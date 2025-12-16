'use client';

import { motion } from 'framer-motion';
import { Play, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import OmnixaOrb3D from '@/components/OmnixaOrb3D';
import ProcessSection from '@/components/ProcessSection';
import IndustriesSection from '@/components/IndustriesSection';
import PainPointsSection from '@/components/PainPointsSection';
import WhyOmnixaSection from '@/components/WhyOmnixaSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import FAQSection from '@/components/FAQSection';
import PlatformExperienceSection from '@/components/PlatformExperienceSection';
import CTASection from '@/components/CTASection';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroLogos from '@/components/HeroLogos';
import TrustedBrandsSection from '@/components/TrustedBrandsSection';
import AuthModal from '@/components/AuthModal';
import { useState } from 'react';

export default function DashboardHero() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080C10] text-[#ededed] font-sans selection:bg-[#00E88F]/30 overflow-hidden w-full">

      <Navbar />

      <div className="relative w-full min-h-[90vh] flex flex-col justify-center pt-24 pb-8">
        <main className="px-4 sm:px-6 max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-8 lg:gap-8 items-center w-full flex-1">
          <div className="flex flex-col items-start z-10 w-full text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00E88F]/30 bg-[#00E88F]/10 text-[#00E88F] text-[10px] sm:text-xs font-bold uppercase tracking-wide mb-4"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E88F] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E88F]"></span>
              </span>
              Next-Gen Omnichannel is Live
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-sans text-4xl sm:text-5xl xl:text-[3.5rem] leading-[1.1] font-extrabold text-white mb-4 tracking-tight"
            >
              Your Business Runs 24/7. <br className="hidden md:block" />
              <span className="relative inline-block mt-2">
                <span className="text-[#00E88F]">Even When You Don&apos;t.</span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-base lg:text-lg text-neutral-400 mb-6 max-w-lg leading-relaxed"
            >
              Leads message at 2am. You&apos;re asleep. Omnixa replies, answers product questions, and closes the deal — on WhatsApp, Instagram, Facebook &amp; more. Zero human slip-ups. Pure automation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
            >
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#00E88F] hover:bg-[#00c77a] text-[#080C10] text-sm font-bold rounded shadow-[0_0_20px_rgba(0,232,143,0.3)] hover:shadow-[0_0_30px_rgba(0,232,143,0.5)] transition-all group"
              >
                Book a Demo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-white/[0.1] hover:bg-white/[0.03] text-white text-sm font-medium rounded transition-all">
                <Play className="w-4 h-4 fill-white text-white" />
                Watch how it works
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="flex flex-wrap items-center gap-4 sm:gap-6 mt-8 sm:mt-10 pt-6 border-t border-white/[0.07] text-xs text-neutral-400 font-medium w-full"
            >
              <div className="flex items-center gap-1.5">
                <strong className="text-white text-sm">24/7</strong> &middot; Always on
              </div>
              <div className="flex items-center gap-1.5">
                <strong className="text-white text-sm">6+</strong> &middot; Channels
              </div>
              <div className="flex items-center gap-1.5">
                <strong className="text-[#00E88F] text-sm">3&times;</strong> &middot; More Leads
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, type: 'spring', stiffness: 60 }}
            className="relative w-full max-w-[480px] mx-auto z-10"
            style={{ height: 540 }}
          >
            <OmnixaOrb3D />
          </motion.div>
        </main>

        <div className="w-full mt-auto pt-8">
          <HeroLogos />
        </div>
      </div>

      <PainPointsSection />
      <IndustriesSection />
      <ProcessSection />
      <TrustedBrandsSection />
      <WhyOmnixaSection />
      <PlatformExperienceSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
