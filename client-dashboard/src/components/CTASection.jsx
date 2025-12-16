'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import AuthModal from './AuthModal';

export default function CTASection() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <>
      <section className="relative w-full z-30 pointer-events-none -mb-[180px] pt-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-6 items-stretch pointer-events-auto">
          
          {/* Left Card: Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex-1 bg-[#13171D] border border-white/[0.08] backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-12 flex flex-col justify-center items-start shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] min-h-[280px]"
          >
            <h2 className="text-2xl md:text-5xl font-black text-white leading-tight mb-8 tracking-tight max-w-[95%]">
              Ready to automate your growth? <br />
              <span className="text-[#00E88F]">Build your 24/7 AI Agent fleet with Omnixa.</span>
            </h2>
            
            <motion.button
              onClick={() => setIsAuthOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="relative group bg-[#00E88F] hover:bg-[#00c77a] text-[#080C10] font-black text-sm md:text-base px-12 py-5 rounded-full transition-all shadow-[0_0_30px_rgba(0,232,143,0.3)] hover:shadow-[0_0_50px_rgba(0,232,143,0.5)] overflow-hidden"
            >
              {/* Shine effect */}
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2, 
                  ease: "linear",
                  repeatDelay: 3
                }}
                className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 pointer-events-none"
              />
              
              <span className="relative z-10">Book a demo</span>
            </motion.button>
          </motion.div>

          {/* Right Card: Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="w-full lg:w-[42%] rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] relative min-h-[250px] lg:min-h-0"
          >
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1200" 
              alt="Omnixa Platform" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Subtle overlay to soften the image */}
            <div className="absolute inset-0 bg-indigo-900/10 mix-blend-multiply" />
          </motion.div>

        </div>
      </section>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
