import { useState, useEffect, useMemo } from "react";
import {
  loadTournamentData,
  getSeasonDaysLeft,
  getSeasonGrade,
  ROUND_CONFIGS,
  TOTAL_ROUNDS,
  TICKET_COST,
  DAILY_MAX_WINS,
} from "../../lib/tournamentLogic";
import PokeModalShell from "../../components/PokeModalShell";

const COST = TICKET_COST ?? 1000;
const EPIC_POKES = [
  { id: 150 },
  { id: 149 },
  { id: 130 },
  { id: 6 },
  { id: 144 },
  { id: 145 },
  { id: 146 },
];

function SilhouetteHero({ pokeId }) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 120,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: "conic-gradient(#ff80ab,#a0f4ff,#b0ffb0,#ffd700,#ff80ab)",
          animation: "trSpin 3s linear infinite",
          filter: "blur(18px)",
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 120,
          height: 120,
          borderRadius: "50%",
          border: "2px solid rgba(160,244,255,0.35)",
          animation: "trPulseRing 2s ease-in-out infinite",
        }}
      />
      <img
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeId}.png`}
        alt=""
        style={{
          width: 110,
          height: 110,
          objectFit: "contain",
          position: "relative",
          zIndex: 2,
          filter:
            "brightness(0) drop-shadow(0 0 12px rgba(160,244,255,0.9)) drop-shadow(0 0 28px rgba(99,102,241,0.7))",
          animation: "trFloat 2.5s ease-in-out infinite",
        }}
      />
      {[
        { l: "8%", t: "18%", d: "0s", c: "#ffd700" },
        { l: "85%", t: "16%", d: "0.5s", c: "#a0f4ff" },
        { l: "18%", t: "74%", d: "0.3s", c: "#ffb0ff" },
        { l: "80%", t: "70%", d: "0.7s", c: "#b0ffb0" },
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
            boxShadow: `0 0 6px ${p.c}`,
            clipPath:
              "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
            animation: `trSparkle ${0.7 + i * 0.15}s ease-in-out infinite`,
            animationDelay: p.d,
          }}
        />
      ))}
    </div>
  );
}

export default function TournamentModal({
  myCoins,
  onClose,
  onStartRound,
  onBuyTicket,
  onClaimReward,
  winW,
}) {
  const [data, setData] = useState(() => loadTournamentData());
  useEffect(() => {
    const id = setInterval(() => setData(loadTournamentData()), 2000);
    return () => clearInterval(id);
  }, []);

  const epicPoke = useMemo(
    () => EPIC_POKES[Math.floor(Math.random() * EPIC_POKES.length)],
    []
  );
  const {
    currentRound,
    freeUsed,
    ticketActive,
    todayResult,
    dailyWins = 0,
  } = data;
  const MAX = DAILY_MAX_WINS ?? 3;
  const isChampion = todayResult === "win" && currentRound === 0;
  const inProgress = currentRound > 0;
  const canFree = !freeUsed && !inProgress;
  const needTicket = freeUsed && !inProgress;
  const dailyMaxed = dailyWins >= MAX;
  const canAfford = myCoins >= COST;
  const currentConfig =
    ROUND_CONFIGS[Math.max(0, (currentRound > 0 ? currentRound : 1) - 1)];

  return (
    <PokeModalShell
      onClose={onClose}
      title="이로치 토너먼트"
      titleIcon="✨"
      screenColor="rgba(139,92,246,0.8)"
      winW={winW}
      zIndex={1100}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {/* 오늘 도전 현황 */}
        <div
          style={{
            background: "#f8fafc",
            borderRadius: 12,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "1px solid #e5e7eb",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>🏆</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#111827" }}>
                오늘 우승
              </div>
              <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 1 }}>
                매일 자정 초기화
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {Array.from({ length: MAX }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  border: `2px solid ${i < dailyWins ? "#6366F1" : "#e5e7eb"}`,
                  background:
                    i < dailyWins
                      ? "linear-gradient(135deg,#6366F1,#a0f4ff)"
                      : "#f9fafb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                }}
              >
                {i < dailyWins ? "✓" : ""}
              </div>
            ))}
            <div
              style={{
                marginLeft: 4,
                fontSize: 13,
                fontWeight: 900,
                color: dailyMaxed ? "#6366F1" : "#111827",
              }}
            >
              {dailyWins}
              <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 400 }}>
                /{MAX}
              </span>
            </div>
          </div>
        </div>

        {/* 챔피언 메시지 */}
        {isChampion && (
          <div
            style={{
              background: "linear-gradient(135deg,#eef2ff,#f0fdf4)",
              border: "1px solid #a5b4fc",
              borderRadius: 12,
              padding: "10px 14px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 18, marginBottom: 3 }}>🏆</div>
            <div style={{ color: "#4338ca", fontWeight: 900, fontSize: 13 }}>
              오늘의 챔피언!
            </div>
            <div style={{ color: "#6b7280", fontSize: 10, marginTop: 1 }}>
              이로치 씰을 획득했어요
            </div>
          </div>
        )}

        {/* 패배 메시지 */}
        {needTicket && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 12,
              padding: "9px 12px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 18 }}>💥</span>
            <div>
              <div style={{ color: "#dc2626", fontWeight: 800, fontSize: 12 }}>
                탈락!
              </div>
              <div style={{ color: "#9ca3af", fontSize: 10, marginTop: 1 }}>
                티켓 구매 후 1라운드부터 재도전
              </div>
            </div>
          </div>
        )}

        {/* 이로치 씰 히어로 */}
        <div
          onClick={isChampion && onClaimReward ? onClaimReward : undefined}
          style={{
            background: "linear-gradient(135deg,#1e1b4b,#312e81)",
            border:
              isChampion && onClaimReward
                ? "2px solid rgba(255,215,0,0.8)"
                : "1px solid rgba(139,92,246,0.3)",
            borderRadius: 16,
            padding: "12px 12px 8px",
            overflow: "hidden",
            position: "relative",
            cursor: isChampion && onClaimReward ? "pointer" : "default",
            animation:
              isChampion && onClaimReward
                ? "trHeroGlow 1.5s ease-in-out infinite"
                : "none",
          }}
        >
          <SilhouetteHero pokeId={epicPoke.id} />
          <div
            style={{
              textAlign: "center",
              marginTop: 2,
              position: "relative",
              zIndex: 3,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 900, color: "#a0f4ff" }}>
              ✨ 이로치 씰 획득
            </div>
            {isChampion && onClaimReward ? (
              <div
                style={{
                  fontSize: 12,
                  color: "#ffd700",
                  marginTop: 5,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <span>🎁</span>
                <span>탭하여 보상 받기!</span>
                <span>🎁</span>
              </div>
            ) : (
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.35)",
                  marginTop: 2,
                }}
              >
                3라운드 제패 보상 · 1세대 랜덤 1마리
              </div>
            )}
          </div>
        </div>

        {/* 라운드 진행 */}
        <div
          style={{
            background: "#f8fafc",
            borderRadius: 12,
            padding: "11px 10px 9px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              fontSize: 9,
              color: "#9ca3af",
              marginBottom: 9,
              letterSpacing: 1,
            }}
          >
            라운드 진행
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            {ROUND_CONFIGS.map((cfg, i) => {
              const done = currentRound > cfg.round || isChampion;
              const active = currentRound === cfg.round && ticketActive;
              return (
                <div
                  key={cfg.round}
                  style={{ display: "flex", alignItems: "center", flex: 1 }}
                >
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background: done
                          ? "linear-gradient(135deg,#10B981,#059669)"
                          : active
                          ? `linear-gradient(135deg,${cfg.color},${cfg.color}bb)`
                          : "#f1f5f9",
                        border: active
                          ? `2px solid ${cfg.color}`
                          : "2px solid transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 17,
                        boxShadow: active ? `0 0 14px ${cfg.color}55` : "none",
                      }}
                    >
                      {done ? "✓" : active ? cfg.emoji : "🔒"}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: done
                          ? "#10B981"
                          : active
                          ? "#374151"
                          : "#9ca3af",
                        fontWeight: active ? 800 : 600,
                      }}
                    >
                      {cfg.name}
                    </div>
                  </div>
                  {i < TOTAL_ROUNDS - 1 && (
                    <div
                      style={{
                        width: 20,
                        height: 2,
                        background: done ? "#10B981" : "#e5e7eb",
                        flexShrink: 0,
                        marginBottom: 22,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 액션 버튼 */}
        {canFree && !dailyMaxed && (
          <button
            onClick={() => {
              const c = ROUND_CONFIGS[0];
              onStartRound(1, c.leagueId);
            }}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 50,
              border: "none",
              background: "linear-gradient(135deg,#6366F1,#4338CA)",
              color: "#fff",
              fontWeight: 900,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: "0 5px 0 #312e81, 0 8px 18px rgba(99,102,241,0.4)",
            }}
          >
            ⚡ 무료 도전하기!
          </button>
        )}
        {inProgress && (
          <button
            onClick={() => {
              const c = ROUND_CONFIGS[currentRound - 1];
              onStartRound(currentRound, c.leagueId);
            }}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 50,
              border: "none",
              background: `linear-gradient(135deg,${currentConfig.color},${currentConfig.color}bb)`,
              color: "#fff",
              fontWeight: 900,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: `0 5px 0 ${currentConfig.color}88`,
            }}
          >
            {currentConfig.emoji} {currentConfig.name} 계속하기!
          </button>
        )}
        {needTicket && !dailyMaxed && canAfford && (
          <button
            onClick={onBuyTicket}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 50,
              border: "none",
              background: "linear-gradient(135deg,#F59E0B,#D97706)",
              color: "#fff",
              fontWeight: 900,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: "0 5px 0 #92400E",
            }}
          >
            {isChampion ? "🔄 한 번 더 도전!" : "🎫 티켓 구매 · 재도전"}{" "}
            <span style={{ fontSize: 11, opacity: 0.7 }}>
              (-{COST.toLocaleString()}코인)
            </span>
          </button>
        )}
        {needTicket && !dailyMaxed && !canAfford && (
          <div
            style={{
              padding: "12px 0",
              borderRadius: 50,
              textAlign: "center",
              background: "#f8fafc",
              color: "#9ca3af",
              fontWeight: 700,
              fontSize: 13,
              border: "1px solid #e5e7eb",
            }}
          >
            코인 부족 (티켓 {COST.toLocaleString()}코인 필요)
          </div>
        )}
        {dailyMaxed && !inProgress && (
          <div
            style={{
              padding: "14px 0",
              borderRadius: 50,
              textAlign: "center",
              background: "#f8fafc",
              border: "1px solid #e5e7eb",
              color: "#9ca3af",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            🌙 오늘 {MAX}회 모두 완료 · 내일 다시 도전!
          </div>
        )}
      </div>

      <style>{`
        @keyframes trSpin      { to { transform: rotate(360deg); } }
        @keyframes trFloat     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes trPulseRing { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.06)} }
        @keyframes trSparkle   { 0%,100%{transform:scale(0) rotate(0deg);opacity:0} 50%{transform:scale(1) rotate(180deg);opacity:1} }
        @keyframes trHeroGlow  { 0%,100%{box-shadow:0 0 12px rgba(255,215,0,0.3);border-color:rgba(255,215,0,0.5)} 50%{box-shadow:0 0 28px rgba(255,215,0,0.7);border-color:rgba(255,215,0,1)} }
      `}</style>
    </PokeModalShell>
  );
}
