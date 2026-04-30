import { useState, useMemo, useEffect } from "react";
import {
  ALL_SEALS,
  loadSealDex,
  saveSealDex,
  getDexProgress,
  getTotalShards,
  DEX_REWARDS,
} from "../../lib/sealLogic";
import {
  SHINY_SEALS,
  loadShinyDex,
  getShinyOwnedCount,
} from "../../lib/shinySeals";
import {
  CAP_PIKACHU_SEALS,
  COSPLAY_PIKACHU_SEALS,
  PARTNER_SEALS,
  MEGA_SEALS,
  GMAX_SEALS,
  ALL_EVENT_SEALS,
  loadCapDex,
  saveCapDex,
  getCapOwnedCount,
} from "../../lib/eventLogic";

const GRADE_FX = {
  COMMON: { label: "일반", color: "#aaaaaa" },
  RARE: { label: "레어", color: "#4fc3f7" },
  SR: { label: "슈퍼레어", color: "#ce93d8" },
  LEGENDARY: { label: "레전더리", color: "#ffd700" },
  HOLO: { label: "홀로그램", color: "#ff80ab" },
  SHINY: { label: "이로치", color: "#a0f4ff" },
  EVENT: { label: "이벤트", color: "#ffd700" },
};
const GRADE_FILTERS = ["ALL", "COMMON", "RARE", "SR", "LEGENDARY", "HOLO"];
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
const typeColorCache = {},
  sizeCache = {};
