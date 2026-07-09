import { useState, useMemo, useEffect, useRef } from "react";
import { T } from "../../lib/constants";
import { ALL_SEALS, loadSealDex } from "../../lib/sealLogic";
import { SHINY_SEALS } from "../../lib/shinySeals";
import { SEAL_TYPES, countCollectedByType } from "../../lib/sealTypes";
import TrainerPortrait from "../../components/TrainerPortrait";
import {
  TITLES,
  GYM_BADGES,
  getUnlockedTitles,
  getUnlockedBadges,
  getNextTitle,
  getNextBadge,
} from "../../lib/titleLogic";

const ALL_SEALS_MERGED = [...ALL_SEALS, ...SHINY_SEALS];

function totalByType(type) {
  return ALL_SEALS.filter((s) => SEAL_TYPES[s.pokeId] === type).length;
}

const TYPE_BORDER = {
  fire_mania: { color: "#FF4500", anim: "tb_fire" },
  water_mania: { color: "#0EA5E9", anim: "tb_water" },
  electric_mania: { color: "#FFD700", anim: "tb_elec" },
  grass_mania: { color: "#22C55E", anim: "tb_grass" },
  ghost_mania: { color: "#7C3AED", anim: "tb_ghost" },
  psychic_mania: { color: "#EC4899", anim: "tb_psychic" },
  bug_mania: { color: "#84CC16", anim: "tb_bug" },
  rock_mania: { color: "#B45309", anim: "tb_rock" },
  poison_mania: { color: "#A855F7", anim: "tb_poison" },
  fighting_mania: { color: "#DC2626", anim: "tb_fight" },
  ground_mania: { color: "#D97706", anim: "tb_ground" },
  dragon_mania: { color: "#4338CA", anim: "tb_dragon" },
  ice_mania: { color: "#67E8F9", anim: "tb_ice" },
  normal_mania: { color: "#9CA3AF", anim: "tb_normal" },
};

