// src/screens/WildRuleReveal.jsx
// 배틀프런티어 게임 시작 직전 룰 공개 풀스크린 연출

import { useState, useEffect, useRef } from "react";
import { WILD_RULES } from "../lib/wildRules";

export default function WildRuleReveal({ ruleId, onComplete }) {
  const [countdown, setCountdown] = useState(3);
  const [phase, setPhase] = useState("reveal");
  const doneRef = useRef(false);

  const rule = WILD_RULES[ruleId] || {
    name: "???",
    emoji: "🎲",
    desc: "알 수 없는 룰",
    color: "#fff",
    bg: "#111",
  };

  const safeComplete = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete();
  };

  useEffect(() => {
    const t = setTimeout(() => setPhase("countdown"), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      safeComplete();
      return;
    }
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id);
          setTimeout(safeComplete, 300);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  return (
    <div
      onClick={safeComplete}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(ellipse at center, ${rule.bg} 0%, #020508 70%)`,
        fontFamily: "system-ui, sans-serif",
        cursor: "pointer",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* 배경 글로우 링 */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          border: `2px solid ${rule.color}22`,
          animation: "bfRing 2s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          border: `1px solid ${rule.color}11`,
          animation: "bfRing 2s ease-in-out infinite 0.4s",
          pointerEvents: "none",
        }}
      />

      {/* 상단 라벨 */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 4,
          color: rule.color,
          opacity: 0.7,
          marginBottom: 24,
          animation: "bfFadeUp 0.6s ease forwards",
          textTransform: "uppercase",
        }}
      >
        ⚡ 배틀프런티어 · 이번 판 룰
      </div>

      {/* 이모지 */}
      <div
        style={{
          fontSize: 96,
          lineHeight: 1,
          marginBottom: 16,
          animation:
            "bfPopIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards",
          filter: `drop-shadow(0 0 40px ${rule.color}88)`,
        }}
      >
        {rule.emoji}
      </div>

      {/* 룰 이름 */}
      <div
        style={{
          fontSize: 44,
          fontWeight: 900,
          color: "#fff",
          letterSpacing: 2,
          marginBottom: 12,
          textShadow: `0 0 60px ${rule.color}`,
          animation: "bfFadeUp 0.5s ease 0.1s both",
        }}
      >
        {rule.name}
      </div>

      {/* 룰 설명 */}
      <div
        style={{
          fontSize: 15,
          color: "rgba(255,255,255,0.65)",
          fontWeight: 500,
          maxWidth: 320,
          textAlign: "center",
          lineHeight: 1.6,
          marginBottom: 40,
          animation: "bfFadeUp 0.5s ease 0.2s both",
        }}
      >
        {rule.desc}
      </div>

      {/* 카운트다운 / 진행바 */}
      {phase === "countdown" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            animation: "bfFadeUp 0.3s ease both",
          }}
        >
          <div
            style={{
              width: 200,
              height: 4,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: rule.color,
                borderRadius: 99,
                width: `${(countdown / 3) * 100}%`,
                transition: "width 0.9s linear",
                boxShadow: `0 0 8px ${rule.color}`,
              }}
            />
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.35)",
              fontWeight: 600,
            }}
          >
            {countdown}초 후 시작 · 탭하면 스킵
          </div>
        </div>
      )}

      {/* 스킵 버튼 */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          fontSize: 11,
          color: "rgba(255,255,255,0.3)",
          fontWeight: 600,
          letterSpacing: 1,
        }}
      >
        탭하여 스킵 →
      </div>

      <style>{`
        @keyframes bfRing {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes bfPopIn {
          from { transform: scale(0.3) rotate(-10deg); opacity: 0; }
          to   { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes bfFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
