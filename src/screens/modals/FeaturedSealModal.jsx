import { useState, useEffect, useMemo } from "react";
import { ALL_SEALS, loadSealDex } from "../../lib/sealLogic";
import { SHINY_SEALS, loadShinyDex } from "../../lib/shinySeals";
import { ALL_EVENT_SEALS, loadCapDex } from "../../lib/eventLogic";
const MAX_FEATURED = 6;
const ALL_SEALS_MERGED = [...ALL_SEALS, ...SHINY_SEALS, ...ALL_EVENT_SEALS];

const GRADE_FX = {
  COMMON: { label: "일반", color: "#aaaaaa" },
  RARE: { label: "레어", color: "#4fc3f7" },
  SR: { label: "슈퍼레어", color: "#ce93d8" },
  LEGENDARY: { label: "레전더리", color: "#ffd700" },
  HOLO: { label: "홀로그램", color: "#ff80ab" },
};

const TYPE_COLORS = {
  fire: "#E8763A",
  water: "#4FC3F7",
  grass: "#66BB6A",
  electric: "#F5C400",
  psychic: "#E91E8C",
  ice: "#80DEEA",
  dragon: "#7E57C2",
  dark: "#546E7A",
  fairy: "#F48FB1",
  normal: "#A8A878",
  fighting: "#C03028",
  flying: "#89AAE3",
  poison: "#A040A0",
  ground: "#E0C068",
  rock: "#B8A038",
  bug: "#A8B820",
  ghost: "#705898",
  steel: "#B8B8D0",
};
const _tcCache = {};
async function _fetchTC(pokeId) {
  if (_tcCache[pokeId]) return _tcCache[pokeId];
  try {
    const d = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeId}`).then(
      (r) => r.json()
    );
    _tcCache[pokeId] = TYPE_COLORS[d.types[0].type.name] || "#A8A878";
  } catch {
    _tcCache[pokeId] = "#A8A878";
  }
  return _tcCache[pokeId];
}

const HOLO_FX_TYPE = {
  6: "fire",
  25: "lightning",
  3: "grass",
  9: "water",
  149: "dragon",
  150: "psychic",
  151: "psychic",
  133: "sparkle",
  129: "golden",
  130: "dragon",
};

function HoloEffect({ pokeId }) {
  const type = HOLO_FX_TYPE[pokeId] || "sparkle";
  if (type === "fire")
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {[
          { l: "4%", d: "0s", s: 8, h: 10 },
          { l: "14%", d: "0.18s", s: 10, h: 22 },
          { l: "25%", d: "0.07s", s: 7, h: 35 },
          { l: "36%", d: "0.32s", s: 11, h: 15 },
          { l: "48%", d: "0.05s", s: 8, h: 28 },
          { l: "59%", d: "0.24s", s: 9, h: 10 },
          { l: "70%", d: "0.14s", s: 8, h: 32 },
          { l: "81%", d: "0.38s", s: 7, h: 20 },
          { l: "91%", d: "0.1s", s: 10, h: 8 },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: "2%",
              left: p.l,
              width: p.s,
              height: p.s * 2,
              borderRadius: "50% 50% 25% 75% / 60% 60% 40% 40%",
              background: `hsl(${p.h},100%,55%)`,
              boxShadow: `0 0 10px hsl(${p.h},100%,65%), 0 0 4px #fff`,
              animation: `fsmFireRise ${0.55 + i * 0.08}s ease-out infinite`,
              animationDelay: p.d,
            }}
          />
        ))}
      </div>
    );
  if (type === "lightning")
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        {[
          { l: "8%", t: "10%", d: "0s", r: "40deg" },
          { l: "55%", t: "8%", d: "0.45s", r: "-30deg" },
          { l: "28%", t: "52%", d: "0.22s", r: "25deg" },
          { l: "72%", t: "55%", d: "0.65s", r: "-48deg" },
          { l: "18%", t: "30%", d: "0.1s", r: "-20deg" },
          { l: "82%", t: "28%", d: "0.55s", r: "35deg" },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.l,
              top: p.t,
              width: 8,
              height: 17,
              background: "linear-gradient(to bottom,#ffffff,#ffe000,#ff9900)",
              boxShadow: "0 0 10px #ffe000, 0 0 4px #fff",
              clipPath:
                "polygon(50% 0%,15% 45%,42% 45%,5% 100%,85% 42%,55% 42%)",
              transform: `rotate(${p.r})`,
              animation: `fsmSpark ${0.8 + i * 0.12}s ease-in-out infinite`,
              animationDelay: p.d,
            }}
          />
        ))}
      </div>
    );
  if (type === "water")
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {[
          { l: "6%", d: "0s", s: 6 },
          { l: "18%", d: "0.35s", s: 5 },
          { l: "30%", d: "0.12s", s: 7 },
          { l: "44%", d: "0.5s", s: 5 },
          { l: "57%", d: "0.08s", s: 8 },
          { l: "68%", d: "0.42s", s: 5 },
          { l: "78%", d: "0.22s", s: 6 },
          { l: "90%", d: "0.15s", s: 5 },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: "5%",
              left: p.l,
              width: p.s,
              height: p.s,
              borderRadius: "50%",
              border: "1.5px solid rgba(100,210,255,0.95)",
              background: "rgba(140,220,255,0.2)",
              boxShadow: "0 0 8px rgba(100,200,255,0.8)",
              animation: `fsmBubble ${0.9 + i * 0.16}s ease-in-out infinite`,
              animationDelay: p.d,
            }}
          />
        ))}
      </div>
    );
  if (type === "grass")
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {[
          { l: "5%", d: "0s", s: 6 },
          { l: "16%", d: "0.28s", s: 5 },
          { l: "28%", d: "0.1s", s: 7 },
          { l: "40%", d: "0.42s", s: 6 },
          { l: "53%", d: "0.06s", s: 7 },
          { l: "64%", d: "0.35s", s: 5 },
          { l: "76%", d: "0.18s", s: 6 },
          { l: "88%", d: "0.48s", s: 5 },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: "4%",
              left: p.l,
              width: p.s,
              height: p.s * 1.8,
              borderRadius: "50% 0 50% 0",
              background: "linear-gradient(135deg,#77ee44,#22aa00)",
              boxShadow: "0 0 8px rgba(80,220,40,0.9)",
              animation: `fsmLeaf ${1 + i * 0.13}s ease-out infinite`,
              animationDelay: p.d,
            }}
          />
        ))}
      </div>
    );
  if (type === "dragon")
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {[
          { d: "0s", c: "#a78bfa", s: 6, r: 22 },
          { d: "0.83s", c: "#f472b6", s: 5, r: 22 },
          { d: "1.67s", c: "#60a5fa", s: 6, r: 22 },
          { d: "2.5s", c: "#fbbf24", s: 5, r: 22 },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 0,
              height: 0,
              animation: "fsmDragon 2.2s linear infinite",
              animationDelay: p.d,
            }}
          >
            <div
              style={{
                width: p.s,
                height: p.s,
                borderRadius: "50%",
                background: p.c,
                boxShadow: `0 0 12px ${p.c}, 0 0 4px #fff`,
                transform: `translateX(${p.r}px)`,
              }}
            />
          </div>
        ))}
      </div>
    );
  if (type === "psychic")
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {[
          { d: "0s", c: "#e879f9", s: 6, r: 22, spd: 2.8 },
          { d: "0.7s", c: "#c084fc", s: 5, r: 22, spd: 2.8 },
          { d: "1.4s", c: "#f0abfc", s: 6, r: 22, spd: 2.8 },
          { d: "2.1s", c: "#a855f7", s: 5, r: 22, spd: 2.8 },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 0,
              height: 0,
              animation: `fsmPsychic ${p.spd}s linear infinite`,
              animationDelay: p.d,
            }}
          >
            <div
              style={{
                width: p.s,
                height: p.s,
                borderRadius: "50%",
                background: `radial-gradient(circle,#fff 20%,${p.c})`,
                boxShadow: `0 0 12px ${p.c}, 0 0 4px #fff`,
                transform: `translateX(${p.r}px)`,
              }}
            />
          </div>
        ))}
      </div>
    );
  if (type === "golden")
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        {[
          { l: "8%", t: "12%", d: "0s", s: 9 },
          { l: "72%", t: "10%", d: "0.5s", s: 8 },
          { l: "38%", t: "45%", d: "0.25s", s: 11 },
          { l: "82%", t: "52%", d: "0.7s", s: 7 },
          { l: "18%", t: "62%", d: "0.15s", s: 9 },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.l,
              top: p.t,
              width: p.s,
              height: p.s,
              background: "linear-gradient(135deg,#fff7a0,#ffd700,#ffaa00)",
              boxShadow: "0 0 12px #ffd700, 0 0 5px #fff",
              clipPath:
                "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
              animation: `fsmGoldenSpin ${
                0.8 + i * 0.15
              }s ease-in-out infinite`,
              animationDelay: p.d,
            }}
          />
        ))}
      </div>
    );
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 2,
        pointerEvents: "none",
      }}
    >
      {[
        { l: "6%", t: "10%", d: "0s", s: 7, c: "#ffd700" },
        { l: "75%", t: "14%", d: "0.38s", s: 6, c: "#ff80ab" },
        { l: "15%", t: "65%", d: "0.18s", s: 6, c: "#a78bfa" },
        { l: "68%", t: "60%", d: "0.55s", s: 8, c: "#60d4f0" },
        { l: "44%", t: "30%", d: "0.08s", s: 5, c: "#ffd700" },
        { l: "86%", t: "38%", d: "0.72s", s: 6, c: "#ff80ab" },
      ].map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.l,
            top: p.t,
            width: p.s,
            height: p.s,
            background: p.c,
            boxShadow: `0 0 8px ${p.c}, 0 0 3px #fff`,
            clipPath:
              "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
            animation: `fsmSparkle ${0.7 + i * 0.12}s ease-in-out infinite`,
            animationDelay: p.d,
          }}
        />
      ))}
    </div>
  );
}

