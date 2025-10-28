import { generateKeyPairSync, createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
});

fs.writeFileSync('jwt_private.pem', privateKey);
fs.mkdirSync('keys', { recursive: true });
fs.writeFileSync(path.join('keys', 'jwt_public.pem'), publicKey);

const privHash = createHash('sha256').update(privateKey).digest('hex').slice(0,16);
const pubHash  = createHash('sha256').update(publicKey).digest('hex').slice(0,16);
console.log('✅ New keys generated.');
console.log('Private fingerprint:', privHash);
console.log('Public  fingerprint:', pubHash);
