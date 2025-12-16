'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Zap, TrendingUp, Users } from 'lucide-react';

const caseStudies = [
  {
    id: 'vipdesk',
    name: 'vipdesk',
    logo: 'https://cdn.worldvectorlogo.com/logos/vipdesk-connect.svg',
    color: '#80bc00',
    title: 'Customer Experience Leader',
    quote: "Omnixa has redefined our throughput. We handle 3x more queries without increasing headcount, providing instant support across every touchpoint.",
    author: 'Sarah Jenkins',
    role: 'CEO, GrowthFlow',
    stats: [
      { label: 'Deflection Rate', val: '92%', icon: <Zap className="w-3 h-3" /> },
      { label: 'Satisfaction', val: '4.9/5', icon: <TrendingUp className="w-3 h-3" /> }
    ],
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'lionparcel',
    name: 'Lion Parcel',
    logo: 'https://lionparcel.com/assets/images/logo-lionparcel.png',
    color: '#ffffff',
    title: 'Logistics Giant',
    quote: "Revolutionizing customer support in the logistics industry, Lion Parcel is driving an unparalleled service experience with Gen AI-powered dynamic AI agents.",
    author: 'Mr. Budi Santoso',
    role: 'Chief Experience Officer',
    stats: [
      { label: 'Deflection Rate', val: '85%', icon: <Zap className="w-3 h-3" /> },
      { label: 'High Adoption', val: '84K+', icon: <Users className="w-3 h-3" /> }
    ],
    image: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'waste',
    name: 'Waste Connections',
    logo: 'https://logos-world.net/wp-content/uploads/2022/03/Waste-Connections-Logo.png',
    color: '#005a3c',
    title: 'Industrial Solutions',
    quote: "Environmental services require precise automation. Omnixa's multi-channel sync ensures none of our service requests slip through the cracks.",
    author: ' Marcus Chen',
    role: 'Operations Director',
    stats: [
      { label: 'Efficiency', val: '+40%', icon: <TrendingUp className="w-3 h-3" /> },
      { label: 'Cost Savings', val: '$2M+', icon: <Zap className="w-3 h-3" /> }
    ],
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'airasia',
    name: 'Air Asia',
    logo: 'https://logos-world.net/wp-content/uploads/2021/11/AirAsia-Logo.png',
    color: '#e31c1b',
    title: 'Aviation Leader',
    quote: "Scaling support for millions of travelers is only possible with Omnixa. It's the most reliable AI infrastructure we've ever integrated.",
    author: 'Elena Rodriguez',
    role: 'Founder, Bloom Digital',
    stats: [
      { label: 'Scale', val: 'Millions', icon: <Users className="w-3 h-3" /> },
      { label: 'Response', val: '<2s', icon: <Zap className="w-3 h-3" /> }
    ],
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?auto=format&fit=crop&q=80&w=800'
  }
];

