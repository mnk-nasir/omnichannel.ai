'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthModal from './AuthModal';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4 backdrop-blur-md border-b border-white/[0.07] bg-[#080C10]/70">
        <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center">
          <img src="/omnixa-logo-dark.png" alt="Omnixa" className="h-[32px] sm:h-[38px] w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={() => setIsOpen(true)}
            className="text-[11px] sm:text-sm font-bold uppercase tracking-widest text-[#00E88F] hover:text-[#00c77a] transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => setIsOpen(true)}
            className="text-[10px] sm:text-sm font-black uppercase tracking-tighter sm:tracking-widest px-4 py-2 sm:px-8 sm:py-2.5 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-[#00E88F] hover:text-[#080C10] hover:border-[#00E88F] transition-all"
          >
            Dashboard
          </button>
        </div>
      </nav>

      <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
