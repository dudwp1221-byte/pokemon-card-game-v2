import { useState } from "react";
import {
  MISSIONS,
  loadDailyMissions,
  claimMissionReward,
  canClaimBonus,
  claimBonusReward,
} from "../../lib/dailyMissions";
export default function DailyMissionsModal({
  freeBreadCount,
  freePremiumBreadCount,
  onClaimBread,
  onClaimPremiumBread,
  onClaimCoins,
  onClose,
}) {
  const [data, setData] = useState(() => loadDailyMissions());
  const [claimFlash, setFlash] = useState(null);
  const [bonusFlash, setBonusFlash] = useState(false);

  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = Number(midnight) - Number(now);
  const hh = String(Math.floor(diff / 3600000)).padStart(2, "0");
  const mm = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");

  const handleClaim = (id) => {
    const { bread, coins } = claimMissionReward(id);
    if (bread <= 0 && coins <= 0) return;
    if (bread > 0) onClaimBread(bread);
    if (coins > 0) onClaimCoins?.(coins);
    setFlash(id);
    setTimeout(() => setFlash(null), 1000);
    setData(loadDailyMissions());
  };

  const handleClaimBonus = () => {
    if (!claimBonusReward()) return;
    onClaimPremiumBread();
    setBonusFlash(true);
    setTimeout(() => setBonusFlash(false), 1200);
    setData(loadDailyMissions());
  };

  const bonusAvail = canClaimBonus();
  const claimed = MISSIONS.filter((m) => data.progress[m.id]?.claimed).length;
  const bonusPct = claimed / MISSIONS.length;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.78)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1020,
        fontFamily: "system-ui,sans-serif",
        padding: 16,
      }}
    >
      <div
        style={{
          width: Math.min(400, window.innerWidth - 32),
          background: "linear-gradient(160deg,#E8190A,#C01208)",
          borderRadius: 28,
          padding: 12,
          boxShadow:
            "0 16px 48px rgba(0,0,0,0.7),inset 0 2px 0 rgba(255,130,110,0.5),inset 0 -3px 0 rgba(0,0,0,0.35)",
          border: "3px solid #8B0000",
          animation: "dmPopIn 0.25s ease",
        }}
      >
        {/* 상단 바 */}
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
              📋 일일 미션
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
                DAILY MISSIONS
              </div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 14 }}>
                📋 일일 미션
              </div>
            </div>
            <div
              style={{
                background: "rgba(255,208,60,0.15)",
                border: "1px solid rgba(255,208,60,0.4)",
                borderRadius: 8,
                padding: "3px 10px",
              }}
            >
              <span
                style={{
                  color: "#fbbf24",
                  fontSize: 10,
                  fontFamily: "monospace",
                  fontWeight: 700,
                }}
              >
                ⏰ {hh}:{mm}
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
          }}
        >
          {/* 보유 빵 */}
          <div
            style={{
              background: "#FFFBEB",
              border: "1.5px solid #FCD34D",
              borderRadius: 12,
              padding: "10px 13px",
              boxShadow: "0 3px 0 #fde68a",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 22 }}>🍞</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 12, color: "#92400E" }}>
                보유 빵
              </div>
              <div style={{ fontSize: 11, color: "#78350F", marginTop: 1 }}>
                기본 빵 <strong>{freeBreadCount}개</strong>
                {freePremiumBreadCount > 0 && (
                  <span
                    style={{ marginLeft: 8, color: "#6D28D9", fontWeight: 800 }}
                  >
                    · 프리미엄 빵 <strong>{freePremiumBreadCount}개</strong> ✨
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 전체 완료 보너스 */}
          <div
            style={{
              background: bonusAvail ? "#F5F3FF" : "#FAFAFA",
              border: `1.5px solid ${bonusAvail ? "#7C3AED" : "#C4B5FD"}`,
              borderRadius: 12,
              padding: "12px 14px",
              boxShadow: bonusAvail ? "0 3px 0 #c4b5fd" : "0 3px 0 #e2e8f0",
              opacity: data.bonusClaimed ? 0.65 : 1,
              animation: bonusFlash ? "dmPop 0.4s ease" : "none",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 26, flexShrink: 0 }}>🎁</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 12,
                  color: data.bonusClaimed ? "#16a34a" : "#4C1D95",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginBottom: 2,
                }}
              >
                전체 완료 보너스
                {data.bonusClaimed && (
                  <span
                    style={{
                      fontSize: 9,
                      background: "#22c55e",
                      color: "#fff",
                      borderRadius: 99,
                      padding: "1px 7px",
                      fontWeight: 700,
                    }}
                  >
                    완료
                  </span>
                )}
              </div>
              <div style={{ fontSize: 10, color: "#6B7280", marginBottom: 5 }}>
                미션 4개 모두 수령 → 피카피카 촉촉치즈케잌 1개 무료!
              </div>
              <div
                style={{
                  height: 6,
                  background: "#E5E7EB",
                  borderRadius: 99,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${bonusPct * 100}%`,
                    background: data.bonusClaimed
                      ? "#22c55e"
                      : bonusAvail
                      ? "#7C3AED"
                      : "#6366F1",
                    borderRadius: 99,
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "#9CA3AF",
                  marginTop: 2,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  {claimed}/{MISSIONS.length}
                </span>
                <span style={{ color: "#6D28D9", fontWeight: 700 }}>
                  ✨ 피카피카 촉촉치즈케잌 ×1
                </span>
              </div>
            </div>
            {bonusAvail && !data.bonusClaimed && (
              <button
                onClick={handleClaimBonus}
                style={{
                  flexShrink: 0,
                  padding: "8px 13px",
                  borderRadius: 10,
                  border: "none",
                  fontWeight: 900,
                  fontSize: 11,
                  cursor: "pointer",
                  background: bonusFlash
                    ? "#22c55e"
                    : "linear-gradient(135deg,#7C3AED,#6D28D9)",
                  color: "#fff",
                  transition: "background 0.3s",
                  animation: bonusFlash
                    ? "none"
                    : "dmBonusPulse 1.4s ease-in-out infinite",
                }}
              >
                {bonusFlash ? "🎉" : "수령"}
              </button>
            )}
            {data.bonusClaimed && (
              <span style={{ flexShrink: 0, fontSize: 22 }}>✅</span>
            )}
            {!bonusAvail && !data.bonusClaimed && (
              <div style={{ flexShrink: 0, width: 50 }} />
            )}
          </div>

          {/* 미션 목록 (일일 + BF 통합) */}
          <div
            style={{
              maxHeight: "36vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 7,
            }}
          >
            {/* 일일 미션 */}
            {MISSIONS.map((m) => {
              const prog = data.progress[m.id] || {
                current: 0,
                claimed: false,
              };
              const pct = Math.min(1, prog.current / m.target);
              const completed = prog.current >= m.target;
              const isClaimed = prog.claimed;
              const flashing = claimFlash === m.id;
              return (
                <div
                  key={m.id}
                  style={{
                    background: isClaimed
                      ? "#F0FDF4"
                      : completed
                      ? "#FFFBEB"
                      : "#F9FAFB",
                    border: `1.5px solid ${
                      isClaimed ? "#bbf7d0" : completed ? "#FCD34D" : "#E5E7EB"
                    }`,
                    borderRadius: 12,
                    padding: "12px 13px",
                    boxShadow: isClaimed
                      ? "0 3px 0 #bbf7d0"
                      : completed
                      ? "0 3px 0 #fde68a"
                      : "0 3px 0 #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    animation: flashing ? "dmPop 0.4s ease" : "none",
                  }}
                >
                  <span style={{ fontSize: 26, flexShrink: 0 }}>{m.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 12,
                        color: isClaimed ? "#16a34a" : "#111",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        marginBottom: 1,
                      }}
                    >
                      {m.title}
                      {isClaimed && (
                        <span
                          style={{
                            fontSize: 9,
                            background: "#22c55e",
                            color: "#fff",
                            borderRadius: 99,
                            padding: "1px 7px",
                            fontWeight: 700,
                          }}
                        >
                          완료
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#6B7280",
                        marginBottom: 5,
                      }}
                    >
                      {m.desc}
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: "#E5E7EB",
                        borderRadius: 99,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct * 100}%`,
                          background: isClaimed
                            ? "#22c55e"
                            : completed
                            ? "#F59E0B"
                            : "#E8190A",
                          borderRadius: 99,
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: "#9CA3AF",
                        marginTop: 2,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>
                        {prog.current}/{m.target}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span style={{ color: "#D97706", fontWeight: 700 }}>
                          🍞 ×{m.reward}
                        </span>
                        {m.coins > 0 && (
                          <span style={{ color: "#f59e0b", fontWeight: 700 }}>
                            🪙 +{m.coins}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {!isClaimed && completed && (
                    <button
                      onClick={() => handleClaim(m.id)}
                      style={{
                        flexShrink: 0,
                        padding: "8px 13px",
                        borderRadius: 10,
                        border: "none",
                        background: flashing
                          ? "#22c55e"
                          : "linear-gradient(160deg,#4ade80,#22c55e 40%,#16a34a)",
                        color: "#fff",
                        fontWeight: 900,
                        fontSize: 11,
                        cursor: "pointer",
                        boxShadow: flashing ? "none" : "0 3px 0 #166534",
                        transition: "background 0.3s",
                        animation: flashing
                          ? "none"
                          : "dmClaimPulse 1.4s ease-in-out infinite",
                      }}
                    >
                      {flashing ? "🍞✓" : "수령"}
                    </button>
                  )}
                  {isClaimed && (
                    <span style={{ flexShrink: 0, fontSize: 22 }}>✅</span>
                  )}
                  {!isClaimed && !completed && (
                    <div style={{ flexShrink: 0, width: 50 }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* 닫기 */}
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
        </div>
      </div>
      <style>{`
        @keyframes scanLine      { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes dmPopIn       { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
        @keyframes dmPop         { 0%{transform:scale(0.95);opacity:.5} 100%{transform:scale(1);opacity:1} }
        @keyframes dmClaimPulse  { 0%,100%{box-shadow:0 3px 0 #166534} 50%{box-shadow:0 3px 0 #166534,0 0 0 5px rgba(34,197,94,0.2)} }
        @keyframes dmBonusPulse  { 0%,100%{box-shadow:none} 50%{box-shadow:0 0 0 6px rgba(124,58,237,0.2)} }
      `}</style>
    </div>
  );
}
