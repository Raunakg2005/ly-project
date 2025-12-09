import crypto from 'crypto';

/**
 * Generate SHA-3 hash of file content (quantum-resistant)
 */
export function generateFileHash(fileBuffer: Buffer | string): string {
    const hash = crypto.createHash('sha3-256');
    hash.update(fileBuffer);
    return hash.digest('hex');
}

/**
 * Verify file hash matches
 */
export function verifyFileHash(fileBuffer: Buffer | string, expectedHash: string): boolean {
    const actualHash = generateFileHash(fileBuffer);
    return actualHash === expectedHash;
}

/**
 * Generate a random hash (for unique identifiers)
 */
export function generateRandomHash(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
}
