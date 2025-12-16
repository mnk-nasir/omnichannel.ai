"use client";

import { useState, useEffect } from "react";
import { Bot, Trash2, Edit3, Search, Plus, AlertCircle, X, Save, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAgents } from "@/hooks/useAgents";
import { useBusinessContext } from "@/context/BusinessContext";

const S = {
  card: { background: 'var(--bg-card)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden' },
  input: { width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' },
  label: { display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '7px' },
};

export default function MyAgentsPage() {
  const { businessId } = useBusinessContext();
  const [search, setSearch] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { agents, loading, fetchAgents, updateAgent, deleteAgent } = useAgents(businessId);
  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const filtered = agents.filter(a =>
    (a.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (a.role || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!confirm("Delete this agent? This cannot be undone.")) return;
    try { await deleteAgent(id); } catch { alert("Failed to delete agent."); }
  };

  const handleSaveEdit = async () => {
    try {
      await updateAgent(selectedAgent.id, { name: selectedAgent.name, role: selectedAgent.role, status: selectedAgent.status });
      setIsEditOpen(false); setSelectedAgent(null);
    } catch { alert("Failed to update agent."); }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(0,232,143,0.08)', border: '1px solid rgba(0,232,143,0.2)', borderRadius: '99px', padding: '4px 12px', marginBottom: '12px' }}>
            <Bot size={11} color="#00E88F" />
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#00E88F', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Agent Manager</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.03em', margin: 0, color: 'var(--text-primary)' }}>My AI Agents</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '6px 0 0' }}>Manage your deployed experts and their industry knowledge.</p>
        </div>
        <Link href="/dashboard/setup-agent" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px', background: 'linear-gradient(135deg,#00E88F,#00c97a)', borderRadius: '12px', color: '#000', fontWeight: 800, fontSize: '13px', textDecoration: 'none', boxShadow: '0 0 24px rgba(0,232,143,0.25)', letterSpacing: '-0.01em' }}>
          <Plus size={16} /> Create New Agent
        </Link>
      </div>

      {/* Main card */}
      <div style={S.card}>
        {/* Search + stats */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search by name or role..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...S.input, paddingLeft: '36px' }} />
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Total: <strong style={{ color: 'var(--text-primary)' }}>{agents.length}</strong></span>
            <span style={{ color: 'var(--text-secondary)' }}>Active: <strong style={{ color: '#00E88F' }}>{agents.filter(a => a.status === "active").length}</strong></span>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
            <div style={{ width: '32px', height: '32px', border: '2px solid rgba(0,232,143,0.2)', borderTopColor: '#00E88F', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {["Agent Details", "Industry Role", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: '14px 24px', fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: h === 'Actions' ? 'right' : 'left', background: 'rgba(255,255,255,0.02)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(agent => (
                <tr key={agent.id} style={{ borderBottom: '1px solid var(--border)' }} className="agent-row">
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(0,232,143,0.1)', border: '1px solid rgba(0,232,143,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00E88F', flexShrink: 0 }}>
                        <Bot size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{agent.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Created {new Date(agent.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', fontSize: '11px', fontWeight: 700, textTransform: 'capitalize' }}>{agent.role}</span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: agent.status === 'active' ? '#00E88F' : '#475569', boxShadow: agent.status === 'active' ? '0 0 8px #00E88F' : 'none', flexShrink: 0 }} />
                      <span style={{ fontSize: '12px', fontWeight: 700, color: agent.status === 'active' ? '#00E88F' : 'var(--text-muted)', textTransform: 'capitalize' }}>{agent.status || 'active'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button onClick={() => { setSelectedAgent({ ...agent }); setIsEditOpen(true); }} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer' }} title="Edit"><Edit3 size={14} /></button>
                      <button onClick={() => handleDelete(agent.id)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', cursor: 'pointer' }} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} style={{ padding: '60px 24px', textAlign: 'center' }}>
                  <AlertCircle size={36} style={{ margin: '0 auto 14px', color: 'var(--text-muted)', opacity: 0.4 }} />
                  <div style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>No agents found</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Create a new expert to get started.</div>
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {isEditOpen && selectedAgent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#131820', border: '1px solid var(--border)', borderRadius: '20px', width: '100%', maxWidth: '440px', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={14} color="#00E88F" /> Edit AI Agent
              </h3>
              <button onClick={() => setIsEditOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {[{ label: "Agent Name", key: "name" }, { label: "Industry Role", key: "role" }].map(f => (
                <div key={f.key}>
                  <label style={S.label}>{f.label}</label>
                  <input type="text" value={selectedAgent[f.key] || ""} onChange={e => setSelectedAgent({ ...selectedAgent, [f.key]: e.target.value })} style={S.input} />
                </div>
              ))}
              <div>
                <label style={S.label}>Status</label>
                <select value={selectedAgent.status} onChange={e => setSelectedAgent({ ...selectedAgent, status: e.target.value })} style={{ ...S.input, cursor: 'pointer' }}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px' }}>
              <button onClick={() => setIsEditOpen(false)} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
              <button onClick={handleSaveEdit} style={{ flex: 1, padding: '11px', borderRadius: '10px', background: 'linear-gradient(135deg,#00E88F,#00c97a)', color: '#000', fontWeight: 800, cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
                <Save size={14} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .agent-row:hover { background: rgba(255,255,255,0.02); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
