'use client';

import { motion } from 'framer-motion';

const BRANDS = [
  {
    name: 'Ranazonai',
    domain: 'ranazonai.com',
    tagline: 'Real Estate Intelligence',
    initial: 'R',
    color: '#00E88F',
  },
  {
    name: 'eKaralu',
    domain: 'ekaralu.com',
    tagline: 'Digital Commerce Platform',
    initial: 'eK',
    color: '#4A9EFF',
  },
  {
    name: 'LawPex',
    domain: 'lawpex.musabhashmi.com',
    tagline: 'Legal Services Automation',
    initial: 'LP',
    color: '#9B6BFF',
  },
  {
    name: 'FilemyRTI',
    domain: 'filemyrti.com',
    tagline: 'RTI Filing Made Simple',
    initial: 'FT',
    color: '#FFB547',
  },
  {
    name: 'Matchpoint',
    domain: 'matchpoint.ai',
    tagline: 'AI-Powered Matchmaking',
    initial: 'MP',
    color: '#00E88F',
  },
];

// Duplicate for seamless loop
const LOOP = [...BRANDS, ...BRANDS, ...BRANDS];

function BrandCard({ brand }) {
  return (
    <a href={`https://${brand.domain}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 mx-4 group cursor-pointer block">
      <div
        className="flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-sm hover:border-[#00E88F]/40 hover:bg-[#00E88F]/5 hover:shadow-[0_0_20px_rgba(0,232,143,0.1)] transition-all duration-400"
        style={{ minWidth: '240px' }}
      >
        {/* Logo mark */}
        <div
          className="relative w-11 h-11 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0 transition-transform duration-300 group-hover:scale-110 overflow-hidden"
          style={{
            background: `${brand.color}18`,
            border: `1px solid ${brand.color}35`,
          }}
        >
          <img 
            src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=128`} 
            alt={`${brand.name} logo`}
            className="w-full h-full object-contain p-2 relative z-10"
            onError={(e) => {
              e.target.style.opacity = '0';
              e.target.nextSibling.style.opacity = '1';
            }}
          />
          {/* Fallback initial */}
          <span 
            className="absolute inset-0 flex items-center justify-center transition-opacity text-[13px] tracking-tight bg-white/[0.03]" 
            style={{ color: brand.color, opacity: 0 }}
          >
            {brand.initial}
          </span>
        </div>

        {/* Text */}
        <div className="flex flex-col">
          <span className="text-white font-bold text-base leading-tight tracking-tight group-hover:text-[#00E88F] transition-colors">
            {brand.name}
          </span>
          <span className="text-neutral-500 text-[11px] font-medium tracking-wide mt-0.5">
            {brand.tagline}
          </span>
        </div>
      </div>
    </a>
  );
}

export default function TrustedBrandsSection() {
  return (
    <section className="relative w-full py-16 lg:py-20 bg-[#080C10] border-t border-white/[0.05] overflow-hidden">

      {/* Fade edges */}
      <div className="absolute top-0 bottom-0 left-0 w-32 md:w-56 bg-gradient-to-r from-[#080C10] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-32 md:w-56 bg-gradient-to-l from-[#080C10] to-transparent z-10 pointer-events-none" />

      {/* Header */}
      <div className="text-center px-6 mb-12 relative z-20">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-bold uppercase tracking-[0.2em] text-[#00E88F] mb-4"
        >
          Trusted By
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-snug mb-3"
        >
          Brands that trusted us to{' '}
          <span className="text-[#00E88F]">make their business work better</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-neutral-400 text-sm md:text-base max-w-xl mx-auto"
        >
          Real businesses. Real results. Powered by Omnixa.
        </motion.p>
      </div>

      {/* Scrolling Row */}
      <div className="relative w-full flex overflow-hidden">
        <motion.div
          animate={{ x: ['0%', '-33.33%'] }}
          transition={{
            repeat: Infinity,
            ease: 'linear',
            duration: 40,
          }}
          className="flex items-center w-max py-2"
        >
          {LOOP.map((brand, i) => (
            <BrandCard key={i} brand={brand} />
          ))}
        </motion.div>
      </div>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="relative z-20 flex flex-wrap justify-center gap-8 md:gap-14 mt-12 px-6"
      >
        {[
          { value: '5+', label: 'Active Client Businesses' },
          { value: '98%', label: 'Client Retention Rate' },
          { value: '3×', label: 'Avg. Lead Response Improvement' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl md:text-3xl font-extrabold text-[#00E88F]">{stat.value}</div>
            <div className="text-neutral-500 text-xs md:text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </motion.div>

    </section>
  );
}
