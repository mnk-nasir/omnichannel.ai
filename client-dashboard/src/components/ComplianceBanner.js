"use client";
import { useState, useEffect } from "react";
import { ShieldCheck, Cookie, BrainCircuit, Activity, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function ComplianceBanner() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    ai_training: false,
  });

  useEffect(() => {
    // Unique keys so the user must accept both independently
    const storageKey = isDashboard ? "omnixa_dashboard_compliance" : "omnixa_website_compliance";
    const saved = localStorage.getItem(storageKey);
    
    if (!saved) {
      setIsVisible(false); // hide quickly if transitioning
      setShowPreferences(false);
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isDashboard, pathname]);

  const storageKey = isDashboard ? "omnixa_dashboard_compliance" : "omnixa_website_compliance";

  const handleAcceptAll = () => {
    const prefs = { 
      essential: true, 
      analytics: true, 
      ai_training: isDashboard ? true : false 
    };
    localStorage.setItem(storageKey, JSON.stringify(prefs));
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem(storageKey, JSON.stringify(preferences));
    setIsVisible(false);
  };

  const togglePref = (key) => {
    if (key === 'essential') return;
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 150, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 150, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 28, stiffness: 250 }}
          style={{
            position: "fixed",
            bottom: "32px",
            right: "32px",
            width: "min(420px, calc(100vw - 48px))",
            zIndex: 99999,
          }}
        >
          <motion.div 
            layout
            style={{
              background: "rgba(10, 15, 25, 0.85)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "24px",
              boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,232,143,0.1) inset",
              overflow: "hidden",
            }}
          >
            {/* Header Area */}
            <div style={{ padding: "28px 28px 20px" }}>
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "14px",
                  background: isDashboard 
                    ? "linear-gradient(135deg, rgba(0, 232, 143, 0.15), rgba(99, 102, 241, 0.15))"
                    : "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))",
                  border: isDashboard ? "1px solid rgba(0, 232, 143, 0.2)" : "1px solid rgba(99, 102, 241, 0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: isDashboard ? "0 0 20px rgba(0,232,143,0.15) inset" : "0 0 20px rgba(99,102,241,0.15) inset"
                }}>
                  <ShieldCheck size={24} color={isDashboard ? "#00E88F" : "#818CF8"} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.01em" }}>
                    {isDashboard ? "AI Training Consent" : "Website Cookies"}
                  </h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "#94A3B8", lineHeight: 1.5, fontWeight: 500 }}>
                    {isDashboard 
                      ? "Because you are entering the dashboard, we must ask for your consent to use uploaded data and telemetry to train our Large Language Models (LLMs)."
                      : "We use essential cookies to ensure our website functions perfectly and basic analytics to improve your browsing experience."}
                  </p>
                </div>
              </div>

              {/* Preferences Expansion */}
              <AnimatePresence>
                {showPreferences && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: "auto", opacity: 1, marginTop: "24px" }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingBottom: "8px" }}>
                      
                      {/* Essential */}
                      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "16px", display: "flex", gap: "14px" }}>
                        <Cookie size={18} color="#64748B" style={{ marginTop: "2px" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "#E2E8F0" }}>Strictly Necessary</span>
                            <span style={{ fontSize: "10px", fontWeight: 900, color: isDashboard ? "#00E88F" : "#818CF8", background: isDashboard ? "rgba(0,232,143,0.1)" : "rgba(99,102,241,0.1)", padding: "4px 8px", borderRadius: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Always On</span>
                          </div>
                          <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#64748B", lineHeight: 1.4 }}>Required for core platform functionality, security, and authentication.</p>
                        </div>
                      </div>

                      {/* Analytics */}
                      <div 
                        onClick={() => togglePref('analytics')}
                        style={{ background: preferences.analytics ? "rgba(99,102,241,0.05)" : "rgba(255,255,255,0.02)", border: preferences.analytics ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "16px", display: "flex", gap: "14px", cursor: "pointer", transition: "all 0.2s ease" }}
                      >
                        <Activity size={18} color={preferences.analytics ? "#818cf8" : "#64748B"} style={{ marginTop: "2px", transition: "all 0.2s" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: preferences.analytics ? "#ffffff" : "#E2E8F0", transition: "all 0.2s" }}>Usage Analytics</span>
                            <div style={{ width: "40px", height: "22px", borderRadius: "11px", background: preferences.analytics ? "#6366f1" : "rgba(255,255,255,0.1)", position: "relative", transition: "all 0.2s ease" }}>
                              <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#fff", position: "absolute", top: "3px", left: preferences.analytics ? "21px" : "3px", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
                            </div>
                          </div>
                          <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#64748B", lineHeight: 1.4 }}>Helps us understand how you navigate the site so we can improve UI.</p>
                        </div>
                      </div>

                      {/* AI Training (ONLY SHOWS ON DASHBOARD) */}
                      {isDashboard && (
                        <div 
                          onClick={() => togglePref('ai_training')}
                          style={{ background: preferences.ai_training ? "rgba(0,232,143,0.05)" : "rgba(255,255,255,0.02)", border: preferences.ai_training ? "1px solid rgba(0,232,143,0.3)" : "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "16px", display: "flex", gap: "14px", cursor: "pointer", transition: "all 0.2s ease" }}
                        >
                          <BrainCircuit size={18} color={preferences.ai_training ? "#00E88F" : "#64748B"} style={{ marginTop: "2px", transition: "all 0.2s" }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: "13px", fontWeight: 700, color: preferences.ai_training ? "#ffffff" : "#E2E8F0", transition: "all 0.2s" }}>AI Model Training</span>
                              <div style={{ width: "40px", height: "22px", borderRadius: "11px", background: preferences.ai_training ? "#00E88F" : "rgba(255,255,255,0.1)", position: "relative", transition: "all 0.2s ease" }}>
                                <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#fff", position: "absolute", top: "3px", left: preferences.ai_training ? "21px" : "3px", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
                              </div>
                            </div>
                            <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#64748B", lineHeight: 1.4 }}>Allows us to use your uploaded data to fine-tune specific Large Language Models.</p>
                          </div>
                        </div>
                      )}

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <motion.div layout style={{ display: "flex", gap: "12px", marginTop: "24px", flexDirection: showPreferences ? "column-reverse" : "row" }}>
                <button
                  onClick={() => {
                    if(showPreferences) handleSavePreferences();
                    else setShowPreferences(true);
                  }}
                  style={{
                    flex: showPreferences ? "none" : 1,
                    padding: "14px",
                    background: "rgba(255,255,255,0.05)",
                    color: "#F0F4FA",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "14px",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                >
                  {showPreferences ? "Save Preferences" : "Customize"}
                </button>
                <button
                  onClick={handleAcceptAll}
                  style={{
                    flex: showPreferences ? "none" : 2,
                    padding: "14px",
                    background: isDashboard ? "linear-gradient(135deg, #00E88F, #00c97a)" : "linear-gradient(135deg, #818CF8, #6366F1)",
                    color: isDashboard ? "#000" : "#fff",
                    border: "none",
                    borderRadius: "14px",
                    fontWeight: 800,
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: isDashboard ? "0 10px 30px rgba(0,232,143,0.3)" : "0 10px 30px rgba(99,102,241,0.3)",
                    transition: "all 0.1s ease",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                  }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  onMouseOver={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
                  onMouseOut={(e) => (e.currentTarget.style.filter = "brightness(1)")}
                >
                  <Check size={18} /> Accept All
                </button>
              </motion.div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
