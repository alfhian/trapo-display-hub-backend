import bcrypt from 'bcrypt';
const hash = await bcrypt.hash('898989', 10);
console.log(hash);
