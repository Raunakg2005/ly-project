import Link from 'next/link';
import { Shield, Lock, Brain, Award } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DocShield
            </span>
          </div>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            ✨ Powered by Quantum-Safe Cryptography & Local AI
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Secure Document Verification for the Future
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Protect your documents with quantum-resistant cryptography and AI-powered authenticity analysis.
            100% private, zero API costs, enterprise-grade security.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
            >
              Start Verifying
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 border-2 border-gray-300 rounded-lg font-semibold hover:border-gray-400 transition-colors text-lg"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Shield className="h-12 w-12 text-blue-600" />}
            title="Quantum-Safe"
            description="Future-proof security with post-quantum cryptographic algorithms"
          />
          <FeatureCard
            icon={<Brain className="h-12 w-12 text-purple-600" />}
            title="AI-Powered"
            description="Local Llama 3.3 70B analysis for document authenticity verification"
          />
          <FeatureCard
            icon={<Lock className="h-12 w-12 text-green-600" />}
            title="100% Private"
            description="All processing happens locally. Your documents never leave your server"
          />
          <FeatureCard
            icon={<Award className="h-12 w-12 text-orange-600" />}
            title="Enterprise Grade"
            description="Professional verification for certificates, IDs, contracts, and more"
          />
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">99.5%</div>
              <div className="text-blue-100">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">&lt;30s</div>
              <div className="text-blue-100">Avg Analysis Time</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$0</div>
              <div className="text-blue-100">AI API Costs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2025 DocShield. All rights reserved. Built with Next.js 16.0.7 & Local AI.</p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
