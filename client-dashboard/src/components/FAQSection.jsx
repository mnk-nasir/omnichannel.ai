'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

const ACCENT = '#00E88F';

const FAQS = [
  {
    question: 'What does Omnixa actually build?',
    answer:
      'We build intelligent systems that directly improve how your business operates and earns. This includes AI voice agents that answer calls instantly, WhatsApp automation tailored to your workflow, and conversion-focused websites connected directly to your sales process — all working together as one seamless system.',
    accent: ACCENT,
  },
  {
    question: 'Do I need to stop using my current tools?',
    answer:
      'Not at all. Omnixa is designed to work with what you already use — whether it\'s your CRM, spreadsheets, or internal tools. We connect everything together so your data flows automatically, reducing manual work instead of forcing you to switch platforms.',
    accent: ACCENT,
  },
  {
    question: 'How quickly can everything be set up?',
    answer:
      'It depends on what you need. Simple, plug-and-play systems can go live within a few days. More advanced, end-to-end setups are carefully built and usually take a few weeks to ensure everything runs smoothly and delivers real results.',
    accent: ACCENT,
  },
  {
    question: 'What happens if the AI gives incorrect information?',
    answer:
      'We don\'t leave that to chance. Our AI systems are trained on your specific business data and operate within strict boundaries. If a situation goes beyond what it knows, it instantly transfers the conversation to a human — ensuring accuracy and protecting your customer experience.',
    accent: ACCENT,
  },
  {
    question: 'How does pricing work?',
    answer:
      'We keep it simple and transparent. There\'s a one-time cost to design and build your system. For AI-powered features like voice agents, usage is based on actual activity — meaning you only pay for what your business truly uses.',
    accent: ACCENT,
  },
  {
    question: 'Will this actually increase my revenue or just save time?',
    answer:
      'Both — and that\'s the point. Everything we build is focused on faster responses, better lead handling, and smoother operations. That means more conversions, less missed opportunities, and measurable business growth.',
    accent: ACCENT,
  },
  {
    question: 'What kind of support do we get after launch?',
    answer:
      'We don\'t disappear after delivery. Omnixa continuously monitors, maintains, and improves your system to ensure everything runs smoothly as your business grows. Whether it\'s updates, optimizations, or quick fixes — we stay with you so your system keeps delivering results without interruptions.',
    accent: ACCENT,
  },
];

function FAQItem({ faq, index, isOpen, onToggle }) {
  const contentRef = useRef(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <div
        onClick={onToggle}
        className="relative rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden"
        style={{
          borderColor: isOpen ? `${faq.accent}40` : 'rgba(255,255,255,0.07)',
          background: isOpen
            ? `linear-gradient(135deg, ${faq.accent}08 0%, rgba(255,255,255,0.02) 100%)`
            : 'rgba(255,255,255,0.015)',
        }}
      >
        {/* Left accent bar */}
        <motion.div
          animate={{ opacity: isOpen ? 1 : 0, scaleY: isOpen ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full origin-top"
          style={{ background: faq.accent }}
        />

        {/* Question row */}
        <button
          className="w-full flex items-center justify-between gap-4 px-7 py-5 text-left"
          aria-expanded={isOpen}
        >
          {/* Number */}
          <span
            className="text-[11px] font-bold uppercase tracking-widest shrink-0 transition-colors duration-300"
            style={{ color: isOpen ? faq.accent : 'rgba(255,255,255,0.25)' }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>

          {/* Question text */}
          <span
            className="flex-1 text-base md:text-lg font-semibold leading-snug transition-colors duration-300"
            style={{ color: isOpen ? '#ffffff' : 'rgba(255,255,255,0.75)' }}
          >
            {faq.question}
          </span>

          {/* Toggle icon — chevron */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full border transition-all duration-300"
            style={{
              borderColor: isOpen ? `${faq.accent}50` : 'rgba(255,255,255,0.12)',
              background: isOpen ? `${faq.accent}15` : 'transparent',
              color: isOpen ? faq.accent : 'rgba(255,255,255,0.4)',
            }}
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </button>

        {/* Answer */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="answer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="px-7 pb-6 pl-[4.5rem]">
                <p className="text-neutral-400 text-sm md:text-[15px] leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  const toggle = (i) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <section ref={sectionRef} className="relative w-full py-20 lg:py-28 bg-[#080C10] border-t border-white/[0.05] overflow-hidden">

      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-left glow */}
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[160px] opacity-[0.06]"
          style={{ background: 'radial-gradient(ellipse, #00E88F, transparent 70%)' }}
        />
        {/* Bottom-right glow */}
        <div
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-[140px] opacity-[0.05]"
          style={{ background: 'radial-gradient(ellipse, #4A9EFF, transparent 70%)' }}
        />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative max-w-[900px] mx-auto px-6 z-10">

        {/* Header */}
        <div className="text-center mb-14 lg:mb-18">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-[0.2em] text-[#00E88F] mb-4"
          >
            Got Questions?
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-5"
          >
            Everything you need{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E88F] to-[#4A9EFF]">
              to know
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-neutral-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed"
          >
            Clear answers to the questions we hear most. No jargon. No runaround.
          </motion.p>
        </div>

        {/* FAQ List */}
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-14 text-center"
        >
          <p className="text-neutral-500 text-sm mb-4">Still have questions? We'd love to talk.</p>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#00E88F]/10 border border-[#00E88F]/30 text-[#00E88F] text-sm font-semibold hover:bg-[#00E88F]/20 hover:border-[#00E88F]/60 transition-all duration-300 group"
          >
            Book a Free Consultation
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </motion.div>

      </div>
    </section>
  );
}
