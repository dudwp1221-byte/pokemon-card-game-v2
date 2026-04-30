import { useState, useEffect, useCallback } from "react";
import { fetchLeaderboard, saveUserData, db } from "../../lib/db";
import TrainerPortrait from "../../components/TrainerPortrait";
import ProfileBorder from "../../components/ProfileBorder";
import { TitleBadge, BadgeIcon } from "./ProfileEditor";
import { ALL_SEALS } from "../../lib/sealLogic";
import { SHINY_SEALS } from "../../lib/shinySeals";
import { ALL_EVENT_SEALS } from "../../lib/eventLogic";

const todayKey = () => {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return `lb_likes_${kst.toISOString().slice(0, 10)}`;
};
const readLikes = () => {
  try {
    const r = localStorage.getItem(todayKey());
    return r ? JSON.parse(r) : { count: 0, liked: [] };
  } catch {
    return { count: 0, liked: [] };
  }
};
const writeLikes = (d) => {
  try {
    localStorage.setItem(todayKey(), JSON.stringify(d));
  } catch {}
};
const toFirebaseKey = (name) => encodeURIComponent(name).replace(/%/g, "_");
const tiebreaker = (a, b) =>
  (a.registeredAt ?? a.updatedAt ?? 0) - (b.registeredAt ?? b.updatedAt ?? 0);

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
async function fetchTypeColor(pokeId) {
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
              animation: `holoPsychic ${p.spd}s linear infinite reverse`,
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

function SealChip({ seal, size = 26 }) {
  const isHolo = seal.grade === "HOLO";
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: 6,
        overflow: "hidden",
        flexShrink: 0,
        background: isHolo
          ? "linear-gradient(135deg,#fff0f8,#f0f8ff,#fffff0)"
          : "#f3f4f6",
        boxShadow: isHolo
          ? "0 0 6px 1px rgba(255,128,171,0.6)"
          : "0 1px 3px rgba(0,0,0,0.1)",
        border: isHolo
          ? "1px solid rgba(255,128,171,0.4)"
          : "1px solid #e5e7eb",
      }}
    >
      {isHolo && (
        <div
          style={{
            position: "absolute",
            inset: -size,
            background:
              "conic-gradient(rgba(255,128,171,0.25),rgba(79,195,247,0.25),rgba(255,215,0,0.25),rgba(255,128,171,0.25))",
            animation: "lbHoloSpin 3s linear infinite",
            zIndex: 0,
          }}
        />
      )}
      {isHolo && <HoloEffect pokeId={seal.pokeId} />}
      <img
        src={seal.artwork}
        alt={seal.name}
        style={{
          position: "relative",
          zIndex: 3,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          filter: isHolo
            ? "drop-shadow(0 0 3px rgba(255,128,171,0.9))"
            : "none",
          animation: isHolo ? "lbHoloFloat 2s ease-in-out infinite" : "none",
        }}
      />
    </div>
  );
}

function resolveSealIds(ids) {
  if (!ids || !Array.isArray(ids)) return [];
  const ALL_MERGED = [...ALL_SEALS, ...SHINY_SEALS, ...ALL_EVENT_SEALS];
  return ids
    .map((id) => ALL_MERGED.find((s) => String(s.id) === String(id)))
    .filter(Boolean)
    .slice(0, 6);
}

function SealGrid({ ids, size = 22 }) {
  const seals = resolveSealIds(ids);
  return (
    <div style={{ display: "flex", gap: 3, marginTop: 5 }}>
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: 5,
            flexShrink: 0,
            overflow: "hidden",
            background: "#f1f5f9",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {seals[i] && <SealChip seal={seals[i]} size={size} />}
        </div>
      ))}
    </div>
  );
}

const RANK_COLORS = [
  {
    bg: "linear-gradient(135deg,#fffbeb,#fef3c7)",
    border: "1px solid #fde68a",
    accent: "#f59e0b",
    shadow: "0 3px 14px rgba(245,158,11,0.2)",
  },
  {
    bg: "linear-gradient(135deg,#f8fafc,#f1f5f9)",
    border: "1px solid #e2e8f0",
    accent: "#94a3b8",
    shadow: "0 3px 14px rgba(148,163,184,0.18)",
  },
  {
    bg: "linear-gradient(135deg,#fff7ed,#ffedd5)",
    border: "1px solid #fed7aa",
    accent: "#f97316",
    shadow: "0 3px 14px rgba(249,115,22,0.18)",
  },
];