async function fetchPokeData(pokeId) {
  if (typeColorCache[pokeId] && sizeCache[pokeId] !== undefined) return;
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeId}`);
    const data = await res.json();
    typeColorCache[pokeId] = TYPE_COLORS[data.types[0].type.name] || "#A8A878";
    const h = data.height || 10;
    sizeCache[pokeId] = Math.min(1.4, Math.max(1.0, 1.0 + (10 - h) * 0.04));
  } catch {
    typeColorCache[pokeId] = "#A8A878";
    sizeCache[pokeId] = 1.0;
  }
}
async function fetchTypeColor(pokeId) {
  await fetchPokeData(pokeId);
  return typeColorCache[pokeId] || "#A8A878";
}

const CARD_W = 120,
  CARD_H = 138,
  IMG_SZ = 104;
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

function ShinyEffect() {
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
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "conic-gradient(rgba(255,0,128,0.12),rgba(255,165,0,0.12),rgba(255,255,0,0.1),rgba(0,255,128,0.12),rgba(0,128,255,0.12),rgba(200,0,255,0.12),rgba(255,0,128,0.12))",
          animation: "ddSpin 3s linear infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(105deg,transparent 20%,rgba(255,255,255,0.5) 50%,transparent 80%)",
          animation: "shinyShimmer 1.8s ease-in-out infinite",
        }}
      />
      {[
        { l: "12%", t: "18%", d: "0s", c: "#fff" },
        { l: "80%", t: "12%", d: "0.4s", c: "#a0f4ff" },
        { l: "45%", t: "52%", d: "0.2s", c: "#fff" },
        { l: "88%", t: "60%", d: "0.65s", c: "#ffb0ff" },
        { l: "22%", t: "72%", d: "0.1s", c: "#b0ffb0" },
        { l: "62%", t: "28%", d: "0.5s", c: "#ffd700" },
        { l: "35%", t: "10%", d: "0.3s", c: "#fff" },
      ].map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.l,
            top: p.t,
            width: 6,
            height: 6,
            background: p.c,
            boxShadow: `0 0 8px ${p.c}`,
            clipPath:
              "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
            animation: `holoSparkle ${0.6 + i * 0.14}s ease-in-out infinite`,
            animationDelay: p.d,
          }}
        />
      ))}
    </div>
  );
}

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
              animation: `holoFireRise ${0.55 + i * 0.08}s ease-out infinite`,
              animationDelay: p.d,
            }}
          />
        ))}
        {[
          { l: "8%", t: "50%", d: "0s" },
          { l: "22%", t: "38%", d: "0.3s" },
          { l: "40%", t: "55%", d: "0.12s" },
          { l: "58%", t: "32%", d: "0.45s" },
          { l: "72%", t: "48%", d: "0.2s" },
          { l: "85%", t: "40%", d: "0.35s" },
        ].map((p, i) => (
          <div
            key={"e" + i}
            style={{
              position: "absolute",
              left: p.l,
              top: p.t,
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: "#ffee44",
              boxShadow: "0 0 6px #ffaa00",
              animation: `holoEmber ${1 + i * 0.15}s ease-out infinite`,
              animationDelay: p.d,
            }}
          />
        ))}
        {[
          { d: "0s", c: "rgba(255,80,0,0.4)" },
          { d: "0.6s", c: "rgba(255,160,0,0.3)" },
        ].map((p, i) => (
          <div
            key={"r" + i}
            style={{
              position: "absolute",
              left: "50%",
              bottom: "10%",
              width: 12,
              height: 12,
              borderRadius: "50%",
              border: `2px solid ${p.c}`,
              transform: "translateX(-50%)",
              animation: "holoPulse 1.2s ease-out infinite",
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
              animation: `holoSpark ${0.8 + i * 0.12}s ease-in-out infinite`,
              animationDelay: p.d,
            }}
          />
        ))}
        {[
          { l: "35%", t: "20%", d: "0.15s" },
          { l: "65%", t: "40%", d: "0.5s" },
          { l: "50%", t: "70%", d: "0.08s" },
          { l: "20%", t: "65%", d: "0.38s" },
          { l: "80%", t: "15%", d: "0.28s" },
        ].map((p, i) => (
          <div
            key={"s" + i}
            style={{
              position: "absolute",
              left: p.l,
              top: p.t,
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "#fff",
              boxShadow: "0 0 8px #ffe000",
              animation: `holoSpark ${0.5 + i * 0.1}s ease-in-out infinite`,
              animationDelay: p.d,
            }}
          />
        ))}
        {[{ d: "0s" }, { d: "0.35s" }, { d: "0.7s" }].map((p, i) => (
          <div
            key={"r" + i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 10,
              height: 10,
              borderRadius: "50%",
              border: "2px solid rgba(255,230,0,0.6)",
              transform: "translate(-50%,-50%)",
              animation: "holoPulse 0.8s ease-out infinite",
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
              animation: `holoBubble ${0.9 + i * 0.16}s ease-in-out infinite`,
              animationDelay: p.d,
            }}
          />
        ))}
        {[
          { l: "25%", t: "25%", d: "0.1s" },
          { l: "60%", t: "20%", d: "0.4s" },
          { l: "45%", t: "60%", d: "0.2s" },
          { l: "80%", t: "45%", d: "0.55s" },
        ].map((p, i) => (
          <div
            key={"d" + i}
            style={{
              position: "absolute",
              left: p.l,
              top: p.t,
              width: 4,
              height: 5,
              borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%",
              background: "rgba(100,210,255,0.8)",
              boxShadow: "0 0 6px rgba(100,200,255,0.9)",
              animation: `holoDropFall ${1 + i * 0.2}s ease-in infinite`,
              animationDelay: p.d,
            }}
          />
        ))}
        {[{ d: "0s" }, { d: "0.5s" }, { d: "1s" }].map((p, i) => (
          <div
            key={"r" + i}
            style={{
              position: "absolute",
              left: "50%",
              bottom: "12%",
              width: 10,
              height: 10,
              borderRadius: "50%",
              border: "1.5px solid rgba(100,210,255,0.5)",
              transform: "translateX(-50%)",
              animation: "holoPulse 1.5s ease-out infinite",
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
              animation: `holoLeaf ${1 + i * 0.13}s ease-out infinite`,
              animationDelay: p.d,
            }}
          />
        ))}
        {[
          { l: "20%", t: "30%", d: "0.15s", c: "#ffb3de" },
          { l: "50%", t: "20%", d: "0.4s", c: "#ff80c0" },
          { l: "75%", t: "35%", d: "0.08s", c: "#ffcce8" },
          { l: "38%", t: "55%", d: "0.55s", c: "#ffb3de" },
          { l: "62%", t: "60%", d: "0.3s", c: "#ff99d0" },
        ].map((p, i) => (
          <div
            key={"p" + i}
            style={{
              position: "absolute",
              left: p.l,
              top: p.t,
              width: 5,
              height: 5,
              borderRadius: "60% 40% 60% 40%",
              background: p.c,
              boxShadow: `0 0 6px ${p.c}`,
              animation: `holoLeaf ${1.3 + i * 0.18}s ease-out infinite`,
              animationDelay: p.d,
            }}
          />
        ))}
        {[
          { l: "10%", t: "45%", d: "0.2s" },
          { l: "40%", t: "40%", d: "0.5s" },
          { l: "70%", t: "50%", d: "0.1s" },
          { l: "88%", t: "38%", d: "0.38s" },
        ].map((p, i) => (
          <div
            key={"g" + i}
            style={{
              position: "absolute",
              left: p.l,
              top: p.t,
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: "#88ff44",
              boxShadow: "0 0 6px #44dd00",
              animation: `holoEmber ${1 + i * 0.2}s ease-out infinite`,
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
              animation: "holoDragon 2.2s linear infinite",
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
        {[
          { d: "0s", c: "#34d399", s: 5, r: 12 },
          { d: "1.1s", c: "#fb923c", s: 4, r: 12 },
          { d: "2.2s", c: "#e879f9", s: 5, r: 12 },
        ].map((p, i) => (
          <div
            key={"i" + i}
            style={{
              position: "absolute",
              width: 0,
              height: 0,
              animation: "holoDragonRev 1.6s linear infinite",
              animationDelay: p.d,
            }}
          >
            <div
              style={{
                width: p.s,
                height: p.s,
                borderRadius: "50%",
                background: p.c,
                boxShadow: `0 0 10px ${p.c}`,
                transform: `translateX(${p.r}px)`,
              }}
            />
          </div>
        ))}
        {[{ d: "0s" }, { d: "0.7s" }].map((p, i) => (
          <div
            key={"r" + i}
            style={{
              position: "absolute",
              width: 14,
              height: 14,
              borderRadius: "50%",
              border: "1.5px solid rgba(167,139,250,0.5)",
              animation: "holoPulse 1.4s ease-out infinite",
              animationDelay: p.d,
            }}
          />
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
              animation: `holoPsychic ${p.spd}s linear infinite`,
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
        {[
          { d: "0s", c: "#f472b6", s: 5, r: 13, spd: 1.8 },
          { d: "0.9s", c: "#818cf8", s: 5, r: 13, spd: 1.8 },
          { d: "1.8s", c: "#e879f9", s: 4, r: 13, spd: 1.8 },
        ].map((p, i) => (
          <div
            key={"m" + i}
            style={{
              position: "absolute",
              width: 0,
              height: 0,
              animation: `holoPsychicRev ${p.spd}s linear infinite`,
              animationDelay: p.d,
            }}
          >
            <div
              style={{
                width: p.s,
                height: p.s,
                borderRadius: "50%",
                background: `radial-gradient(circle,#fff 15%,${p.c})`,
                boxShadow: `0 0 10px ${p.c}`,
                transform: `translateX(${p.r}px)`,
              }}
            />
          </div>
        ))}
        {[{ d: "0s" }, { d: "0.5s" }, { d: "1s" }].map((p, i) => (
          <div
            key={"r" + i}
            style={{
              position: "absolute",
              width: 14,
              height: 14,
              borderRadius: "50%",
              border: "1.5px solid rgba(232,121,249,0.5)",
              animation: "holoPulse 1.2s ease-out infinite",
              animationDelay: p.d,
            }}
          />
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
          { l: "52%", t: "18%", d: "0.4s", s: 7 },
          { l: "90%", t: "30%", d: "0.6s", s: 8 },
          { l: "30%", t: "78%", d: "0.1s", s: 7 },
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
              boxShadow: "0 0 12px #ffd700, 0 0 5px #fff, 0 0 20px #ffaa00",
              clipPath:
                "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
              animation: `holoGoldenSpin ${
                0.8 + i * 0.15
              }s ease-in-out infinite`,
              animationDelay: p.d,
            }}
          />
        ))}
        {[
          { l: "28%", t: "28%", d: "0.1s" },
          { l: "62%", t: "32%", d: "0.4s" },
          { l: "14%", t: "48%", d: "0.2s" },
          { l: "84%", t: "42%", d: "0.6s" },
          { l: "48%", t: "68%", d: "0.05s" },
          { l: "33%", t: "82%", d: "0.35s" },
          { l: "68%", t: "72%", d: "0.55s" },
          { l: "22%", t: "18%", d: "0.45s" },
        ].map((p, i) => (
          <div
            key={"p" + i}
            style={{
              position: "absolute",
              left: p.l,
              top: p.t,
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "#ffd700",
              boxShadow: "0 0 8px #ffd700, 0 0 3px #fff7a0",
              animation: `holoSpark ${0.5 + i * 0.1}s ease-in-out infinite`,
              animationDelay: p.d,
            }}
          />
        ))}
        {[
          { d: "0s", c: "rgba(255,215,0,0.7)" },
          { d: "0.45s", c: "rgba(255,180,0,0.5)" },
          { d: "0.9s", c: "rgba(255,220,80,0.5)" },
        ].map((p, i) => (
          <div
            key={"r" + i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 14,
              height: 14,
              borderRadius: "50%",
              border: `2px solid ${p.c}`,
              transform: "translate(-50%,-50%)",
              animation: "holoPulse 1.1s ease-out infinite",
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
        { l: "32%", t: "18%", d: "0.44s", s: 6, c: "#86efac" },
        { l: "56%", t: "75%", d: "0.25s", s: 5, c: "#fda4af" },
        { l: "90%", t: "68%", d: "0.6s", s: 6, c: "#a78bfa" },
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
            animation: `holoSparkle ${0.7 + i * 0.12}s ease-in-out infinite`,
            animationDelay: p.d,
          }}
        />
      ))}
      {[
        { l: "22%", t: "42%", d: "0.2s", c: "#ff80ab" },
        { l: "60%", t: "45%", d: "0.55s", c: "#fda4af" },
        { l: "40%", t: "55%", d: "0.1s", c: "#ff80ab" },
        { l: "80%", t: "52%", d: "0.4s", c: "#fda4af" },
      ].map((p, i) => (
        <div
          key={"h" + i}
          style={{
            position: "absolute",
            left: p.l,
            top: p.t,
            width: 7,
            height: 6,
            background: p.c,
            boxShadow: `0 0 6px ${p.c}`,
            clipPath:
              "polygon(50% 85%,5% 40%,20% 20%,35% 18%,50% 30%,65% 18%,80% 20%,95% 40%)",
            animation: `holoHeart ${1 + i * 0.2}s ease-in-out infinite`,
            animationDelay: p.d,
          }}
        />
      ))}
      {[
        { l: "35%", t: "8%", d: "0.3s" },
        { l: "70%", t: "80%", d: "0.65s" },
        { l: "10%", t: "80%", d: "0.5s" },
        { l: "92%", t: "22%", d: "0.15s" },
      ].map((p, i) => (
        <div
          key={"g" + i}
          style={{
            position: "absolute",
            left: p.l,
            top: p.t,
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 0 6px #ffd700",
            animation: `holoSpark ${0.6 + i * 0.1}s ease-in-out infinite`,
            animationDelay: p.d,
          }}
        />
      ))}
    </div>
  );
}

