"use client";

import { useState, useEffect, useRef } from "react";
import {
  Building2, FileText, Sparkles, Upload, ArrowRight, ArrowLeft,
  CheckCircle2, Target, UserCircle, Bot, MessageSquare, X
} from "lucide-react";
import Link from "next/link";
import { useBusinessContext } from "@/context/BusinessContext";

const STEPS = [
  { id: 1, name: "Choose Industry", icon: Building2 },
  { id: 2, name: "Company Context", icon: FileText },
  { id: 3, name: "Knowledge Base", icon: Upload },
  { id: 4, name: "AI Persona", icon: Sparkles }
];

const INDUSTRIES = [
  { id: "11111111-1111-4111-8111-111111111111", name: "Real Estate", emoji: "🏠", description: "Property listings, viewing bookings, and buyer qualification." },
  { id: "22222222-2222-4222-8222-222222222222", name: "Healthcare", emoji: "🏥", description: "Clinic appointments, patient FAQs, and service hours." },
  { id: "33333333-3333-4333-8333-333333333333", name: "Ecommerce", emoji: "🛒", description: "Order tracking, product discovery, and customer support." },
  { id: "44444444-4444-4444-8444-444444444444", name: "Education", emoji: "📚", description: "Course admissions, fee info, and student enrollment." },
  { id: "55555555-5555-4555-8555-555555555555", name: "Automotive", emoji: "🚗", description: "Car inventory, test drive bookings, and financing." },
  { id: "66666666-6666-4666-8666-666666666666", name: "Food & Beverage", emoji: "🍽️", description: "Table bookings, menu inquiries, and delivery updates." },
  { id: "77777777-7777-4777-8777-777777777777", name: "Hospitality", emoji: "🏨", description: "Room reservations, guest services, and local guides." },
  { id: "00000000-0000-0000-0000-000000000000", name: "Other", emoji: "⚡", description: "Build a custom AI expert for any specialized business niche." },
];

const SI = {
  input: {
    width: '100%', padding: '12px 14px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
    borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
  },
  label: {
    display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px',
  },
};

