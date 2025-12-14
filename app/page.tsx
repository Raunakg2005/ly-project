'use client';

import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import StatsSection from '@/components/landing/StatsSection';
import TrustBanner from '@/components/landing/TrustBanner';
import FeaturesSection from '@/components/landing/FeaturesSection';
import SecurityDemo from '@/components/landing/SecurityDemo';
import Footer from '@/components/landing/Footer';
import CustomCursor from '@/components/animations/CustomCursor';

export default function HomePage() {
  return (
    <div className="custom-cursor-page">
      <CustomCursor />
      <Navbar />
      <main className="relative min-h-screen bg-slate-950">
        <HeroSection />
        <StatsSection />
        <TrustBanner />
        <FeaturesSection />
        <SecurityDemo />
        <Footer />
      </main>
    </div>
  );
}
