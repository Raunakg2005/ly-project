from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.backends import default_backend
import os
from pathlib import Path

class SigningService:
    def __init__(self):
        self.key_dir = Path("./keys")
        self.key_dir.mkdir(exist_ok=True)
        self.private_key_path = self.key_dir / "private_key.pem"
        self.public_key_path = self.key_dir / "public_key.pem"
        self._ensure_keys()
    
    def _ensure_keys(self):
        """Generate RSA keys if they don't exist"""
        if not self.private_key_path.exists():
            print("🔐 Generating RSA-2048 key pair...")
            
            # Generate private key
            private_key = rsa.generate_private_key(
                public_exponent=65537,
                key_size=2048,
                backend=default_backend()
            )
            
            # Save private key
            with open(self.private_key_path, 'wb') as f:
                f.write(private_key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.PKCS8,
                    encryption_algorithm=serialization.NoEncryption()
                ))
            
            # Save public key
            public_key = private_key.public_key()
            with open(self.public_key_path, 'wb') as f:
                f.write(public_key.public_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PublicFormat.SubjectPublicKeyInfo
                ))
            
            print("✅ Keys generated and saved")
        else:
            print("✅ Using existing RSA keys")
    
    def _load_private_key(self):
        """Load private key from file"""
        with open(self.private_key_path, 'rb') as f:
            return serialization.load_pem_private_key(
                f.read(),
                password=None,
                backend=default_backend()
            )
    
    def _load_public_key(self):
        """Load public key from file"""
        with open(self.public_key_path, 'rb') as f:
            return serialization.load_pem_public_key(
                f.read(),
                backend=default_backend()
            )
    
    def sign_hash(self, file_hash: str) -> str:
        """
        Sign a file hash with RSA-2048
        Returns: Base64 encoded signature
        """
        try:
            private_key = self._load_private_key()
            
            # Sign the hash
            signature = private_key.sign(
                file_hash.encode('utf-8'),
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            
            # Return hex encoded signature
            return signature.hex()
        
        except Exception as e:
            print(f"❌ Signing error: {e}")
            return None
    
    def verify_signature(self, file_hash: str, signature_hex: str) -> bool:
        """
        Verify a signature against a file hash
        Returns: True if valid, False otherwise
        """
        try:
            public_key = self._load_public_key()
            signature = bytes.fromhex(signature_hex)
            
            public_key.verify(
                signature,
                file_hash.encode('utf-8'),
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            
            return True
        
        except Exception as e:
            print(f"❌ Verification failed: {e}")
            return False
    
    def get_public_key_pem(self) -> str:
        """Get public key as PEM string"""
        with open(self.public_key_path, 'r') as f:
            return f.read()

# Singleton instance
signing_service = SigningService()

# Note for v1.1.0: Migrate to Dilithium3 (NIST Post-Quantum Cryptography)
# from pqcrypto.sign.dilithium3 import generate_keypair, sign, verify
