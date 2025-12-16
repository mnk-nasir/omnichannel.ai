"use client";
import { useState, useEffect } from "react";
import { Send, Phone, PhoneOff, Loader2 } from "lucide-react";
import Vapi from "@vapi-ai/web";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Initialize without realtime for history, but add channel logic in useEffect
let supabase;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export function SandboxChat() {
  const [businessId, setBusinessId] = useState("00000000-0000-4000-8000-000000000001");
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! Test the AI via the Gateway here.", sender: "ai" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [callStatus, setCallStatus] = useState("inactive"); // inactive, loading, active
  const [vapi, setVapi] = useState(null);

  useEffect(() => {
    // 1. Fetch User Profile & Business Identity
    const fetchProfile = async () => {
      if (!supabase) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('business_id')
        .single();

      if (profile?.business_id) {
        setBusinessId(profile.business_id);
        console.log("🛠️ Sandbox Identity Synced:", profile.business_id);
      } else {
        setBusinessId(user.id);
        console.log("🛠️ Sandbox Identity Synced to User ID:", user.id);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    // 2. Fetch Chat History
    const fetchHistory = async () => {
      if (!supabase) return;

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('business_id', businessId)
        .eq('user_phone', 'sandbox_user')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        const formatted = data.map(msg => ({
          id: msg.id,
          text: msg.message,
          sender: msg.sender === 'ai' ? 'ai' : 'user'
        }));
        setMessages(formatted);
      } else {
        setMessages([{ id: 1, text: "Hello! Test the AI via the Gateway here.", sender: "ai" }]);
      }
    };
    fetchHistory();

    // 3. Setup Realtime Subscription
    let channel;
    if (supabase) {
      channel = supabase
        .channel('sandbox-chat')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `business_id=eq.${businessId}`
          },
          (payload) => {
            if (payload.new.user_phone === 'sandbox_user' && payload.new.sender === 'ai') {
              setMessages((prev) => {
                if (prev.some(m => m.id === payload.new.id)) return prev;
                return [...prev, { id: payload.new.id, text: payload.new.message, sender: "ai" }];
              });
              setIsTyping(false);
            }
          }
        )
        .subscribe();
    }

    // 4. Initialize Vapi voice
    const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "dummy_public_key");
    setVapi(vapiInstance);

    vapiInstance.on("call-start", () => setCallStatus("active"));
    vapiInstance.on("call-end", () => setCallStatus("inactive"));

    return () => {
      vapiInstance.removeAllListeners();
      if (channel) supabase.removeChannel(channel);
    };
  }, [businessId]);

  const toggleCall = async () => {
    if (callStatus === "active") {
      vapi.stop();
      setCallStatus("inactive");
    } else {
      setCallStatus("loading");
      try {
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "dummy_assistant_id");
      } catch (err) {
        console.error("Vapi Start Error:", err);
        setCallStatus("inactive");
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const messageId = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString();
    const newMsg = { id: messageId, text: input, sender: "user" };
    setMessages((prev) => [...prev, newMsg]);
    setIsTyping(true);
    setInput("");

    try {
      const res = await fetch("/api/webhooks/incoming", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "web",
          business_id: businessId,
          user_phone: "sandbox_user",
          message: newMsg.text
        })
      });

      if (!res.ok) {
        console.error("Failed to send message to gateway");
        setIsTyping(false);
      }

      setTimeout(() => {
        setIsTyping((current) => {
          if (current) {
            const fallbackId = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString();
            setMessages((prev) => [
              ...prev,
              { id: fallbackId, text: "⚠️ Timeout: The Python Brain did not respond. Check if the Celery worker is running.", sender: "ai" }
            ]);
            return false;
          }
          return current;
        });
      }, 30000); // 30 seconds timeout

    } catch (error) {
      console.error(error);
      setIsTyping(false);
    }
  };

  return (
    <div className="w-full max-w-sm h-[600px] bg-white border border-neutral-200 shadow-xl rounded-3xl flex flex-col overflow-hidden relative">
      <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">AI</div>
          <div>
            <h3 className="font-semibold leading-tight">Omnichannel AI</h3>
            <p className="text-xs text-emerald-100">Typically replies instantly</p>
          </div>
        </div>
        <button
          onClick={toggleCall}
          disabled={callStatus === 'loading'}
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-colors ${callStatus === 'active' ? 'bg-rose-500 hover:bg-rose-600 text-white' :
              callStatus === 'loading' ? 'bg-emerald-500 opacity-70 text-emerald-100' :
                'bg-emerald-500 hover:bg-emerald-400 text-white'
            }`}
          title={callStatus === 'active' ? "End Voice Call" : "Start Voice Call"}
        >
          {callStatus === 'loading' ? <Loader2 size={18} className="animate-spin" /> :
            callStatus === 'active' ? <PhoneOff size={18} /> :
              <Phone size={18} />}
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 bg-[#F5F5EC] p-4 overflow-y-auto flex flex-col space-y-3 relative">
        {/* WhatsApp-style pattern background overlay could go here */}

        {messages.map((m) => (
          <div key={m.id} className={`max-w-[85%] p-3 rounded-xl text-sm shadow-sm ${m.sender === "user" ? "bg-emerald-100 text-emerald-900 self-end rounded-tr-sm" : "bg-white text-neutral-800 self-start rounded-tl-sm"}`}>
            {m.text}
          </div>
        ))}
        {isTyping && (
          <div className="bg-white text-neutral-500 self-start p-3 rounded-xl rounded-tl-sm text-sm shadow-sm flex space-x-1 w-16">
            <span className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce"></span>
          </div>
        )}
      </div>

      {/* Inputs */}
      <div className="bg-[#F0F2F5] p-3 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 bg-white rounded-full px-4 py-2.5 text-sm outline-none border border-transparent focus:border-emerald-300"
        />
        <button
          onClick={sendMessage}
          className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center transition-colors"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
