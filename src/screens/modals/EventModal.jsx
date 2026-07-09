// src/screens/modals/EventModal.jsx
import { useState, useEffect } from "react";
import {
  getCurrentEvent,
  getEventDaysLeft,
  STAMP_DEFS,
  STAMP_TOTAL,
  STAMP_REQUIRED,
  getStampCount,
  canClaimReward,
  canClaimFullReward,
  loadEventProgress,
  saveEventProgress,
} from "../../lib/eventLogic";
import PokeModalShell from "../../components/PokeModalShell";

function CapPikachuPreview({ seal }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  return (
    <div
      style={{
        position: "relative",
        width: 100,
        height: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -6,
          borderRadius: "50%",
          background: "conic-gradient(#ff80ab,#ffd700,#a0f4ff,#86efac,#ff80ab)",
          animation: "evSpin 3s linear infinite",
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, transparent 45%, rgba(255,255,255,0.9) 100%)",
          zIndex: 1,
        }}
      />
      {!error ? (
        <img
          src={seal.artwork}
          alt={seal.name}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{
            width: 84,
            height: 84,
            objectFit: "contain",
            position: "relative",
            zIndex: 2,
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.3s",
            filter: "drop-shadow(0 0 8px #ffd700)",
          }}
        />
      ) : (
        <div style={{ fontSize: 48, position: "relative", zIndex: 2 }}>🧢</div>
      )}
    </div>
  );
}

function StampCard({ def, achieved, progress }) {
  const val = (() => {
    const p = progress;
    if (def.id === "loginDays") return (p.loginDays || []).length;
    if (def.id === "missionDays") return (p.missionDays || []).length;
    if (def.id === "streak") return achieved ? def.target : p.streak || 0;
    return p[def.id] || 0;
  })();
  return (
    <div
      style={{
        background: achieved ? "#eff6ff" : "#f9fafb",
        border: `1.5px solid ${achieved ? "#93c5fd" : "#e5e7eb"}`,
        borderRadius: 12,
        padding: "10px 12px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          flexShrink: 0,
          background: achieved
            ? "linear-gradient(135deg,#60a5fa,#6366F1)"
            : "#e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: achieved ? 16 : 15,
        }}
      >
        {achieved ? "✓" : def.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: achieved ? "#1d4ed8" : "#374151",
            marginBottom: 2,
          }}
        >
          {def.label}
        </div>
        <div style={{ fontSize: 10, color: "#6b7280", lineHeight: 1.4 }}>
          {def.desc}
        </div>
      </div>
      <div style={{ flexShrink: 0, textAlign: "right" }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 900,
            color: achieved ? "#2563eb" : "#374151",
          }}
        >
          {Math.min(val, def.target)}
        </span>
        <span style={{ fontSize: 10, color: "#9ca3af" }}>/{def.target}</span>
      </div>
    </div>
  );
}