const SPIN_CONFIGS = {
  holo: {
    gradient:
      "conic-gradient(from 0deg,#ff80ab,#f472b6,#e040fb,#c084fc,#ff80ab)",
    speed: "2.4s",
    thickness: 3,
    glow: "0 0 10px 2px #f472b655, 0 0 20px 4px #e040fb33",
    shimmer: true,
  },
  crystal: {
    gradient:
      "conic-gradient(from 0deg,#60A5FA,#93C5FD,#E0F2FE,#BAE6FD,#38BDF8,#60A5FA)",
    speed: "2s",
    thickness: 3,
    glow: "0 0 10px 2px #38BDF855, 0 0 22px 5px #7DD3FC33",
    shimmer: true,
  },
  diamond: {
    gradient:
      "conic-gradient(from 0deg,#1e1b4b,#4338ca,#6366f1,#3730a3,#1e1b4b,#4338ca)",
    speed: "1.8s",
    thickness: 3,
    glow: "0 0 12px 3px #4338ca88, 0 0 24px 6px #6366f144",
    shimmer: true,
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

export const BORDER_STYLES = [
  {
    key: "none",
    label: "없음",
    group: "기본",
    color: "#E5E7EB",
    pattern: "none",
    unlockDesc: null,
    check: () => true,
  },
  {
    key: "bronze",
    label: "브론즈",
    group: "기본",
    color: "#CD7F32",
    pattern: "shimmer",
    unlockDesc: "일반 씰 10종 수집",
    check: (dex) =>
      ALL_SEALS.filter(
        (s) => s.grade === "COMMON" && dex[String(s.id)]?.count > 0
      ).length >= 10,
  },
  {
    key: "silver",
    label: "실버",
    group: "기본",
    color: "#C0C0C0",
    pattern: "shimmer",
    unlockDesc: "레어 씰 20종 수집",
    check: (dex) =>
      ALL_SEALS.filter(
        (s) => s.grade === "RARE" && dex[String(s.id)]?.count > 0
      ).length >= 20,
  },
  {
    key: "gold",
    label: "골드",
    group: "기본",
    color: "#FFD700",
    pattern: "shimmer",
    unlockDesc: "슈퍼레어 씰 20종 수집",
    check: (dex) =>
      ALL_SEALS.filter((s) => s.grade === "SR" && dex[String(s.id)]?.count > 0)
        .length >= 20,
  },
  {
    key: "platinum",
    label: "플래티넘",
    group: "기본",
    color: "#4DD0E1",
    pattern: "shimmer",
    unlockDesc: "일반 씰 전부 수집 (51종)",
    check: (dex) =>
      ALL_SEALS.filter(
        (s) => s.grade === "COMMON" && dex[String(s.id)]?.count > 0
      ).length >= 51,
  },
  {
    key: "fire_mania",
    label: "🔥 불꽃 매니아",
    group: "타입 매니아",
    color: "#FF4500",
    pattern: "type",
    unlockDesc: `불꽃타입 씰 전부 수집 (${totalByType("fire")}종)`,
    check: (dex) =>
      countCollectedByType(ALL_SEALS, dex, "fire") >= totalByType("fire"),
  },
  {
    key: "water_mania",
    label: "💧 물 매니아",
    group: "타입 매니아",
    color: "#0EA5E9",
    pattern: "type",
    unlockDesc: `물타입 씰 전부 수집 (${totalByType("water")}종)`,
    check: (dex) =>
      countCollectedByType(ALL_SEALS, dex, "water") >= totalByType("water"),
  },
  {
    key: "electric_mania",
    label: "⚡ 전기 매니아",
    group: "타입 매니아",
    color: "#FFD700",
    pattern: "type",
    unlockDesc: `전기타입 씰 전부 수집 (${totalByType("electric")}종)`,
    check: (dex) =>
      countCollectedByType(ALL_SEALS, dex, "electric") >=
      totalByType("electric"),
  },
  {
    key: "grass_mania",
    label: "🌿 풀 매니아",
    group: "타입 매니아",
    color: "#22C55E",
    pattern: "type",
    unlockDesc: `풀타입 씰 전부 수집 (${totalByType("grass")}종)`,
    check: (dex) =>
      countCollectedByType(ALL_SEALS, dex, "grass") >= totalByType("grass"),
  },
  {
    key: "ghost_mania",
    label: "👻 고스트 매니아",
    group: "타입 매니아",
    color: "#7C3AED",
    pattern: "type",
    unlockDesc: `고스트타입 씰 전부 수집 (${totalByType("ghost")}종)`,
    check: (dex) =>
      countCollectedByType(ALL_SEALS, dex, "ghost") >= totalByType("ghost"),
  },
  {
    key: "psychic_mania",
    label: "🔮 에스퍼 매니아",
    group: "타입 매니아",
    color: "#EC4899",
    pattern: "type",
    unlockDesc: `에스퍼타입 씰 전부 수집 (${totalByType("psychic")}종)`,
    check: (dex) =>
      countCollectedByType(ALL_SEALS, dex, "psychic") >= totalByType("psychic"),
  },
  {
    key: "bug_mania",
    label: "🐛 벌레 매니아",
    group: "타입 매니아",
    color: "#84CC16",
    pattern: "type",
    unlockDesc: `벌레타입 씰 전부 수집 (${totalByType("bug")}종)`,
    check: (dex) =>
      countCollectedByType(ALL_SEALS, dex, "bug") >= totalByType("bug"),
  },
  {
    key: "rock_mania",
    label: "🪨 바위 매니아",
    group: "타입 매니아",
    color: "#B45309",
    pattern: "type",
    unlockDesc: `바위타입 씰 전부 수집 (${totalByType("rock")}종)`,
    check: (dex) =>
      countCollectedByType(ALL_SEALS, dex, "rock") >= totalByType("rock"),
  },
  {
    key: "poison_mania",
    label: "☠️ 독 매니아",
    group: "타입 매니아",
    color: "#A855F7",
    pattern: "type",
    unlockDesc: `독타입 씰 전부 수집 (${totalByType("poison")}종)`,
    check: (dex) =>
      countCollectedByType(ALL_SEALS, dex, "poison") >= totalByType("poison"),
  },
  {
    key: "fighting_mania",
    label: "👊 격투 매니아",
    group: "타입 매니아",
    color: "#DC2626",
    pattern: "type",
    unlockDesc: `격투타입 씰 전부 수집 (${totalByType("fighting")}종)`,
    check: (dex) =>
      countCollectedByType(ALL_SEALS, dex, "fighting") >=
      totalByType("fighting"),
  },
  {
    key: "ground_mania",
    label: "🌍 땅 매니아",
    group: "타입 매니아",
    color: "#D97706",
    pattern: "type",
    unlockDesc: `땅타입 씰 전부 수집 (${totalByType("ground")}종)`,
    check: (dex) =>
      countCollectedByType(ALL_SEALS, dex, "ground") >= totalByType("ground"),
  },
  {
    key: "dragon_mania",
    label: "🐲 드래곤 매니아",
    group: "타입 매니아",
    color: "#4338CA",
    pattern: "type",
    unlockDesc: `드래곤타입 씰 전부 수집 (${totalByType("dragon")}종)`,
    check: (dex) =>
      countCollectedByType(ALL_SEALS, dex, "dragon") >= totalByType("dragon"),
  },
  {
    key: "ice_mania",
    label: "❄️ 얼음 매니아",
    group: "타입 매니아",
    color: "#67E8F9",
    pattern: "type",
    unlockDesc: `얼음타입 씰 전부 수집 (${totalByType("ice")}종)`,
    check: (dex) =>
      countCollectedByType(ALL_SEALS, dex, "ice") >= totalByType("ice"),
  },
  {
    key: "normal_mania",
    label: "🐦 노말 매니아",
    group: "타입 매니아",
    color: "#9CA3AF",
    pattern: "type",
    unlockDesc: `노말타입 씰 전부 수집 (${totalByType("normal")}종)`,
    check: (dex) =>
      countCollectedByType(ALL_SEALS, dex, "normal") >= totalByType("normal"),
  },
  {
    key: "holo",
    label: "홀로그램",
    group: "고급",
    color: "#FF80AB",
    pattern: "spin",
    unlockDesc: "홀로그램 씰 최초 획득",
    check: (dex) =>
      ALL_SEALS.some((s) => s.grade === "HOLO" && dex[String(s.id)]?.count > 0),
  },
  {
    key: "crystal",
    label: "크리스탈",
    group: "고급",
    color: "#60A5FA",
    pattern: "spin",
    unlockDesc: "레어 씰 전부 수집 (46종)",
    check: (dex) =>
      ALL_SEALS.filter(
        (s) => s.grade === "RARE" && dex[String(s.id)]?.count > 0
      ).length >= 46,
  },
  {
    key: "diamond",
    label: "다이아",
    group: "고급",
    color: "#6366f1",
    pattern: "spin",
    unlockDesc: "슈퍼레어 씰 전부 수집 (45종)",
    check: (dex) =>
      ALL_SEALS.filter((s) => s.grade === "SR" && dex[String(s.id)]?.count > 0)
        .length >= 45,
  },
  {
    key: "master",
    label: "사천왕",
    group: "최고급",
    color: "#7c3aed",
    pattern: "spin",
    unlockDesc: "레전더리 씰 전부 수집 (7종)",
    check: (dex) =>
      ALL_SEALS.filter((s) => s.grade === "LEGENDARY").every(
        (s) => dex[String(s.id)]?.count > 0
      ),
  },
  {
    key: "champion",
    label: "챔피언",
    group: "최고급",
    color: "#FBBF24",
    pattern: "spin",
    unlockDesc: "홀로그램 씰 7종 수집",
    check: (dex) =>
      ALL_SEALS.filter(
        (s) => s.grade === "HOLO" && dex[String(s.id)]?.count > 0
      ).length >= 7,
  },
  {
    key: "rainbow",
    label: "포켓몬 마스터",
    group: "최고급",
    color: null,
    pattern: "spin",
    unlockDesc: "도감 100% 달성",
    check: (dex) => ALL_SEALS.every((s) => dex[String(s.id)]?.count > 0),
  },
];

const BR = 10;

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
          fontSize: 8 + Math.random() * 7,
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
            textShadow: `0 0 6px ${p.color}`,
          }}
        >
          {p.char}
        </div>
      ))}
    </div>
  );
}

