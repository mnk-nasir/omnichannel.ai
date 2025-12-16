'use client';

import { motion } from 'framer-motion';

// Structure exactly how you will add your own local PNGs
// You will place your downloaded images in the Next.js "public" folder (e.g., public/logos/brand1.png) 
// and reference them below directly with a forward slash: "/logos/brand1.png"
const BRANDS = [
  { 
    name: 'Netflix', 
    imageSrc: '/logos/netflix.png',
  },
  { 
    name: 'Spotify', 
    imageSrc: '/logos/spotify.png', 
  },
  { 
    name: 'Slack', 
    imageSrc: '/logos/slack.png', 
  },
  { 
    name: 'Airbnb', 
    imageSrc: '/logos/airbnb.png', 
  },
  { 
    name: 'YouTube', 
    imageSrc: '/logos/youtube.png', 
  },
  { 
    name: 'Discord', 
    imageSrc: '/logos/discord.png', 
  },
];

const LOOP = [...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS];

export default function HeroLogos() {
  return (
    <div className="w-full flex flex-col lg:flex-row relative z-20 overflow-visible mt-4 -mb-10">
      
      {/* Left Label */}
      <div className="flex lg:hidden justify-center items-center py-4 bg-transparent border-b border-white/[0.05]">
        <span className="text-white/60 font-bold text-sm tracking-wide">Trusted by 1300+ global brands</span>
      </div>

      <div className="hidden lg:flex flex-col justify-center items-end pr-8 pl-8 py-4 border-r border-white/[0.05] bg-transparent min-w-[260px]">
        <span className="text-white/60 font-medium text-sm tracking-wide">Trusted by</span>
        <span className="text-white font-bold text-sm tracking-wide">1300+ global brands</span>
      </div>
      
      {/* Marquee Wrapper */}
      <div className="flex-1 overflow-hidden relative flex items-center bg-transparent min-h-[60px] lg:min-h-0">
        
        {/* Fade gradients (matching the root background #080C10) */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[#080C10] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[#080C10] to-transparent z-10 pointer-events-none" />

        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            repeat: Infinity,
            ease: 'linear',
            duration: 30, // Adjust speed
          }}
          className="flex items-center w-max py-4"
        >
          {LOOP.map((brand, i) => (
            <div key={i} className="flex items-center justify-center mx-8 md:mx-14 opacity-80 hover:opacity-100 transition-all hover:scale-110">
              <img 
                src={brand.imageSrc} 
                alt={`${brand.name}`}
                className="h-7 sm:h-9 w-auto object-contain"
                // When using custom pngs, if they aren't fully white, you can uncomment the line below to force them white:
                // className="h-7 sm:h-9 w-auto object-contain filter brightness-0 invert"
              />
            </div>
          ))}
        </motion.div>
      </div>

    </div>
  );
}