function SealProfileCard({ seal }) {
  const [typeColor, setTypeColor] = useState("#A8A878");
  const isHolo = seal.grade === "HOLO";
  useEffect(() => {
    fetchTypeColor(seal.pokeId).then(setTypeColor);
  }, [seal.pokeId]);
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        border: "1px solid #c8c8c8",
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
                maxWidth: 48,
              }}
            >
              {seal.name}
            </span>
          </div>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          position: "relative",
          minHeight: 72,
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
              inset: -80,
              background:
                "conic-gradient(rgba(255,128,171,0.2),rgba(79,195,247,0.2),rgba(255,215,0,0.2),rgba(255,128,171,0.2))",
              animation: "lbHoloSpin 4s linear infinite",
            }}
          />
        )}
        {isHolo && <HoloEffect pokeId={seal.pokeId} />}
        <img
          src={seal.artwork}
          alt={seal.name}
          style={{
            width: 78,
            height: 78,
            objectFit: "contain",
            position: "relative",
            zIndex: 1,
            filter: isHolo
              ? "drop-shadow(0 0 8px rgba(255,128,171,0.8))"
              : "none",
            animation: isHolo ? "lbHoloFloat 2s ease-in-out infinite" : "none",
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
  );
}

function ProfileDetail({ r, tImgs, myName, likeData, onLike, onClose }) {
  const isMe = r.name === myName;
  const hasLiked = likeData.liked.includes(r.name);
  const canLike = !isMe && !hasLiked && likeData.count < 3;
  const seals = resolveSealIds(r.featuredSealIds);
  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        borderRadius: 20,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: 18,
          width: "100%",
          boxShadow: "0 16px 48px rgba(0,0,0,0.45)",
          animation: "lbDetailPop 0.2s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 16,
          }}
        >
          <ProfileBorder borderStyle={r.borderStyle || "none"} size={60}>
            {r.trainerId ? (
              <TrainerPortrait name={r.trainerId} size={54} tImgs={tImgs} />
            ) : (
              <span style={{ fontSize: 30 }}>👤</span>
            )}
          </ProfileBorder>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 900,
                fontSize: 15,
                color: "#111827",
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 4,
              }}
            >
              {r.title && <TitleBadge titleKey={r.title} fontSize={10} />}
              <span>{r.name}</span>
              {isMe && (
                <span style={{ fontSize: 9, color: "#16a34a" }}>(나)</span>
              )}
            </div>
            {r.badge && (
              <div style={{ marginTop: 3 }}>
                <BadgeIcon badge={r.badge} size={20} />
              </div>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                marginTop: 6,
              }}
            >
              <span style={{ fontSize: 13 }}>❤️</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#E8190A" }}>
                {(r.likesReceived ?? 0).toLocaleString()}
              </span>
              <span style={{ fontSize: 10, color: "#9CA3AF" }}>좋아요</span>
            </div>
            {r.bio ? (
              <div
                style={{
                  fontSize: 11,
                  color: "#6B7280",
                  fontStyle: "italic",
                  marginTop: 5,
                  lineHeight: 1.5,
                }}
              >
                "{r.bio}"
              </div>
            ) : (
              <div style={{ fontSize: 11, color: "#D1D5DB", marginTop: 5 }}>
                한줄 인사말 없음
              </div>
            )}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#9CA3AF",
              letterSpacing: 0.5,
              marginBottom: 8,
            }}
          >
            대표 씰
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 7,
            }}
          >
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                style={{
                  borderRadius: 8,
                  overflow: "hidden",
                  background: seals[i] ? "transparent" : "#f9fafb",
                  border: seals[i] ? "none" : "1.5px dashed #E5E7EB",
                  minHeight: 94,
                  display: seals[i] ? "block" : "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {seals[i] && <SealProfileCard seal={seals[i]} />}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {!isMe && (
            <button
              onClick={() => canLike && onLike(r.name)}
              style={{
                flex: 2,
                padding: "11px 0",
                borderRadius: 28,
                border: hasLiked
                  ? "1.5px solid #FECACA"
                  : canLike
                  ? "2px solid #E8190A"
                  : "1.5px solid #E5E7EB",
                background: hasLiked
                  ? "#FEF2F2"
                  : canLike
                  ? "linear-gradient(135deg,#E8190A,#C01208)"
                  : "#f9fafb",
                color: hasLiked ? "#EF4444" : canLike ? "#fff" : "#9CA3AF",
                fontWeight: 700,
                fontSize: 12,
                cursor: canLike ? "pointer" : "default",
                boxShadow: canLike ? "0 3px 0 #8B0000" : "none",
              }}
            >
              {hasLiked
                ? "❤️ 좋아요 완료"
                : likeData.count >= 3
                ? "🚫 오늘 한도 초과 (3/3)"
                : `❤️ 좋아요 +100 코인 (${3 - likeData.count}회 남음)`}
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 28,
              border: "1.5px solid #E5E7EB",
              background: "#fff",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              color: "#6B7280",
              boxShadow: "0 3px 0 #e2e8f0",
            }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

function PokeBall({ type = "poke", size = 28, uid = "0" }) {
  const s = size,
    cx = s / 2,
    cy = s / 2,
    r = s / 2 - 1.5;
  const sw = Math.max(1.2, s * 0.045),
    ir = r - sw / 2;
  const bO = r * 0.34,
    bI = r * 0.19,
    bSw = Math.max(0.8, r * 0.065),
    bandH = r * 0.26;
  const topPath = `M${cx - r},${cy} A${r},${r} 0 0,1 ${cx + r},${cy}Z`;
  const botPath = `M${cx - r},${cy} A${r},${r} 0 0,0 ${cx + r},${cy}Z`;
  const Band = ({ cid, color = "#111" }) => (
    <rect
      x={cx - ir}
      y={cy - bandH / 2}
      width={ir * 2}
      height={bandH}
      fill={color}
      clipPath={`url(#${cid})`}
    />
  );
  const Btn = ({ sc = "#111" }) => (
    <>
      <circle
        cx={cx}
        cy={cy}
        r={bO}
        fill="white"
        stroke={sc}
        strokeWidth={bSw}
      />
      <circle
        cx={cx}
        cy={cy}
        r={bI}
        fill="white"
        stroke={sc}
        strokeWidth={bSw * 0.75}
      />
    </>
  );

  if (type === "master")
    return (
      <svg
        width={s}
        height={s}
        viewBox={`0 0 ${s} ${s}`}
        style={{
          display: "block",
          filter: "drop-shadow(0 0 4px rgba(139,92,246,0.85))",
          animation: "lbMasterPulse 2.5s ease-in-out infinite",
        }}
      >
        <defs>
          <clipPath id={`mt${uid}`}>
            <path d={topPath} />
          </clipPath>
          <clipPath id={`mc${uid}`}>
            <circle cx={cx} cy={cy} r={ir} />
          </clipPath>
        </defs>
        <path d={botPath} fill="#EDE9FE" />
        <path d={topPath} fill="#7C3AED" />
        <circle
          cx={cx - r * 0.52}
          cy={cy - r * 0.8}
          r={r * 0.27}
          fill="#EC4899"
          clipPath={`url(#mt${uid})`}
        />
        <circle
          cx={cx + r * 0.52}
          cy={cy - r * 0.8}
          r={r * 0.27}
          fill="#EC4899"
          clipPath={`url(#mt${uid})`}
        />
        <text
          x={cx}
          y={cy - r * 0.32}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={r * 0.78}
          fontWeight="900"
          fontFamily="'Arial Black',Impact,sans-serif"
          clipPath={`url(#mt${uid})`}
        >
          M
        </text>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#1a0040"
          strokeWidth={sw}
        />
        <Band cid={`mc${uid}`} />
        <Btn sc="#1a0040" />
      </svg>
    );
  if (type === "ultra") {
    const strW = r * 0.27;
    return (
      <svg
        width={s}
        height={s}
        viewBox={`0 0 ${s} ${s}`}
        style={{
          display: "block",
          filter: "drop-shadow(0 0 3px rgba(245,196,0,0.55))",
        }}
      >
        <defs>
          <clipPath id={`ut${uid}`}>
            <path d={topPath} />
          </clipPath>
          <clipPath id={`ub${uid}`}>
            <circle cx={cx} cy={cy} r={ir} />
          </clipPath>
        </defs>
        <path d={botPath} fill="white" />
        <path d={topPath} fill="#1a1a1a" />
        <rect
          x={cx - r * 0.82}
          y={cy - r}
          width={strW}
          height={r}
          fill="#F5C400"
          clipPath={`url(#ut${uid})`}
        />
        <rect
          x={cx + r * 0.82 - strW}
          y={cy - r}
          width={strW}
          height={r}
          fill="#F5C400"
          clipPath={`url(#ut${uid})`}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#111"
          strokeWidth={sw}
        />
        <Band cid={`ub${uid}`} />
        <Btn />
      </svg>
    );
  }
  if (type === "great")
    return (
      <svg
        width={s}
        height={s}
        viewBox={`0 0 ${s} ${s}`}
        style={{
          display: "block",
          filter: "drop-shadow(0 0 2px rgba(37,99,235,0.4))",
        }}
      >
        <defs>
          <clipPath id={`gt${uid}`}>
            <path d={topPath} />
          </clipPath>
          <clipPath id={`gb${uid}`}>
            <circle cx={cx} cy={cy} r={ir} />
          </clipPath>
        </defs>
        <path d={botPath} fill="white" />
        <path d={topPath} fill="#3B82F6" />
        <rect
          x={cx - r * 0.82}
          y={cy - r * 0.72}
          width={r * 0.34}
          height={r * 0.27}
          rx={r * 0.05}
          fill="#DC2626"
          transform={`rotate(40, ${cx - r * 0.65}, ${cy - r * 0.585})`}
          clipPath={`url(#gt${uid})`}
        />
        <rect
          x={cx + r * 0.48}
          y={cy - r * 0.72}
          width={r * 0.34}
          height={r * 0.27}
          rx={r * 0.05}
          fill="#DC2626"
          transform={`rotate(-40, ${cx + r * 0.65}, ${cy - r * 0.585})`}
          clipPath={`url(#gt${uid})`}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#111"
          strokeWidth={sw}
        />
        <Band cid={`gb${uid}`} />
        <Btn />
      </svg>
    );
  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      style={{ display: "block", opacity: 0.65 }}
    >
      <defs>
        <radialGradient id={`pg${uid}`} cx="38%" cy="32%">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="100%" stopColor="#DC2626" />
        </radialGradient>
        <clipPath id={`pb${uid}`}>
          <circle cx={cx} cy={cy} r={ir} />
        </clipPath>
      </defs>
      <path d={topPath} fill={`url(#pg${uid})`} />
      <path d={botPath} fill="white" />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#374151"
        strokeWidth={sw}
      />
      <rect
        x={cx - ir}
        y={cy - bandH / 2}
        width={ir * 2}
        height={bandH}
        fill="#374151"
        clipPath={`url(#pb${uid})`}
      />
      <circle
        cx={cx}
        cy={cy}
        r={bO}
        fill="white"
        stroke="#374151"
        strokeWidth={bSw}
      />
      <circle
        cx={cx}
        cy={cy}
        r={bI}
        fill="white"
        stroke="#374151"
        strokeWidth={bSw * 0.75}
      />
    </svg>
  );
}