function SealItem({ seal, selectedIndex, isMaxed, onClick }) {
  const [typeColor, setTypeColor] = useState("#A8A878");
  const isHolo = seal.grade === "HOLO";
  const isShiny = typeof seal.id === "string" && seal.id.startsWith("shiny_");
  const isSel = selectedIndex !== -1;
  useEffect(() => {
    _fetchTC(seal.pokeId).then(setTypeColor);
  }, [seal.pokeId]);

  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        width: 78,
        cursor: !isSel && isMaxed ? "not-allowed" : "pointer",
        opacity: !isSel && isMaxed ? 0.4 : 1,
        transition: "transform 0.12s, box-shadow 0.12s",
        boxShadow: isSel
          ? "0 0 0 1px rgba(22,163,74,0.3), 0 3px 8px rgba(0,0,0,0.1)"
          : "0 1px 5px rgba(0,0,0,0.15)",
        outline: isSel ? "1.5px solid #22c55e" : "none",
        outlineOffset: 0,
        borderRadius: 1,
        overflow: "visible",
      }}
      onMouseEnter={(e) => {
        if (!(!isSel && isMaxed))
          e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          background: "#fff",
          border: `1px solid ${isSel ? "#22c55e" : "#c8c8c8"}`,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            padding: "0px 4px 0px",
            marginTop: "-3px",
            background: "#fff",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "stretch",
              border: "1px solid #bbb",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: isShiny
                  ? "linear-gradient(90deg,#a0f4ff,#ffb0ff)"
                  : typeColor,
                padding: "1px 4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 900,
                  color: "#111",
                  lineHeight: 1.4,
                  whiteSpace: "nowrap",
                }}
              >
                {isShiny ? "✨" : String(seal.pokeId).padStart(3, "0")}
              </span>
            </div>
            <div
              style={{
                background: "#fff",
                padding: "1px 5px",
                display: "flex",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: "#111",
                  lineHeight: 1.4,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 42,
                }}
              >
                {seal.name}
              </span>
            </div>
          </div>
        </div>
        <div
          style={{
            position: "relative",
            height: 70,
            background: isHolo
              ? "linear-gradient(135deg,#fff0f8,#f0f8ff,#fffff0)"
              : "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {isHolo && (
            <div
              style={{
                position: "absolute",
                inset: -78,
                background:
                  "conic-gradient(rgba(255,128,171,0.2),rgba(79,195,247,0.2),rgba(255,215,0,0.2),rgba(255,128,171,0.2))",
                animation: "fsmHoloSpin 4s linear infinite",
                zIndex: 0,
              }}
            />
          )}
          {isHolo && <HoloEffect pokeId={seal.pokeId} />}
          <img
            src={seal.artwork}
            alt={seal.name}
            style={{
              width: 62,
              height: 62,
              objectFit: "contain",
              position: "relative",
              zIndex: 1,
              filter: isHolo
                ? "drop-shadow(0 0 5px rgba(255,128,171,0.8))"
                : "none",
              animation: isHolo
                ? "fsmHoloFloat 2s ease-in-out infinite"
                : "none",
            }}
          />
        </div>
        <div
          style={{
            padding: "2px 5px",
            display: "flex",
            justifyContent: "flex-end",
            background: "#fff",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 6, color: "#bbb", letterSpacing: 0.3 }}>
            ©Pokémon
          </span>
        </div>
      </div>
      {isSel && (
        <div
          style={{
            position: "absolute",
            top: 3,
            right: 3,
            width: 17,
            height: 17,
            borderRadius: "50%",
            background: "#22c55e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
          }}
        >
          <span style={{ color: "#fff", fontSize: 9, fontWeight: 900 }}>
            {selectedIndex + 1}
          </span>
        </div>
      )}
    </div>
  );
}