export default function TestimonialsSection() {
  const [active, setActive] = useState(caseStudies[0]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-cycle logic
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActive((prev) => {
        const currentIndex = caseStudies.findIndex(cs => cs.id === prev.id);
        const nextIndex = (currentIndex + 1) % caseStudies.length;
        return caseStudies[nextIndex];
      });
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleManualSelect = (cs) => {
    setIsAutoPlaying(false);
    setActive(cs);
  };

  return (
    <section className="py-24 relative overflow-hidden bg-[#080C10]">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#00E88F]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-neutral-400 text-[10px] font-black uppercase tracking-widest mb-6"
          >
            Case Studies and Testimonials
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            The results speak for themselves, <br />
            <span className="text-[#00E88F]">just like our customers</span>
          </h2>
        </div>

        {/* Logo Selection Grid - Attached to details */}
        <div className="flex flex-wrap lg:flex-nowrap gap-4 mb-0">
          {caseStudies.map((cs) => {
            const isActive = active.id === cs.id;
            return (
              <motion.button
                key={cs.id}
                onClick={() => handleManualSelect(cs)}
                animate={{ 
                  flexGrow: isActive ? 2.5 : 1,
                  backgroundColor: isActive ? cs.color : 'rgba(255,255,255,0.02)'
                }}
                className={`relative h-40 flex items-center justify-center p-8 transition-all overflow-hidden border border-white/[0.05] border-b-0 rounded-t-[3rem] group ${isActive ? 'z-20 shadow-2xl' : 'z-10'}`}
                style={{ flexBasis: isActive ? '40%' : '15%' }}
              >
                 {isActive && cs.id === 'lionparcel' ? (
                    <div className="flex items-center justify-between w-full px-4">
                       <img src={cs.logo} alt={cs.name} className="h-8 object-contain invert" />
                       <span className="text-[#080C10] font-black text-lg uppercase tracking-tighter">Logistics</span>
                    </div>
                 ) : (
                    <img 
                      src={cs.logo} 
                      alt={cs.name} 
                      className={`h-8 object-contain transition-all ${isActive ? 'invert brightness-0' : 'opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0'}`} 
                    />
                 )}
                 
                 {isActive && (
                    <motion.div 
                       layoutId="active-indicator"
                       className="absolute bottom-0 left-0 right-0 h-1 bg-white/20"
                    />
                 )}
              </motion.button>
            );
          })}
        </div>

        {/* Selected Details Display - Flushed with Logos */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full bg-[#13171D]/60 backdrop-blur-3xl rounded-b-[3rem] rounded-tr-[3rem] lg:rounded-tr-none border border-white/[0.08] border-t-0 overflow-hidden flex flex-col lg:flex-row items-stretch min-h-[480px]"
          >
            <div className="flex-1 p-10 lg:p-20 flex flex-col justify-center">
               <div className="flex items-center gap-3 mb-10">
                  <div className="flex -space-x-1">
                     {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 bg-[#00E88F] rounded-full shadow-[0_0_8px_rgba(0,232,143,1)]" />)}
                  </div>
                  <span className="text-[#00E88F] text-[10px] font-black uppercase tracking-[0.3em]">Success Story</span>
               </div>
               
               <p className="text-white text-2xl lg:text-3xl font-medium leading-tight mb-12 tracking-tight">
                  "{active.quote}"
               </p>

               <div className="flex items-center justify-between pt-10 border-t border-white/5">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00E88F]/20 to-indigo-500/20 p-px">
                        <div className="w-full h-full rounded-2xl bg-[#080C10] overflow-hidden flex items-center justify-center">
                           <img src={`https://ui-avatars.com/api/?name=${active.author}&background=080C10&color=00E88F&bold=true`} alt={active.author} className="w-8 h-8 opacity-80" />
                        </div>
                     </div>
                     <div>
                       <h4 className="text-white font-black text-sm tracking-tight">{active.author}</h4>
                       <p className="text-neutral-500 text-[9px] font-black uppercase tracking-widest mt-0.5">{active.role}</p>
                     </div>
                  </div>

                  <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all group">
                     Read Case Study
                     <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
            </div>

            <div className="w-full lg:w-[42%] relative min-h-[400px] lg:min-h-0 bg-[#080C10]">
               <img src={active.image} alt={active.name} className="absolute inset-0 w-full h-full object-cover opacity-90" />
               <div className="absolute inset-0 bg-gradient-to-r from-[#13171D] via-transparent to-transparent hidden lg:block" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#13171D] via-transparent to-transparent lg:hidden" />
               
               {/* KPI Below Image Area */}
               <div className="absolute bottom-6 left-6 right-6 flex gap-3">
                  {active.stats.map((s, i) => (
                    <div key={i} className="flex-1 bg-[#13171D]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                       <div className="text-[#00E88F] mb-1 font-bold flex items-center gap-2">
                          {s.icon}
                          <span className="text-[9px] font-black uppercase tracking-[0.1em]">{s.label}</span>
                       </div>
                       <div className="text-white text-xl font-black">{s.val}</div>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
