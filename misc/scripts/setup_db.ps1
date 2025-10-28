<# -------------------- CONFIG (EDIT) -------------------- #>
$PsqlBin = "C:\Program Files\PostgreSQL\17\bin"   # ganti sesuai instalasi
$PgSuperUser = "postgres"
$PgHost = "127.0.0.1"
$PgPort = 5432

$AppDbName = "tvdash"
$AppDbUser = "tvdash"
$AppDbPass = "supersecret"       # ganti password kuat

$InitSqlPath = "C:\Users\Yunio\Documents\Job\trapo-display\db\init.sql"

$SeedExample = $true
$SeedScreenId = "00000000-0000-0000-0000-000000000001"
$SeedScreenName = "Bay A"
$SeedScreenToken = "SECRETTOKEN123"
<# ------------------------------------------------------ #>

if (-not (Test-Path $PsqlBin)) {
  Write-Error "psql.exe tidak ditemukan di: $PsqlBin"
  exit 1
}
$env:Path = "$PsqlBin;$env:Path"

if (-not $env:PGPASSWORD_SUPER) {
  $secure = Read-Host "Password superuser Postgres ($PgSuperUser)" -AsSecureString
  $env:PGPASSWORD_SUPER = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  )
}

function Invoke-PSQL {
  param([string]$Db,[string]$User,[string]$Sql,[string]$PasswordEnvName)
  $env:PGPASSWORD = (Get-Item -Path "Env:\$PasswordEnvName").Value
  & psql -h $PgHost -p $PgPort -U $User -d $Db -v "ON_ERROR_STOP=1" -c $Sql 2>&1
  if ($LASTEXITCODE -ne 0) { throw "psql gagal: $Sql" }
}

Write-Host "Membuat ROLE (user) jika belum ada..."
$createRoleSql = @"
DO `$`$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '$AppDbUser') THEN
    CREATE ROLE $AppDbUser LOGIN PASSWORD '$AppDbPass';
  END IF;
END
`$`$;
"@
Invoke-PSQL -Db "postgres" -User $PgSuperUser -Sql $createRoleSql -PasswordEnvName "PGPASSWORD_SUPER"

Write-Host "Mengecek/ membuat DATABASE..."
$env:PGPASSWORD = $env:PGPASSWORD_SUPER
$dbExists = & psql -h $PgHost -p $PgPort -U $PgSuperUser -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$AppDbName'" 2>$null
if (-not $dbExists) {
  & psql -h $PgHost -p $PgPort -U $PgSuperUser -d postgres -c "CREATE DATABASE $AppDbName OWNER $AppDbUser ENCODING 'UTF8';"
  if ($LASTEXITCODE -ne 0) { throw "Gagal membuat database $AppDbName" }
} else {
  Write-Host "Database $AppDbName sudah ada."
}

Write-Host "Mengatur ownership & extension..."
Invoke-PSQL -Db "postgres" -User $PgSuperUser -Sql "ALTER DATABASE $AppDbName OWNER TO $AppDbUser;" -PasswordEnvName "PGPASSWORD_SUPER"
Invoke-PSQL -Db $AppDbName -User $PgSuperUser -Sql "CREATE EXTENSION IF NOT EXISTS pgcrypto;" -PasswordEnvName "PGPASSWORD_SUPER"

if (-not (Test-Path $InitSqlPath)) { throw "init.sql tidak ditemukan: $InitSqlPath" }
Write-Host "Menjalankan init.sql..."
$env:PGPASSWORD = $AppDbPass
& psql -h $PgHost -p $PgPort -U $AppDbUser -d $AppDbName -v "ON_ERROR_STOP=1" -f $InitSqlPath
if ($LASTEXITCODE -ne 0) { throw "Gagal menjalankan init.sql" }

if ($SeedExample) {
  Write-Host "Seeding contoh screen & token..."
  $seedSql = @"
INSERT INTO screens (id, name) VALUES ('$SeedScreenId', '$SeedScreenName')
ON CONFLICT (id) DO NOTHING;
INSERT INTO screen_tokens (screen_id, token, active)
VALUES ('$SeedScreenId', '$SeedScreenToken', true)
ON CONFLICT (screen_id, token) DO NOTHING;
"@
  Invoke-PSQL -Db $AppDbName -User $AppDbUser -Sql $seedSql -PasswordEnvName "PGPASSWORD"
}

Write-Host "`nSUKSES! DATABASE_URL:"
Write-Host "postgres://${AppDbUser}:${AppDbPass}@${PgHost}:${PgPort}/${AppDbName}"
