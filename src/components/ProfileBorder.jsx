import { useState, useEffect, useRef } from "react";

// ── 타입 매니아 글로우 색 ─────────────────────────────────
const TYPE_BORDER_COLOR = {
  fire_mania: "#FF4500",
  water_mania: "#0EA5E9",
  electric_mania: "#FFD700",
  grass_mania: "#22C55E",
  ghost_mania: "#7C3AED",
  psychic_mania: "#EC4899",
  bug_mania: "#84CC16",
  rock_mania: "#B45309",
  poison_mania: "#A855F7",
  fighting_mania: "#DC2626",
  ground_mania: "#D97706",
  dragon_mania: "#4338CA",
  ice_mania: "#67E8F9",
  normal_mania: "#9CA3AF",
};

// ── 기본/shimmer 테두리 색 ────────────────────────────────
const SHIMMER_COLOR = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
  platinum: "#4DD0E1",
};

// ── spin 설정 ─────────────────────────────────────────────
const SPIN_CONFIGS = {
  holo: {
    gradient:
      "conic-gradient(from 0deg,#ff80ab,#f472b6,#e040fb,#c084fc,#ff80ab)",
    speed: "2.4s",
    thickness: 3,
    glow: "0 0 10px 2px #f472b655, 0 0 20px 4px #e040fb33",
  },
  crystal: {
    gradient:
      "conic-gradient(from 0deg,#60A5FA,#93C5FD,#E0F2FE,#BAE6FD,#38BDF8,#60A5FA)",
    speed: "2s",
    thickness: 3,
    glow: "0 0 10px 2px #38BDF855, 0 0 22px 5px #7DD3FC33",
  },
  diamond: {
    gradient:
      "conic-gradient(from 0deg,#1e1b4b,#4338ca,#6366f1,#3730a3,#1e1b4b,#4338ca)",
    speed: "1.8s",
    thickness: 3,
    glow: "0 0 12px 3px #4338ca88, 0 0 24px 6px #6366f144",
  },
  champion: {
    gradient:
      "conic-gradient(from 0deg,#FBBF24,#FDE68A,#FFD700,#F59E0B,#FEF08A,#FBBF24)",
    speed: "1.4s",
    thickness: 3,
    glow: "0 0 7px 2px #FFD70066, 0 0 14px 4px #FBBF2422",
    particles: "champion",
  },
  master: {
    gradient:
      "conic-gradient(from 0deg,#0a0a0a,#3b0764,#1e0a2e,#7c2d12,#0a0a0a,#4c0519,#1e1b4b,#0a0a0a)",
    speed: "1.1s",
    thickness: 3,
    glow: "0 0 8px 2px #7c3aed44, 0 0 16px 5px #dc262622",
    particles: "master",
  },
  rainbow: {
    gradient:
      "conic-gradient(from 0deg,#ff0080,#ff4500,#ffd700,#00cc44,#00aaff,#8844ff,#ff0080)",
    speed: "1.0s",
    thickness: 3,
    glow: "0 0 10px 3px #ff008044, 0 0 20px 7px #00aaff22, 0 0 30px 10px #ffd70011",
    particles: "rainbow",
    outerSpin: true,
  },
};

const PARTICLE_CONFIGS = {
  champion: {
    chars: ["🌟", "✦", "★", "💛", "✨"],
    colors: ["#FFD700", "#FFF176", "#FBBF24", "#F59E0B", "#FDE68A"],
    rate: 320,
    count: 2,
  },
  master: {
    chars: ["💀", "⚡", "✦", "👁️", "⚡"],
    colors: ["#7c3aed", "#dc2626", "#9333ea", "#6d28d9", "#b91c1c"],
    rate: 320,
    count: 2,
  },
  rainbow: {
    chars: ["✨", "⭐", "💫", "✦", "🌟"],
    colors: ["#FF0080", "#FF4500", "#FFD700", "#00CC44", "#00AAFF", "#8844FF"],
    rate: 180,
    count: 3,
  },
};

const BR = 8;

