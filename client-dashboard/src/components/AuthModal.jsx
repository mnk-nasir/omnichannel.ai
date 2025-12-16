'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { login, signup, signInWithGoogle } from '@/app/login/actions';
import { useState } from 'react';

export default function AuthModal({ isOpen, onClose }) {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[360px] bg-[#13171D] rounded-[2rem] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            {/* Close Button */}
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-5 right-5 p-1.5 text-neutral-500 hover:text-white transition-colors z-20 hover:bg-white/5 rounded-lg"
            >
              <X size={18} />
            </button>

            {/* Decorative Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[150px] bg-[#00E88F]/10 rounded-full blur-[60px] pointer-events-none" />

            <div className="p-6 md:p-8 relative z-10">
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-black text-white tracking-tight">
                  {isSignUp ? 'Create Omnixa ID' : 'Welcome Back'}
                </h2>
                <p className="text-neutral-500 mt-1 text-xs font-medium">
                  {isSignUp ? 'Join the future of automation' : 'Log in to your AI Console'}
                </p>
              </div>

              {/* Google Button */}
              <form>
                <button
                  formAction={signInWithGoogle}
                  className="w-full py-3 bg-white/[0.03] border border-white/10 rounded-xl hover:bg-white/[0.08] transition-all flex items-center justify-center gap-3 group mb-5"
                >
                  <svg width="16" height="16" viewBox="0 0 18 18">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.248h2.908c1.701-1.567 2.684-3.874 2.684-6.606z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.248c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.583-5.036-3.711H.957v2.331C2.438 15.992 5.487 18 9 18z" fill="#34A853"/>
                    <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.173.282-1.712V4.957H.957C.347 6.173 0 7.549 0 9s.347 2.827.957 4.043l3.007-2.331z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.582C13.463.891 11.426 0 9 0 5.487 0 2.438 2.008.957 5.043l3.007 2.331C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                  <span className="text-xs font-bold text-white tracking-wide">Continue with Google</span>
                </button>
              </form>

              <div className="flex items-center gap-3 mb-5">
                <div className="h-px bg-white/5 flex-1" />
                <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest whitespace-nowrap">or use email</span>
                <div className="h-px bg-white/5 flex-1" />
              </div>

              {/* Form */}
              <form className="space-y-2.5">
                {isSignUp && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 ml-1">Full Name</label>
                      <input 
                        name="full_name" 
                        type="text" 
                        required 
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white text-xs placeholder:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#00E88F]/20 focus:border-[#00E88F]/40 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 ml-1">Phone Number</label>
                      <input 
                        name="phone" 
                        type="tel" 
                        required 
                        placeholder="+1 234 567 890"
                        className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white text-xs placeholder:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#00E88F]/20 focus:border-[#00E88F]/40 transition-all"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 ml-1">Email Address</label>
                  <input 
                    name="email" 
                    type="email" 
                    required 
                    placeholder="name@company.com"
                    className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white text-xs placeholder:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#00E88F]/20 focus:border-[#00E88F]/40 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Password</label>
                    {!isSignUp && (
                      <button type="button" className="text-[9px] font-bold text-[#00E88F]/60 hover:text-[#00E88F] transition-colors">Forgot?</button>
                    )}
                  </div>
                  <input 
                    name="password" 
                    type="password" 
                    required 
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white text-xs placeholder:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#00E88F]/20 focus:border-[#00E88F]/40 transition-all"
                  />
                </div>

                <div className="pt-2">
                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    formAction={isSignUp ? signup : login}
                    className="w-full py-3 bg-[#00E88F] hover:bg-[#00c77a] text-[#080C10] font-black text-xs rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 group"
                  >
                    {isSignUp ? 'Sign Up' : 'Sign In'}
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </div>
              </form>

              {/* Toggle Sign Up / Sign In */}
              <div className="mt-5 text-center border-t border-white/5 pt-5">
                <button 
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-[10px] font-bold text-neutral-500 hover:text-[#00E88F] transition-colors uppercase tracking-widest"
                >
                  {isSignUp ? 'Already have an account? Sign In' : 'Need an engine? Sign Up'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