function RankRow({ r, rank, myName, tImgs, tab, onProfile, likeData, onLike }) {
  const isMe = r.name === myName,
    top3 = rank < 3;
  const rc = top3 ? RANK_COLORS[rank] : null;
  const hasLiked = likeData.liked.includes(r.name);
  const canLike = !isMe && !hasLiked && likeData.count < 3;
  const accentColor = rc ? rc.accent : isMe ? "#22c55e" : "#e2e8f0";
  return (
    <div
      onClick={() => onProfile(r)}
      style={{
        display: "flex",
        alignItems: "stretch",
        borderRadius: 14,
        marginBottom: 6,
        overflow: "hidden",
        background: rc
          ? rc.bg
          : isMe
          ? "linear-gradient(135deg,#f0fdf4,#dcfce7)"
          : "#fff",
        boxShadow: rc
          ? rc.shadow
          : isMe
          ? "0 2px 10px rgba(22,163,74,0.12)"
          : "0 1px 6px rgba(0,0,0,0.07)",
        border: rc
          ? rc.border
          : isMe
          ? "1px solid #bbf7d0"
          : "1px solid #f1f5f9",
        cursor: "pointer",
        transition: "transform 0.12s, box-shadow 0.12s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = rc
          ? rc.shadow.replace("14px", "20px")
          : isMe
          ? "0 4px 16px rgba(22,163,74,0.18)"
          : "0 4px 14px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = rc
          ? rc.shadow
          : isMe
          ? "0 2px 10px rgba(22,163,74,0.12)"
          : "0 1px 6px rgba(0,0,0,0.07)";
      }}
    >
      <div style={{ width: 4, flexShrink: 0, background: accentColor }} />
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "11px 12px 11px 10px",
        }}
      >
        <div
          style={{
            width: 40,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <PokeBall
            type={
              rank === 0
                ? "master"
                : rank === 1
                ? "ultra"
                : rank === 2
                ? "great"
                : "poke"
            }
            size={rank < 3 ? 26 : 20}
            uid={String(rank)}
          />
          <span
            style={{
              fontWeight: top3 ? 800 : 600,
              fontSize: 10,
              lineHeight: 1,
              color:
                rank === 0
                  ? "#6d28d9"
                  : rank === 1
                  ? "#374151"
                  : rank === 2
                  ? "#1d4ed8"
                  : "#9ca3af",
            }}
          >
            {rank + 1}
          </span>
        </div>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <ProfileBorder borderStyle={r.borderStyle || "none"} size={50}>
            {r.trainerId ? (
              <TrainerPortrait name={r.trainerId} size={44} tImgs={tImgs} />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  color: "#9ca3af",
                }}
              >
                👤
              </div>
            )}
          </ProfileBorder>
          {r.badge && (
            <div
              style={{
                position: "absolute",
                bottom: -4,
                right: -4,
                zIndex: 10,
              }}
            >
              <BadgeIcon badge={r.badge} size={17} />
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 6,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              {r.title && (
                <div style={{ marginBottom: 2 }}>
                  <TitleBadge titleKey={r.title} fontSize={9} />
                </div>
              )}
              <div
                style={{
                  fontWeight: top3 || isMe ? 800 : 600,
                  fontSize: 13,
                  color: isMe ? "#15803d" : "#111827",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {r.name}
                {isMe && (
                  <span
                    style={{
                      fontSize: 9,
                      color: "#16a34a",
                      marginLeft: 4,
                      fontWeight: 700,
                    }}
                  >
                    나
                  </span>
                )}
              </div>
            </div>
            <div
              style={{
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 5,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    fontWeight: 900,
                    fontSize: 16,
                    lineHeight: 1,
                    color:
                      tab === "coins"
                        ? "#d97706"
                        : isMe
                        ? "#15803d"
                        : "#111827",
                  }}
                >
                  {tab === "coins"
                    ? (r.coins ?? 0).toLocaleString()
                    : r.collected ?? 0}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: "#9ca3af",
                    marginLeft: 2,
                  }}
                >
                  {tab === "coins" ? "🪙" : "종"}
                </span>
              </div>
              {!isMe ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canLike) onLike(r.name);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    padding: "3px 8px",
                    borderRadius: 20,
                    border: "1px solid #f1f5f9",
                    background: hasLiked ? "#fff0f0" : "#f8fafc",
                    fontSize: 10,
                    fontWeight: 600,
                    cursor: canLike ? "pointer" : "default",
                    color: hasLiked
                      ? "#ef4444"
                      : canLike
                      ? "#6b7280"
                      : "#d1d5db",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  }}
                >
                  <span style={{ fontSize: 11 }}>
                    {hasLiked ? "❤️" : likeData.count >= 3 ? "🚫" : "🤍"}
                  </span>
                  {(r.likesReceived ?? 0) > 0 && <span>{r.likesReceived}</span>}
                </button>
              ) : (
                (r.likesReceived ?? 0) > 0 && (
                  <div
                    style={{
                      fontSize: 10,
                      color: "#9ca3af",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <span>❤️</span>
                    <span>{r.likesReceived}</span>
                  </div>
                )
              )}
            </div>
          </div>
          <SealGrid ids={r.featuredSealIds} size={22} />
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardModal({
  myName,
  tImgs,
  onOpen,
  onClose,
  onEarnCoins,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoad] = useState(true);
  const [tab, setTab] = useState("dex");
  const [likeData, setLikeData] = useState(readLikes);
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    setLoad(true);
    const init = async () => {
      if (onOpen) await onOpen();
      fetchLeaderboard()
        .then((data) => {
          const sorted = (data || [])
            .sort((a, b) => {
              if (tab === "coins") {
                const d = (b.coins ?? 0) - (a.coins ?? 0);
                return d !== 0 ? d : tiebreaker(a, b);
              }
              const d = (b.collected ?? 0) - (a.collected ?? 0);
              return d !== 0 ? d : tiebreaker(a, b);
            })
            .slice(0, 20);
          setRows(sorted);
        })
        .catch(() => setRows([]))
        .finally(() => setLoad(false));
    };
    init();
  }, [tab]);

  const handleLike = useCallback(
    async (targetName) => {
      const data = readLikes();
      if (data.count >= 3 || data.liked.includes(targetName)) return;
      const optimisticData = {
        count: data.count + 1,
        liked: [...data.liked, targetName],
      };
      writeLikes(optimisticData);
      setLikeData({ ...optimisticData });
      try {
        const targetRow = rows.find((r) => r.name === targetName);
        const enc = targetRow?._key ?? toFirebaseKey(targetName);
        let newCount = 1;
        await db.transaction(`users/${enc}`, (current) => {
          newCount = (current?.likesReceived ?? 0) + 1;
          return { ...(current || {}), likesReceived: newCount };
        });
        await db.update(`leaderboard/${enc}`, { likesReceived: newCount });
        if (onEarnCoins) onEarnCoins(100);
        setRows((prev) =>
          prev.map((r) =>
            r.name === targetName ? { ...r, likesReceived: newCount } : r
          )
        );
      } catch {
        writeLikes(data);
        setLikeData({ ...data });
      }
    },
    [onEarnCoins, rows]
  );

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
        zIndex: 1025,
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
          animation: "lbModalPop 0.25s ease",
        }}
      >
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
              🏆 랭킹
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
                LEADERBOARD
              </div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 14 }}>
                {tab === "dex" ? "📖 도감 랭킹" : "🪙 코인 랭킹"}
              </div>
            </div>
            <div
              style={{
                color: "rgba(74,222,128,0.4)",
                fontSize: 9,
                fontFamily: "monospace",
              }}
            >
              TOP {rows.length}
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
        <div
          style={{
            background: "#FEFEFE",
            borderRadius: 20,
            padding: 12,
            boxShadow: "inset 0 2px 0 #fff,inset 0 -2px 0 rgba(180,0,0,0.12)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              background: "#f1f5f9",
              borderRadius: 12,
              padding: 3,
            }}
          >
            {[
              ["dex", "📖 도감"],
              ["coins", "🪙 코인"],
            ].map(([k, l]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                style={{
                  flex: 1,
                  padding: "9px 0",
                  borderRadius: 9,
                  border: "none",
                  background: tab === k ? "#fff" : "transparent",
                  fontWeight: tab === k ? 800 : 600,
                  fontSize: 13,
                  cursor: "pointer",
                  color: tab === k ? "#16a34a" : "#94a3b8",
                  boxShadow: tab === k ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.18s",
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <div
            style={{ maxHeight: "52vh", overflowY: "auto", paddingRight: 2 }}
          >
            {loading ? (
              <div
                style={{ textAlign: "center", padding: 36, color: "#9CA3AF" }}
              >
                ⏳ 불러오는 중...
              </div>
            ) : rows.length === 0 ? (
              <div
                style={{ textAlign: "center", padding: 36, color: "#9CA3AF" }}
              >
                랭킹 데이터가 없어요
              </div>
            ) : (
              rows.map((r, i) => (
                <RankRow
                  key={r._key ?? r.name}
                  r={r}
                  rank={i}
                  myName={myName}
                  tImgs={tImgs}
                  tab={tab}
                  onProfile={setSelectedProfile}
                  likeData={likeData}
                  onLike={handleLike}
                />
              ))
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "11px 0",
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
            닫기
          </button>
          {selectedProfile && (
            <ProfileDetail
              r={selectedProfile}
              tImgs={tImgs}
              myName={myName}
              likeData={likeData}
              onLike={handleLike}
              onClose={() => setSelectedProfile(null)}
            />
          )}
        </div>
      </div>
      <style>{`
        @keyframes scanLine    { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes lbModalPop  { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
        @keyframes lbDetailPop { from{opacity:0;transform:scale(0.96) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes lbHoloSpin  { to{transform:rotate(360deg)} }
        @keyframes lbHoloFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-2px) scale(1.05)} }
        @keyframes lbMasterPulse { 0%,100%{filter:drop-shadow(0 0 4px rgba(139,92,246,0.85))} 50%{filter:drop-shadow(0 0 10px rgba(139,92,246,1)) drop-shadow(0 0 3px rgba(196,181,253,0.7))} }
        @keyframes holoFireRise  { 0%{transform:translateY(0) scaleX(1);opacity:0.9} 60%{transform:translateY(-35px) scaleX(0.5);opacity:0.6} 100%{transform:translateY(-65px) scaleX(0.1);opacity:0} }
        @keyframes holoEmber     { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(8px,-40px);opacity:0} }
        @keyframes holoSpark     { 0%,100%{opacity:0;transform:scale(0.3)} 40%,60%{opacity:1;transform:scale(1)} }
        @keyframes holoBubble    { 0%{transform:translateY(0) scale(1);opacity:0.9} 80%{transform:translateY(-55px) scale(1.4);opacity:0.4} 100%{transform:translateY(-68px) scale(1.5);opacity:0} }
        @keyframes holoDropFall  { 0%{transform:translateY(-8px);opacity:0} 20%{opacity:1} 100%{transform:translateY(25px);opacity:0} }
        @keyframes holoLeaf      { 0%{transform:translateY(0) translateX(0) rotate(0deg);opacity:1} 50%{transform:translateY(-26px) translateX(9px) rotate(130deg);opacity:0.6} 100%{transform:translateY(-54px) translateX(-5px) rotate(260deg);opacity:0} }
        @keyframes holoDragon    { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes holoDragonRev { 0%{transform:rotate(0deg)} 100%{transform:rotate(-360deg)} }
        @keyframes holoPsychic   { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes holoPulse     { 0%{transform:translate(-50%,-50%) scale(1);opacity:0.8} 100%{transform:translate(-50%,-50%) scale(5);opacity:0} }
        @keyframes holoSparkle   { 0%,100%{transform:scale(0) rotate(0deg);opacity:0} 50%{transform:scale(1) rotate(180deg);opacity:1} }
        @keyframes holoHeart     { 0%{transform:scale(0) translateY(0);opacity:0} 30%{transform:scale(1.2) translateY(-5px);opacity:1} 70%{transform:scale(1) translateY(-15px);opacity:0.6} 100%{transform:scale(0.8) translateY(-28px);opacity:0} }
        @keyframes holoGoldenSpin{ 0%,100%{transform:rotate(0deg) scale(0.7);opacity:0.5} 50%{transform:rotate(180deg) scale(1.3);opacity:1} }
      `}</style>
    </div>
  );
}