// ── 파티클 컴포넌트 ───────────────────────────────────────
function Particles({ type, size }) {
  const [particles, setParticles] = useState([]);
  const idRef = useRef(0);
  const cfg = PARTICLE_CONFIGS[type];
  if (!cfg) return null;

  useEffect(() => {
    const spawn = () => {
      const newPs = Array.from({ length: cfg.count }, () => {
        const angle = Math.random() * 360;
        const rad = (angle * Math.PI) / 180;
        const r = size / 2 + 4;
        return {
          id: idRef.current++,
          x: size / 2 + r * Math.cos(rad),
          y: size / 2 + r * Math.sin(rad),
          char: cfg.chars[Math.floor(Math.random() * cfg.chars.length)],
          color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)],
          dx: (Math.random() - 0.5) * 28,
          dy: (Math.random() - 0.5) * 28,
          life: 1,
          fontSize: 6 + Math.random() * 5,
        };
      });
      setParticles((prev) => [...prev.slice(-18), ...newPs]);
    };
    const t = setInterval(spawn, cfg.rate);
    return () => clearInterval(t);
  }, [type, size]);

  useEffect(() => {
    const fade = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            life: p.life - 0.06,
            x: p.x + p.dx * 0.06,
            y: p.y + p.dy * 0.06,
          }))
          .filter((p) => p.life > 0)
      );
    }, 40);
    return () => clearInterval(fade);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 5,
        overflow: "visible",
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            fontSize: p.fontSize,
            color: p.color,
            opacity: p.life,
            transform: `translate(-50%,-50%) scale(${p.life})`,
            pointerEvents: "none",
            userSelect: "none",
            textShadow: `0 0 4px ${p.color}`,
          }}
        >
          {p.char}
        </div>
      ))}
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
export default function ProfileBorder({
  borderStyle = "none",
  size = 46,
  children,
}) {
  const cfg = SPIN_CONFIGS[borderStyle];
  const typeColor = TYPE_BORDER_COLOR[borderStyle];
  const shimmerColor = SHIMMER_COLOR[borderStyle];

  // ── spin (고급/최고급) ────────────────────────────────
  if (cfg) {
    return (
      <>
        <style>{PB_STYLES}</style>
        <div
          style={{
            position: "relative",
            width: size,
            height: size,
            flexShrink: 0,
            overflow: "visible",
          }}
        >
          {/* 포켓몬마스터 외부 역방향 링 */}
          {cfg.outerSpin && (
            <div
              style={{
                position: "absolute",
                inset: -4,
                borderRadius: BR + 3,
                background: cfg.gradient,
                animation: `pb_spin ${
                  parseFloat(cfg.speed) * 0.7
                }s linear infinite reverse`,
                filter: "blur(3px)",
                opacity: 0.45,
                zIndex: -1,
              }}
            />
          )}
          {/* 메인 spin */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: BR,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: -size,
                background: cfg.gradient,
                animation: `pb_spin ${cfg.speed} linear infinite`,
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: cfg.thickness,
                borderRadius: BR - 2,
                overflow: "hidden",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
                boxShadow: `inset ${cfg.glow}`,
              }}
            >
              {children}
            </div>
          </div>
          {/* 글로우 */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: BR,
              boxShadow: cfg.glow,
              pointerEvents: "none",
              zIndex: 3,
              animation: `pb_glow_${borderStyle} 1.8s ease-in-out infinite`,
            }}
          />
          {/* 파티클 */}
          {cfg.particles && <Particles type={cfg.particles} size={size} />}
        </div>
      </>
    );
  }

  // ── 타입 매니아 ───────────────────────────────────────
  if (typeColor) {
    return (
      <>
        <style>{PB_STYLES}</style>
        <div
          style={{
            position: "relative",
            width: size,
            height: size,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: BR,
              border: `3px solid ${typeColor}`,
              overflow: "hidden",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: `pb_type_${borderStyle} 1.4s ease-in-out infinite`,
              zIndex: 1,
            }}
          >
            {children}
          </div>
        </div>
      </>
    );
  }

  // ── shimmer (브론즈/실버/골드/플래티넘) ──────────────
  if (shimmerColor) {
    return (
      <>
        <style>{PB_STYLES}</style>
        <div
          style={{
            position: "relative",
            width: size,
            height: size,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: BR,
              border: `3px solid ${shimmerColor}`,
              overflow: "hidden",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            {children}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.75) 50%,transparent 70%)",
                animation: "pb_shimmer 2s ease-in-out infinite",
                pointerEvents: "none",
                zIndex: 2,
              }}
            />
          </div>
        </div>
      </>
    );
  }

  // ── none (기본) ───────────────────────────────────────
  return (
    <div
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: BR,
          border: "2px solid transparent",
          overflow: "hidden",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── CSS ───────────────────────────────────────────────────
const PB_STYLES = `
  @keyframes pb_spin    { to { transform: rotate(360deg); } }
  @keyframes pb_shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }

  @keyframes pb_glow_holo     { 0%,100%{opacity:0.7} 50%{opacity:1} }
  @keyframes pb_glow_crystal  { 0%,100%{opacity:0.6} 50%{opacity:1} }
  @keyframes pb_glow_diamond  { 0%,100%{opacity:0.65} 50%{opacity:1} }
  @keyframes pb_glow_champion { 0%,100%{box-shadow:0 0 7px 2px #FFD70066,0 0 14px 4px #FBBF2422} 50%{box-shadow:0 0 11px 3px #FFD700aa,0 0 22px 7px #FBBF2433} }
  @keyframes pb_glow_master   { 0%,100%{box-shadow:0 0 8px 2px #7c3aed44,0 0 16px 5px #dc262622} 50%{box-shadow:0 0 13px 4px #7c3aed77,0 0 25px 8px #dc262633} }
  @keyframes pb_glow_rainbow  { 0%,100%{box-shadow:0 0 10px 3px #ff008044,0 0 20px 7px #00aaff22} 50%{box-shadow:0 0 16px 6px #ff008066,0 0 32px 11px #00aaff44,0 0 45px 14px #ffd70022} }

  @keyframes pb_type_fire_mania    { 0%,100%{box-shadow:0 0 2px 1px #FF450044} 50%{box-shadow:0 0 4px 1px #FF6B0066} }
  @keyframes pb_type_water_mania   { 0%,100%{box-shadow:0 0 2px 1px #0EA5E944} 50%{box-shadow:0 0 4px 1px #38BDF866} }
  @keyframes pb_type_electric_mania{ 0%,100%{box-shadow:0 0 2px 1px #FFD70044} 50%{box-shadow:0 0 4px 1px #FFEE0066} }
  @keyframes pb_type_grass_mania   { 0%,100%{box-shadow:0 0 2px 1px #22C55E44} 50%{box-shadow:0 0 4px 1px #4ADE8066} }
  @keyframes pb_type_ghost_mania   { 0%,100%{box-shadow:0 0 2px 1px #7C3AED44} 50%{box-shadow:0 0 4px 1px #A78BFA66} }
  @keyframes pb_type_psychic_mania { 0%,100%{box-shadow:0 0 2px 1px #EC489944} 50%{box-shadow:0 0 4px 1px #F472B666} }
  @keyframes pb_type_bug_mania     { 0%,100%{box-shadow:0 0 2px 1px #84CC1644} 50%{box-shadow:0 0 4px 1px #A3E63566} }
  @keyframes pb_type_rock_mania    { 0%,100%{box-shadow:0 0 2px 1px #B4530944} 50%{box-shadow:0 0 4px 1px #D9770666} }
  @keyframes pb_type_poison_mania  { 0%,100%{box-shadow:0 0 2px 1px #A855F744} 50%{box-shadow:0 0 4px 1px #D946EF66} }
  @keyframes pb_type_fighting_mania{ 0%,100%{box-shadow:0 0 2px 1px #DC262644} 50%{box-shadow:0 0 4px 1px #EF444466} }
  @keyframes pb_type_ground_mania  { 0%,100%{box-shadow:0 0 2px 1px #D9770644} 50%{box-shadow:0 0 4px 1px #F59E0B66} }
  @keyframes pb_type_dragon_mania  { 0%,100%{box-shadow:0 0 2px 1px #4338CA44} 50%{box-shadow:0 0 4px 1px #6366F166} }
  @keyframes pb_type_ice_mania     { 0%,100%{box-shadow:0 0 2px 1px #67E8F944} 50%{box-shadow:0 0 4px 1px #A5F3FC66} }
  @keyframes pb_type_normal_mania  { 0%,100%{box-shadow:0 0 2px 1px #9CA3AF44} 50%{box-shadow:0 0 4px 1px #D1D5DB66} }
`;
