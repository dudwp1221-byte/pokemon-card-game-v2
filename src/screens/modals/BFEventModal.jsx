// src/screens/modals/BFEventModal.jsx
import { useState, useMemo } from "react";
import {
  getCurrentWeeklyMissions,
  loadBFEventProgress,
  getDaysLeft,
  claimBFMission,
  getWeekNum,
} from "../../lib/bfEventLogic";
import { WILD_RULES } from "../../lib/wildRules";

const RULE_COLORS = {
  no_discard: "#ef4444",
  jackpot: "#f59e0b",
  speed: "#3b82f6",
  reveal: "#8b5cf6",
  "4set": "#06b6d4",
  bonus: "#10b981",
};

function MissionCard({ mission, progress, onClaim }) {
  const count = progress?.count || 0;
  const claimed = progress?.claimed || false;
  const done = count >= mission.goal;
  const ratio = Math.min(1, count / mission.goal);
  const ruleColor = mission.rule
    ? RULE_COLORS[mission.rule] || "#6366f1"
    : "#6366f1";

  return (
    <div
      style={{
        background: claimed ? "#f0fdf4" : done ? "#fffbeb" : "#f8fafc",
        border: `1.5px solid ${
          claimed ? "#86efac" : done ? "#fde68a" : "#e5e7eb"
        }`,
        borderRadius: 14,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 9,
        boxShadow: claimed
          ? "0 3px 0 #bbf7d0"
          : done
          ? "0 3px 0 #fde68a"
          : "0 3px 0 #e2e8f0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginBottom: 3,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontWeight: 900, fontSize: 14, color: "#111827" }}>
              {mission.title}
            </span>
            {mission.rule && WILD_RULES[mission.rule] && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  padding: "2px 7px",
                  borderRadius: 99,
                  background: `${ruleColor}18`,
                  color: ruleColor,
                  border: `1px solid ${ruleColor}33`,
                }}
              >
                {WILD_RULES[mission.rule].emoji} {WILD_RULES[mission.rule].name}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{mission.desc}</div>
        </div>
        <div
          style={{
            flexShrink: 0,
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 9,
            padding: "5px 10px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 9, color: "#9ca3af" }}>보상</div>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#d97706" }}>
            🪙 {(mission.coins || 0).toLocaleString()}
          </div>
        </div>
      </div>
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 5,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: claimed ? "#16a34a" : done ? "#d97706" : "#6b7280",
            }}
          >
            {claimed
              ? "✅ 수령 완료"
              : done
              ? "🎉 달성!"
              : `${count} / ${mission.goal}`}
          </span>
          {!claimed && !done && (
            <span style={{ fontSize: 11, color: "#9ca3af" }}>
              {mission.goal - count}개 남음
            </span>
          )}
        </div>
        <div
          style={{
            height: 6,
            background: "#e5e7eb",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${ratio * 100}%`,
              background: claimed
                ? "linear-gradient(90deg,#22c55e,#4ade80)"
                : done
                ? "linear-gradient(90deg,#f59e0b,#fcd34d)"
                : "linear-gradient(90deg,#6366f1,#8b5cf6)",
              borderRadius: 99,
              transition: "width 0.4s",
            }}
          />
        </div>
      </div>
      {done && !claimed && (
        <button
          onClick={() => onClaim(mission.id)}
          style={{
            alignSelf: "flex-end",
            background: "linear-gradient(135deg,#f59e0b,#d97706)",
            border: "none",
            borderRadius: 10,
            color: "#000",
            fontWeight: 900,
            fontSize: 13,
            padding: "7px 20px",
            cursor: "pointer",
            boxShadow: "0 3px 0 #92400e",
          }}
        >
          받기 🎁
        </button>
      )}
    </div>
  );
}

export default function BFEventModal({ onClose, onClaimReward, winW }) {
  const [prog, setProg] = useState(() => loadBFEventProgress());
  const missions = useMemo(() => getCurrentWeeklyMissions(), []);
  const daysLeft = getDaysLeft();
  const allClaimed = missions.every((m) => prog.missions?.[m.id]?.claimed);
  const earnedCoins = missions
    .filter((m) => prog.missions?.[m.id]?.claimed)
    .reduce((s, m) => s + m.coins, 0);
  const totalCoins = missions.reduce((s, m) => s + (m.coins || 0), 0);
  const W = winW ? Math.min(380, winW - 32) : 380;

  const handleClaim = (missionId) => {
    const coins = claimBFMission(missionId);
    if (!coins) return;
    setProg(loadBFEventProgress());
    onClaimReward?.(coins);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1010,
        background: "rgba(0,0,0,0.82)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui,sans-serif",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: W,
          background: "linear-gradient(160deg,#E8190A,#C01208)",
          borderRadius: 28,
          padding: 12,
          boxShadow:
            "0 16px 48px rgba(0,0,0,0.65), inset 0 2px 0 rgba(255,130,110,0.5), inset 0 -3px 0 rgba(0,0,0,0.35)",
          border: "3px solid #8B0000",
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
              width: 44,
              height: 44,
              borderRadius: "50%",
              flexShrink: 0,
              position: "relative",
              background:
                "radial-gradient(circle at 32% 28%,#bfdbfe,#2563EB 55%,#1e3a8a)",
              boxShadow:
                "0 0 0 3px rgba(255,255,255,0.3), 0 0 16px rgba(59,130,246,0.6)",
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
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            {[
              { c: "#f87171", g: "#ef4444" },
              { c: "#fbbf24", g: "#f59e0b" },
              { c: "#4ade80", g: "#22c55e" },
            ].map(({ c, g }, i) => (
              <div
                key={i}
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: c,
                  boxShadow: `0 0 6px ${g}`,
                  border: "1.5px solid rgba(255,255,255,0.3)",
                }}
              />
            ))}
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <span
              style={{
                color: "#fff",
                fontWeight: 900,
                fontSize: 15,
                letterSpacing: 1,
                textShadow: "0 1px 4px rgba(0,0,0,0.5)",
              }}
            >
              ⚡ PokéSet
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.3)",
              background: "rgba(0,0,0,0.3)",
              color: "rgba(255,255,255,0.8)",
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* 스크린 */}
        <div
          style={{
            background: "#0a0f1a",
            borderRadius: 12,
            border: "4px solid #fff",
            boxShadow: "0 0 0 2px #bbb, inset 0 2px 10px rgba(0,0,0,0.9)",
            overflow: "hidden",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              height: 2,
              background:
                "linear-gradient(90deg,transparent,rgba(74,222,128,0.2),transparent)",
            }}
          />
          <div
            style={{
              padding: "8px 14px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 18 }}>🏟️</span>
            <div>
              <div
                style={{
                  color: "rgba(139,92,246,0.8)",
                  fontSize: 8,
                  fontFamily: "monospace",
                  letterSpacing: 1,
                  marginBottom: 1,
                }}
              >
                POKÉSET SYSTEM
              </div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 14 }}>
                주간 미션
              </div>
            </div>
          </div>
          <div style={{ display: "flex", height: 2 }}>
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
            borderRadius: 18,
            padding: 12,
            boxShadow: "inset 0 2px 0 #fff, inset 0 -2px 0 rgba(180,0,0,0.12)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            maxHeight: "60vh",
            overflowY: "auto",
          }}
        >
          {/* 주간 요약 */}
          <div style={{ display: "flex", gap: 8 }}>
            <div
              style={{
                flex: 1,
                background: "#fffbeb",
                borderRadius: 12,
                padding: "10px 12px",
                border: "1px solid #fde68a",
              }}
            >
              <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>
                이번 주 획득 코인
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#d97706" }}>
                🪙 {earnedCoins.toLocaleString()}
              </div>
              <div style={{ fontSize: 9, color: "#9ca3af" }}>
                / {totalCoins.toLocaleString()}
              </div>
            </div>
            <div
              style={{
                flex: 1,
                background: "#f5f3ff",
                borderRadius: 12,
                padding: "10px 12px",
                border: "1px solid #ddd6fe",
              }}
            >
              <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>
                미션 완료
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#7c3aed" }}>
                {
                  missions.filter(
                    (m) => (prog.missions?.[m.id]?.count || 0) >= m.goal
                  ).length
                }
                <span
                  style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400 }}
                >
                  {" "}
                  / {missions.length}
                </span>
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: daysLeft <= 1 ? "#ef4444" : "#9ca3af",
                }}
              >
                종료까지 {daysLeft}일
              </div>
            </div>
          </div>

          {allClaimed && (
            <div
              style={{
                background: "#f0fdf4",
                border: "1.5px solid #86efac",
                borderRadius: 12,
                padding: "12px 16px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>🎉</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#16a34a" }}>
                이번 주 미션 전부 완료!
              </div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>
                다음 주에 새로운 미션이 시작돼요
              </div>
            </div>
          )}

          {missions.map((m) => (
            <MissionCard
              key={m.id}
              mission={m}
              progress={prog.missions?.[m.id]}
              onClaim={handleClaim}
            />
          ))}

          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: "11px 14px",
              fontSize: 11,
              color: "#6b7280",
              lineHeight: 1.7,
            }}
          >
            💡 주간 미션은 매주 월요일 자정에 초기화돼요
            <br />
            💡 특수룰 게임과 일반 게임 모두 진행됩니다
          </div>

          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "11px 0",
              borderRadius: 28,
              border: "1.5px solid #e5e7eb",
              background: "#fff",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              color: "#6b7280",
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
