"use client";

import { useState, useEffect } from 'react';
import Vapi from "@vapi-ai/web";
import { Mic, PhoneOff, Loader2, Volume2 } from 'lucide-react';

// Initialize Vapi instance
let vapiInstance = null;

export default function VapiWebDialer() {
  const [callStatus, setCallStatus] = useState('inactive'); // 'inactive', 'loading', 'active'
  const [volumeLevel, setVolumeLevel] = useState(0);

  useEffect(() => {
    // We only want to instantiate Vapi on the client side
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (publicKey && !vapiInstance) {
       vapiInstance = new Vapi(publicKey);
    }

    if (vapiInstance) {
        vapiInstance.on('call-start', () => {
            setCallStatus('active');
        });

        vapiInstance.on('call-end', () => {
            setCallStatus('inactive');
            setVolumeLevel(0);
        });

        vapiInstance.on('error', (e) => {
            console.error("Vapi Error:", e);
            setCallStatus('inactive');
        });

        vapiInstance.on('volume-level', (volume) => {
            setVolumeLevel(volume);
        });
    }

    return () => {
        // Cleanup listener on unmount
        if (vapiInstance) {
            vapiInstance.removeAllListeners();
        }
    };
  }, []);

  const toggleCall = async () => {
    if (!vapiInstance) return;

    if (callStatus === 'active' || callStatus === 'loading') {
        vapiInstance.stop();
        setCallStatus('inactive');
    } else {
        setCallStatus('loading');
        try {
            const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
            await vapiInstance.start(assistantId);
        } catch (error) {
            console.error(error);
            setCallStatus('inactive');
        }
    }
  };

  return (
    <div className="bg-white border text-center border-neutral-200 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4 relative overflow-hidden">
        {callStatus === 'active' && (
             <div 
               className="absolute inset-0 bg-emerald-200 opacity-50"
               style={{ transform: `scale(${1 + volumeLevel * 2})`, transition: 'transform 0.1s ease-out' }}
             />
        )}
        <Volume2 className="text-emerald-600 relative z-10" size={32} />
      </div>
      
      <h2 className="text-xl font-semibold text-neutral-800 mb-2">Browser Web Dialer</h2>
      <p className="text-sm text-neutral-500 mb-6 max-w-sm">
        Test your Voice AI Agent directly through your browser microphone without needing a phone!
      </p>

      <button
        onClick={toggleCall}
        className={`flex items-center justify-center px-8 py-4 rounded-full font-bold text-white transition-all shadow-md w-64 ${
            callStatus === 'active' 
              ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' 
              : callStatus === 'loading'
              ? 'bg-neutral-800 hover:bg-neutral-900 shadow-neutral-200 cursor-wait'
              : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
        }`}
      >
        {callStatus === 'loading' ? (
           <>
             <Loader2 className="animate-spin mr-2" size={20} /> Connecting...
           </>
        ) : callStatus === 'active' ? (
           <>
             <PhoneOff className="mr-2" size={20} /> End Call
           </>
        ) : (
           <>
             <Mic className="mr-2" size={20} /> Start Web Call
           </>
        )}
      </button>
      
      {callStatus === 'active' && (
          <p className="mt-4 text-xs font-semibold text-emerald-600 animate-pulse uppercase tracking-widest">
            ● Live Call Active
          </p>
      )}
    </div>
  );
}