function SealSticker({ seal, entry, typeColor }) {
  const collected = entry && entry.count > 0;
  const isHolo = seal.grade === "HOLO";
  const fx = GRADE_FX[seal.grade];
  return (
    <div
      style={{
        width: CARD_W,
        height: CARD_H,
        display: "flex",
        flexDirection: "column",
        background: collected ? "#fff" : "#111",
        border: `1px solid ${collected ? "#c8c8c8" : "#222"}`,
        overflow: "hidden",
        flexShrink: 0,
        position: "relative",
      }}
    >
      <div
        style={{
          padding: "0px 4px 0px",
          marginTop: "-3px",
          background: collected ? "#fff" : "#111",
          flexShrink: 0,
        }}
      >
        {collected ? (
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
                background: typeColor,
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
                {String(seal.pokeId).padStart(3, "0")}
              </span>
            </div>
            <div
              style={{
                background: "#fff",
                padding: "1px 5px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: "#111",
                  lineHeight: 1.4,
                  whiteSpace: "nowrap",
                }}
              >
                {seal.name.replace(" ✨", "")}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ height: 12 }} />
        )}
      </div>
      <div
        style={{
          flex: 1,
          position: "relative",
          background: collected ? "#fff" : "#111",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {collected && isHolo && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "conic-gradient(rgba(255,128,171,0.2),rgba(79,195,247,0.2),rgba(255,215,0,0.2),rgba(255,128,171,0.2))",
              animation: "ddSpin 4s linear infinite",
              maskImage:
                "radial-gradient(ellipse at center, black 50%, transparent 80%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at center, black 50%, transparent 80%)",
            }}
          />
        )}
        {collected && isHolo && <HoloEffect pokeId={seal.pokeId} />}
        <img
          src={seal.artwork}
          alt={collected ? seal.name : "?"}
          style={{
            width: IMG_SZ,
            height: IMG_SZ,
            objectFit: "contain",
            position: "relative",
            zIndex: 1,
            filter: collected
              ? isHolo
                ? `drop-shadow(0 0 8px ${fx?.color || "#fff"})`
                : "none"
              : "brightness(0) invert(1) opacity(0.13)",
            animation:
              collected && isHolo ? "ddFloat 2s ease-in-out infinite" : "none",
          }}
        />
      </div>
      <div
        style={{
          padding: "2px 5px",
          display: "flex",
          justifyContent: "flex-end",
          background: collected ? "#fff" : "#111",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 6,
            color: collected ? "#bbb" : "#333",
            letterSpacing: 0.3,
          }}
        >
          ©Pokémon
        </span>
      </div>
    </div>
  );
}

