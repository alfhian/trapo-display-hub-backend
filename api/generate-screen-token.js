//generate-screen-token.js
import fs from 'fs';
import jwt from 'jsonwebtoken';
import path from 'path';

const PRIVATE_KEY_PATH = path.join(process.cwd(), 'jwt_private.pem'); // adjust
const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');

const screenId = process.argv[2] || '1';
const expires = process.argv[3] || '365d';

const token = jwt.sign({ screenId, type: 'screen' }, privateKey, {
  algorithm: 'RS256',
  expiresIn: expires
});

console.log(token);