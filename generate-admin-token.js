//generate-admin-token.js
import fs from 'fs';
import jwt from 'jsonwebtoken';
import path from 'path';

const PRIVATE_KEY_PATH = path.join(process.cwd(), 'jwt_private.pem'); // adjust if different
const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');

const token = jwt.sign(
  { sub: 'admin@yourdomain.com', role: 'admin' },
  privateKey,
  { algorithm: 'RS256', expiresIn: '8h' }
);

console.log(token);
