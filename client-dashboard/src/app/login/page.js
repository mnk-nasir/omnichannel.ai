'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { login, signup } from './actions';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';

function LoginContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[360px] relative z-10 text-left"
    >
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-6 text-xs group uppercase font-black tracking-widest"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
        Back to home
      </Link>

      <div className="w-full bg-[#13171D]/40 backdrop-blur-3xl rounded-[2rem] border border-white/[0.08] shadow-[0_40px_80px_rgba(0,0,0,0.4)] p-6 md:p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-neutral-500 mt-1 text-xs font-medium">
            {isSignUp ? 'Join the future of automation' : 'Log in to your AI Command Center'}
          </p>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-medium leading-relaxed"
          >
            {message}
          </motion.div>
        )}

        <form className="space-y-2.5">
          {isSignUp && (
            <>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 ml-1">Full Name</label>
                <div className="relative group">
                  <input 
                    name="full_name" 
                    type="text" 
                    required 
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.05] rounded-xl text-white text-xs placeholder:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#00E88F]/20 focus:border-[#00E88F]/40 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 ml-1">Phone Number</label>
                <div className="relative group">
                  <input 
                    name="phone" 
                    type="tel" 
                    required 
                    placeholder="+1 234 567 890"
                    className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.05] rounded-xl text-white text-xs placeholder:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#00E88F]/20 focus:border-[#00E88F]/40 transition-all"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600 group-focus-within:text-[#00E88F] transition-colors" />
              <input 
                id="email" 
                name="email" 
                type="email" 
                required 
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.05] rounded-xl text-white text-xs placeholder:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#00E88F]/20 focus:border-[#00E88F]/40 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Password</label>
              {!isSignUp && (
                <Link href="#" className="text-[9px] font-bold text-[#00E88F]/60 hover:text-[#00E88F] transition-colors uppercase tracking-wider">Forgot?</Link>
              )}
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600 group-focus-within:text-[#00E88F] transition-colors" />
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.05] rounded-xl text-white text-xs placeholder:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#00E88F]/20 focus:border-[#00E88F]/40 transition-all"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-4">
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              formAction={isSignUp ? signup : login}
              className="w-full py-3 bg-[#00E88F] hover:bg-[#00c77a] text-[#080C10] font-black text-xs rounded-xl shadow-[0_20px_40px_rgba(0,232,143,0.15)] transition-all flex items-center justify-center gap-2 group"
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <div className="flex items-center gap-3 py-2">
              <div className="h-px bg-white/[0.05] flex-1" />
              <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest whitespace-nowrap">
                {isSignUp ? 'already have an account?' : 'or create account'}
              </span>
              <div className="h-px bg-white/[0.05] flex-1" />
            </div>
            <motion.button 
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 bg-transparent border border-white/10 hover:bg-white/[0.03] text-white text-[10px] font-bold rounded-xl transition-all uppercase tracking-widest"
            >
              {isSignUp ? 'Back to Login' : 'Sign up for Omnixa'}
            </motion.button>
          </div>
        </form>
      </div>

      <p className="text-center mt-8 text-neutral-600 text-[10px] font-bold uppercase tracking-widest">
        Enterprise Security &middot; <span className="text-neutral-500">GDPR Ready</span>
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#080C10] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#00E88F]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <Suspense fallback={<div className="text-white font-black uppercase tracking-widest opacity-20 animate-pulse">Initializing Security...</div>}>
         <LoginContent />
      </Suspense>
    </div>
  );
}
