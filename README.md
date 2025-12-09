# DocShield - Quantum-Safe Document Verification Platform

A comprehensive web platform built with Next.js 16.0.7 and MongoDB that addresses document fraud and cybersecurity awareness using quantum-resistant cryptography and AI-powered analysis.

## 🚀 Features

- **Quantum-Safe Cryptography**: Dilithium3 digital signatures for future-proof security
- **AI-Powered Analysis**: Local Llama 3.3 70B via Ollama for document authenticity verification
- **Document Verification**: Secure verification for certificates, IDs, contracts, and official documents
- **Cybersecurity Education**: Interactive learning modules with gamification
- **Multi-Role Support**: User, Verifier, and Admin roles with appropriate permissions
- **Institutional Accounts**: Multi-user organization support with custom branding

## 🛠️ Tech Stack

- **Framework**: Next.js 16.0.7 (App Router, React 19, TypeScript)
- **Database**: MongoDB 7.0+ with Mongoose ODM
- **Authentication**: NextAuth.js v5 with MongoDB adapter
- **AI**: Ollama + Meta Llama 3.3 70B (local, private, zero-cost)
- **Cryptography**: Quantum-resistant algorithms (Dilithium3)
- **Styling**: Tailwind CSS + shadcn/ui components
- **OCR**: Tesseract.js + PDF.js for text extraction

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 7.0+ (local or MongoDB Compass)
- Ollama installed with Llama 3.3 model
- 16GB+ RAM recommended (8GB minimum with quantized model)
- NVIDIA GPU (optional, 3-5x faster inference)

## 🏁 Getting Started

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Set Up MongoDB

Install MongoDB locally or use MongoDB Compass:
\`\`\`bash
# For local MongoDB
mongod --dbpath ./data/db
\`\`\`

### 3. Set Up Ollama AI

\`\`\`bash
# Install Ollama from https://ollama.com/download
# Pull Llama 3.3 model
ollama pull llama3.3:70b

# Or use quantized version for 8GB RAM
ollama pull llama3.3:70b-instruct-q4_0

# Start Ollama service
ollama serve
\`\`\`

### 4. Configure Environment Variables

Create `.env.local` file:

\`\`\`env
# Database
MONGODB_URI=mongodb://localhost:27017/docshield

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Ollama AI (Local)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.3:70b
OLLAMA_TIMEOUT=60000
OLLAMA_TEMPERATURE=0.7

# File Storage
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=10485760

# Application
NODE_ENV=development
\`\`\`

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

\`\`\`
docshield/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   ├── documents/        # Document management
│   └── dashboard/        # Dashboard components
├── lib/                   # Core libraries
│   ├── db/               # Database models and connection
│   ├── ai/               # Ollama AI integration
│   ├── crypto/           # Quantum cryptography
│   ├── storage/          # File storage management
│   └── auth/             # Authentication utilities
├── types/                 # TypeScript type definitions
└── public/               # Static assets
\`\`\`

## 🧪 Testing

\`\`\`bash
# Test database connection
npm run test:db

# Test Ollama AI connection
npm run test:ollama

# Test AI document analysis
npm run test:ai-analysis

# Run all tests
npm test
\`\`\`

## 🔒 Security Features

- Quantum-resistant digital signatures (Dilithium3)
- Secure password hashing with bcrypt (14 rounds)
- CSRF protection via NextAuth
- Role-based access control
- File validation and security scanning
- Encrypted data storage

## 📊 Database Schema

- **Users**: User accounts with roles and subscriptions
- **Documents**: Uploaded documents with metadata and signatures
- **Verifications**: Verification requests and results
- **Learning Modules**: Educational content for cybersecurity
- **User Progress**: Learning progress tracking
- **Institutions**: Organizational accounts

## 🎯 Roadmap

- [x] Phase 1: Foundation (Project setup, Auth, File upload, AI integration)
- [ ] Phase 2: Core Features (Quantum crypto, Verification workflow, Analytics)
- [ ] Phase 3: Advanced Features (Education platform, Admin dashboard, Institutional accounts)
- [ ] Phase 4: Production (Testing, Deployment, Documentation)

## 👥 Contributing

This is a private project currently in active development.

## 📄 License

All rights reserved.

## 🆘 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ using Next.js 16.0.7, MongoDB, and Local AI**
