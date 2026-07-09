import { useState } from "react";
import {
  getAttendance,
  canCheckInToday,
  isStreakBroken,
  checkIn,
  DAY_REWARDS,
  type DayReward,
} from "../../lib/attendance";

interface Props {
  onClaim: (
    coins: number,
    bread: number,
    premiumBread: number,
    holoSeal: boolean
  ) => void;
  onClose: () => void;
}

const MEWTWO_IMG =
  "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/150.png";

export default function AttendanceModal({ onClaim, onClose }: Props) {
  const [data, setData] = useState(getAttendance);
  const [justClaimed, setClaimed] = useState(false);
  const [lastReward, setLastReward] = useState<DayReward | null>(null);

  const broken = isStreakBroken();
  const canDo = canCheckInToday() && !justClaimed;
  const streak = broken ? 0 : data.streak;
  const todayIdx = broken ? 0 : Math.min(streak, 6);
  const isDay7 = todayIdx === 6 && canDo;

  const handleCheckIn = () => {
    if (!canDo) return;
    const { data: nd, reward } = checkIn();
    setData(nd);
    setLastReward(reward);
    setClaimed(true);
    onClaim(reward.coins, reward.bread, reward.premiumBread, reward.holoSeal);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.78)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 600,
        fontFamily: "system-ui,sans-serif",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* ── 포켓덱스 외관 ── */}
      <div
        style={{
          width: Math.min(380, window.innerWidth - 32),
          background: "linear-gradient(160deg,#E8190A,#C01208)",
          borderRadius: 28,
          padding: 12,
          boxShadow:
            "0 16px 48px rgba(0,0,0,0.7),inset 0 2px 0 rgba(255,130,110,0.5),inset 0 -3px 0 rgba(0,0,0,0.35)",
          border: "3px solid #8B0000",
          animation: "atndSlideIn 0.3s ease",
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
            {(
              [
                { c: "#f87171", g: "#ef4444" },
                { c: "#fbbf24", g: "#f59e0b" },
                { c: "#4ade80", g: "#22c55e" },
              ] as const
            ).map(({ c, g }, i) => (
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
              ⚡ PokéSet
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
          <div style={{ padding: "10px 14px" }}>
            <div
              style={{
                color: "rgba(74,222,128,0.65)",
                fontSize: 9,
                fontFamily: "monospace",
                letterSpacing: 1,
                marginBottom: 3,
              }}
            >
              DAILY CHECK-IN
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 15 }}>
                📅 7일 출석 체크
              </div>
              {streak > 0 && !broken && (
                <div
                  style={{
                    background: "rgba(251,191,36,0.15)",
                    border: "1px solid rgba(251,191,36,0.4)",
                    borderRadius: 8,
                    padding: "2px 10px",
                  }}
                >
                  <span
                    style={{ color: "#fbbf24", fontSize: 11, fontWeight: 800 }}
                  >
                    🔥 {streak}일 연속
                  </span>
                </div>
              )}
              {broken && (
                <div
                  style={{
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.4)",
                    borderRadius: 8,
                    padding: "2px 10px",
                  }}
                >
                  <span
                    style={{ color: "#f87171", fontSize: 10, fontWeight: 700 }}
                  >
                    ⚠️ 스트릭 끊김
                  </span>
                </div>
              )}
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

        {/* ── 흰 패널 ── */}
        <div
          style={{
            background: "#FEFEFE",
            borderRadius: 20,
            padding: 12,
            boxShadow: "inset 0 2px 0 #fff,inset 0 -2px 0 rgba(180,0,0,0.12)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {/* 7일차 특별 예고 배너 */}
          {!data.claimed[6] && !justClaimed && (
            <div
              style={{
                borderRadius: 14,
                padding: "10px 13px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                border: "2px solid #ff0080",
                background: "linear-gradient(135deg,#fff0f8,#f0f8ff)",
                animation: "holoBorderLg 2s linear infinite",
                boxShadow: "0 3px 0 #fce7f3",
              }}
            >
              <div style={{ flexShrink: 0, position: "relative" }}>
                <img
                  src={MEWTWO_IMG}
                  alt="???"
                  style={{
                    width: 50,
                    height: 50,
                    objectFit: "contain",
                    animation:
                      "holoSilhouette 2s linear infinite,holoPulse2 2.4s ease-in-out infinite",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 12,
                    color: "rgba(255,255,255,0.9)",
                    textShadow: "0 0 6px #000",
                  }}
                >
                  ???
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 13,
                    color: "#1e1b4b",
                    marginBottom: 2,
                  }}
                >
                  🏆 7일 개근 특별 보상
                </div>
                <div
                  style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5 }}
                >
                  홀로 랜덤 띠부씰 1개 획득!
                  <br />
                  <span style={{ color: "#7c3aed", fontWeight: 600 }}>
                    7일 연속 출석하면 공개돼요 ✨
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 7칸 그리드 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7,1fr)",
              gap: 5,
            }}
          >
            {DAY_REWARDS.map((r, i) => {
              const isDone = data.claimed[i];
              const isToday = i === todayIdx && canDo;
              const isFuture = i > todayIdx && !isDone;

              return (
                <div
                  key={i}
                  style={{
                    borderRadius: 10,
                    padding: "6px 2px 5px",
                    textAlign: "center",
                    position: "relative",
                    opacity: isFuture ? 0.4 : 1,
                    border: isDone
                      ? "1.5px solid #bbf7d0"
                      : isToday
                      ? "1.5px solid #fbbf24"
                      : r.holoSeal
                      ? "1.5px solid #ff0080"
                      : r.premiumBread
                      ? "1.5px solid #fde68a"
                      : "1.5px solid #E5E7EB",
                    background: isDone
                      ? "#F0FDF4"
                      : isToday
                      ? "#FFFBEB"
                      : r.holoSeal
                      ? "#fff0f8"
                      : r.premiumBread
                      ? "#fffbeb"
                      : "#F9FAFB",
                    boxShadow: isDone
                      ? "0 3px 0 #bbf7d0"
                      : isToday
                      ? "0 3px 0 #fde68a"
                      : "0 3px 0 #e2e8f0",
                    transition: "all 0.2s",
                    animation:
                      r.holoSeal && !isDone
                        ? "holoBorderSm 2s linear infinite"
                        : undefined,
                  }}
                >
                  <div
                    style={{
                      fontSize: 8,
                      fontWeight: 800,
                      marginBottom: 3,
                      color: isDone
                        ? "#16a34a"
                        : isToday
                        ? "#D97706"
                        : r.holoSeal
                        ? "#db2777"
                        : r.premiumBread
                        ? "#D97706"
                        : "#9CA3AF",
                    }}
                  >
                    {i + 1}일
                  </div>
                  {r.holoSeal && !isDone ? (
                    <div
                      style={{
                        position: "relative",
                        width: 22,
                        height: 22,
                        margin: "0 auto",
                      }}
                    >
                      <img
                        src={MEWTWO_IMG}
                        alt="???"
                        style={{
                          width: 22,
                          height: 22,
                          objectFit: "contain",
                          animation:
                            "holoSilhouette 2s linear infinite,holoShake 3s ease-in-out infinite",
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ fontSize: 14 }}>{r.emoji}</div>
                  )}
                  <div
                    style={{
                      fontSize: 8,
                      fontWeight: 700,
                      marginTop: 3,
                      lineHeight: 1.2,
                      color: isDone
                        ? "#374151"
                        : r.holoSeal
                        ? "#db2777"
                        : r.premiumBread
                        ? "#D97706"
                        : "#6B7280",
                    }}
                  >
                    {r.holoSeal
                      ? "홀로씰"
                      : r.premiumBread
                      ? "피카빵"
                      : r.coins}
                  </div>
                  {isDone && (
                    <div
                      style={{
                        position: "absolute",
                        top: -7,
                        right: -7,
                        width: 16,
                        height: 16,
                        background: "#22c55e",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 9,
                        fontWeight: 900,
                        color: "#fff",
                        animation: "atndCheck 0.3s ease",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 오늘의 보상 안내 */}
          {canDo && !isDay7 && (
            <div
              style={{
                background: "#FFFBEB",
                border: "1.5px solid #FCD34D",
                borderRadius: 12,
                padding: "10px 14px",
                textAlign: "center",
                boxShadow: "0 3px 0 #fde68a",
              }}
            >
              <div
                style={{
                  color: "#D97706",
                  fontWeight: 700,
                  fontSize: 11,
                  marginBottom: 3,
                }}
              >
                오늘의 보상 ({todayIdx + 1}일차)
              </div>
              <div style={{ fontWeight: 900, fontSize: 20, color: "#374151" }}>
                {DAY_REWARDS[todayIdx].emoji} {DAY_REWARDS[todayIdx].label}
              </div>
            </div>
          )}

          {/* 7일차 보상 카드 */}
          {isDay7 && (
            <div
              style={{
                borderRadius: 14,
                padding: "12px 14px",
                textAlign: "center",
                border: "2px solid #ff0080",
                background: "linear-gradient(135deg,#fff0f8,#f0f8ff)",
                animation: "holoBorderLg 2s linear infinite",
              }}
            >
              <div
                style={{
                  color: "#db2777",
                  fontWeight: 800,
                  fontSize: 12,
                  marginBottom: 8,
                }}
              >
                🏆 7일 개근 달성! 오늘의 보상
              </div>
              <div
                style={{
                  position: "relative",
                  width: 72,
                  height: 72,
                  margin: "0 auto 8px",
                }}
              >
                <img
                  src={MEWTWO_IMG}
                  alt="???"
                  style={{
                    width: 72,
                    height: 72,
                    objectFit: "contain",
                    animation:
                      "holoSilhouette 2s linear infinite,holoPulse2 2s ease-in-out infinite",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 16,
                    color: "#fff",
                    textShadow: "0 0 8px #000",
                  }}
                >
                  ???
                </div>
              </div>
              <div style={{ fontWeight: 900, fontSize: 16, color: "#1e1b4b" }}>
                ✨ 홀로 랜덤 띠부씰 1개
              </div>
              <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>
                출석하면 정체가 공개돼요!
              </div>
            </div>
          )}

          {/* 수령 완료 */}
          {justClaimed && lastReward && (
            <div
              style={{
                borderRadius: 12,
                padding: "11px 14px",
                textAlign: "center",
                border: lastReward.holoSeal
                  ? "2px solid #ff0080"
                  : "1.5px solid #bbf7d0",
                background: lastReward.holoSeal
                  ? "linear-gradient(135deg,#fff0f8,#f0f8ff)"
                  : "#F0FDF4",
                boxShadow: lastReward.holoSeal ? undefined : "0 3px 0 #bbf7d0",
                animation: lastReward.holoSeal
                  ? "atndSlideIn 0.3s ease,holoBorderLg 2s linear infinite"
                  : "atndSlideIn 0.3s ease",
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 12,
                  marginBottom: 6,
                  color: lastReward.holoSeal ? "#db2777" : "#16a34a",
                }}
              >
                ✅ 출석 완료!
              </div>
              {lastReward.holoSeal && (
                <img
                  src={MEWTWO_IMG}
                  style={{
                    width: 56,
                    height: 56,
                    objectFit: "contain",
                    animation: "holoSilhouette 2s linear infinite",
                  }}
                  alt=""
                />
              )}
              <div style={{ fontWeight: 900, fontSize: 18, color: "#374151" }}>
                {lastReward.emoji} {lastReward.label} 획득!
              </div>
              {lastReward.holoSeal && (
                <div
                  style={{
                    color: "#7c3aed",
                    fontSize: 11,
                    marginTop: 5,
                    fontWeight: 600,
                  }}
                >
                  씰 도감에서 확인해보세요 ✨
                </div>
              )}
              {lastReward.premiumBread > 0 && (
                <div
                  style={{
                    color: "#D97706",
                    fontSize: 11,
                    marginTop: 4,
                    fontWeight: 600,
                  }}
                >
                  포켓몬 빵 구매에서 사용할 수 있어요 🍞
                </div>
              )}
            </div>
          )}

          {/* 이미 출석함 */}
          {!canCheckInToday() && !justClaimed && (
            <div
              style={{
                background: "#F9FAFB",
                borderRadius: 12,
                padding: "11px 14px",
                textAlign: "center",
                border: "1.5px solid #E5E7EB",
                boxShadow: "0 3px 0 #e2e8f0",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>
                오늘은 이미 출석했어요 🎉
              </div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 3 }}>
                내일 다시 오면 {streak < 7 ? `${streak + 1}일차` : "새 사이클"}{" "}
                보상을 받아요!
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div style={{ display: "flex", gap: 8 }}>
            {canDo && (
              <button
                onClick={handleCheckIn}
                style={{
                  flex: 1,
                  padding: "13px 0",
                  borderRadius: 28,
                  border: isDay7 ? "2px solid #7c3aed" : "2px solid #15803d",
                  background: isDay7
                    ? "linear-gradient(135deg,#a855f7,#7c3aed)"
                    : "linear-gradient(160deg,#4ade80,#22c55e 40%,#16a34a)",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 15,
                  cursor: "pointer",
                  boxShadow: isDay7
                    ? "0 4px 0 #5b21b6,0 8px 24px rgba(124,58,237,0.35)"
                    : "0 4px 0 #166534,0 8px 24px rgba(22,163,74,0.35)",
                  animation: "atndGlow 1.6s ease-in-out infinite",
                }}
              >
                {isDay7 ? "✨ 씰 받기!" : "📅 출석하기"}
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "13px 0",
                borderRadius: 28,
                border: "1.5px solid #E5E7EB",
                background: "#fff",
                fontWeight: 700,
                fontSize: 14,
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

      <style>{`
        @keyframes scanLine        { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes atndSlideIn     { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
        @keyframes atndCheck       { from{transform:scale(0);opacity:0} 60%{transform:scale(1.3)} to{transform:scale(1);opacity:1} }
        @keyframes atndGlow        { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.08)} }
        @keyframes holoSilhouette  {
          0%  {filter:brightness(0) drop-shadow(0 0 7px #ff0080);}
          16% {filter:brightness(0) drop-shadow(0 0 9px #ff6600);}
          33% {filter:brightness(0) drop-shadow(0 0 9px #ffd700);}
          50% {filter:brightness(0) drop-shadow(0 0 9px #00cc44);}
          66% {filter:brightness(0) drop-shadow(0 0 9px #00aaff);}
          83% {filter:brightness(0) drop-shadow(0 0 9px #8844ff);}
          100%{filter:brightness(0) drop-shadow(0 0 7px #ff0080);}
        }
        @keyframes holoBorderLg {
          0%,100%{border-color:#ff0080;box-shadow:0 0 14px #ff008044,0 3px 0 #fce7f3;}
          16%    {border-color:#ff6600;box-shadow:0 0 14px #ff660044,0 3px 0 #fce7f3;}
          33%    {border-color:#ffd700;box-shadow:0 0 14px #ffd70044,0 3px 0 #fce7f3;}
          50%    {border-color:#00cc44;box-shadow:0 0 14px #00cc4444,0 3px 0 #fce7f3;}
          66%    {border-color:#00aaff;box-shadow:0 0 14px #00aaff44,0 3px 0 #fce7f3;}
          83%    {border-color:#8844ff;box-shadow:0 0 14px #8844ff44,0 3px 0 #fce7f3;}
        }
        @keyframes holoBorderSm {
          0%,100%{border-color:#ff0080} 16%{border-color:#ff6600}
          33%{border-color:#ffd700}     50%{border-color:#00cc44}
          66%{border-color:#00aaff}     83%{border-color:#8844ff}
        }
        @keyframes holoPulse2  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
        @keyframes holoShake   { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-2deg)} 75%{transform:rotate(2deg)} }
      `}</style>
    </div>
  );
}