export default function EventModal({
  onClose,
  onClaimReward,
  onClaimFullReward,
  winW,
}) {
  const event = getCurrentEvent();
  const daysLeft = getEventDaysLeft();
  const [prog, setProg] = useState(() => loadEventProgress());
  useEffect(() => {
    saveEventProgress(prog);
  }, [prog]);

  const stampCount = getStampCount(prog);
  const canMain = canClaimReward(prog);
  const canFull = canClaimFullReward(prog);

  const handleClaimMain = () => {
    if (!canMain) return;
    const updated = { ...prog, rewarded: true };
    setProg(updated);
    saveEventProgress(updated);
    onClaimReward?.(event.seal);
  };
  const handleClaimFull = () => {
    if (!canFull) return;
    const updated = { ...prog, fullRewarded: true };
    setProg(updated);
    saveEventProgress(updated);
    onClaimFullReward?.();
  };

  return (
    <PokeModalShell
      onClose={onClose}
      title="지우의 여행"
      titleIcon="🎒"
      screenColor="rgba(160,244,255,0.8)"
      winW={winW}
      zIndex={1050}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxHeight: "60vh",
          overflowY: "auto",
        }}
      >
        {/* 이벤트 씰 미리보기 */}
        <div
          style={{
            background: "linear-gradient(135deg,#0d0d2b,#1a1040)",
            borderRadius: 14,
            padding: 14,
            display: "flex",
            alignItems: "center",
            gap: 14,
            border: "1px solid rgba(160,244,255,0.2)",
          }}
        >
          <CapPikachuPreview seal={event.seal} />
          <div>
            <div
              style={{
                fontSize: 9,
                color: "rgba(160,244,255,0.6)",
                fontFamily: "monospace",
                marginBottom: 3,
              }}
            >
              이번 이벤트 보상
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 900,
                color: "#ffd700",
                marginBottom: 6,
              }}
            >
              {event.seal.name}
            </div>
            <div
              style={{
                display: "flex",
                gap: 6,
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  background: "rgba(255,0,0,0.4)",
                  border: "1px solid rgba(255,100,100,0.5)",
                  borderRadius: 99,
                  padding: "3px 10px",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#ff8080",
                }}
              >
                {daysLeft > 0 ? `D-${daysLeft}` : "오늘 마감!"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 3 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background:
                      i === event.idx
                        ? "#ffd700"
                        : i < event.idx
                        ? "rgba(160,244,255,0.4)"
                        : "rgba(255,255,255,0.15)",
                  }}
                />
              ))}
            </div>
            <div
              style={{
                fontSize: 9,
                color: "rgba(255,255,255,0.3)",
                marginTop: 3,
              }}
            >
              8종 순환 {event.idx + 1}/8
            </div>
          </div>
        </div>

        {/* 스탬프 현황 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>
            스탬프 현황
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {Array.from({ length: STAMP_TOTAL }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: prog.stamps[i]
                    ? "linear-gradient(135deg,#60a5fa,#6366F1)"
                    : "#e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 8,
                  color: "#fff",
                }}
              >
                {prog.stamps[i] ? "✓" : ""}
              </div>
            ))}
            <span
              style={{
                fontSize: 12,
                fontWeight: 900,
                color: stampCount >= STAMP_REQUIRED ? "#2563eb" : "#6b7280",
                marginLeft: 2,
              }}
            >
              {stampCount}/{STAMP_TOTAL}
            </span>
          </div>
        </div>

        {/* 스탬프 카드 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {STAMP_DEFS.map((def, i) => (
            <StampCard
              key={def.id}
              def={def}
              achieved={prog.stamps[i]}
              progress={prog.progress}
            />
          ))}
        </div>

        {/* 보상 */}
        <div
          style={{
            background: "#fffbeb",
            borderRadius: 12,
            padding: 12,
            border: "1px solid #fde68a",
            display: "flex",
            flexDirection: "column",
            gap: 9,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#92400e",
              letterSpacing: 0.5,
            }}
          >
            🎁 REWARDS
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: prog.rewarded ? "#9ca3af" : "#111827",
                }}
              >
                {STAMP_REQUIRED}개 달성 ·{" "}
                <span style={{ color: "#d97706" }}>
                  {event.seal.cap} 모자 피카츄
                </span>
              </div>
              <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}>
                이로치 씰 도감에 등록됩니다
              </div>
            </div>
            <button
              onClick={handleClaimMain}
              disabled={!canMain}
              style={{
                flexShrink: 0,
                padding: "8px 14px",
                borderRadius: 99,
                border: "none",
                background: prog.rewarded
                  ? "#f1f5f9"
                  : canMain
                  ? "linear-gradient(135deg,#ffd700,#ff8c00)"
                  : "#e5e7eb",
                color: prog.rewarded ? "#9ca3af" : canMain ? "#000" : "#9ca3af",
                fontWeight: 900,
                fontSize: 12,
                cursor: canMain ? "pointer" : "default",
                boxShadow: canMain ? "0 3px 10px rgba(255,215,0,0.4)" : "none",
              }}
            >
              {prog.rewarded
                ? "✓ 수령완료"
                : canMain
                ? "🎁 받기"
                : `${STAMP_REQUIRED - stampCount}개 남음`}
            </button>
          </div>
          <div style={{ height: 1, background: "#fde68a" }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: prog.fullRewarded ? "#9ca3af" : "#111827",
                }}
              >
                전부 달성 ·{" "}
                <span style={{ color: "#2563eb" }}>
                  코인 500 + 이로치씰 1장
                </span>
              </div>
              <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}>
                스탬프 {STAMP_TOTAL}개 전부 달성
              </div>
            </div>
            <button
              onClick={handleClaimFull}
              disabled={!canFull}
              style={{
                flexShrink: 0,
                padding: "8px 14px",
                borderRadius: 99,
                border: "none",
                background: prog.fullRewarded
                  ? "#f1f5f9"
                  : canFull
                  ? "linear-gradient(135deg,#60a5fa,#6366F1)"
                  : "#e5e7eb",
                color: prog.fullRewarded
                  ? "#9ca3af"
                  : canFull
                  ? "#fff"
                  : "#9ca3af",
                fontWeight: 900,
                fontSize: 12,
                cursor: canFull ? "pointer" : "default",
                boxShadow: canFull ? "0 3px 10px rgba(96,165,250,0.4)" : "none",
              }}
            >
              {prog.fullRewarded
                ? "✓ 수령완료"
                : canFull
                ? "🎁 받기"
                : `${STAMP_TOTAL - stampCount}개 남음`}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes evSpin     { to{transform:rotate(360deg)} }
        @keyframes evStampPop { from{transform:scale(0.5);opacity:0} to{transform:scale(1);opacity:1} }
      `}</style>
    </PokeModalShell>
  );
}
