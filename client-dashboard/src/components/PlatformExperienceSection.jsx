'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

const CARDS = [
  {
    id: 1,
    title: "Analyze Module:",
    description: "Discover Insights with Analytics for AI Agent Conversations",
    videoSrc: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
  {
    id: 2,
    title: "Conversational KB:",
    description: "Unleash the true potential of enterprise intelligence via Agentic RAG",
    videoSrc: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  },
  {
    id: 3,
    title: "Automated Testing:",
    description: "Ship Confidence Faster with comprehensive AI testing tools.",
    videoSrc: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  },
  {
    id: 4,
    title: "Omnichannel Routing:",
    description: "Seamlessly route conversations across all platforms efficiently.",
    videoSrc: "https://media.w3.org/2010/05/sintel/trailer.mp4",
  },
  {
    id: 5,
    title: "Agent Builder:",
    description: "Design custom AI workflows with intuitive visual builders.",
    videoSrc: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  }
];

export default function PlatformExperienceSection() {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isClient, setIsClient] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const videoRefs = useRef([]);

  useEffect(() => {
    setIsClient(true);
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CARDS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleNext = () => {
    setIsPaused(true);
    setCurrentIndex((prev) => (prev + 1) % CARDS.length);
  };

  const handlePrev = () => {
    setIsPaused(true);
    setCurrentIndex((prev) => (prev - 1 + CARDS.length) % CARDS.length);
  };

  // Pause inactive videos when scrolling
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video && index !== currentIndex) {
        video.pause();
      }
    });
  }, [currentIndex]);

  // Helper to get card positions relative to current index
  const getCardPosition = (index) => {
    const diff = index - currentIndex;
    const len = CARDS.length;
    // Normalize to handle wrap around
    let offset = diff;
    if (diff > len / 2) offset -= len;
    if (diff < -len / 2) offset += len;

    return offset;
  };

  if (!isClient) return null;

  return (
    <section className="relative w-full py-24 sm:py-32 bg-[#080C10] flex flex-col items-center justify-center overflow-hidden">

      {/* Soft background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6e5ff2]/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-16 text-center z-10 px-4 tracking-tight"
      >
        Experience our Agentic AI platform
      </motion.h2>

      <div className="relative w-full max-w-6xl mx-auto h-[450px] sm:h-[550px] flex items-center justify-center perspective-[1000px]">

        {CARDS.map((card, index) => {
          const offset = getCardPosition(index);
          const isCenter = offset === 0;

          return (
            <motion.div
              key={card.id}
              initial={false}
              animate={{
                x: `${offset * 60}%`,
                scale: isCenter ? 1 : 0.8 - Math.abs(offset) * 0.1,
                opacity: isCenter ? 1 : Math.max(0.3, 1 - Math.abs(offset) * 0.3),
                zIndex: CARDS.length - Math.abs(offset),
                rotateY: offset * -15, // Creates the 3D coverflow effect
              }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1], // Custom spring-like easing
              }}
              className="absolute w-[80%] max-w-[400px] sm:max-w-[500px] h-auto flex flex-col items-center"
              style={{
                transformOrigin: "center center",
              }}
            >
              {/* Card Container */}
              <div className="w-full bg-[#13171D] rounded-2xl sm:rounded-3xl shadow-[0_0_40px_rgba(110,95,242,0.15)] overflow-hidden border border-white/[0.05]">

                {/* Video Container (Top Half) */}
                <div className="relative w-full aspect-video bg-[#0c1015] overflow-hidden flex items-center justify-center">
                  <video
                    ref={(el) => (videoRefs.current[index] = el)}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-auto ${!isCenter ? 'opacity-50' : 'opacity-100'}`}
                    src={card.videoSrc}
                    loop
                    muted
                    playsInline
                    controls={true}
                    onPlay={() => setIsPaused(true)}
                    onClick={() => {
                      setIsPaused(true);
                      // Optional: clicking a side video brings it to center
                      if (!isCenter) setCurrentIndex(index);
                    }}
                  />
                </div>

                {/* Text Content (Bottom Half) */}
                <div className="p-6 sm:p-8 bg-[#13171D]">
                  <h3 className="text-[#8a7df4] font-bold text-lg sm:text-xl mb-2 flex items-center gap-2">
                    {card.title}
                  </h3>
                  <p className="text-neutral-300 font-medium text-base sm:text-lg leading-snug">
                    {card.description}
                  </p>
                </div>

              </div>
            </motion.div>
          );
        })}

        {/* Navigation Arrows */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-4 sm:px-12 pointer-events-none z-50">
          <button
            onClick={handlePrev}
            className="w-12 h-12 bg-white/5 border border-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-md text-white hover:bg-white/10 hover:text-[#6e5ff2] hover:shadow-lg transition-all pointer-events-auto"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="w-12 h-12 bg-white/5 border border-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-md text-white hover:bg-white/10 hover:text-[#6e5ff2] hover:shadow-lg transition-all pointer-events-auto"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

    </section>
  );
}
