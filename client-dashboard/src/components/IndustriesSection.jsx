'use client';

import { motion } from 'framer-motion';
import { EggFried } from 'lucide-react';
import { Edu_VIC_WA_NT_Beginner } from 'next/font/google';

const INDUSTRIES = [
  "Real Estate & Property Businesses",
  "Healthcare & Medical Clinics",
  "Coaching, Training & Education",
  "Direct-to-Consumer (D2C) Brands",
  "Legal & Professional Services",
  "SaaS & Tech Startups",
  "E-commerce & Online Stores",
  "Finance & Insurance Services",
  "Travel & Hospitality",
  "Fitness & Wellness Businesses",
  "Local Service Businesses (Salons, Repair, etc.)",
  "Consultants & Agencies"
];

export default function IndustriesSection() {
  // Duplicating exactly once to create a perfect two-part seamless loop
  const loopItems = [...INDUSTRIES, ...INDUSTRIES];

  return (
    <section className="relative w-full py-10 lg:py-16 bg-[#080C10] border-t border-white/[0.05] overflow-hidden flex flex-col items-center">

      {/* Container Background Fades (so edges fade off instead of cutting sharp) */}
      <div className="absolute top-0 bottom-0 left-0 w-24 md:w-48 bg-gradient-to-r from-[#080C10] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-24 md:w-48 bg-gradient-to-l from-[#080C10] to-transparent z-10 pointer-events-none" />

      {/* Headline */}
      <div className="text-center px-6 mb-12 relative z-20">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-snug mb-4"
        >
          If You’re Scaling These Businesses, <br className="hidden md:block" />
          <span className="text-[#00E88F]">You’re In The Right Place.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-neutral-400 text-sm md:text-base"
        >
          Our platform is precisely engineered for industries that demand non-stop growth and automation.
        </motion.p>
      </div>

      {/* Infinite Scroll Marquee */}
      <div className="relative w-full flex overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 80 // Much slower scroll
          }}
          className="flex whitespace-nowrap gap-4 md:gap-6 pr-4 md:pr-6 w-max"
        >
          {loopItems.map((industry, i) => (
            <div
              key={i}
              className="px-5 py-3 md:px-7 md:py-4 rounded-xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.2)] flex items-center justify-center transition-colors hover:bg-white/[0.05] hover:border-white/[0.15]"
            >
              <span className="text-neutral-300 font-medium text-sm md:text-base tracking-wide">
                {industry}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

    </section>
  );
}
