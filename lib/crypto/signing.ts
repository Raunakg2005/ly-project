import crypto from 'crypto';

/**
 * Quantum-Safe Digital Signature Module
 * 
 * Phase 1: Using RSA-2048 with SHA-256 (transitional)
 * Phase 2: Will migrate to Dilithium3 (NIST PQC standard)
 * 
 * Note: This implementation provides a foundation that can be easily
 * upgraded to quantum-resistant algorithms when liboqs is integrated.
 */

export interface KeyPair {
    publicKey: string;
    privateKey: string;
}

export interface SignatureResult {
    signature: string;
    algorithm: string;
    timestamp: Date;
}

/**
 * Generate RSA key pair (2048-bit)
 * TODO: Replace with Dilithium3 in Phase 2
 */
export function generateKeyPair(): KeyPair {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
        },
    });

    return {
        publicKey,
        privateKey,
    };
}

/**
 * Sign data with private key
 */
export function signData(data: string | Buffer, privateKey: string): SignatureResult {
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(data);
    sign.end();

    const signature = sign.sign(privateKey, 'base64');

    return {
        signature,
        algorithm: 'RSA-SHA256',
        timestamp: new Date(),
    };
}

/**
 * Verify signature with public key
 */
export function verifySignature(
    data: string | Buffer,
    signature: string,
    publicKey: string
): boolean {
    try {
        const verify = crypto.createVerify('RSA-SHA256');
        verify.update(data);
        verify.end();

        return verify.verify(publicKey, signature, 'base64');
    } catch (error) {
        console.error('❌ Signature verification error:', error);
        return false;
    }
}

/**
 * Sign document hash (recommended approach)
 * Signs the SHA-3 hash instead of entire file for efficiency
 */
export function signDocumentHash(fileHash: string, privateKey: string): SignatureResult {
    return signData(fileHash, privateKey);
}

/**
 * Verify document hash signature
 */
export function verifyDocumentSignature(
    fileHash: string,
    signature: string,
    publicKey: string
): boolean {
    return verifySignature(fileHash, signature, publicKey);
}

/**
 * Generate system-level key pair (for document signing)
 * Store securely in environment variables or key management service
 */
export function generateSystemKeys(): KeyPair {
    const keys = generateKeyPair();

    console.log('🔐 System Key Pair Generated');
    console.log('⚠️  Store these securely in your .env.local file:');
    console.log('\nSYSTEM_PUBLIC_KEY=');
    console.log(keys.publicKey);
    console.log('\nSYSTEM_PRIVATE_KEY=');
    console.log(keys.privateKey);

    return keys;
}

// TODO Phase 2: Quantum-Safe Implementation
// import { dilithium3 } from 'pqcrypto';
//
// export async function generateQuantumKeys(): Promise<KeyPair> {
//   return await dilithium3.generateKeyPair();
// }
//
// export async function signQuantum(data: Buffer, privateKey: Buffer): Promise<Buffer> {
//   return await dilithium3.sign(data, privateKey);
// }
//
// export async function verifyQuantum(data: Buffer, signature: Buffer, publicKey: Buffer): Promise<boolean> {
//   return await dilithium3.verify(data, signature, publicKey);
// }
