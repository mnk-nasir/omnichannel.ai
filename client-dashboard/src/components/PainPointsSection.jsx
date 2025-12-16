'use client';

import { motion } from 'framer-motion';

const G = '#00E88F';
const G_BG = 'rgba(0,232,143,0.08)';
const G_BORDER = 'rgba(0,232,143,0.2)';

const PAIN_POINTS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    accent: G,
    accentBg: G_BG,
    accentBorder: G_BORDER,
    label: 'Speed to Lead',
    title: 'Lost Deals Due to Slow Response',
    body: 'You invest in ads and generate leads — but response time kills the opportunity. Most buyers choose the first business that replies. By the time your team reaches out, the customer has already moved on to someone faster.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M9 12h6M9 16h6M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2" />
        <rect x="7" y="2" width="10" height="4" rx="1" />
      </svg>
    ),
    accent: G,
    accentBg: G_BG,
    accentBorder: G_BORDER,
    label: 'Operational Drain',
    title: 'Time Drained by Repetitive Tasks',
    body: 'Your team is stuck doing the same manual work every day — updating data, scheduling calls, preparing reports. That\'s 20–40 hours every week spent on tasks that don\'t directly grow your business.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M3 3l18 18M3 21l4.5-4.5M21 3l-4.5 4.5" />
        <path d="M15.5 8.5A5 5 0 018.5 15.5" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
    accent: G,
    accentBg: G_BG,
    accentBorder: G_BORDER,
    label: 'Conversion Leakage',
    title: 'Visitors Leaving Without Converting',
    body: 'People visit your website, browse for a few seconds, and disappear. Without a system to capture, engage, and qualify visitors in real time, you\'re missing out on real revenue opportunities.',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function PainPointsSection() {
  return (
    <section className="relative w-full py-12 lg:py-16 bg-[#080C10] border-t border-white/[0.05] overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px] opacity-20"
          style={{
            width: '70vw',
            height: '50vh',
            background: 'radial-gradient(ellipse, #1a2a3a 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative max-w-[1240px] mx-auto px-6 z-10">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-5"
          >
            You're putting in the effort —{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-300 to-neutral-500">
              but the results aren't following.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-neutral-400 text-base md:text-lg leading-relaxed"
          >
            Most businesses face the same invisible bottlenecks that silently drain leads, time, and revenue.
          </motion.p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {PAIN_POINTS.map((point, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="group relative rounded-2xl border p-7 flex flex-col gap-5 cursor-default transition-shadow duration-300"
              style={{
                background: point.accentBg,
                borderColor: point.accentBorder,
              }}
            >
              {/* Hover glow overlay */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at top left, ${point.accent}12, transparent 70%)`,
                }}
              />

              {/* Icon */}
              <div
                className="relative w-12 h-12 flex items-center justify-center rounded-xl shrink-0"
                style={{ background: point.accentBg, borderColor: point.accentBorder, border: '1px solid', color: point.accent }}
              >
                {point.icon}
              </div>

              {/* Label */}
              <span
                className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: point.accent }}
              >
                {point.label}
              </span>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-bold text-white leading-snug -mt-3">
                {point.title}
              </h3>

              {/* Body */}
              <p className="text-neutral-400 text-sm md:text-[15px] leading-relaxed">
                {point.body}
              </p>

              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 left-6 right-6 h-[2px] rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${point.accent}, transparent)` }}
              />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