function BorderPreview({
  borderKey,
  trainerId,
  tImgs,
  size = 56,
  locked = false,
}) {
  const b = BORDER_STYLES.find((x) => x.key === borderKey) || BORDER_STYLES[0];
  const tb = TYPE_BORDER[borderKey];
  const cfg = SPIN_CONFIGS[borderKey];
  const inner = trainerId ? (
    <TrainerPortrait name={trainerId} size={size - 8} tImgs={tImgs} />
  ) : (
    <span style={{ fontSize: size * 0.4 }}>👤</span>
  );

  if (b.pattern === "type" && tb && !locked)
    return (
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
            border: `3px solid ${tb.color}`,
            overflow: "hidden",
            background: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: `${tb.anim} 1.4s ease-in-out infinite`,
            zIndex: 1,
          }}
        >
          {inner}
        </div>
      </div>
    );

  if (b.pattern === "spin" && cfg && !locked)
    return (
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          flexShrink: 0,
          overflow: "visible",
        }}
      >
        {cfg.outerSpin && (
          <div
            style={{
              position: "absolute",
              inset: -6,
              borderRadius: BR + 4,
              background: cfg.gradient,
              animation: `borderSpin ${
                parseFloat(cfg.speed) * 0.7
              }s linear infinite reverse`,
              filter: "blur(4px)",
              opacity: 0.5,
              zIndex: -1,
            }}
          />
        )}
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
              animation: `borderSpin ${cfg.speed} linear infinite`,
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: cfg.thickness,
              borderRadius: BR - 2,
              overflow: "hidden",
              background: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
              boxShadow: `inset ${cfg.glow}`,
            }}
          >
            {inner}
            {cfg.shimmer && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(105deg,transparent 25%,rgba(255,255,255,0.85) 50%,transparent 75%)",
                  animation: "shimmerSlide 2.2s ease-in-out infinite",
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              />
            )}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: BR,
            boxShadow: cfg.glow,
            pointerEvents: "none",
            zIndex: 3,
            animation: `glowPulse_${borderKey} 1.8s ease-in-out infinite`,
          }}
        />
        {cfg.particles && <Particles type={cfg.particles} size={size} />}
      </div>
    );

  if (b.pattern === "shimmer" && !locked)
    return (
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
            border: `3px solid ${b.color}`,
            overflow: "hidden",
            background: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          {inner}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.75) 50%,transparent 70%)",
              animation: "shimmerSlide 2s ease-in-out infinite",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
        </div>
      </div>
    );

  return (
    <div
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: BR,
          border:
            b.pattern === "none"
              ? "2px dashed #E5E7EB"
              : `3px solid ${locked ? "#D1D5DB" : b.color}`,
          overflow: "hidden",
          background: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          filter: locked ? "grayscale(1) opacity(0.5)" : "none",
          zIndex: 1,
        }}
      >
        {inner}
      </div>
      {locked && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.35,
          }}
        >
          🔒
        </div>
      )}
    </div>
  );
}

export function BadgeIcon({ badge, size = 40 }) {
  if (!badge) return null;
  const region = GYM_BADGES[badge.region];
  if (!region) return null;
  const b = region.badges.find((x) => x.key === badge.key);
  if (!b) return null;
  return (
    <div
      title={`${region.label} ${b.label} 뱃지`}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "transparent",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        cursor: "default",
        userSelect: "none",
        overflow: "hidden",
      }}
    >
      <img
        src={b.img || ""}
        alt={b.label}
        style={{
          width: size - 4,
          height: size - 4,
          objectFit: "contain",
          display: b.img ? "block" : "none",
        }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
          if (e.currentTarget.nextElementSibling)
            e.currentTarget.nextElementSibling.style.display = "flex";
        }}
      />
      <span
        style={{
          fontSize: size * 0.55,
          display: b.img ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {b.emoji}
      </span>
    </div>
  );
}

export function TitleBadge({ titleKey, fontSize = 11 }) {
  if (!titleKey || titleKey === "none") return null;
  const t = TITLES.find((x) => x.key === titleKey);
  if (!t) return null;
  return (
    <span
      style={{
        fontSize,
        fontWeight: 700,
        color: "#7c3aed",
        marginRight: 4,
        whiteSpace: "nowrap",
      }}
    >
      {t.label}
    </span>
  );
}