export default function FeaturedSealModal({
  currentSealIds = [],
  onSelect,
  onClose,
}) {
  const [dex] = useState(() => loadSealDex());
  const [shinyDex] = useState(() => loadShinyDex());
  const [capDex] = useState(() => loadCapDex());

  // ── ID를 그대로 유지 (이로치는 "shiny_25", 모자는 "cap_original" 같은 문자열) ──
  const [selected, setSel] = useState(() =>
    Array.isArray(currentSealIds)
      ? [...currentSealIds]
      : currentSealIds
      ? [currentSealIds]
      : []
  );
  const [gradeFilter, setGF] = useState("ALL");
  const [search, setSearch] = useState("");

  // 보유한 일반씰 + 이로치씰 + 이벤트씰(모자+코스프레) 통합 — 도감 번호 순 정렬
  const ownedSeals = useMemo(
    () =>
      [
        ...ALL_SEALS.filter((s) => dex[String(s.id)]?.count > 0),
        ...SHINY_SEALS.filter((s) => shinyDex[s.id]?.count > 0),
        ...ALL_EVENT_SEALS.filter((s) => capDex[s.id]?.count > 0),
      ].sort((a, b) => (a.pokeId ?? 9999) - (b.pokeId ?? 9999)),
    [dex, shinyDex, capDex]
  );

  const filtered = useMemo(
    () =>
      ownedSeals
        .filter((s) => {
          if (gradeFilter !== "ALL" && s.grade !== gradeFilter) return false;
          if (search && !s.name.includes(search)) return false;
          return true;
        })
        .sort((a, b) => (a.pokeId ?? 9999) - (b.pokeId ?? 9999)),
    [ownedSeals, gradeFilter, search]
  );

  const grades = [
    "ALL",
    ...Array.from(new Set(ownedSeals.map((s) => s.grade))),
  ];
  const isMaxed = selected.length >= MAX_FEATURED;
  const selSeals = selected
    .map((id) => ALL_SEALS_MERGED.find((s) => String(s.id) === String(id)))
    .filter(Boolean);

  const toggle = (sealId) => {
    setSel((prev) => {
      const idx = prev.findIndex((x) => String(x) === String(sealId));
      if (idx !== -1) return prev.filter((_, i) => i !== idx);
      if (prev.length >= MAX_FEATURED) return prev;
      return [...prev, sealId];
    });
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.78)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1030,
        fontFamily: "system-ui,sans-serif",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: Math.min(420, window.innerWidth - 32),
          background: "linear-gradient(160deg,#E8190A,#C01208)",
          borderRadius: 28,
          padding: 12,
          boxShadow:
            "0 16px 48px rgba(0,0,0,0.7),inset 0 2px 0 rgba(255,130,110,0.5),inset 0 -3px 0 rgba(0,0,0,0.35)",
          border: "3px solid #8B0000",
          animation: "fsmModalPop 0.25s ease",
          display: "flex",
          flexDirection: "column",
          maxHeight: "95vh",
        }}
      >
        {/* 상단 바 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "4px 4px 10px",
            flexShrink: 0,
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
              ⭐ 대표 씰 설정
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

        {/* 스크린 */}
        <div
          style={{
            background: "#0a0f1a",
            borderRadius: 14,
            border: "5px solid #fff",
            boxShadow: "0 0 0 2px #bbb,inset 0 2px 12px rgba(0,0,0,0.9)",
            overflow: "hidden",
            marginBottom: 12,
            flexShrink: 0,
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
                FEATURED SEALS
              </div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 14 }}>
                ⭐ 대표 씰 설정
              </div>
            </div>
            <div
              style={{
                background: "rgba(74,222,128,0.15)",
                border: "1px solid rgba(74,222,128,0.3)",
                borderRadius: 8,
                padding: "3px 10px",
              }}
            >
              <span
                style={{
                  color: "#4ade80",
                  fontSize: 10,
                  fontFamily: "monospace",
                  fontWeight: 700,
                }}
              >
                {selected.length}/{MAX_FEATURED}
              </span>
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

        {/* 흰 패널 */}
        <div
          style={{
            background: "#FEFEFE",
            borderRadius: 20,
            padding: 12,
            boxShadow: "inset 0 2px 0 #fff,inset 0 -2px 0 rgba(180,0,0,0.12)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* 선택된 씰 슬롯 */}
          <div
            style={{
              display: "flex",
              gap: 5,
              alignItems: "center",
              padding: "9px 11px",
              background: "#F0FDF4",
              borderRadius: 12,
              border: "1.5px solid #bbf7d0",
              boxShadow: "0 3px 0 #bbf7d0",
              flexShrink: 0,
            }}
          >
            {Array.from({ length: MAX_FEATURED }).map((_, i) => {
              const seal = selSeals[i],
                isHolo = seal?.grade === "HOLO";
              return (
                <div
                  key={i}
                  onClick={() => seal && toggle(seal.id)}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    cursor: seal ? "pointer" : "default",
                    flexShrink: 0,
                    position: "relative",
                    overflow: "hidden",
                    border: seal
                      ? "1.5px solid #22c55e"
                      : "1.5px dashed #86efac",
                    background: seal
                      ? isHolo
                        ? "linear-gradient(135deg,#fff0f8,#f0f8ff)"
                        : "#fff"
                      : "rgba(134,239,172,0.1)",
                    boxShadow: isHolo
                      ? "0 0 6px rgba(255,128,171,0.5)"
                      : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {seal ? (
                    <>
                      {isHolo && (
                        <div
                          style={{
                            position: "absolute",
                            inset: -38,
                            background:
                              "conic-gradient(rgba(255,128,171,0.3),rgba(79,195,247,0.3),rgba(255,215,0,0.3),rgba(255,128,171,0.3))",
                            animation: "fsmHoloSpin 3s linear infinite",
                            zIndex: 0,
                          }}
                        />
                      )}
                      <img
                        src={seal.artwork}
                        alt={seal.name}
                        style={{
                          width: 26,
                          height: 26,
                          objectFit: "contain",
                          position: "relative",
                          zIndex: 1,
                          filter: isHolo
                            ? "drop-shadow(0 0 3px rgba(255,128,171,0.8))"
                            : "none",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: -4,
                          right: -4,
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: "#EF4444",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 8,
                          color: "#fff",
                          fontWeight: 900,
                          zIndex: 2,
                        }}
                      >
                        ✕
                      </div>
                    </>
                  ) : (
                    <span style={{ fontSize: 14, color: "#86efac" }}>+</span>
                  )}
                </div>
              );
            })}
            <div
              style={{ marginLeft: "auto", textAlign: "right", flexShrink: 0 }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 900,
                  color: isMaxed ? "#16a34a" : "#9CA3AF",
                }}
              >
                {selected.length}
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                  /{MAX_FEATURED}
                </span>
              </div>
            </div>
          </div>

          {/* 필터 */}
          <div
            style={{
              display: "flex",
              gap: 5,
              flexWrap: "wrap",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름 검색..."
              style={{
                flex: 1,
                minWidth: 70,
                padding: "5px 10px",
                borderRadius: 10,
                border: "1.5px solid #E5E7EB",
                fontSize: 11,
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.border = "1.5px solid #22c55e")}
              onBlur={(e) => (e.target.style.border = "1.5px solid #E5E7EB")}
            />
            {grades.map((g) => (
              <button
                key={g}
                onClick={() => setGF(g)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 20,
                  border: `1.5px solid ${
                    gradeFilter === g
                      ? GRADE_FX[g]?.color || "#22c55e"
                      : "#E5E7EB"
                  }`,
                  background:
                    gradeFilter === g
                      ? (GRADE_FX[g]?.color || "#22c55e") + "22"
                      : "#fff",
                  color:
                    gradeFilter === g
                      ? GRADE_FX[g]?.color || "#16a34a"
                      : "#6B7280",
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {g === "ALL" ? "전체" : GRADE_FX[g]?.label || g}
              </button>
            ))}
          </div>

          {/* 씰 그리드 */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {ownedSeals.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px 20px",
                  color: "#9CA3AF",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 10 }}>🍞</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>
                  보유한 씰이 없어요
                </div>
                <div style={{ fontSize: 11, marginTop: 4 }}>
                  포켓몬 빵을 구매해서 씰을 모아보세요!
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 36,
                  color: "#9CA3AF",
                  fontSize: 12,
                }}
              >
                해당하는 씰이 없습니다
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 7,
                  justifyContent: "flex-start",
                }}
              >
                {filtered.map((seal) => {
                  const idx = selected.findIndex(
                    (x) => String(x) === String(seal.id)
                  );
                  return (
                    <SealItem
                      key={seal.id}
                      seal={seal}
                      selectedIndex={idx}
                      isMaxed={isMaxed}
                      onClick={() => toggle(seal.id)}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* 하단 버튼 */}
          <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
            {selected.length > 0 && (
              <button
                onClick={() => setSel([])}
                style={{
                  padding: "11px 0",
                  borderRadius: 28,
                  border: "1.5px solid #fca5a5",
                  background: "#fff",
                  color: "#EF4444",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                  width: 80,
                  boxShadow: "0 3px 0 #fca5a5",
                }}
              >
                🗑️ 전체해제
              </button>
            )}
            <button
              onClick={() => {
                onSelect(selected);
                onClose();
              }}
              style={{
                flex: 1,
                padding: "12px 0",
                borderRadius: 28,
                border: "2px solid #15803d",
                background:
                  "linear-gradient(160deg,#4ade80,#22c55e 40%,#16a34a)",
                color: "#fff",
                fontWeight: 900,
                fontSize: 13,
                cursor: "pointer",
                boxShadow: "0 4px 0 #166534,0 8px 24px rgba(22,163,74,0.3)",
              }}
            >
              ⭐ {selected.length}마리 설정 완료
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanLine      { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes fsmModalPop   { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
        @keyframes fsmHoloSpin   { to{transform:rotate(360deg)} }
        @keyframes fsmHoloFloat  { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-3px) scale(1.05)} }
        @keyframes fsmFireRise   { 0%{transform:translateY(0) scaleX(1);opacity:0.9} 60%{transform:translateY(-35px) scaleX(0.5);opacity:0.6} 100%{transform:translateY(-65px) scaleX(0.1);opacity:0} }
        @keyframes fsmEmber      { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(8px,-40px);opacity:0} }
        @keyframes fsmSpark      { 0%,100%{opacity:0;transform:scale(0.3)} 40%,60%{opacity:1;transform:scale(1)} }
        @keyframes fsmBubble     { 0%{transform:translateY(0) scale(1);opacity:0.9} 80%{transform:translateY(-55px) scale(1.4);opacity:0.4} 100%{transform:translateY(-68px) scale(1.5);opacity:0} }
        @keyframes fsmLeaf       { 0%{transform:translateY(0) translateX(0) rotate(0deg);opacity:1} 50%{transform:translateY(-26px) translateX(9px) rotate(130deg);opacity:0.6} 100%{transform:translateY(-54px) translateX(-5px) rotate(260deg);opacity:0} }
        @keyframes fsmDragon     { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes fsmPsychic    { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes fsmSparkle    { 0%,100%{transform:scale(0) rotate(0deg);opacity:0} 50%{transform:scale(1) rotate(180deg);opacity:1} }
        @keyframes fsmGoldenSpin { 0%,100%{transform:rotate(0deg) scale(0.7);opacity:0.5} 50%{transform:rotate(180deg) scale(1.3);opacity:1} }
        @keyframes fsmPulse      { 0%{transform:translate(-50%,-50%) scale(1);opacity:0.8} 100%{transform:translate(-50%,-50%) scale(5);opacity:0} }
        @keyframes fsmHeart      { 0%{transform:scale(0) translateY(0);opacity:0} 30%{transform:scale(1.2) translateY(-5px);opacity:1} 70%{transform:scale(1) translateY(-15px);opacity:0.6} 100%{transform:scale(0.8) translateY(-28px);opacity:0} }
      `}</style>
    </div>
  );
}
