// src/screens/modals/AchievementModal.jsx
import { useState, useMemo } from "react";
import {
  ACHIEVEMENTS,
  loadAchStats,
  loadAchProgress,
  getCurrentStage,
  claimAchievement,
  getUnclaimedCount,
  findNewlyAchieved,
  markAchieved,
} from "../../lib/achievementLogic";
import { getAttendance } from "../../lib/attendance";

const CATEGORY_TABS = [
  { key: "all", label: "전체", icon: "🏅" },
  { key: "battle", label: "승리/전투", icon: "⚔️" },
  { key: "card", label: "세트/카드", icon: "🃏" },
  { key: "coin", label: "코인", icon: "💰" },
  { key: "social", label: "기타", icon: "👥" },
  { key: "bf", label: "특수룰", icon: "🏟️" },
  { key: "hidden", label: "히든", icon: "🔮" },
];

function AchievementCard({ ach, stats, prog, onClaim }) {
  const curStage = getCurrentStage(ach, stats);
  const claimed = prog[ach.id]?.claimed ?? -1;
  // achieved: prog에 저장된 단계 OR stat 기반 현재 단계 중 더 큰 것
  const achieved = Math.max(prog[ach.id]?.stage ?? -1, curStage);
  const isHidden = ach.hidden && achieved < 0;
  // 달성했지만 아직 수령 안 한 단계가 있으면 canClaim
  const canClaim = achieved > claimed;
  const nextStageIdx = claimed + 1;
  const curVal = ach.stat(stats);
  const nextThreshold =
    nextStageIdx < ach.stages.length
      ? ach.stages[nextStageIdx].threshold
      : null;
  const prevThreshold =
    nextStageIdx > 0 ? ach.stages[nextStageIdx - 1].threshold : 0;
  const ratio =
    nextThreshold !== null
      ? Math.min(
          1,
          Math.max(
            0,
            (curVal - prevThreshold) / (nextThreshold - prevThreshold)
          )
        )
      : 1;

  if (isHidden) {
    return (
      <div
        style={{
          background: "#1a1040",
          border: "1.5px solid rgba(139,92,246,0.3)",
          borderRadius: 14,
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            flexShrink: 0,
            background: "rgba(139,92,246,0.15)",
            border: "1px solid rgba(139,92,246,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            filter: "blur(4px)",
          }}
        >
          ❓
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              color: "rgba(255,255,255,0.4)",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            ???
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.2)",
              fontSize: 10,
              marginTop: 2,
            }}
          >
            숨겨진 업적이에요
          </div>
        </div>
        <div
          style={{
            fontSize: 9,
            color: "rgba(139,92,246,0.6)",
            fontWeight: 700,
            background: "rgba(139,92,246,0.1)",
            borderRadius: 99,
            padding: "2px 8px",
          }}
        >
          HIDDEN
        </div>
      </div>
    );
  }

  const allClaimed = claimed >= ach.stages.length - 1;

  return (
    <div
      style={{
        background: canClaim
          ? "linear-gradient(135deg,#fffbeb,#fef3c7)"
          : allClaimed
          ? "#f0fdf4"
          : "#fff",
        border: `1.5px solid ${
          canClaim ? "#fcd34d" : allClaimed ? "#86efac" : "#e5e7eb"
        }`,
        borderRadius: 14,
        padding: "12px 14px",
        boxShadow: canClaim
          ? "0 3px 0 #fde68a"
          : allClaimed
          ? "0 3px 0 #bbf7d0"
          : "0 2px 0 #e2e8f0",
        animation: canClaim ? "achPulse 2s ease-in-out infinite" : undefined,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* 아이콘 */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            flexShrink: 0,
            background: allClaimed
              ? "#22c55e"
              : canClaim
              ? "#f59e0b"
              : curStage >= 0
              ? "#6366f1"
              : "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            boxShadow: canClaim ? "0 0 12px rgba(245,158,11,0.4)" : "none",
          }}
        >
          {allClaimed ? "✅" : ach.icon}
        </div>

        {/* 정보 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontWeight: 800,
                fontSize: 14,
                color: allClaimed ? "#15803d" : "#111827",
              }}
            >
              {ach.name}
            </span>
            {ach.stages.length > 1 && !allClaimed && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#9ca3af",
                  background: "#f3f4f6",
                  borderRadius: 99,
                  padding: "2px 7px",
                  flexShrink: 0,
                }}
              >
                Lv.{nextStageIdx + 1}/{ach.stages.length}
              </span>
            )}
            {ach.hidden && (
              <span
                style={{
                  fontSize: 9,
                  background: "#7c3aed",
                  color: "#fff",
                  borderRadius: 99,
                  padding: "1px 6px",
                  fontWeight: 700,
                }}
              >
                HIDDEN
              </span>
            )}
            {canClaim && (
              <span
                style={{
                  fontSize: 9,
                  background: "#f59e0b",
                  color: "#fff",
                  borderRadius: 99,
                  padding: "1px 6px",
                  fontWeight: 700,
                }}
              >
                수령 가능!
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              marginBottom: 6,
            }}
          >
            {ach.desc}
          </div>

          {!allClaimed && nextStageIdx < ach.stages.length && (
            <div style={{ marginTop: 4 }}>
              {/* 진행 바 */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    flex: 1,
                    height: 6,
                    background: "#f3f4f6",
                    borderRadius: 99,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.round(ratio * 100)}%`,
                      background:
                        ratio >= 1
                          ? "#f59e0b"
                          : "linear-gradient(90deg,#6366f1,#8b5cf6)",
                      borderRadius: 99,
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#6b7280",
                    flexShrink: 0,
                  }}
                >
                  {curVal.toLocaleString()}/
                  {nextThreshold !== null
                    ? nextThreshold.toLocaleString()
                    : "완료"}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    color: "#d97706",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    flexShrink: 0,
                  }}
                >
                  <span>🪙</span>
                  <span>
                    {ach.stages[nextStageIdx].coins?.toLocaleString() ?? 0}
                  </span>
                  {ach.stages[nextStageIdx].title && (
                    <span style={{ color: "#6366f1" }}>+ 칭호</span>
                  )}
                  {ach.stages[nextStageIdx].seal && (
                    <span style={{ color: "#16a34a" }}>+ 씰</span>
                  )}
                </span>
              </div>
            </div>
          )}
          {allClaimed && (
            <span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a" }}>
              ✅ 모든 단계 완료!
            </span>
          )}
        </div>

        {/* 수령 버튼 */}
        {canClaim && (
          <button
            onClick={() => onClaim(ach, claimed + 1)}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg,#f59e0b,#d97706)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 12,
              cursor: "pointer",
              flexShrink: 0,
              boxShadow: "0 3px 0 #92400e",
              whiteSpace: "nowrap",
            }}
          >
            받기 →
          </button>
        )}
      </div>
    </div>
  );
}

export default function AchievementModal({ onClose, onClaimReward, myCoins }) {
  const [tab, setTab] = useState("all");
  const [refreshTick, setRefreshTick] = useState(0); // 카운터 값을 deps에 직접 사용

  // ── stats: 모달 열릴 때 + 수동 갱신마다 재계산 ──
  const stats = useMemo(() => {
    const s = loadAchStats();
    // 씰 도감 실시간 반영
    try {
      const dex = JSON.parse(localStorage.getItem("pokeset_sealdex") || "{}");
      s.sealCount = Object.values(dex).filter((v) => v?.count > 0).length;
    } catch {}
    // 출석 연속 실시간 반영
    try {
      s.attendanceStreak = getAttendance().streak || 0;
    } catch {}
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTick]); // refreshTick 값이 바뀔 때마다 재계산

  // ── prog: 매번 신선하게 로드 ──
  const prog = useMemo(() => {
    // stats 기준으로 achieve 상태 먼저 동기화
    try {
      const newly = findNewlyAchieved(stats);
      if (newly.length > 0) markAchieved(newly);
    } catch {}
    return loadAchProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats, refreshTick]);

  const filtered = useMemo(
    () =>
      tab === "all"
        ? ACHIEVEMENTS
        : ACHIEVEMENTS.filter((a) => a.category === tab),
    [tab]
  );

  const totalUnclaimed = useMemo(() => {
    // prog 기반으로 직접 계산 (캐시 없이)
    let count = 0;
    for (const ach of ACHIEVEMENTS) {
      const p = prog[ach.id];
      if (!p) continue;
      if ((p.stage ?? -1) > (p.claimed ?? -1)) count++;
    }
    return count;
  }, [prog]);

  const handleClaim = (ach, stageIdx) => {
    const stage = ach.stages[stageIdx];
    const ok = claimAchievement(ach.id, stageIdx);
    if (!ok) return;
    setRefreshTick((n) => n + 1); // claim 후 즉시 전체 갱신
    onClaimReward({
      coins: stage.coins || 0,
      seal: stage.seal || false,
      title: stage.title || null,
      achName: ach.name,
    });
  };

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
          width: Math.min(480, window.innerWidth - 32),
          maxHeight: "90vh",
          background: "linear-gradient(160deg,#E8190A,#C01208)",
          borderRadius: 28,
          padding: 12,
          boxShadow:
            "0 16px 48px rgba(0,0,0,0.7),inset 0 2px 0 rgba(255,130,110,0.5)",
          border: "3px solid #8B0000",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 포켓덱스 상단 바 */}
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
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {totalUnclaimed > 0 && (
              <div
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 11,
                  borderRadius: 99,
                  padding: "2px 8px",
                  boxShadow: "0 2px 8px rgba(239,68,68,0.5)",
                }}
              >
                {totalUnclaimed}개 수령 가능
              </div>
            )}
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
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* 스크린 (제목) */}
        <div
          style={{
            background: "#0a0f1a",
            borderRadius: 12,
            border: "5px solid #fff",
            boxShadow: "0 0 0 2px #bbb, inset 0 2px 10px rgba(0,0,0,0.9)",
            overflow: "hidden",
            marginBottom: 10,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              height: 2,
              background:
                "linear-gradient(90deg,transparent,rgba(74,222,128,0.2),transparent)",
              animation: "achScanLine 2.5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 22 }}>🏅</span>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  color: "rgba(74,222,128,0.65)",
                  fontSize: 8,
                  fontFamily: "monospace",
                  letterSpacing: 1,
                  marginBottom: 3,
                }}
              >
                POKÉSET SYSTEM
              </div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>
                업적
              </div>
              {totalUnclaimed > 0 && (
                <div
                  style={{
                    fontSize: 10,
                    color: "#fbbf24",
                    marginTop: 3,
                    fontWeight: 700,
                  }}
                >
                  🎁 {totalUnclaimed}개 수령 가능!
                </div>
              )}
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

        {/* 카테고리 탭 */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 10,
            overflowX: "auto",
            paddingBottom: 2,
            flexShrink: 0,
          }}
        >
          {CATEGORY_TABS.map(({ key, label, icon }) => {
            const count =
              key === "all"
                ? ACHIEVEMENTS.filter((a) => {
                    const p = prog[a.id];
                    return p && (p.stage ?? -1) > (p.claimed ?? -1);
                  }).length
                : ACHIEVEMENTS.filter(
                    (a) =>
                      a.category === key &&
                      prog[a.id] &&
                      (prog[a.id].stage ?? -1) > (prog[a.id].claimed ?? -1)
                  ).length;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  flexShrink: 0,
                  padding: "7px 10px",
                  borderRadius: 20,
                  border:
                    tab === key
                      ? "2px solid #16a34a"
                      : "1.5px solid rgba(255,255,255,0.2)",
                  background: tab === key ? "#F0FDF4" : "rgba(255,255,255,0.1)",
                  color: tab === key ? "#15803d" : "rgba(255,255,255,0.8)",
                  fontWeight: 700,
                  fontSize: 10,
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                {icon} {label}
                {count > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      background: "#ef4444",
                      color: "#fff",
                      fontSize: 8,
                      fontWeight: 900,
                      borderRadius: "50%",
                      width: 14,
                      height: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 업적 목록 */}
        <div
          style={{
            background: "#FEFEFE",
            borderRadius: 16,
            padding: 10,
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 7,
          }}
        >
          {filtered.length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: "#9ca3af",
                padding: 20,
                fontSize: 13,
              }}
            >
              업적이 없어요
            </div>
          )}
          {filtered.map((ach) => (
            <AchievementCard
              key={ach.id}
              ach={ach}
              stats={stats}
              prog={prog}
              onClaim={handleClaim}
            />
          ))}
        </div>

        {/* 하단 안내 */}
        <div
          style={{
            textAlign: "center",
            color: "rgba(255,255,255,0.4)",
            fontSize: 10,
            marginTop: 8,
          }}
        >
          달성 조건을 충족하면 받기 버튼이 활성화돼요
        </div>
      </div>

      <style>{`
        @keyframes achPulse    { 0%,100%{box-shadow:0 3px 0 #fde68a} 50%{box-shadow:0 3px 0 #fde68a,0 0 12px rgba(245,158,11,0.3)} }
        @keyframes achScanLine { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
      `}</style>
    </div>
  );
}
