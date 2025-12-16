'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

const STEPS = [
  {
    num: '01',
    title: 'We Understand Your Business',
    desc: 'Quick call to understand your workflow, leads, and gaps.\nWe plug our ready-made automations directly into your needs — no delay, no complexity.',
    color: '#00E88F'
  },
  {
    num: '02',
    title: 'We Set Up in 1 Day',
    desc: 'We connect, customize, and launch your system.\nEverything goes live within 1 day — fully done for you, no hidden costs.',
    color: '#00E88F'
  },
  {
    num: '03',
    title: 'Results in 7 Days',
    desc: "Your system starts working instantly — capturing leads, replying faster, and saving time.\nWithin 7 days, you'll see better responses, higher conversions, and less manual work.",
    color: '#00E88F'
  }
];

const CYCLE_MS = 2500;

export default function ProcessSection() {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, CYCLE_MS);
    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <section ref={sectionRef} className="relative w-full py-10 lg:py-16 bg-[#080C10] border-t border-white/[0.05] overflow-hidden">
      {/* Background radial gradient to blend section */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080C10] via-[#0b1218] to-[#080C10] pointer-events-none" />

      <div className="relative max-w-[1240px] mx-auto px-6 z-10">

        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-[1.1]"
          >
            Pre-built systems. Fast setup. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 to-neutral-500">Real results — in days.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-neutral-400"
          >
            No long builds. No delays. Just plug, launch, and grow.
          </motion.p>
        </div>

        {/* Steps Container */}
        <div className="relative">

          {/* Connecting Lines (Desktop Only) */}
          <div className="hidden md:block absolute top-[36px] left-[16%] right-[16%] h-[2px] z-0">
            {/* Base dim dashed line across all */}
            <svg width="100%" height="100%" preserveAspectRatio="none">
              <line x1="0" y1="1" x2="100%" y2="1" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeDasharray="6 8" />
            </svg>

            {/* Animated flowing line overlay between active and next */}
            <AnimatePresence>
              {isInView && activeStep < 2 && (
                <motion.div
                  key={`line-${activeStep}`}
                  initial={{ width: '0%' }}
                  animate={{ width: '50%', left: activeStep === 0 ? '0%' : '50%' }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  transition={{ duration: CYCLE_MS / 1000, ease: 'linear' }}
                  className="absolute top-0 h-full overflow-hidden"
                  style={{ left: activeStep === 0 ? '0%' : '50%' }}
                >
                  <svg width="200%" height="100%" style={{ width: '200%' }} preserveAspectRatio="none">
                    <motion.line
                      x1="0" y1="1" x2="100%" y2="1"
                      stroke={STEPS[activeStep].color}
                      strokeWidth="2.5"
                      strokeDasharray="6 8"
                      animate={{ strokeDashoffset: -100 }}
                      transition={{ repeat: Infinity, ease: 'linear', duration: 1.5 }}
                    />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-6 relative z-10 cursor-default">
            {STEPS.map((step, idx) => {
              const isActive = idx === activeStep;
              const isPast = idx < activeStep;

              return (
                <div
                  key={idx}
                  className="relative flex flex-col items-center md:items-start group"
                  onClick={() => setActiveStep(idx)}
                >
                  {/* The Number Circle */}
                  <div className="flex flex-col items-center mb-5 md:mb-6 md:mx-auto">
                    <motion.div
                      layout
                      animate={{
                        backgroundColor: isActive || isPast ? step.color : '#0a1118',
                        borderColor: isActive || isPast ? step.color : 'rgba(255,255,255,0.15)',
                        color: isActive || isPast ? '#080C10' : '#888',
                        scale: isActive ? 1.15 : 1,
                        boxShadow: isActive || isPast ? `0 0 25px ${step.color}66` : 'none'
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-2 font-bold text-xl md:text-2xl transition-colors z-10"
                    >
                      {step.num}
                    </motion.div>
                  </div>

                  {/* The Card */}
                  <div className="relative w-full h-full">
                    <motion.div
                      animate={{
                        borderColor: isActive ? step.color : 'rgba(255,255,255,0.08)',
                        backgroundColor: isActive ? step.color + '05' : 'rgba(255,255,255,0.01)'
                      }}
                      transition={{ duration: 0.4 }}
                      className="h-full rounded-xl border-[3px] bg-[#0a1118]/40 backdrop-blur-sm p-5 md:p-6 flex flex-col items-center text-center transition-colors"
                    >
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-3 leading-snug">
                        {step.title}
                      </h3>
                      <div className="text-neutral-400 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                        {step.desc.replace(/\[for\]/g, 'for')}
                      </div>
                    </motion.div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
