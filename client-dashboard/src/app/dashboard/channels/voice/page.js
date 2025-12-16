"use client";
import { useState, useEffect } from 'react';
import { Phone, Search, Plus, CheckCircle2, Loader2, PhoneCall, Info, Zap, Globe, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import VapiWebDialer from '@/components/VapiWebDialer';
import AiOutboundDialer from '@/components/AiOutboundDialer';
import { useBusinessContext } from '@/context/BusinessContext';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const S = {
  card: { background: 'var(--bg-card)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid var(--border)', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-card)' },
  input: { width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', transition: 'all 0.2s' },
  btn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }
};

export default function VoiceChannels() {
  const { businessId, loading: bizLoading } = useBusinessContext();
  const [myNumbers, setMyNumbers] = useState([]);
  const [areaCode, setAreaCode] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    if (businessId) fetchMyNumbers();
  }, [businessId]);

  const fetchMyNumbers = async () => {
    if (!businessId) return;
    const { data } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('business_id', businessId)
      .eq('provider', 'twilio');
    
    if (data) setMyNumbers(data);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    try {
      const res = await fetch(`/api/twilio/search?country=US&areaCode=${areaCode}`);
      const data = await res.json();
      if (data.availablePhoneNumbers) {
        setSearchResults(data.availablePhoneNumbers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const purchaseNumber = async (phoneNumber) => {
    setIsBuying(phoneNumber);
    try {
      const res = await fetch('/api/twilio/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, businessId })
      });
      const data = await res.json();
      if (data.success) {
        setMyNumbers([...myNumbers, { id: data.sid, phone_number: phoneNumber, capabilities: ['voice', 'sms'] }]);
        setSearchResults(searchResults.filter(n => n.phoneNumber !== phoneNumber));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '99px', padding: '4px 12px', marginBottom: '12px' }}>
            <PhoneCall size={11} color="#00E88F" />
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#00E88F', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Voice Infrastructure</span>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-primary)', margin: 0 }}>Voice Channels</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '8px 0 0', fontWeight: 500 }}>
            Connect your existing lines to the neural voice engine via intelligent forwarding.
          </p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ ...S.card, background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)', padding: '28px', marginBottom: '32px', display: 'flex', gap: '24px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00E88F', shrink: 0 }}>
          <Info size={28} />
        </div>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#00E88F', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Integration Protocol</h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            To activate AI on your current business line, use the <strong style={{ color: 'var(--text-primary)' }}>Conditional Forwarding</strong> method. Purchase a System Number below, then configure your carrier to forward missed calls to it.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '24px' }}>
             {[
               { icon: <Zap size={14} />, t: 'Acquire Node', s: 'Buy a System Number' },
               { icon: <Globe size={14} />, t: 'Link Carrier', s: 'Set up Forwarding' },
               { icon: <ShieldCheck size={14} />, t: 'Neural Live', s: 'AI takes the call' },
             ].map((item, i) => (
               <div key={i} style={{ display: 'flex', gap: '10px' }}>
                 <div style={{ color: '#00E88F', marginTop: '2px' }}>{item.icon}</div>
                 <div>
                   <div style={{ fontSize: '12px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.t}</div>
                   <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.s}</div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', marginBottom: '32px' }}>
        
        {/* Active Numbers */}
        <div style={{ ...S.card, padding: '28px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={15} color="#00E88F" /> Active Infrastructure
          </h2>

          {myNumbers.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border)', borderRadius: '20px' }}>
               <Phone size={32} style={{ color: 'var(--text-muted)', opacity: 0.2, margin: '0 auto 16px' }} />
               <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>No active nodes</p>
               <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Provision a system number to begin.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {myNumbers.map(num => (
                <div key={num.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(0,232,143,0.08)', border: '1px solid rgba(0,232,143,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00E88F' }}>
                      <Phone size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{num.phone_number}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginTop: '2px' }}>{num.capabilities?.join(' • ')} ENABLED</div>
                    </div>
                  </div>
                  <div style={{ padding: '4px 10px', borderRadius: '99px', background: 'rgba(0,232,143,0.1)', color: '#00E88F', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}>Active</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search & Buy */}
        <div style={{ ...S.card, padding: '28px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={15} color="#60a5fa" /> Provision New Node
          </h2>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Area Code (e.g. 415)" value={areaCode} onChange={e => setAreaCode(e.target.value)} maxLength={3} style={{ ...S.input, paddingLeft: '40px' }} />
            </div>
            <button type="submit" disabled={isSearching} style={{ ...S.btn, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-primary)', minWidth: '100px', justifyContent: 'center' }}>
              {isSearching ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }} className="custom-scrollbar">
            {searchResults.map(result => (
              <div key={result.phoneNumber} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '14px', transition: 'all 0.2s' }} className="search-row">
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{result.friendlyName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{result.locality || 'US Region'}</div>
                </div>
                <button onClick={() => purchaseNumber(result.phoneNumber)} disabled={isBuying === result.phoneNumber} style={{ ...S.btn, padding: '7px 14px', background: 'transparent', border: '1px solid #00E88F', color: '#00E88F', fontSize: '11px' }} className="buy-btn">
                  {isBuying === result.phoneNumber ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14} /> Buy $1.15/mo</>}
                </button>
              </div>
            ))}
            {searchResults.length === 0 && areaCode && !isSearching && (
              <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', padding: '20px' }}>No nodes found in area {areaCode}.</p>
            )}
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <AiOutboundDialer />
        <VapiWebDialer />
      </div>

      <style>{`
        .search-row:hover { background: rgba(255,255,255,0.03) !important; border-color: rgba(96,165,250,0.3) !important; }
        .buy-btn:hover { background: #00E88F !important; color: #000 !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
