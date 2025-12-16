'use client';
import { useEffect, useRef, useCallback } from 'react';

const NODES = [
  { label: 'Leads', color: '#00E88F' },
  { label: 'Follow-up', color: '#9B6BFF' },
  { label: 'Bookings', color: '#4A9EFF' },
  { label: 'WhatsApp', color: '#25D366' },
  { label: '24/7 Calls', color: '#F5A623' },
  { label: 'Email', color: '#FF6B9D' },
  { label: 'CRM Sync', color: '#60D4F5' },
];

const N = NODES.length;
const EFFECTIVE_MS = 2800;   // ms per cycle — lineP hits 1.0 exactly at reset
const ROTATE_SPEED = 0.00016; // rad/ms anti-clockwise

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function hexRgba(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export default function OmnixaOrb3D() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const st = useRef({ orbitAngle: 0, stepTimer: 0, activeIdx: 0, t: 0, lastTs: null, stars: [] });

  const draw = useCallback((ts) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = st.current;

    if (!s.lastTs) s.lastTs = ts;
    const dt = Math.min(32, ts - s.lastTs);
    s.lastTs = ts;
    s.t += dt * 0.001;

    // Anti-clockwise
    s.orbitAngle -= ROTATE_SPEED * dt;

    // Advance exactly when lineP hits 1.0 (line reaches next node)
    s.stepTimer += dt;
    if (s.stepTimer >= EFFECTIVE_MS) {
      s.stepTimer -= EFFECTIVE_MS;
      s.activeIdx = (s.activeIdx + 1) % N;  // immediate pop on next node
    }

    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2 - 25; // moved slightly up
    const ORBIT_R = Math.min(W, H) * 0.38;
    const CORE_R  = Math.min(W, H) * 0.13;
    const R_SMALL  = Math.min(W, H) * 0.080;  // Increased significantly so they start big
    const R_ACTIVE = Math.min(W, H) * 0.095;  // Just a little pop above base size

    // p: 0..1 within one cycle
    const p = s.stepTimer / EFFECTIVE_MS;
    // pop-in: 0-0.22 → 0..1; hold: 0.22-1.0 → stays 1
    const popProgress = p < 0.22 ? easeOutCubic(p / 0.22) : 1;
    // lineP: 0 during pop-in, then 0..1 from 0.22 to 1.0
    // lineP=1 when p=1.0 → step resets → next node immediately pops
    const lineP = p < 0.22 ? 0 : (p - 0.22) / 0.78;

    // Fill with hero bg (#080C10) — canvas color matches page, NO box border possible
    ctx.fillStyle = '#080C10';
    ctx.fillRect(0, 0, W, H);

    // Stars
    if (!s.stars.length) {
      for (let i = 0; i < 70; i++)
        s.stars.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.1 + 0.3, a: Math.random() * 0.4 + 0.08, sp: Math.random() * 2 + 1, ph: Math.random() * 6 });
    }
    s.stars.forEach(star => {
      ctx.beginPath();
      ctx.arc(star.x * W, star.y * H, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${star.a * (0.6 + 0.4 * Math.sin(s.t * star.sp + star.ph))})`;
      ctx.fill();
    });

    // ── Node positions
    const nodes = NODES.map((n, i) => {
      const base = -Math.PI / 2 + (2 * Math.PI * i) / N;
      const a = base + s.orbitAngle;
      return { ...n, idx: i, a, x: cx + ORBIT_R * Math.cos(a), y: cy + ORBIT_R * Math.sin(a) };
    });

    // ── Orbit ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, ORBIT_R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.09)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 13]);
    ctx.lineDashOffset = s.t * 18;
    ctx.stroke();
    ctx.restore();

    // ── Radial spokes: center → every node (always flowing outward)
    nodes.forEach((n, i) => {
      // Clip spoke to start just outside core and end just inside node
      const edgeStart = CORE_R + 6;
      const dx = n.x - cx, dy = n.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / dist, uy = dy / dist;   // unit vector

      const x0 = cx + ux * edgeStart;
      const y0 = cy + uy * edgeStart;
      const x1 = n.x - ux * (R_SMALL + 4);
      const y1 = n.y - uy * (R_SMALL + 4);

      // Brighter dashed spoke
      const spokeGrad = ctx.createLinearGradient(x0, y0, x1, y1);
      spokeGrad.addColorStop(0, hexRgba(n.color, 0.15));
      spokeGrad.addColorStop(0.25, hexRgba(n.color, 0.40));
      spokeGrad.addColorStop(1, hexRgba(n.color, 0.70));

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.strokeStyle = spokeGrad;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 8]);
      // Each spoke offset by its index so they don't pulse in unison
      ctx.lineDashOffset = -(s.t * 55 + i * 14);
      ctx.stroke();
      ctx.restore();

      // Traveling dot along spoke (each node has its own phase offset)
      const travelPhase = ((s.t * 0.55 + i / N) % 1);
      const tx = x0 + (x1 - x0) * travelPhase;
      const ty = y0 + (y1 - y0) * travelPhase;
      const dotAlpha = travelPhase < 0.85 ? 1 : (1 - travelPhase) / 0.15; // fade near node

      ctx.beginPath();
      ctx.arc(tx, ty, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = hexRgba(n.color, dotAlpha * 0.9);
      ctx.fill();

      // Second trailing dot
      const travelPhase2 = ((s.t * 0.55 + i / N + 0.45) % 1);
      const tx2 = x0 + (x1 - x0) * travelPhase2;
      const ty2 = y0 + (y1 - y0) * travelPhase2;
      const dotAlpha2 = travelPhase2 < 0.85 ? 0.4 : ((1 - travelPhase2) / 0.15) * 0.4;
      ctx.beginPath();
      ctx.arc(tx2, ty2, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = hexRgba(n.color, dotAlpha2);
      ctx.fill();
    });

    // ── Outer ring: dim dashed lines between all consecutive nodes (always visible)
    nodes.forEach((n, i) => {
      const m = nodes[(i + 1) % N];
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(n.x, n.y);
      ctx.lineTo(m.x, m.y);
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 0.9;
      ctx.setLineDash([5, 9]);
      ctx.lineDashOffset = -s.t * 10;
      ctx.stroke();
      ctx.restore();
    });

    // ── Sequential bright flowing line: active node → next node
    if (lineP > 0) {
      const fn = nodes[s.activeIdx];
      const tn = nodes[(s.activeIdx + 1) % N];
      const ex = fn.x + (tn.x - fn.x) * lineP;
      const ey = fn.y + (tn.y - fn.y) * lineP;

      const lg = ctx.createLinearGradient(fn.x, fn.y, ex, ey);
      lg.addColorStop(0, fn.color + '00');
      lg.addColorStop(0.3, fn.color + 'bb');
      lg.addColorStop(1, tn.color + 'ff');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(fn.x, fn.y);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = lg;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 7]);
      ctx.lineDashOffset = -s.t * 65;
      ctx.stroke();
      ctx.restore();

      // Leading dot — clean, no bloom
      ctx.beginPath();
      ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = tn.color;
      ctx.fill();
    }

    // ── Central sphere
    const cp = 1 + 0.03 * Math.sin(s.t * 1.7);
    [3.6, 2.6, 1.9, 1.45].forEach((m, i) => {
      const alphas = [0.025, 0.04, 0.07, 0.11];
      const g = ctx.createRadialGradient(cx, cy, CORE_R * 0.3, cx, cy, CORE_R * m);
      g.addColorStop(0, `rgba(0,232,143,${alphas[i]})`);
      g.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, CORE_R * m * cp, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    });

    const cg = ctx.createRadialGradient(cx - CORE_R * 0.35, cy - CORE_R * 0.35, CORE_R * 0.08, cx, cy, CORE_R);
    cg.addColorStop(0, '#1e382a'); cg.addColorStop(0.5, '#0c1c14'); cg.addColorStop(1, '#050c08');
    ctx.beginPath(); ctx.arc(cx, cy, CORE_R * cp, 0, Math.PI * 2);
    ctx.fillStyle = cg; ctx.fill();

    const cb = ctx.createLinearGradient(cx - CORE_R, cy - CORE_R, cx + CORE_R, cy + CORE_R);
    cb.addColorStop(0, '#00E88F'); cb.addColorStop(0.5, 'rgba(0,232,143,0.3)'); cb.addColorStop(1, 'rgba(0,232,143,0.7)');
    ctx.beginPath(); ctx.arc(cx, cy, CORE_R * cp, 0, Math.PI * 2);
    ctx.strokeStyle = cb; ctx.lineWidth = 2.5; ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx - CORE_R * 0.28, cy - CORE_R * 0.28, CORE_R * 0.6 * cp, Math.PI * 1.0, Math.PI * 1.65);
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 7; ctx.stroke();

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `bold ${Math.round(CORE_R * 0.155)}px Inter, sans-serif`;
    ctx.fillStyle = 'rgba(0,232,143,0.55)';
    ctx.fillText('YOUR', cx, cy - CORE_R * 0.19);
    ctx.font = `bold ${Math.round(CORE_R * 0.24)}px Inter, sans-serif`;
    ctx.fillStyle = '#e8e8e8';
    ctx.fillText('BUSINESS', cx, cy + CORE_R * 0.17);

    // ── Orbit nodes
    nodes.forEach((n, i) => {
      const isActive = i === s.activeIdx;
      const pop = isActive ? popProgress : 0;
      const r = R_SMALL + (R_ACTIVE - R_SMALL) * pop;
      const pushOut = pop * 14;
      const nx = n.x + Math.cos(n.a) * pushOut;
      const ny = n.y + Math.sin(n.a) * pushOut;

      // Body (no glow outside, no ambient light)
      const bg = ctx.createRadialGradient(nx - r * 0.35, ny - r * 0.35, r * 0.05, nx, ny, r);
      bg.addColorStop(0, isActive ? '#2c3e4a' : '#151e26');
      bg.addColorStop(1, '#0a1118');
      ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI * 2);
      ctx.fillStyle = bg; ctx.globalAlpha = isActive ? 1 : 0.70; ctx.fill(); ctx.globalAlpha = 1;

      // Border
      ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI * 2);
      ctx.strokeStyle = n.color; ctx.lineWidth = isActive ? 2 : 1;
      ctx.globalAlpha = isActive ? 0.85 : 0.45;
      ctx.stroke(); ctx.globalAlpha = 1;

      // Subtle inner highlight arc (active only)
      if (pop > 0.5) {
        ctx.beginPath();
        ctx.arc(nx - r * 0.3, ny - r * 0.3, r * 0.6, Math.PI * 1.0, Math.PI * 1.65);
        ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 4; ctx.stroke();
      }

      // Full label INSIDE circle — always visible, text scales with `r`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

      const maxWidth = r * 1.6;
      let labelPx = Math.max(9, Math.round(r * 0.36));
      ctx.font = `bold ${labelPx}px Inter, sans-serif`;
      
      const measured = ctx.measureText(n.label).width;
      if (measured > maxWidth) labelPx = Math.floor(labelPx * (maxWidth / measured));
      ctx.font = `bold ${Math.max(8, labelPx)}px Inter, sans-serif`;

      if (isActive && pop > 0.1) {
        // Blend from colored to white as it pops
        const blend = hexRgba(n.color, 1 - pop);
        ctx.fillStyle = pop > 0.8 ? '#ffffff' : blend;
        // Keep it bright
        ctx.globalAlpha = 0.8 + 0.2 * pop;
      } else {
        // Inactive: brightly colored and legible
        ctx.fillStyle = hexRgba(n.color, 0.9);
        ctx.globalAlpha = 0.8;
      }
      
      ctx.fillText(n.label, nx, ny);
      ctx.globalAlpha = 1;

    });

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const p = canvas.parentElement;
      canvas.width = p.clientWidth;
      canvas.height = p.clientHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);

    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [draw]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 540, background: 'transparent' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', background: 'transparent' }} />
      <div style={{
        position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
        fontSize: 8, fontWeight: 600, letterSpacing: '0.14em',
        color: 'rgba(0,232,143,0.28)', pointerEvents: 'none',
        textTransform: 'uppercase', whiteSpace: 'nowrap'
      }}>
        Omnixa AI — Unified Intelligence Network
      </div>
    </div>
  );
}