export default function SetupAgentPage() {
  const { businessId } = useBusinessContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({ industry_id: "", company_name: "", business_goals: "", tone: "professional", agent_name: "", ai_model: "llama-3.1-8b-instant", files: [] });
  const [isDeployed, setIsDeployed] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const nextStep = () => setCurrentStep(p => Math.min(p + 1, STEPS.length));
  const prevStep = () => setCurrentStep(p => Math.max(p - 1, 1));

  const handleFileChange = (e) => {
    const f = Array.from(e.target.files);
    setFormData(p => ({ ...p, files: [...p.files, ...f] }));
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    setProgress(0);
    try {
      const fp = new FormData();
      fp.append("business_id", businessId || "00000000-0000-4000-8000-000000000001");
      fp.append("template_id", formData.industry_id);
      fp.append("context", JSON.stringify({ company_name: formData.company_name, business_goals: formData.business_goals, tone: formData.tone, agent_name: formData.agent_name, ai_model: formData.ai_model }));
      formData.files.forEach(f => fp.append("files", f));
      await new Promise(r => setTimeout(r, 3500));
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || "";
      const res = await fetch(`${gatewayUrl}/api/templates/deploy`, { method: "POST", body: fp });
      if (!res.ok) throw new Error("Deployment failed");
      setIsDeployed(true);
    } catch (err) {
      console.error(err);
      alert("Deployment failed. Please check if the AI Brain service is running.");
    } finally { setIsDeploying(false); }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>

      {/* Page header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(0,232,143,0.08)', border: '1px solid rgba(0,232,143,0.2)', borderRadius: '99px', padding: '4px 12px', marginBottom: '12px' }}>
          <Sparkles size={11} color="#00E88F" />
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#00E88F', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Agent Builder</span>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text-primary)', margin: 0 }}>Agent Setup Lab</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '7px 0 0' }}>Transform your business context into a production-grade AI expert in 4 steps.</p>
      </div>

      {/* Step progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', position: 'relative', padding: '0 20px' }}>
        <div style={{ position: 'absolute', top: '19px', left: '40px', right: '40px', height: '1px', background: 'var(--border)', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: '19px', left: '40px', height: '1px', background: '#00E88F', zIndex: 1, transition: 'width 0.5s ease', width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }} />
        {STEPS.map(step => {
          const done = currentStep > step.id;
          const active = currentStep === step.id;
          const Icon = step.icon;
          return (
            <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 2 }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done || active ? '#00E88F' : 'var(--bg-surface)',
                border: `2px solid ${done || active ? '#00E88F' : 'var(--border)'}`,
                color: done || active ? '#000' : 'var(--text-muted)',
                boxShadow: active ? '0 0 20px rgba(0,232,143,0.4)' : 'none',
                transition: 'all 0.3s ease',
              }}>
                {done ? <CheckCircle2 size={18} /> : <Icon size={16} />}
              </div>
              <span style={{ fontSize: '10px', fontWeight: 700, color: active ? '#00E88F' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                {step.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step card */}
      <div style={{ background: 'var(--bg-card)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden', minHeight: '420px', display: 'flex', flexDirection: 'column' }}>

        <div style={{ flex: 1, padding: '32px' }}>
          {isDeployed ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px 0' }}>
              <div style={{ position: 'relative', marginBottom: '28px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0,232,143,0.1)', border: '2px solid rgba(0,232,143,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={40} color="#00E88F" />
                </div>
                <div style={{ position: 'absolute', inset: '-8px', borderRadius: '50%', border: '1px solid rgba(0,232,143,0.2)', animation: 'ping 2s ease-out infinite' }} />
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.03em' }}>Agent Deployed! 🎉</h2>
              <p style={{ fontSize: '14px', color: '#00E88F', fontWeight: 600, marginBottom: '6px' }}>Your AI Expert is live and ready</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '380px', lineHeight: 1.6, marginBottom: '28px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{formData.agent_name || "Your new expert"}</strong> is now active for <strong style={{ color: 'var(--text-primary)' }}>{formData.company_name || "your business"}</strong>.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link href="/dashboard/my-agents" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg,#00E88F,#00c97a)', borderRadius: '12px', color: '#000', fontWeight: 800, fontSize: '13px', textDecoration: 'none' }}>
                  <Bot size={15} /> Manage Agent
                </Link>
                <Link href="/dashboard/inbox" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
                  <MessageSquare size={15} /> Live Inbox
                </Link>
              </div>
            </div>
          ) : isDeploying ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px 0' }}>
              <div style={{ position: 'relative', marginBottom: '28px' }}>
                <div style={{ width: '80px', height: '80px', border: '3px solid rgba(0,232,143,0.2)', borderTopColor: '#00E88F', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={24} color="#00E88F" />
                </div>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 8px' }}>Creating Your Agent...</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '28px' }}>Initializing persona and industry knowledge base</p>
              <div style={{ width: '280px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg,#00E88F,#6366F1)', borderRadius: '99px', animation: 'progress-bar 3.5s linear forwards' }} />
              </div>
            </div>
          ) : (
            <>
              {/* Step 1 — Industry */}
              {currentStep === 1 && (
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Building2 size={18} color="#00E88F" /> What industry is your business in?
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {INDUSTRIES.map(ind => {
                      const active = formData.industry_id === ind.id;
                      return (
                        <button key={ind.id} onClick={() => setFormData({ ...formData, industry_id: ind.id })}
                          style={{ padding: '16px', borderRadius: '14px', textAlign: 'left', border: `1px solid ${active ? 'rgba(0,232,143,0.4)' : 'var(--border)'}`, background: active ? 'rgba(0,232,143,0.08)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'all 0.2s', boxShadow: active ? '0 0 20px rgba(0,232,143,0.12)' : 'none' }}>
                          <div style={{ fontSize: '22px', marginBottom: '6px' }}>{ind.emoji}</div>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>{ind.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ind.description}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2 — Company */}
              {currentStep === 2 && (
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Target size={18} color="#00E88F" /> Tell us about your company
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={SI.label}>Company Name</label>
                      <input type="text" placeholder="e.g. Acme Realty" value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} style={SI.input} />
                    </div>
                    <div>
                      <label style={SI.label}>Key Business Goals</label>
                      <textarea rows={4} placeholder="e.g. Answer property FAQs and qualify leads by asking for their budget and neighborhood preference." value={formData.business_goals} onChange={e => setFormData({ ...formData, business_goals: e.target.value })} style={{ ...SI.input, resize: 'vertical' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 — Knowledge */}
              {currentStep === 3 && (
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Upload size={18} color="#00E88F" /> Ground your AI in Truth
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>Upload brochures, product manuals, or price lists so your agent gives facts, not guesses.</p>
                  <div onClick={() => fileInputRef.current?.click()} style={{ border: '2px dashed rgba(0,232,143,0.25)', borderRadius: '16px', padding: '48px 24px', textAlign: 'center', cursor: 'pointer', background: 'rgba(0,232,143,0.03)', transition: 'all 0.2s', marginBottom: '20px' }} className="upload-zone">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept=".pdf,.docx,.txt" style={{ display: 'none' }} />
                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(0,232,143,0.1)', border: '1px solid rgba(0,232,143,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                      <Upload size={22} color="#00E88F" />
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Click or drag documents here</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Supports PDF, DOCX, TXT · Max 10MB</div>
                  </div>
                  {formData.files.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', maxHeight: '140px', overflowY: 'auto' }} className="custom-scrollbar">
                      {formData.files.map((file, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FileText size={14} color="#00E88F" />
                            <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{file.name}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({(file.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <button onClick={e => { e.stopPropagation(); setFormData(p => ({ ...p, files: p.files.filter((_, i) => i !== idx) })); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4 — Persona */}
              {currentStep === 4 && (
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <UserCircle size={18} color="#00E88F" /> Define your AI Persona
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={SI.label}>Agent Name</label>
                      <input type="text" placeholder="e.g. RealtyExpert Bot" value={formData.agent_name} onChange={e => setFormData({ ...formData, agent_name: e.target.value })} style={SI.input} />
                    </div>
                    <div>
                      <label style={SI.label}>Communication Tone</label>
                      <select value={formData.tone} onChange={e => setFormData({ ...formData, tone: e.target.value })} style={{ ...SI.input, cursor: 'pointer', background: 'rgba(255,255,255,0.04)' }}>
                        <option value="professional" style={{ background: '#131820' }}>Professional & Direct</option>
                        <option value="empathetic" style={{ background: '#131820' }}>Empathetic & Caring</option>
                        <option value="energetic" style={{ background: '#131820' }}>Energetic & Sales-focused</option>
                        <option value="witty" style={{ background: '#131820' }}>Witty & Creative</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer nav */}
        {!isDeployed && !isDeploying && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
            <button onClick={prevStep} disabled={currentStep === 1}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: currentStep === 1 ? 'var(--text-muted)' : 'var(--text-secondary)', fontWeight: 700, fontSize: '13px', cursor: currentStep === 1 ? 'default' : 'pointer', opacity: currentStep === 1 ? 0.4 : 1 }}>
              <ArrowLeft size={14} /> Back
            </button>

            {currentStep === STEPS.length ? (
              <button onClick={handleDeploy}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg,#00E88F,#00c97a)', borderRadius: '12px', color: '#000', fontWeight: 800, fontSize: '13px', cursor: 'pointer', border: 'none', boxShadow: '0 0 24px rgba(0,232,143,0.3)' }}>
                Deploy Expert <Sparkles size={14} />
              </button>
            ) : (
              <button onClick={nextStep}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg,#00E88F,#00c97a)', borderRadius: '12px', color: '#000', fontWeight: 800, fontSize: '13px', cursor: 'pointer', border: 'none' }}>
                Next Step <ArrowRight size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        .upload-zone:hover { border-color: rgba(0,232,143,0.5) !important; background: rgba(0,232,143,0.06) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ping { 0%,100% { opacity:0; transform:scale(1); } 50% { opacity:0.4; transform:scale(1.15); } }
        @keyframes progress-bar { from { width:0 } to { width:100% } }
      `}</style>
    </div>
  );
}
