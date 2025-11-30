import "./env";
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY?.trim();
const ALGORITHM = 'aes-256-cbc';

if (!ENCRYPTION_KEY) {
  throw new Error('[Encryption] ENCRYPTION_KEY environment variable is required for security. Please set a 32-character encryption key.');
}

if (ENCRYPTION_KEY.length !== 32) {
  throw new Error(`[Encryption] ENCRYPTION_KEY must be exactly 32 characters long. Current length: ${ENCRYPTION_KEY.length}`);
}

const KEY = Buffer.from(ENCRYPTION_KEY);

export function encryptToken(token: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decryptToken(encryptedToken: string): string {
  const [ivHex, encrypted] = encryptedToken.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