function WinStatsCard({ wins }) {
  const w = wins || {};
  const stats = [
    {
      label: "전체 승리",
      value: w.total ?? 0,
      icon: "🏆",
      color: "#f59e0b",
      bg: "#fffbeb",
      border: "#fde68a",
    },
    {
      label: "솔로",
      value: w.solo ?? 0,
      icon: "🤖",
      color: "#3b82f6",
      bg: "#eff6ff",
      border: "#bfdbfe",
    },
    {
      label: "멀티",
      value: w.multi ?? 0,
      icon: "👥",
      color: "#8b5cf6",
      bg: "#f5f3ff",
      border: "#ddd6fe",
    },
  ];
  const regions = [
    { label: "관동", value: w.kantoSolo ?? 0, color: "#16a34a" },
    { label: "성도", value: w.johtoSolo ?? 0, color: "#2563eb" },
    { label: "호연", value: w.hoennSolo ?? 0, color: "#ea580c" },
  ];
  return (
    <div
      style={{
        background: "#F9FAFB",
        borderRadius: 14,
        padding: "12px 14px",
        marginBottom: 14,
        border: "1.5px solid #E5E7EB",
        boxShadow: "0 3px 0 #e2e8f0",
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 11,
          color: "#374151",
          marginBottom: 10,
        }}
      >
        📊 전적
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {stats.map(({ label, value, icon, color, bg, border }) => (
          <div
            key={label}
            style={{
              flex: 1,
              background: bg,
              border: `1.5px solid ${border}`,
              borderRadius: 10,
              padding: "8px 4px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 16, marginBottom: 2 }}>{icon}</div>
            <div
              style={{
                fontWeight: 900,
                fontSize: 16,
                color,
                fontFamily: "monospace",
              }}
            >
              {value.toLocaleString()}
            </div>
            <div
              style={{
                fontSize: 9,
                color: "#6B7280",
                fontWeight: 600,
                marginTop: 1,
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: 10,
          color: "#6B7280",
          marginBottom: 6,
        }}
      >
        지역별 솔로 승리
      </div>
      <div style={{ display: "flex", gap: 5 }}>
        {regions.map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              flex: 1,
              background: "#fff",
              border: "1.5px solid #E5E7EB",
              borderRadius: 8,
              padding: "6px 4px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontWeight: 900,
                fontSize: 14,
                color,
                fontFamily: "monospace",
              }}
            >
              {value}
            </div>
            <div style={{ fontSize: 9, color: "#6B7280", fontWeight: 600 }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TitleTab({ wins, stats, selectedTitle, onSelect }) {
  const unlockedKeys = useMemo(
    () => new Set(getUnlockedTitles(wins, stats).map((t) => t.key)),
    [wins, stats]
  );
  const nextTitle = useMemo(() => getNextTitle(wins, stats), [wins, stats]);
  return (
    <div>
      {nextTitle && (
        <div
          style={{
            background: "#FFF1F1",
            borderRadius: 10,
            padding: "9px 13px",
            marginBottom: 12,
            fontSize: 11,
            color: "#C01208",
            display: "flex",
            alignItems: "center",
            gap: 7,
            border: "1.5px solid #FECACA",
            boxShadow: "0 3px 0 #fecaca",
          }}
        >
          <span style={{ fontSize: 16 }}>🎯</span>
          <span>
            다음 칭호 <b>{nextTitle.label}</b> — {nextTitle.desc}
          </span>
        </div>
      )}
      <div
        onClick={() => onSelect("none")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          padding: "9px 13px",
          borderRadius: 12,
          cursor: "pointer",
          marginBottom: 6,
          border: `1.5px solid ${
            selectedTitle === "none" ? "#22c55e" : "#E5E7EB"
          }`,
          background: selectedTitle === "none" ? "#F0FDF4" : "#fff",
          boxShadow:
            selectedTitle === "none" ? "0 3px 0 #bbf7d0" : "0 3px 0 #e2e8f0",
        }}
      >
        <div style={{ fontSize: 22 }}>🚫</div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 12,
            color: selectedTitle === "none" ? "#16a34a" : "#111827",
          }}
        >
          칭호 없음{" "}
          {selectedTitle === "none" && (
            <span style={{ fontSize: 9, color: "#16a34a" }}>✓ 적용중</span>
          )}
        </div>
      </div>
      {TITLES.map((t) => {
        const isUnlocked = unlockedKeys.has(t.key),
          isSel = selectedTitle === t.key;
        const emoji = t.label.split(" ")[0],
          labelText = t.label.slice(emoji.length + 1);
        return (
          <div
            key={t.key}
            onClick={() => isUnlocked && onSelect(t.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: "9px 13px",
              borderRadius: 12,
              marginBottom: 5,
              cursor: isUnlocked ? "pointer" : "not-allowed",
              border: `1.5px solid ${
                isSel ? "#22c55e" : isUnlocked ? "#E5E7EB" : "#F3F4F6"
              }`,
              background: isSel ? "#F0FDF4" : isUnlocked ? "#fff" : "#FAFAFA",
              opacity: isUnlocked ? 1 : 0.55,
              transition: "all 0.15s",
              boxShadow: isSel ? "0 3px 0 #bbf7d0" : "0 3px 0 #e2e8f0",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                flexShrink: 0,
                background: isUnlocked
                  ? isSel
                    ? "#22c55e"
                    : "#F3F4F6"
                  : "#E5E7EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              {emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 12,
                    color: isSel
                      ? "#16a34a"
                      : isUnlocked
                      ? "#111827"
                      : "#9CA3AF",
                  }}
                >
                  {labelText}
                </span>
                {isSel && (
                  <span
                    style={{
                      fontSize: 9,
                      color: "#16a34a",
                      fontWeight: 700,
                      background: "#F0FDF4",
                      borderRadius: 5,
                      padding: "1px 5px",
                    }}
                  >
                    ✓ 적용중
                  </span>
                )}
                {isUnlocked && !isSel && (
                  <span
                    style={{
                      fontSize: 9,
                      color: "#16a34a",
                      fontWeight: 700,
                      background: "#F0FDF4",
                      borderRadius: 5,
                      padding: "1px 5px",
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    해금
                  </span>
                )}
              </div>
              {isUnlocked && (
                <div
                  style={{
                    fontSize: 9,
                    color: "#9CA3AF",
                    fontStyle: "italic",
                    marginTop: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  "{t.flavor}"
                </div>
              )}
              <div
                style={{
                  fontSize: 9,
                  marginTop: 2,
                  color: isUnlocked ? "#6B7280" : "#EF4444",
                  fontWeight: 600,
                }}
              >
                {isUnlocked ? "✅" : "🔒"} {t.desc}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BadgeTab({ wins, selectedBadge, onSelect }) {
  const unlockedBadges = useMemo(() => getUnlockedBadges(wins), [wins]);
  const nextBadge = useMemo(() => getNextBadge(wins), [wins]);
  return (
    <div>
      {nextBadge && (
        <div
          style={{
            background: "#F0F9FF",
            borderRadius: 10,
            padding: "9px 13px",
            marginBottom: 12,
            fontSize: 11,
            color: "#0284C7",
            display: "flex",
            alignItems: "center",
            gap: 7,
            border: "1.5px solid #BAE6FD",
            boxShadow: "0 3px 0 #bae6fd",
          }}
        >
          <span style={{ fontSize: 16 }}>🏅</span>
          <span>
            다음 뱃지{" "}
            <b>
              {nextBadge.badge.emoji} {nextBadge.badge.label}
            </b>{" "}
            ({nextBadge.regionLabel}) — {nextBadge.winLabel}{" "}
            {nextBadge.badge.threshold}승 ({nextBadge.remaining}승 남음)
          </span>
        </div>
      )}
      <div
        onClick={() => onSelect(null)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          padding: "9px 13px",
          borderRadius: 12,
          cursor: "pointer",
          marginBottom: 10,
          border: `1.5px solid ${!selectedBadge ? "#22c55e" : "#E5E7EB"}`,
          background: !selectedBadge ? "#F0FDF4" : "#fff",
          boxShadow: !selectedBadge ? "0 3px 0 #bbf7d0" : "0 3px 0 #e2e8f0",
        }}
      >
        <div style={{ fontSize: 22 }}>🚫</div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 12,
            color: !selectedBadge ? "#16a34a" : "#111827",
          }}
        >
          뱃지 없음{" "}
          {!selectedBadge && (
            <span style={{ fontSize: 9, color: "#16a34a" }}>✓ 적용중</span>
          )}
        </div>
      </div>
      {Object.entries(GYM_BADGES).map(([region, def]) => {
        const unlockedSet = unlockedBadges[region] || new Set();
        return (
          <div key={region} style={{ marginBottom: 14 }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: 11,
                color: def.color,
                marginBottom: 4,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span>{def.label} 체육관 뱃지</span>
              <span style={{ fontSize: 9, color: "#9CA3AF", fontWeight: 400 }}>
                ({def.winLabel} 기준 · {unlockedSet.size}/{def.badges.length})
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 5,
              }}
            >
              {def.badges.map((b) => {
                const isUnlocked = unlockedSet.has(b.key);
                const isSel =
                  selectedBadge?.region === region &&
                  selectedBadge?.key === b.key;
                return (
                  <div
                    key={b.key}
                    onClick={() =>
                      isUnlocked && onSelect({ region, key: b.key })
                    }
                    title={isUnlocked ? b.label : `🔒 ${b.threshold}승 필요`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 3,
                      padding: "7px 3px",
                      borderRadius: 10,
                      cursor: isUnlocked ? "pointer" : "not-allowed",
                      border: `1.5px solid ${
                        isSel
                          ? "#22c55e"
                          : isUnlocked
                          ? def.color + "55"
                          : "#F3F4F6"
                      }`,
                      background: isSel
                        ? "#F0FDF4"
                        : isUnlocked
                        ? "#fff"
                        : "#FAFAFA",
                      opacity: isUnlocked ? 1 : 0.45,
                      position: "relative",
                      boxShadow: isSel
                        ? "0 3px 0 #bbf7d0"
                        : isUnlocked
                        ? "0 3px 0 #e2e8f0"
                        : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: isUnlocked ? def.color + "22" : "#D1D5DB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: `2px solid ${
                          isUnlocked ? def.color : "#D1D5DB"
                        }`,
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={isUnlocked && b.img ? b.img : ""}
                        alt={b.label}
                        style={{
                          width: 26,
                          height: 26,
                          objectFit: "contain",
                          display: isUnlocked && b.img ? "block" : "none",
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          if (e.currentTarget.nextElementSibling)
                            e.currentTarget.nextElementSibling.style.display =
                              "flex";
                        }}
                      />
                      <span
                        style={{
                          fontSize: 16,
                          display: isUnlocked && b.img ? "none" : "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isUnlocked ? b.emoji : "🔒"}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 8,
                        fontWeight: isSel ? 800 : 600,
                        textAlign: "center",
                        color: isSel
                          ? "#16a34a"
                          : isUnlocked
                          ? "#374151"
                          : "#9CA3AF",
                      }}
                    >
                      {b.label}
                    </div>
                    <div
                      style={{
                        fontSize: 7,
                        color: "#9CA3AF",
                        textAlign: "center",
                      }}
                    >
                      {b.threshold}승
                    </div>
                    {isSel && (
                      <div
                        style={{
                          position: "absolute",
                          top: 2,
                          right: 3,
                          fontSize: 8,
                          color: "#16a34a",
                          fontWeight: 900,
                        }}
                      >
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BorderTab({ border, setBorder, sel, tImgs, unlocked }) {
  const groups = [...new Set(BORDER_STYLES.map((b) => b.group))];
  const groupColors = {
    기본: "#6B7280",
    "타입 매니아": "#0EA5E9",
    고급: "#8B5CF6",
    최고급: "#F59E0B",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {groups.map((group) => (
        <div key={group}>
          <div
            style={{
              fontWeight: 800,
              fontSize: 11,
              color: groupColors[group] || "#6B7280",
              marginBottom: 7,
              paddingBottom: 4,
              borderBottom: `2px solid ${groupColors[group]}33`,
            }}
          >
            {group}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {BORDER_STYLES.filter((b) => b.group === group).map((b) => {
              const isLocked = !unlocked[b.key],
                isSel = border === b.key;
              return (
                <div
                  key={b.key}
                  onClick={() => !isLocked && setBorder(b.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    padding: "9px 13px",
                    borderRadius: 12,
                    cursor: isLocked ? "not-allowed" : "pointer",
                    border: `1.5px solid ${
                      isSel ? "#22c55e" : isLocked ? "#F3F4F6" : "#E5E7EB"
                    }`,
                    background: isSel
                      ? "#F0FDF4"
                      : isLocked
                      ? "#FAFAFA"
                      : "#fff",
                    opacity: isLocked ? 0.7 : 1,
                    boxShadow: isSel
                      ? "0 3px 0 #bbf7d0"
                      : isLocked
                      ? "none"
                      : "0 3px 0 #e2e8f0",
                  }}
                >
                  <BorderPreview
                    borderKey={b.key}
                    trainerId={sel}
                    tImgs={tImgs}
                    size={48}
                    locked={isLocked}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 12,
                        color: isSel
                          ? "#16a34a"
                          : isLocked
                          ? "#9CA3AF"
                          : "#111827",
                      }}
                    >
                      {b.label}{" "}
                      {isSel && (
                        <span
                          style={{
                            marginLeft: 5,
                            fontSize: 9,
                            color: "#16a34a",
                          }}
                        >
                          ✓ 적용중
                        </span>
                      )}
                    </div>
                    {b.unlockDesc && (
                      <div
                        style={{
                          fontSize: 10,
                          marginTop: 1,
                          fontWeight: 600,
                          color: isLocked ? "#EF4444" : "#16a34a",
                        }}
                      >
                        {isLocked ? "🔒 " : "✅ "}
                        {b.unlockDesc}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProfileEditor({
  profile,
  tImgs,
  onSave,
  onClose,
  onShowFeaturedSeal,
}) {
  const [name, setSName] = useState(profile.name || "");
  const [sel, setSel] = useState(profile.trainerId || null);
  const [bio, setBio] = useState(profile.bio || "");
  const [border, setBorder] = useState(profile.borderStyle || "none");
  const [title, setTitle] = useState(profile.title || "none");
  const [badge, setBadge] = useState(profile.badge || null);
  const [tab, setTab] = useState("trainer");

  const trainers = Object.keys(T);
  const wins = profile.wins || {},
    stats = profile.stats || {};
  const dex = useMemo(() => loadSealDex(), []);
  const unlocked = useMemo(
    () => Object.fromEntries(BORDER_STYLES.map((b) => [b.key, b.check(dex)])),
    [dex]
  );

  const featuredIds =
    profile.featuredSealIds ??
    (profile.featuredSealId ? [profile.featuredSealId] : []);
  const featuredSeals = featuredIds
    .map((id) => ALL_SEALS_MERGED.find((s) => String(s.id) === String(id)))
    .filter(Boolean);

  const TABS = [
    ["trainer", "🧑 트레이너"],
    ["customize", "⭐ 대표씰"],
    ["border", "🖼️ 테두리"],
    ["title", "🏅 칭호"],
    ["badge", "🎖️ 뱃지"],
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.82)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1010,
        fontFamily: "system-ui,sans-serif",
        padding: 16,
      }}
    >
      <div
        style={{
          width: Math.min(500, window.innerWidth - 32),
          background: "linear-gradient(160deg,#E8190A,#C01208)",
          borderRadius: 28,
          padding: 12,
          boxShadow:
            "0 16px 48px rgba(0,0,0,0.7),inset 0 2px 0 rgba(255,130,110,0.5),inset 0 -3px 0 rgba(0,0,0,0.35)",
          border: "3px solid #8B0000",
          animation: "pePopIn 0.25s ease",
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "4px 4px 10px",
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              flexShrink: 0,
              position: "relative",
              background:
                "radial-gradient(circle at 32% 28%,#bfdbfe,#2563EB 55%,#1e3a8a)",
              boxShadow:
                "0 0 0 4px rgba(255,255,255,0.3),0 0 20px rgba(59,130,246,0.6),0 4px 8px rgba(0,0,0,0.5)",
              border: "2px solid rgba(255,255,255,0.45)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "18%",
                left: "18%",
                width: "38%",
                height: "38%",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.7)",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
            {[
              { c: "#f87171", g: "#ef4444" },
              { c: "#fbbf24", g: "#f59e0b" },
              { c: "#4ade80", g: "#22c55e" },
            ].map(({ c, g }, i) => (
              <div
                key={i}
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: "50%",
                  background: c,
                  boxShadow: `0 0 7px ${g}`,
                  border: "1.5px solid rgba(255,255,255,0.35)",
                }}
              />
            ))}
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <span
              style={{
                color: "#fff",
                fontWeight: 900,
                fontSize: 17,
                letterSpacing: 1,
                textShadow: "0 1px 4px rgba(0,0,0,0.5)",
              }}
            >
              👤 내 프로필
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.3)",
              background: "rgba(0,0,0,0.3)",
              color: "rgba(255,255,255,0.8)",
              fontSize: 14,
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>

        {/* 포켓덱스 스크린 */}
        <div
          style={{
            background: "#0a0f1a",
            borderRadius: 14,
            border: "5px solid #fff",
            boxShadow: "0 0 0 2px #bbb,inset 0 2px 12px rgba(0,0,0,0.9)",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              height: 2,
              background:
                "linear-gradient(90deg,transparent,rgba(74,222,128,0.2),transparent)",
              animation: "scanLine 2.5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              padding: "8px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  color: "rgba(74,222,128,0.65)",
                  fontSize: 9,
                  fontFamily: "monospace",
                  letterSpacing: 1,
                  marginBottom: 1,
                }}
              >
                TRAINER PROFILE
              </div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 14 }}>
                {name || "TRAINER"}
              </div>
            </div>
            <div
              style={{
                color: "rgba(74,222,128,0.4)",
                fontSize: 9,
                fontFamily: "monospace",
              }}
            >
              ▶ EDIT
            </div>
          </div>
          <div style={{ display: "flex", height: 3 }}>
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  background:
                    i % 3 === 0 ? "rgba(74,222,128,0.45)" : "transparent",
                }}
              />
            ))}
          </div>
        </div>

        {/* 메인 패널 */}
        <div
          style={{
            background: "#FEFEFE",
            borderRadius: 20,
            padding: 12,
            boxShadow: "inset 0 2px 0 #fff,inset 0 -2px 0 rgba(180,0,0,0.12)",
          }}
        >
          {/* 탭 */}
          <div
            style={{
              display: "flex",
              gap: 4,
              marginBottom: 12,
              flexWrap: "wrap",
            }}
          >
            {TABS.map(([k, l]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                style={{
                  flex: 1,
                  padding: "8px 3px",
                  borderRadius: 28,
                  border:
                    tab === k ? "2px solid #16a34a" : "1.5px solid #E5E7EB",
                  background: tab === k ? "#F0FDF4" : "#fff",
                  fontWeight: 700,
                  fontSize: 10,
                  cursor: "pointer",
                  color: tab === k ? "#15803d" : "#6B7280",
                  boxShadow: tab === k ? "0 3px 0 #bbf7d0" : "0 3px 0 #e2e8f0",
                  transition: "all 0.15s",
                }}
              >
                {l}
              </button>
            ))}
          </div>

          <div style={{ maxHeight: "50vh", overflowY: "auto" }}>
            {/* 트레이너 탭 */}
            {tab === "trainer" && (
              <>
                <WinStatsCard wins={wins} />
                <div style={{ marginBottom: 12 }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: 700,
                      fontSize: 11,
                      marginBottom: 5,
                      color: "#374151",
                    }}
                  >
                    트레이너 이름
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setSName(e.target.value)}
                    placeholder="이름 입력"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1.5px solid #E5E7EB",
                      fontSize: 14,
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: 700,
                      fontSize: 11,
                      marginBottom: 7,
                      color: "#374151",
                    }}
                  >
                    트레이너 선택 ({trainers.length}명)
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5,1fr)",
                      gap: 5,
                      maxHeight: 260,
                      overflowY: "auto",
                      padding: 4,
                      border: "1.5px solid #E5E7EB",
                      borderRadius: 10,
                      background: "#FAFAFA",
                    }}
                  >
                    {trainers.map((t) => (
                      <div
                        key={t}
                        onClick={() => setSel((p) => (p === t ? null : t))}
                        style={{
                          textAlign: "center",
                          cursor: "pointer",
                          padding: "7px 3px",
                          borderRadius: 10,
                          border: `1.5px solid ${
                            sel === t ? "#22c55e" : "transparent"
                          }`,
                          background: sel === t ? "#F0FDF4" : "transparent",
                          transition: "all 0.15s",
                        }}
                      >
                        <TrainerPortrait name={t} size={42} tImgs={tImgs} />
                        <div
                          style={{
                            fontSize: 8,
                            fontWeight: sel === t ? 700 : 400,
                            marginTop: 2,
                            color: sel === t ? "#16a34a" : "#6B7280",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 대표씰 탭 (구 꾸미기) */}
            {tab === "customize" && (
              <>
                {/* 프로필 미리보기 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    background: "#F9FAFB",
                    borderRadius: 14,
                    padding: "14px 18px",
                    marginBottom: 14,
                    border: "1.5px solid #E5E7EB",
                    boxShadow: "0 3px 0 #e2e8f0",
                  }}
                >
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <BorderPreview
                      borderKey={border}
                      trainerId={sel}
                      tImgs={tImgs}
                      size={60}
                    />
                    {badge && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: -6,
                          right: -6,
                          zIndex: 10,
                        }}
                      >
                        <BadgeIcon badge={badge} size={22} />
                      </div>
                    )}
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 14,
                        color: "#111827",
                      }}
                    >
                      {title && title !== "none" && (
                        <TitleBadge titleKey={title} fontSize={11} />
                      )}
                      {name || "이름 없음"}
                    </div>
                    {bio && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "#6B7280",
                          fontStyle: "italic",
                          marginTop: 2,
                        }}
                      >
                        "{bio}"
                      </div>
                    )}
                    <div
                      style={{ fontSize: 10, color: "#9CA3AF", marginTop: 3 }}
                    >
                      {sel || "트레이너 미선택"}
                    </div>
                  </div>
                </div>

                {/* 한줄 인사말 */}
                <div style={{ marginBottom: 14 }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: 700,
                      fontSize: 11,
                      marginBottom: 5,
                      color: "#374151",
                    }}
                  >
                    💬 한줄 인사말{" "}
                    <span
                      style={{
                        fontSize: 10,
                        color: "#9CA3AF",
                        fontWeight: 400,
                        marginLeft: 5,
                      }}
                    >
                      (리더보드에 표시)
                    </span>
                  </label>
                  <input
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 30))}
                    placeholder="ex) 뮤츠 3개 보유중 😎"
                    maxLength={30}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1.5px solid #E5E7EB",
                      fontSize: 13,
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />
                  <div
                    style={{
                      fontSize: 10,
                      color: "#9CA3AF",
                      textAlign: "right",
                      marginTop: 2,
                    }}
                  >
                    {bio.length}/30
                  </div>
                </div>

                {/* ── 대표씰 설정 ── */}
                <div
                  style={{ paddingTop: 14, borderTop: "1.5px solid #E5E7EB" }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 11,
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    ⭐ 대표 씰{" "}
                    <span
                      style={{
                        fontSize: 10,
                        color: "#9CA3AF",
                        fontWeight: 400,
                      }}
                    >
                      (프로필에 표시 · 최대 6마리)
                    </span>
                  </div>
                  <button
                    onClick={onShowFeaturedSeal}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 12,
                      cursor: "pointer",
                      border:
                        featuredSeals.length > 0
                          ? "1.5px solid #c7d2fe"
                          : "1.5px dashed #c7d2fe",
                      background:
                        featuredSeals.length > 0 ? "#eef2ff" : "#f8f9ff",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      boxShadow: "0 2px 0 #e0e7ff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        flex: 1,
                        alignItems: "center",
                        minWidth: 0,
                      }}
                    >
                      {featuredSeals.length > 0
                        ? featuredSeals.map((seal) => (
                            <img
                              key={seal.id}
                              src={seal.artwork}
                              alt={seal.name}
                              style={{
                                flex: 1,
                                minWidth: 0,
                                height: 34,
                                objectFit: "contain",
                              }}
                            />
                          ))
                        : Array.from({ length: 6 }).map((_, i) => (
                            <div
                              key={i}
                              style={{
                                flex: 1,
                                height: 34,
                                borderRadius: 6,
                                border: "1px dashed #c7d2fe",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#c7d2fe",
                                fontSize: 12,
                              }}
                            >
                              ⭐
                            </div>
                          ))}
                    </div>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 11,
                        color: "#4338ca",
                        whiteSpace: "nowrap",
                        paddingLeft: 4,
                        flexShrink: 0,
                      }}
                    >
                      {featuredSeals.length > 0 ? "변경 ›" : "설정 ›"}
                    </span>
                  </button>
                </div>
              </>
            )}

            {tab === "border" && (
              <BorderTab
                border={border}
                setBorder={setBorder}
                sel={sel}
                tImgs={tImgs}
                unlocked={unlocked}
              />
            )}
            {tab === "title" && (
              <TitleTab
                wins={wins}
                stats={stats}
                selectedTitle={title}
                onSelect={setTitle}
              />
            )}
            {tab === "badge" && (
              <BadgeTab wins={wins} selectedBadge={badge} onSelect={setBadge} />
            )}
          </div>

          {/* 저장/취소 */}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              onClick={() =>
                onSave({
                  name: name.trim() || "나",
                  trainerId: sel,
                  bio: bio.trim(),
                  borderStyle: border,
                  title: title === "none" ? null : title,
                  badge,
                })
              }
              style={{
                flex: 1,
                padding: "12px 0",
                borderRadius: 28,
                border: "2px solid #15803d",
                background:
                  "linear-gradient(160deg,#4ade80,#22c55e 40%,#16a34a)",
                color: "#fff",
                fontWeight: 900,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 4px 0 #166534,0 8px 24px rgba(22,163,74,0.3)",
              }}
            >
              💾 저장
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "12px 0",
                borderRadius: 28,
                border: "1.5px solid #E5E7EB",
                background: "#fff",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                color: "#6B7280",
                boxShadow: "0 3px 0 #e2e8f0",
              }}
            >
              취소
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanLine     { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes pePopIn      { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
        @keyframes borderSpin   { to{transform:rotate(360deg)} }
        @keyframes shimmerSlide { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes glowPulse_holo     { 0%,100%{opacity:0.7} 50%{opacity:1} }
        @keyframes glowPulse_crystal  { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes glowPulse_diamond  { 0%,100%{opacity:0.65} 50%{opacity:1} }
        @keyframes glowPulse_champion { 0%,100%{box-shadow:0 0 7px 2px #FFD70066,0 0 14px 4px #FBBF2422} 50%{box-shadow:0 0 11px 3px #FFD700aa,0 0 22px 7px #FBBF2433} }
        @keyframes glowPulse_master   { 0%,100%{box-shadow:0 0 8px 2px #7c3aed44,0 0 16px 5px #dc262622} 50%{box-shadow:0 0 13px 4px #7c3aed77,0 0 25px 8px #dc262633} }
        @keyframes glowPulse_rainbow  { 0%,100%{box-shadow:0 0 10px 3px #ff008044,0 0 20px 7px #00aaff22} 50%{box-shadow:0 0 16px 6px #ff008066,0 0 32px 11px #00aaff44,0 0 45px 14px #ffd70022} }
        @keyframes tb_fire    { 0%,100%{box-shadow:0 0 2px 1px #FF450044} 50%{box-shadow:0 0 4px 1px #FF6B0066} }
        @keyframes tb_water   { 0%,100%{box-shadow:0 0 2px 1px #0EA5E944} 50%{box-shadow:0 0 4px 1px #38BDF866} }
        @keyframes tb_elec    { 0%,100%{box-shadow:0 0 2px 1px #FFD70044} 50%{box-shadow:0 0 4px 1px #FFEE0066} }
        @keyframes tb_grass   { 0%,100%{box-shadow:0 0 2px 1px #22C55E44} 50%{box-shadow:0 0 4px 1px #4ADE8066} }
        @keyframes tb_ghost   { 0%,100%{box-shadow:0 0 2px 1px #7C3AED44} 50%{box-shadow:0 0 4px 1px #A78BFA66} }
        @keyframes tb_psychic { 0%,100%{box-shadow:0 0 2px 1px #EC489944} 50%{box-shadow:0 0 4px 1px #F472B666} }
        @keyframes tb_bug     { 0%,100%{box-shadow:0 0 2px 1px #84CC1644} 50%{box-shadow:0 0 4px 1px #A3E63566} }
        @keyframes tb_rock    { 0%,100%{box-shadow:0 0 2px 1px #B4530944} 50%{box-shadow:0 0 4px 1px #D9770666} }
        @keyframes tb_poison  { 0%,100%{box-shadow:0 0 2px 1px #A855F744} 50%{box-shadow:0 0 4px 1px #D946EF66} }
        @keyframes tb_fight   { 0%,100%{box-shadow:0 0 2px 1px #DC262644} 50%{box-shadow:0 0 4px 1px #EF444466} }
        @keyframes tb_ground  { 0%,100%{box-shadow:0 0 2px 1px #D9770644} 50%{box-shadow:0 0 4px 1px #F59E0B66} }
        @keyframes tb_dragon  { 0%,100%{box-shadow:0 0 2px 1px #4338CA44} 50%{box-shadow:0 0 4px 1px #6366F166} }
        @keyframes tb_ice     { 0%,100%{box-shadow:0 0 2px 1px #67E8F944} 50%{box-shadow:0 0 4px 1px #A5F3FC66} }
        @keyframes tb_normal  { 0%,100%{box-shadow:0 0 2px 1px #9CA3AF44} 50%{box-shadow:0 0 4px 1px #D1D5DB66} }
      `}</style>
    </div>
  );
}