function SealCard({ seal, entry, onClick }) {
  const collected = entry && entry.count > 0;
  const [typeColor, setTypeColor] = useState("#A8A878");
  const [imgScale, setImgScale] = useState(1.0);
  useEffect(() => {
    fetchPokeData(seal.pokeId).then(() => {
      setTypeColor(typeColorCache[seal.pokeId] || "#A8A878");
      setImgScale(sizeCache[seal.pokeId] || 1.0);
    });
  }, [seal.pokeId]);
  return (
    <div
      onClick={() => collected && onClick(seal, entry, typeColor, imgScale)}
      style={{
        cursor: collected ? "pointer" : "default",
        transition: "transform 0.15s, box-shadow 0.15s",
        boxShadow: collected ? "0 1px 5px rgba(0,0,0,0.18)" : "none",
        display: "inline-flex",
      }}
      onMouseEnter={(e) => {
        if (collected) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 5px 14px rgba(0,0,0,0.28)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = collected
          ? "0 1px 5px rgba(0,0,0,0.18)"
          : "none";
      }}
    >
      <SealSticker seal={seal} entry={entry} typeColor={typeColor} />
    </div>
  );
}

function SealDetail({ seal, entry, typeColor, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            transform: "scale(2.4)",
            transformOrigin: "center center",
            marginBottom: CARD_H * 1.4,
            boxShadow: "0 12px 48px rgba(0,0,0,0.7)",
            animation: "ddDetailPop 0.3s cubic-bezier(.34,1.56,.64,1)",
          }}
        >
          <SealSticker seal={seal} entry={entry} typeColor={typeColor} />
        </div>
        <button
          onClick={onClose}
          style={{
            background: "#222",
            color: "#fff",
            border: "none",
            padding: "10px 40px",
            fontWeight: 900,
            fontSize: 14,
            cursor: "pointer",
            marginTop: 8,
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}

function ExchangeSealCard({ seal }) {
  const [typeColor, setTypeColor] = useState("#A8A878");
  useEffect(() => {
    fetchTypeColor(seal.pokeId).then(setTypeColor);
  }, [seal.pokeId]);
  return (
    <div
      style={{
        transform: "scale(2)",
        transformOrigin: "center center",
        marginBottom: CARD_H * 1.1,
      }}
    >
      <SealSticker
        seal={seal}
        entry={{ count: 1, shards: 0 }}
        typeColor={typeColor}
      />
    </div>
  );
}

function EventTabContent() {
  const [capDex, setCapDex] = useState(() => loadCapDex());
  const [capDetail, setCapDetail] = useState(null);
  useEffect(() => {
    const refresh = () => setCapDex(loadCapDex());
    window.addEventListener("pokeset_cap_dex_updated", refresh);
    return () => window.removeEventListener("pokeset_cap_dex_updated", refresh);
  }, []);
  const owned = ALL_EVENT_SEALS.filter((s) => capDex[s.id]?.count > 0).length;
  const capOwned = CAP_PIKACHU_SEALS.filter(
    (s) => capDex[s.id]?.count > 0
  ).length;
  const cosplayOwned = COSPLAY_PIKACHU_SEALS.filter(
    (s) => capDex[s.id]?.count > 0
  ).length;
  const partnerOwned = PARTNER_SEALS.filter(
    (s) => capDex[s.id]?.count > 0
  ).length;
  const megaOwned = MEGA_SEALS.filter((s) => capDex[s.id]?.count > 0).length;
  const gmaxOwned = GMAX_SEALS.filter((s) => capDex[s.id]?.count > 0).length;

  const SectionGrid = ({ seals, label, total, accent }) => (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: accent,
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {label}
        <span
          style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.3)",
            fontWeight: 400,
          }}
        >
          {seals.filter((s) => capDex[s.id]?.count > 0).length}/{total}
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {seals.map((seal) => {
          const collected = capDex[seal.id]?.count > 0;
          return (
            <div
              key={seal.id}
              onClick={() => collected && setCapDetail(seal)}
              style={{
                cursor: collected ? "pointer" : "default",
                transition: "transform 0.15s, box-shadow 0.15s",
                boxShadow: collected ? "0 1px 5px rgba(0,0,0,0.18)" : "none",
                display: "inline-flex",
              }}
              onMouseEnter={(e) => {
                if (collected) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 5px 14px rgba(0,0,0,0.28)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = collected
                  ? "0 1px 5px rgba(0,0,0,0.18)"
                  : "none";
              }}
            >
              <CapSealCard seal={seal} collected={collected} />
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 20px",
          background: "#111",
          borderBottom: "1px solid #1a1a1a",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <div
            style={{
              flex: 1,
              height: 6,
              background: "#222",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(owned / ALL_EVENT_SEALS.length) * 100}%`,
                height: "100%",
                background: "linear-gradient(to right,#ffd700,#ff8c00)",
                borderRadius: 99,
                transition: "width 0.5s",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 11,
              color: "#ffd700",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {owned}/{ALL_EVENT_SEALS.length}
          </span>
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
          이벤트 한정 씰 · 모자{capOwned}/8 · 코스프레{cosplayOwned}/6 · 파트너
          {partnerOwned}/2 · 메가{megaOwned}/12 · 거다이{gmaxOwned}/12
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
        <SectionGrid
          seals={CAP_PIKACHU_SEALS}
          total={CAP_PIKACHU_SEALS.length}
          label="🧢 모자 피카츄"
          accent="#ffd700"
        />
        <SectionGrid
          seals={COSPLAY_PIKACHU_SEALS}
          total={COSPLAY_PIKACHU_SEALS.length}
          label="✨ 코스프레 피카츄"
          accent="#ce93d8"
        />
        <SectionGrid
          seals={PARTNER_SEALS}
          total={PARTNER_SEALS.length}
          label="⭐ 파트너 포켓몬"
          accent="#4FC3F7"
        />
        <SectionGrid
          seals={MEGA_SEALS}
          total={MEGA_SEALS.length}
          label="🔮 메가 진화"
          accent="#E91E8C"
        />
        <SectionGrid
          seals={GMAX_SEALS}
          total={GMAX_SEALS.length}
          label="⚡ 거다이맥스"
          accent="#a0f4ff"
        />
      </div>
      {capDetail && (
        <CapDetailView seal={capDetail} onClose={() => setCapDetail(null)} />
      )}
    </div>
  );
}

function CapSealCard({ seal, collected }) {
  const [imgSrc, setImgSrc] = useState(seal.artwork);
  const [imgLoaded, setImgLoaded] = useState(false);
  const tag = "EV";
  const accentColor = seal.cap
    ? "#ffd700"
    : seal.cosplay
    ? "#ce93d8"
    : seal.partner
    ? "#4FC3F7"
    : seal.mega
    ? "#E91E8C"
    : seal.gmax
    ? "#a0f4ff"
    : "#ffd700";
  return (
    <div
      style={{
        width: CARD_W,
        height: CARD_H,
        display: "flex",
        flexDirection: "column",
        background: collected ? "#fff" : "#111",
        border: `1px solid ${collected ? "#c8c8c8" : "#222"}`,
        overflow: "hidden",
        flexShrink: 0,
        position: "relative",
      }}
    >
      <div
        style={{
          padding: "0px 4px 0px",
          marginTop: "-3px",
          background: collected ? "#fff" : "#111",
          flexShrink: 0,
        }}
      >
        {collected ? (
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
                background: accentColor,
                padding: "1px 4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 7,
                  fontWeight: 900,
                  color: "#111",
                  lineHeight: 1.4,
                  whiteSpace: "nowrap",
                }}
              >
                {tag}
              </span>
            </div>
            <div
              style={{
                background: "#fff",
                padding: "1px 5px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: "#111",
                  lineHeight: 1.4,
                  whiteSpace: "nowrap",
                  maxWidth: 72,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {seal.name}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ height: 12 }} />
        )}
      </div>
      <div
        style={{
          flex: 1,
          position: "relative",
          background: collected ? "#fff" : "#111",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <img
          src={imgSrc}
          alt={collected ? seal.name : "?"}
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            if (imgSrc !== seal.artworkFallback)
              setImgSrc(seal.artworkFallback);
          }}
          style={{
            width: IMG_SZ,
            height: IMG_SZ,
            objectFit: "contain",
            position: "relative",
            zIndex: 1,
            opacity: collected ? (imgLoaded ? 1 : 0) : 1,
            transition: "opacity 0.3s",
            filter: collected
              ? "none"
              : "brightness(0) invert(1) opacity(0.13)",
          }}
        />
      </div>
      <div
        style={{
          padding: "2px 5px",
          display: "flex",
          justifyContent: "flex-end",
          background: collected ? "#fff" : "#111",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 6,
            color: collected ? "#bbb" : "#333",
            letterSpacing: 0.3,
          }}
        >
          ©Pokémon
        </span>
      </div>
    </div>
  );
}

function CapDetailView({ seal, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(0,0,0,0.92)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            background: "rgba(255,215,0,0.1)",
            border: "1.5px solid rgba(255,215,0,0.3)",
            borderRadius: 16,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              transform: "scale(2.2)",
              transformOrigin: "center center",
              marginBottom: CARD_H * 1.2,
            }}
          >
            <CapSealCard seal={seal} collected={true} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>{seal.emoji}</span>
          <span style={{ color: "#ffd700", fontWeight: 900, fontSize: 15 }}>
            {seal.name}
          </span>
          <span
            style={{
              fontSize: 10,
              background: "rgba(255,215,0,0.15)",
              color: "#ffd700",
              borderRadius: 99,
              padding: "2px 8px",
              fontWeight: 700,
            }}
          >
            이벤트 한정
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "#222",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "10px 40px",
            fontWeight: 900,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}

function ShinyDetailView({ seal, onClose }) {
  const [typeColor, setTypeColor] = useState(
    typeColorCache[seal.pokeId] || "#A8A878"
  );
  useEffect(() => {
    fetchTypeColor(seal.pokeId).then(setTypeColor);
  }, [seal.pokeId]);
  return (
    <SealDetail
      seal={seal}
      entry={{ count: 1 }}
      typeColor={typeColor}
      onClose={onClose}
    />
  );
}

const SHINY_GRADE_FILTERS = ["ALL", "COMMON", "RARE", "SR", "LEGENDARY"];

function ShinyTabContent({ onRevealShiny }) {
  const [shinyDex, setShinyDex] = useState(() => loadShinyDex());
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [showCollected, setShowColl] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [shinyDetail, setShinyDetail] = useState(null);
  useEffect(() => {
    const refresh = () => setShinyDex(loadShinyDex());
    window.addEventListener("pokeset_shiny_dex_updated", refresh);
    return () =>
      window.removeEventListener("pokeset_shiny_dex_updated", refresh);
  }, []);
  const ownedCount = SHINY_SEALS.filter(
    (s) => shinyDex[s.id]?.count > 0
  ).length;
  const filtered = useMemo(
    () =>
      SHINY_SEALS.filter((s) => {
        if (gradeFilter !== "ALL" && s.grade !== gradeFilter) return false;
        if (showCollected && !(shinyDex[s.id]?.count > 0)) return false;
        if (searchQ && !s.name.includes(searchQ)) return false;
        return true;
      }).sort((a, b) => a.pokeId - b.pokeId),
    [gradeFilter, showCollected, searchQ, shinyDex]
  );

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "10px 20px",
          background: "#111",
          borderBottom: "1px solid #1a1a1a",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            height: 7,
            background: "#222",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${(ownedCount / SHINY_SEALS.length) * 100}%`,
              height: "100%",
              background: "linear-gradient(to right,#a0f4ff,#6366F1)",
              borderRadius: 99,
              transition: "width 0.5s",
            }}
          />
        </div>
        <div
          style={{ display: "flex", marginTop: 6, gap: 5, flexWrap: "wrap" }}
        >
          {[
            { p: 25, icon: "🌿" },
            { p: 50, icon: "💧" },
            { p: 75, icon: "🔥" },
            { p: 100, icon: "✨" },
          ].map((r) => (
            <div
              key={r.p}
              style={{
                fontSize: 10,
                padding: "2px 7px",
                borderRadius: 99,
                background:
                  (ownedCount / SHINY_SEALS.length) * 100 >= r.p
                    ? "#a0f4ff22"
                    : "#1a1a1a",
                color:
                  (ownedCount / SHINY_SEALS.length) * 100 >= r.p
                    ? "#a0f4ff"
                    : "#444",
                border: `1px solid ${
                  (ownedCount / SHINY_SEALS.length) * 100 >= r.p
                    ? "#a0f4ff55"
                    : "#2a2a2a"
                }`,
              }}
            >
              {r.icon} {r.p}%
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          padding: "10px 20px",
          background: "#0f0f0f",
          display: "flex",
          gap: 7,
          alignItems: "center",
          flexWrap: "wrap",
          borderBottom: "1px solid #1a1a1a",
          flexShrink: 0,
        }}
      >
        {SHINY_GRADE_FILTERS.map((g) => (
          <button
            key={g}
            onClick={() => setGradeFilter(g)}
            style={{
              background:
                gradeFilter === g ? GRADE_FX[g]?.color || "#a0f4ff" : "#1a1a1a",
              color: gradeFilter === g ? "#000" : "#777",
              border: `1px solid ${
                gradeFilter === g ? GRADE_FX[g]?.color || "#a0f4ff" : "#333"
              }`,
              borderRadius: 99,
              padding: "3px 10px",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {g === "ALL" ? "전체" : GRADE_FX[g]?.label || g}
          </button>
        ))}
        <button
          onClick={() => setShowColl((v) => !v)}
          style={{
            background: showCollected ? "#ffffff22" : "#1a1a1a",
            color: showCollected ? "#fff" : "#555",
            border: `1px solid ${showCollected ? "#fff" : "#333"}`,
            borderRadius: 99,
            padding: "3px 10px",
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          수집된 씰만
        </button>
        <input
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          placeholder="이름 검색..."
          style={{
            background: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: 99,
            padding: "3px 12px",
            color: "#fff",
            fontSize: 12,
            outline: "none",
            minWidth: 90,
          }}
        />
      </div>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 14,
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignContent: "start",
        }}
      >
        {filtered.map((seal) => {
          const collected = shinyDex[seal.id]?.count > 0;
          return (
            <div
              key={seal.id}
              onClick={() => collected && setShinyDetail(seal)}
              style={{
                cursor: collected ? "pointer" : "default",
                transition: "transform 0.15s, box-shadow 0.15s",
                boxShadow: collected ? "0 1px 5px rgba(0,0,0,0.18)" : "none",
                display: "inline-flex",
              }}
              onMouseEnter={(e) => {
                if (collected) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 5px 14px rgba(0,0,0,0.28)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = collected
                  ? "0 1px 5px rgba(0,0,0,0.18)"
                  : "none";
              }}
            >
              <SealSticker
                seal={seal}
                entry={shinyDex[seal.id] || null}
                typeColor={typeColorCache[seal.pokeId] || "#A8A878"}
              />
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div
            style={{
              width: "100%",
              textAlign: "center",
              color: "#444",
              padding: 60,
              fontSize: 14,
            }}
          >
            씰이 없습니다
          </div>
        )}
      </div>
      {shinyDetail && (
        <ShinyDetailView
          seal={shinyDetail}
          onClose={() => setShinyDetail(null)}
        />
      )}
    </div>
  );
}

export default function SealDexModal({ onClose, onRevealShiny }) {
  const [activeTab, setActiveTab] = useState("normal");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [searchQ, setSearchQ] = useState("");
  const [showCollected, setShowColl] = useState(false);
  const [detailSeal, setDetail] = useState(null);
  const [dex, setDex] = useState(() => loadSealDex());
  const [exchangeResult, setExResult] = useState(null);

  useEffect(() => {
    const refresh = () => setDex(loadSealDex());
    window.addEventListener("pokeset_dex_updated", refresh);
    return () => window.removeEventListener("pokeset_dex_updated", refresh);
  }, []);

  const progress = getDexProgress(dex);
  const shards = getTotalShards(dex);
  const canExchange = shards >= 10;
  const shinyOwned = getShinyOwnedCount();
  const capOwned = getCapOwnedCount();

  const handleExchange = () => {
    if (!canExchange) return;
    const unowned = ALL_SEALS.filter(
      (s) => !(dex[String(s.id)]?.count > 0) && s.grade !== "HOLO"
    );
    if (unowned.length === 0) return;
    const seal = unowned[Math.floor(Math.random() * unowned.length)];
    const newDex = { ...dex };
    let toDeduct = 10;
    for (const key of Object.keys(newDex)) {
      if (toDeduct <= 0) break;
      const e = newDex[key];
      if (e.shards > 0) {
        const d = Math.min(e.shards, toDeduct);
        newDex[key] = { ...e, shards: e.shards - d };
        toDeduct -= d;
      }
    }
    newDex[String(seal.id)] = { count: 1, shards: 0 };
    saveSealDex(newDex);
    setDex(newDex);
    setExResult(seal);
    window.__cloudSave?.({ sealDex: newDex });
  };

  const filtered = useMemo(
    () =>
      ALL_SEALS.filter((s) => {
        if (gradeFilter !== "ALL" && s.grade !== gradeFilter) return false;
        if (showCollected && !(dex[String(s.id)]?.count > 0)) return false;
        if (searchQ && !s.name.includes(searchQ)) return false;
        return true;
      }).sort((a, b) => (a.pokeId ?? a.id) - (b.pokeId ?? b.id)),
    [gradeFilter, showCollected, searchQ, dex]
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 150,
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        fontFamily: "sans-serif",
        color: "#fff",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          padding: "14px 20px",
          background: "#111",
          borderBottom: "1px solid #222",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>
            {activeTab === "shiny" ? "✨" : activeTab === "event" ? "🎒" : "📖"}
          </span>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>
              {activeTab === "shiny"
                ? "이로치 도감"
                : activeTab === "event"
                ? "이벤트 도감"
                : "띠부띠부씰 도감"}
            </div>
            <div style={{ fontSize: 11, color: "#888" }}>
              {activeTab === "shiny"
                ? `${shinyOwned} / ${SHINY_SEALS.length}종 수집`
                : activeTab === "event"
                ? `${capOwned} / ${ALL_EVENT_SEALS.length}종 수집 · 모자+코스프레 피카츄`
                : `${progress.collected} / ${progress.total}종 · ${progress.percent}%`}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {activeTab === "normal" && (
            <div
              onClick={canExchange ? handleExchange : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: canExchange ? "#1a3a1a" : "#1a2a3a",
                borderRadius: 99,
                padding: "4px 12px",
                border: canExchange ? "1px solid #4fc3f7" : "none",
                cursor: canExchange ? "pointer" : "default",
                animation: canExchange
                  ? "ddFloat 1.5s ease-in-out infinite"
                  : "none",
              }}
            >
              <span style={{ fontSize: 12 }}>🧩</span>
              <span style={{ color: "#4fc3f7", fontWeight: 900, fontSize: 12 }}>
                {shards} / 10 조각
              </span>
              {canExchange && (
                <span
                  style={{ fontSize: 10, color: "#ffd700", fontWeight: 900 }}
                >
                  교환!
                </span>
              )}
            </div>
          )}
          <button
            onClick={onClose}
            style={{
              background: "#333",
              border: "none",
              borderRadius: 99,
              color: "#fff",
              fontSize: 16,
              width: 32,
              height: 32,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* 탭 - 수정: 띠부씰 수 추가 + 이벤트 /8 → ALL_EVENT_SEALS.length */}
      <div
        style={{
          display: "flex",
          background: "#0f0f0f",
          borderBottom: "1px solid #1a1a1a",
          flexShrink: 0,
        }}
      >
        {[
          { key: "normal", label: "📖 띠부씰" },
          { key: "shiny", label: "✨ 이로치" },
          { key: "event", label: "🎒 이벤트" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: "11px 0",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === tab.key
                  ? "2px solid #a0f4ff"
                  : "2px solid transparent",
              color: activeTab === tab.key ? "#fff" : "#555",
              fontWeight: activeTab === tab.key ? 800 : 600,
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
            {tab.key === "normal" && (
              <span
                style={{
                  marginLeft: 5,
                  fontSize: 10,
                  background: "rgba(79,195,247,0.15)",
                  color: "#4fc3f7",
                  borderRadius: 99,
                  padding: "1px 6px",
                }}
              >
                {progress.collected}/{progress.total}
              </span>
            )}
            {tab.key === "shiny" && shinyOwned > 0 && (
              <span
                style={{
                  marginLeft: 5,
                  fontSize: 10,
                  background: "rgba(160,244,255,0.15)",
                  color: "#a0f4ff",
                  borderRadius: 99,
                  padding: "1px 6px",
                }}
              >
                {shinyOwned}/{SHINY_SEALS.length}
              </span>
            )}
            {tab.key === "event" && (
              <span
                style={{
                  marginLeft: 5,
                  fontSize: 10,
                  background: "rgba(255,215,0,0.15)",
                  color: "#ffd700",
                  borderRadius: 99,
                  padding: "1px 6px",
                }}
              >
                {capOwned}/{ALL_EVENT_SEALS.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 일반 탭 */}
      {activeTab === "normal" && (
        <>
          <div
            style={{
              padding: "10px 20px",
              background: "#111",
              borderBottom: "1px solid #1a1a1a",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                height: 7,
                background: "#222",
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress.percent}%`,
                  height: "100%",
                  background: "linear-gradient(to right,#4fc3f7,#ffd700)",
                  borderRadius: 99,
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 6,
                gap: 5,
                flexWrap: "wrap",
              }}
            >
              {DEX_REWARDS.map((r) => (
                <div
                  key={r.percent}
                  style={{
                    fontSize: 10,
                    padding: "2px 7px",
                    borderRadius: 99,
                    background:
                      progress.percent >= r.percent ? "#ffd70022" : "#1a1a1a",
                    color: progress.percent >= r.percent ? "#ffd700" : "#444",
                    border: `1px solid ${
                      progress.percent >= r.percent ? "#ffd70055" : "#2a2a2a"
                    }`,
                  }}
                >
                  {r.icon} {r.percent}%
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              padding: "10px 20px",
              background: "#0f0f0f",
              display: "flex",
              gap: 7,
              alignItems: "center",
              flexWrap: "wrap",
              borderBottom: "1px solid #1a1a1a",
              flexShrink: 0,
            }}
          >
            {GRADE_FILTERS.map((g) => (
              <button
                key={g}
                onClick={() => setGradeFilter(g)}
                style={{
                  background:
                    gradeFilter === g
                      ? GRADE_FX[g]?.color || "#fff"
                      : "#1a1a1a",
                  color: gradeFilter === g ? "#000" : "#777",
                  border: `1px solid ${
                    gradeFilter === g ? GRADE_FX[g]?.color || "#fff" : "#333"
                  }`,
                  borderRadius: 99,
                  padding: "3px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {g === "ALL" ? "전체" : GRADE_FX[g].label}
              </button>
            ))}
            <button
              onClick={() => setShowColl((v) => !v)}
              style={{
                background: showCollected ? "#ffffff22" : "#1a1a1a",
                color: showCollected ? "#fff" : "#555",
                border: `1px solid ${showCollected ? "#fff" : "#333"}`,
                borderRadius: 99,
                padding: "3px 10px",
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              수집된 씰만
            </button>
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="이름 검색..."
              style={{
                background: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: 99,
                padding: "3px 12px",
                color: "#fff",
                fontSize: 12,
                outline: "none",
                minWidth: 90,
              }}
            />
          </div>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 14,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignContent: "start",
            }}
          >
            {filtered.map((seal) => (
              <SealCard
                key={seal.id}
                seal={seal}
                entry={dex[String(seal.id)]}
                onClick={(s, e, c, sc) =>
                  setDetail({ seal: s, entry: e, typeColor: c, imgScale: sc })
                }
              />
            ))}
            {filtered.length === 0 && (
              <div
                style={{
                  width: "100%",
                  textAlign: "center",
                  color: "#444",
                  padding: 60,
                  fontSize: 14,
                }}
              >
                씰이 없습니다
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "shiny" && (
        <ShinyTabContent onRevealShiny={onRevealShiny} />
      )}
      {activeTab === "event" && <EventTabContent />}

      {detailSeal && (
        <SealDetail
          seal={detailSeal.seal}
          entry={detailSeal.entry}
          typeColor={detailSeal.typeColor}
          imgScale={detailSeal.imgScale}
          onClose={() => setDetail(null)}
        />
      )}

      {exchangeResult && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 400,
            background: "rgba(0,0,0,0.88)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            animation: "fadeIn 0.3s ease",
          }}
          onClick={() => setExResult(null)}
        >
          <div
            style={{
              color: "#4fc3f7",
              fontWeight: 900,
              fontSize: 14,
              letterSpacing: 2,
            }}
          >
            🧩 씰 조각 교환 완료!
          </div>
          <div
            style={{
              boxShadow: "0 12px 48px rgba(79,195,247,0.4)",
              animation: "ddPop 0.35s cubic-bezier(.34,1.56,.64,1)",
            }}
          >
            <ExchangeSealCard seal={exchangeResult} />
          </div>
          <div style={{ color: "#ffd700", fontWeight: 900, fontSize: 16 }}>
            ✨ 새로운 씰 획득!
          </div>
          <div style={{ color: "#888", fontSize: 13 }}>탭하여 닫기</div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn    {from{opacity:0}to{opacity:1}}
        @keyframes ddFloat   {0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes ddSpin    {to{transform:rotate(360deg)}}
        @keyframes ddPop     {from{transform:scale(0.6) translateY(20px);opacity:0}to{transform:scale(2.4);opacity:1}}
        @keyframes ddDetailPop {from{transform:scale(0.6) translateY(20px);opacity:0}to{transform:scale(2.4);opacity:1}}
        @keyframes shinyShimmer {0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
        @keyframes holoFireRise {0%{transform:translateY(0) scaleX(1);opacity:0.9}60%{transform:translateY(-35px) scaleX(0.5);opacity:0.6}100%{transform:translateY(-65px) scaleX(0.1);opacity:0}}
        @keyframes holoEmber    {0%{transform:translate(0,0);opacity:1}100%{transform:translate(8px,-40px);opacity:0}}
        @keyframes holoSpark    {0%,100%{opacity:0;transform:scale(0.3)}40%,60%{opacity:1;transform:scale(1)}}
        @keyframes holoBubble   {0%{transform:translateY(0) scale(1);opacity:0.9}80%{transform:translateY(-55px) scale(1.4);opacity:0.4}100%{transform:translateY(-68px) scale(1.5);opacity:0}}
        @keyframes holoDropFall {0%{transform:translateY(-8px);opacity:0}20%{opacity:1}100%{transform:translateY(25px);opacity:0}}
        @keyframes holoLeaf     {0%{transform:translateY(0) translateX(0) rotate(0deg);opacity:1}50%{transform:translateY(-26px) translateX(9px) rotate(130deg);opacity:0.6}100%{transform:translateY(-54px) translateX(-5px) rotate(260deg);opacity:0}}
        @keyframes holoDragon    {0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes holoDragonRev {0%{transform:rotate(0deg)}100%{transform:rotate(-360deg)}}
        @keyframes holoPsychic   {0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes holoPsychicRev{0%{transform:rotate(0deg)}100%{transform:rotate(-360deg)}}
        @keyframes holoPulse     {0%{transform:translate(-50%,-50%) scale(1);opacity:0.8}100%{transform:translate(-50%,-50%) scale(5);opacity:0}}
        @keyframes holoSparkle   {0%,100%{transform:scale(0) rotate(0deg);opacity:0}50%{transform:scale(1) rotate(180deg);opacity:1}}
        @keyframes holoGoldenSpin{0%,100%{transform:rotate(0deg) scale(0.7);opacity:0.5}50%{transform:rotate(180deg) scale(1.3);opacity:1}}
        @keyframes holoHeart     {0%{transform:scale(0) translateY(0);opacity:0}30%{transform:scale(1.2) translateY(-5px);opacity:1}70%{transform:scale(1) translateY(-15px);opacity:0.6}100%{transform:scale(0.8) translateY(-28px);opacity:0}}
      `}</style>
    </div>
  );
}
