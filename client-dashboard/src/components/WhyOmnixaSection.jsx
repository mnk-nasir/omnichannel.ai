'use client';

import { motion } from 'framer-motion';

const VALUES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    accent: '#00E88F',
    title: 'Built Around Your Business, Not Just Technology',
    body: "At Omnixa, we don't believe in adding tools for the sake of it. Every solution we create is designed with one goal — to either save your time, increase your revenue, or both. If it doesn't move your business forward, we don't build it.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
    accent: '#4A9EFF',
    title: 'Results You Can Actually Measure',
    body: 'No vague promises. No guesswork. Everything we implement is tied to clear outcomes — hours saved, faster responses, higher conversions, and real revenue impact you can see.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    accent: '#9B6BFF',
    title: 'Speed That Matches Your Ambition',
    body: "We don't believe in long, drawn-out timelines. Once we identify what's slowing your business down, we move fast — delivering powerful systems in weeks, not dragging you through months of delays.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    accent: '#FFB547',
    title: 'We Handle the Tech. You Focus on Growth.',
    body: 'No complex dashboards. No technical stress. You stay focused on running and scaling your business, while Omnixa quietly builds, connects, and manages everything behind the scenes — so it just works.',
  },
];

export default function WhyOmnixaSection() {
  return (
    <section className="relative w-full py-20 lg:py-28 bg-[#060A0E] border-t border-white/[0.05] overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[160px] opacity-[0.07]"
          style={{ background: 'radial-gradient(ellipse, #00E88F 0%, #4A9EFF 50%, transparent 100%)' }}
        />
      </div>

      <div className="relative max-w-[1240px] mx-auto px-6 z-10">

        {/* Header */}
        <div className="mb-16 lg:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-[0.2em] text-[#00E88F] mb-4"
          >
            Why Omnixa
          </motion.p>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.1] max-w-2xl"
            >
              Why businesses choose{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E88F] to-[#4A9EFF]">
                to grow with us
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-neutral-400 text-base lg:text-lg max-w-sm leading-relaxed lg:text-right shrink-0"
            >
              Tangible outcomes. Transparent process.<br className="hidden lg:block" />
              Zero fluff.
            </motion.p>
          </div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="mt-10 h-[1px] origin-left"
            style={{ background: 'linear-gradient(90deg, #00E88F30, #4A9EFF30, transparent)' }}
          />
        </div>

        {/* Cards — 2×2 grid */}
        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
          {VALUES.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -5, transition: { duration: 0.25 } }}
              className="group relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 flex flex-col gap-5 overflow-hidden cursor-default transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.04]"
            >
              {/* Hover corner glow */}
              <div
                className="absolute top-0 left-0 w-40 h-40 rounded-full blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                style={{ background: item.accent }}
              />

              {/* Icon */}
              <div
                className="relative w-11 h-11 flex items-center justify-center rounded-xl shrink-0 border"
                style={{
                  background: `${item.accent}15`,
                  borderColor: `${item.accent}30`,
                  color: item.accent,
                }}
              >
                {item.icon}
              </div>

              {/* Title */}
              <h3
                className="text-lg md:text-xl font-bold text-white leading-snug"
              >
                {item.title}
              </h3>

              {/* Body */}
              <p className="text-neutral-400 text-sm md:text-[15px] leading-relaxed">
                {item.body}
              </p>

              {/* Bottom accent strip */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, ${item.accent}00, ${item.accent}, ${item.accent}00)` }}
              />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
