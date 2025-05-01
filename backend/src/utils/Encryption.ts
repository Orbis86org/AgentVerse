// src/utils/Encryption.ts
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const secretKey = process.env.AGENT_API_SECRET || '6f6c2dfe92bb7e7613c58262b38904e65321c7e3c038f4eb16d9f7989b5f7864';
const ivLength = 12;

/**
 * Placeholder for encryption functionality.
 * Currently, encryption is disabled. The useEncryption flag is false by default.
 * TODO: Implement actual encryption/decryption logic.
 */

export function encryptMessage( text: string): string {
    const iv = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, 'hex'), iv);

    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptMessage(encryptedMessage: string): string {
    if (!encryptedMessage || typeof encryptedMessage !== 'string') {
        throw new Error('Invalid encrypted message');
    }

    const parts = encryptedMessage.split(':');
    if (parts.length !== 3) {
        throw new Error('Malformed encrypted message');
    }

    const [ivHex, tagHex, encryptedHex] = parts;

    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const key = Buffer.from(secretKey, 'hex');

    try {
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        decipher.setAuthTag(tag);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        return decrypted.toString('utf8');
    } catch (err) {
        throw new Error('Decryption failed. Possible wrong key or corrupted data.');
    }
}

