import { useState, useEffect, useRef } from "react";
import {
  StadiumBg,
  EmoteMedia,
  DiscardSlot,
  PlayerAvatar,
} from "../components/misc";
import { CardFace, CardBack } from "../components/CardFace";
import TrainerPortrait from "../components/TrainerPortrait";
import RulesModal from "./modals/RulesModal";
import { LEAGUES, GMAP, GAME_STYLES, SD_DEFAULT } from "../lib/constants";
import {
  findSets,
  isValidSet,
  getTeamOf,
  getTeamColor,
  getTeamEmoji,
  getTeammateIdx,
} from "../lib/gameLogic";
import { SHOP_ITEMS } from "../lib/constants";
import { TitleBadge, BadgeIcon } from "./modals/ProfileEditor";
import { WILD_RULES } from "../lib/wildRules";

// ── 승리 연출 ──────────────────────────────────────────────────────────────
function WinCinematic({ gs, myIdx, tImgs, images, onDone }) {
  const [phase, setPhase] = useState("intro");
  const winner = gs.players.find((p) => p.name === gs.winner);
  const isMyWin = gs.players[myIdx]?.name === gs.winner;
  const winnerSets =
    findSets(winner?.hand || [], gs.wildRule === "4set" ? 4 : 3) || [];
  const confetti = Array.from({ length: 32 }).map((_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    delay: Math.random() * 0.8,
    color: ["#FBBF24", "#4ADE80", "#60A5FA", "#F87171", "#A78BFA", "#FB923C"][
      i % 6
    ],
    size: 6 + Math.random() * 8,
  }));

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("cards"), 1800);
    const t2 = setTimeout(() => {
      setPhase("done");
      onDone();
    }, 6800);
    const handleClick = () => {
      setPhase("done");
      onDone();
    };
    window.addEventListener("click", handleClick);
    window.addEventListener("touchstart", handleClick);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("touchstart", handleClick);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.88)",
        fontFamily: "system-ui,sans-serif",
        overflow: "hidden",
      }}
    >
      {isMyWin &&
        confetti.map((c) => (
          <div
            key={c.id}
            style={{
              position: "absolute",
              left: c.x + "%",
              top: "-10px",
              width: c.size,
              height: c.size,
              borderRadius: "50%",
              background: c.color,
              animation: `confettiFall 1.8s ease-in ${c.delay}s forwards`,
              boxShadow: `0 0 6px ${c.color}`,
            }}
          />
        ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: isMyWin
            ? "radial-gradient(ellipse at center,rgba(74,222,128,0.15) 0%,transparent 70%)"
            : "radial-gradient(ellipse at center,rgba(239,68,68,0.15) 0%,transparent 70%)",
          animation: "glowPulse 1.5s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          fontSize: 42,
          fontWeight: 900,
          color: isMyWin ? "#4ADE80" : "#F87171",
          letterSpacing: 4,
          textShadow: isMyWin
            ? "0 0 40px rgba(74,222,128,0.8)"
            : "0 0 40px rgba(239,68,68,0.8)",
          animation: "popIn 0.4s ease forwards",
          marginBottom: 24,
        }}
      >
        {isMyWin ? "🏆 승리!" : `💀 ${winner?.name?.replace(" (AI)", "")} 승리`}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          marginBottom: 28,
          animation: "popIn 0.5s ease forwards",
        }}
      >
        <div
          style={{
            width: 100,
            height: 110,
            borderRadius: 20,
            overflow: "hidden",
            border: "3px solid #FBBF24",
            boxShadow:
              "0 0 32px rgba(251,191,36,0.7),0 0 60px rgba(251,191,36,0.3)",
            background: "#1a1a2e",
          }}
        >
          <TrainerPortrait
            name={winner?.portraitName || winner?.name?.replace(" (AI)", "")}
            size={96}
            tImgs={tImgs}
          />
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 11,
              color: "#FBBF24",
              fontWeight: 800,
              marginBottom: 3,
              letterSpacing: 2,
            }}
          >
            🏆 승자
          </div>
          <div style={{ fontSize: 16, color: "#fff", fontWeight: 900 }}>
            {winner?.name?.replace(" (AI)", "")}
          </div>
        </div>
      </div>
      {phase === "cards" && winnerSets.length > 0 && (
        <div
          style={{ animation: "popIn 0.4s ease forwards", textAlign: "center" }}
        >
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.6)",
              fontWeight: 700,
              marginBottom: 8,
              letterSpacing: 2,
            }}
          >
            완성된 세트
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {winnerSets.map((setCards, si) => (
              <div
                key={si}
                style={{
                  display: "flex",
                  gap: 4,
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: "8px 10px",
                  border: "1.5px solid rgba(251,191,36,0.4)",
                  animation: `popIn 0.3s ease ${si * 0.15}s both`,
                }}
              >
                {setCards.map((card) => (
                  <div
                    key={card.id}
                    style={{
                      animation: `cardShine 0.6s ease ${si * 0.15}s both`,
                    }}
                  >
                    <CardFace card={card} images={images} w={44} h={60} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      <div
        style={{ marginTop: 24, color: "rgba(255,255,255,0.3)", fontSize: 11 }}
      >
        잠시 후 결과창으로 이동합니다...
      </div>
      <style>{`
        @keyframes confettiFall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}
        @keyframes cardShine{0%{filter:brightness(1);transform:scale(1)}50%{filter:brightness(1.8) drop-shadow(0 0 8px #FBBF24);transform:scale(1.08)}100%{filter:brightness(1);transform:scale(1)}}
        @keyframes glowPulse{0%,100%{opacity:0.8}50%{opacity:1.2}}
      `}</style>
    </div>
  );
}

function HandReveal({ gs, images, tImgs, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(2,5,15,0.92)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 250,
        fontFamily: "system-ui,sans-serif",
        gap: 16,
        padding: 12,
      }}
    >
      <div
        style={{
          color: "#FBBF24",
          fontWeight: 900,
          fontSize: 20,
          letterSpacing: 2,
        }}
      >
        🃏 모든 플레이어 손패
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          justifyContent: "center",
          maxWidth: 720,
          overflowY: "auto",
          maxHeight: "70vh",
        }}
      >
        {gs.players.map((p, i) => {
          const isWinner = p.name === gs.winner;
          const pSets = findSets(p.hand, gs.wildRule === "4set" ? 4 : 3) || [];
          return (
            <div
              key={i}
              style={{
                background: isWinner
                  ? "rgba(251,191,36,0.15)"
                  : "rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: "14px 16px",
                border:
                  "2px solid " +
                  (isWinner ? "#FBBF24" : "rgba(255,255,255,0.15)"),
                minWidth: 160,
                animation: "popIn 0.3s ease " + i * 0.08 + "s both",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      width: 34,
                      height: 38,
                      borderRadius: 7,
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    <TrainerPortrait
                      name={p.portraitName || p.name.replace(" (AI)", "")}
                      size={32}
                      tImgs={tImgs}
                    />
                  </div>
                  {p.profile?.badge && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: -3,
                        right: -3,
                        zIndex: 5,
                      }}
                    >
                      <BadgeIcon badge={p.profile.badge} size={12} />
                    </div>
                  )}
                </div>
                <div>
                  <div
                    style={{
                      color: isWinner ? "#FBBF24" : "#fff",
                      fontWeight: 800,
                      fontSize: 13,
                    }}
                  >
                    {p.profile?.title && (
                      <TitleBadge titleKey={p.profile.title} fontSize={9} />
                    )}
                    {p.name.replace(" (AI)", "") + (isWinner ? " 🏆" : "")}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}>
                    {"세트 " +
                      pSets.length +
                      "/" +
                      (gs.wildRule === "4set" ? "4" : "3")}
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 4,
                  justifyContent: "center",
                }}
              >
                {p.hand.map((card) => (
                  <CardFace
                    key={card.id}
                    card={card}
                    images={images}
                    w={40}
                    h={55}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <button
        onClick={onClose}
        style={{
          padding: "12px 36px",
          borderRadius: 40,
          border: "none",
          background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
          color: "#fff",
          fontWeight: 800,
          fontSize: 15,
          cursor: "pointer",
        }}
      >
        ✕ 닫기
      </button>
    </div>
  );
}

function WinModal({
  gs,
  myIdx,
  roomCode,
  isHost,
  images,
  tImgs,
  heartbeats,
  isMobile,
  waitingForNext,
  nextReadyMap,
  onNextGame,
  onReset,
  onHostForceStart,
  onSetShowHandReveal,
}) {
  const me = gs.players[myIdx];
  const curSd = gs.sdAmount || SD_DEFAULT;
  const isTeam = gs.teamMode;
  const winTeam = gs.winnerTeam;
  const myTeam = isTeam ? getTeamOf(myIdx, gs.teams) : null;
  const isMyWin = isTeam
    ? myTeam === winTeam
    : gs.players[myIdx]?.name === gs.winner;
  const sorted = [...gs.players].sort((a, b) => {
    if (a.name === gs.winner) return -1;
    if (b.name === gs.winner) return 1;
    return (gs.coins[b.name] || 0) - (gs.coins[a.name] || 0);
  });
  const sets = gs.players.find((p) => p.name === gs.winner)
    ? findSets(
        gs.players.find((p) => p.name === gs.winner).hand,
        gs.wildRule === "4set" ? 4 : 3
      )
    : null;
  const rankEmoji = ["🥇", "🥈", "🥉", "4️⃣"];
  const myCurrentCoins = gs.coins[me?.name] || 0;
  const canAffordNext = myCurrentCoins >= (gs.bet || 0);
  const isWaitingMulti = !!roomCode && !!waitingForNext;
  const humanPlayers = gs.players.filter((p) => !p.isAI);
  const myName = gs.players[myIdx]?.name;
  const otherHumans = humanPlayers.filter((p) => p.name !== myName);
  const allOthersReady =
    roomCode &&
    isHost &&
    otherHumans.length > 0 &&
    otherHumans.every((p) => !!nextReadyMap[p.name.replace(/[.#$[\]/]/g, "_")]);
  const showHostStartBtn = isWaitingMulti && allOthersReady;
  const nextBtnDisabled =
    (isWaitingMulti && !showHostStartBtn) || !canAffordNext;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: 12,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: 24,
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          maxWidth: 460,
          width: "100%",
          animation: "popIn 0.3s ease forwards",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            background: isMyWin
              ? "linear-gradient(135deg,#10B981,#059669)"
              : "linear-gradient(135deg,#EF4444,#DC2626)",
            borderRadius: 14,
            padding: "14px 0",
            marginBottom: 12,
          }}
        >
          <div style={{ color: "#fff", fontWeight: 900, fontSize: 26 }}>
            {isMyWin
              ? isTeam
                ? "🏆 " + winTeam + "팀 승리!"
                : "🏆 승리!"
              : isTeam
              ? "💀 " + winTeam + "팀 패배"
              : "💀 패배"}
          </div>
        </div>
        {/* 배틀프런티어 룰 표시 */}
        {gs.wildRule && WILD_RULES[gs.wildRule] && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: WILD_RULES[gs.wildRule].color + "15",
              border: "1px solid " + WILD_RULES[gs.wildRule].color + "40",
              borderRadius: 99,
              padding: "4px 12px",
              marginBottom: 10,
              fontSize: 12,
              fontWeight: 700,
              color: WILD_RULES[gs.wildRule].color,
            }}
          >
            {WILD_RULES[gs.wildRule].emoji} {WILD_RULES[gs.wildRule].name}
          </div>
        )}
        <div style={{ fontSize: 36, marginBottom: 2 }}>🏆</div>
        <h2
          style={{
            margin: "0 0 4px",
            fontSize: 22,
            fontWeight: 900,
            color: "#1e3a5f",
          }}
        >
          {(() => {
            const winner = gs.players.find((p) => p.name === gs.winner);
            return (
              <>
                {winner?.profile?.title && (
                  <TitleBadge titleKey={winner.profile.title} fontSize={14} />
                )}
                {gs.winner.replace(" (AI)", "")}
              </>
            );
          })()}
        </h2>
        {isTeam && winTeam && (
          <div
            style={{
              fontSize: 12,
              color: getTeamColor(winTeam),
              fontWeight: 800,
              marginBottom: 4,
            }}
          >
            {getTeamEmoji(winTeam)}
            {winTeam}팀 MVP
          </div>
        )}
        <div
          style={{
            background: "#FFF9C4",
            borderRadius: 10,
            padding: "8px 16px",
            marginBottom: 14,
            display: "inline-block",
            border: "1px solid #FCD34D",
          }}
        >
          {isTeam ? (
            gs.showdownUsed[gs.winner] ? (
              <span style={{ color: "#92400E", fontWeight: 900, fontSize: 14 }}>
                ⚡ 더블배팅 성공 → 팟×1.5 획득
              </span>
            ) : (
              <span style={{ color: "#92400E", fontWeight: 900, fontSize: 14 }}>
                💰 팟 {gs.pot}코인 → 승리자·팀원 분배
              </span>
            )
          ) : (
            (() => {
              const winnerDelta =
                (gs.coins[gs.winner] || 0) - (gs.preGameCoins[gs.winner] || 0);
              return gs.showdownUsed[gs.winner] ? (
                <span
                  style={{ color: "#92400E", fontWeight: 900, fontSize: 15 }}
                >
                  ⚡ 더블배팅 성공!{" "}
                  <span style={{ color: "#dc2626" }}>💰+{winnerDelta}</span>{" "}
                  획득!
                </span>
              ) : (
                <span
                  style={{ color: "#92400E", fontWeight: 900, fontSize: 15 }}
                >
                  💰 <span style={{ color: "#dc2626" }}>+{winnerDelta}</span>{" "}
                  획득!
                </span>
              );
            })()
          )}
        </div>
        {/* 보너스타임 표시 */}
        {gs.wildRule === "bonus" && (
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #86efac",
              borderRadius: 10,
              padding: "8px 16px",
              marginBottom: 12,
              fontSize: 12,
              fontWeight: 700,
              color: "#15803d",
            }}
          >
            🎁 보너스타임! 승자 +500, 패자 +200 코인 지급됐어요!
          </div>
        )}
        {!isTeam && (
          <div
            style={{
              background: "#f8f9ff",
              borderRadius: 14,
              padding: 12,
              marginBottom: 12,
              border: "1px solid #e0e7ff",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "#6366F1",
                letterSpacing: 2,
                marginBottom: 8,
              }}
            >
              💰 최종 코인
            </div>
            {sorted.map((p, i) => {
              const pre = gs.preGameCoins[p.name] || 0,
                final = gs.coins[p.name] || 0,
                delta = final - pre;
              const isW = p.name === gs.winner;
              return (
                <div
                  key={p.name}
                  style={{
                    marginBottom: 8,
                    borderRadius: 10,
                    background: isW ? "#fffbeb" : "#fff",
                    border: isW ? "1.5px solid #fcd34d" : "1px solid #f3f4f6",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                    }}
                  >
                    <span style={{ fontSize: 14, minWidth: 20 }}>
                      {rankEmoji[i]}
                    </span>
                    <div style={{ position: "relative" }}>
                      <div
                        style={{
                          width: 32,
                          height: 36,
                          borderRadius: 6,
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        <TrainerPortrait
                          name={p.portraitName || p.name.replace(" (AI)", "")}
                          size={30}
                          tImgs={tImgs}
                        />
                      </div>
                      {p.profile?.badge && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: -3,
                            right: -3,
                            zIndex: 5,
                          }}
                        >
                          <BadgeIcon badge={p.profile.badge} size={12} />
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>
                        {p.profile?.title && (
                          <TitleBadge
                            titleKey={p.profile.title}
                            fontSize={10}
                          />
                        )}
                        {p.name.replace(" (AI)", "")}
                        {p.isAI && (
                          <span style={{ color: "#9ca3af", fontSize: 10 }}>
                            {" "}
                            AI
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontWeight: 900,
                          fontSize: 15,
                          color: isW ? "#d97706" : "#374151",
                        }}
                      >
                        {final}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: delta >= 0 ? "#059669" : "#EF4444",
                        }}
                      >
                        {(delta >= 0 ? "+" : "") + delta}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {sets && (
          <div
            style={{
              marginBottom: 12,
              background: "#f8f9ff",
              borderRadius: 10,
              padding: 10,
              border: "1px solid #e0e7ff",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#6366F1",
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              완성된 세트
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {sets.map((setCards, si) => {
                const grp = setCards.find((c) => !c.isJoker);
                const g = grp ? GMAP[grp.group] : null;
                return (
                  <div
                    key={si}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "#fff",
                      borderRadius: 8,
                      padding: "6px 10px",
                      border: "1.5px solid " + (g?.color || "#ccc") + "33",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: g?.color || "#888",
                        minWidth: 32,
                      }}
                    >
                      {g ? g.emoji + g.label : "🌀"}
                    </span>
                    <div style={{ display: "flex", gap: 4 }}>
                      {setCards.map((c) => (
                        <CardFace
                          key={c.id}
                          card={c}
                          images={images}
                          w={42}
                          h={58}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {roomCode && humanPlayers.some((p) => !p.isAI) && (
          <div
            style={{
              background: "#f8faff",
              borderRadius: 10,
              padding: "8px 12px",
              marginBottom: 8,
              border: "1px solid #e0e7ff",
            }}
          >
            {humanPlayers
              .filter((p) => !p.isAI)
              .map((p) => {
                const sk = p.name.replace(/[.#$[\]/]/g, "_");
                const confirmed = !!nextReadyMap[sk];
                const disc =
                  p.id !== undefined &&
                  heartbeats[p.id] &&
                  Date.now() - heartbeats[p.id] > 12000;
                return (
                  <div
                    key={p.name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 12,
                      padding: "3px 0",
                      color: "#374151",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>
                      {p.name.replace(" (AI)", "")}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: disc
                          ? "#6B7280"
                          : confirmed
                          ? "#059669"
                          : "#F59E0B",
                      }}
                    >
                      {disc ? "🚪 나감" : confirmed ? "✅ 확인" : "⏳ 대기중"}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <button
            onClick={() => onSetShowHandReveal(true)}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 10,
              border: "2px solid #FBBF24",
              background: "#FFFBEB",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              color: "#92400E",
            }}
          >
            🃏 손패 확인
          </button>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {onNextGame && (
            <button
              onClick={
                showHostStartBtn && onHostForceStart
                  ? onHostForceStart
                  : !nextBtnDisabled
                  ? onNextGame
                  : undefined
              }
              disabled={nextBtnDisabled}
              style={{
                flex: 1,
                padding: "12px 0",
                borderRadius: 10,
                border: "none",
                background: showHostStartBtn
                  ? "linear-gradient(135deg,#6366F1,#4F46E5)"
                  : nextBtnDisabled
                  ? "rgba(160,160,160,0.25)"
                  : "linear-gradient(135deg,#10B981,#059669)",
                color: nextBtnDisabled ? "rgba(100,100,100,0.6)" : "#fff",
                fontWeight: 700,
                fontSize: 15,
                cursor: nextBtnDisabled ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              {showHostStartBtn
                ? "🎮 게임 시작!"
                : isWaitingMulti
                ? "⏳ 상대 확인 중..."
                : !canAffordNext
                ? "💸 코인 부족 → 로비로"
                : "🔄 다음 판"}
            </button>
          )}
          <button
            onClick={onReset}
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 10,
              border: "1px solid #D1D5DB",
              background: "#fff",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            🏠 메뉴로
          </button>
        </div>
        {!canAffordNext && !isWaitingMulti && (
          <div
            style={{
              marginTop: 10,
              padding: "8px 12px",
              borderRadius: 8,
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              fontSize: 12,
              color: "#DC2626",
              fontWeight: 600,
            }}
          >
            💸 코인이 부족해요. 로비에서 무료 충전 후 다시 도전하세요!
          </div>
        )}
        {isWaitingMulti && (
          <div
            style={{
              marginTop: 10,
              padding: "8px 12px",
              borderRadius: 8,
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              fontSize: 12,
              color: "#1D4ED8",
              fontWeight: 600,
            }}
          >
            {showHostStartBtn
              ? "모두 준비됐어요! 게임 시작을 눌러주세요."
              : "상대방이 결과를 확인하면 자동으로 다음 판이 시작돼요."}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GameScreen({
  gs,
  myIdx,
  roomCode,
  isHost,
  drawnCard,
  drawnKey,
  selId,
  discardingId,
  images,
  tImgs,
  gameBg,
  muted,
  activeEmotes,
  showEmotePicker,
  ownedEmotes,
  emoteLoadout,
  timeLeft,
  heartbeats,
  aiThinking,
  showdownAnim,
  showRules,
  showHandReveal,
  cardEffects,
  timerBarRef,
  leagueConfig,
  isMobile,
  winW,
  sc,
  onDrawDeck,
  onDrawDiscard,
  onDiscardById,
  onUseShowdown,
  onCardTap,
  onUseEmote,
  onToggleMute,
  onRerollAI,
  onSetShowRules,
  onSetShowEmotePicker,
  onSetShowHandReveal,
  onSetShowExitConfirm,
  onNextGame,
  onReset,
  setHighlight,
  onToggleHighlight,
  waitingForNext,
  nextReadyMap = {},
  onFreeCharge,
  onHostForceStart,
}) {
  const [showCinematic, setShowCinematic] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const prevWinnerRef = useRef(null);
  const [localShowdown, setLocalShowdown] = useState(null);
  // 세트 공개 룰: 세트 완성 시 해당 플레이어 패 공개
  const [setReveal, setSetReveal] = useState(null);
  const prevSetCountsRef = useRef({});

  useEffect(() => {
    if (showdownAnim) {
      setLocalShowdown(showdownAnim);
      const t = setTimeout(() => setLocalShowdown(null), 1500);
      return () => clearTimeout(t);
    }
  }, [showdownAnim]);

  useEffect(() => {
    if (gs?.winner && gs.winner !== prevWinnerRef.current) {
      prevWinnerRef.current = gs.winner;
      setShowCinematic(true);
      setShowWinModal(false);
    }
    if (!gs?.winner) {
      prevWinnerRef.current = null;
      setShowCinematic(false);
      setShowWinModal(false);
    }
  }, [gs?.winner]);

  // 세트 공개 룰 감지
  useEffect(() => {
    if (!gs || gs.wildRule !== "reveal" || gs.winner) return;
    const maxSets = gs.wildRule === "4set" ? 4 : 3;
    gs.players.forEach((p) => {
      const cur = (findSets(p.hand, maxSets) || []).length;
      const prev = prevSetCountsRef.current[p.name] || 0;
      if (cur > prev && cur > 0) {
        setSetReveal({ player: p, sets: findSets(p.hand, maxSets) || [] });
        setTimeout(() => setSetReveal(null), 2500);
      }
      prevSetCountsRef.current[p.name] = cur;
    });
  }, [gs]);

  if (!gs || !gs.players || gs.players.length === 0) return null;

  const pavSz = Math.round(46 * sc);
  const bCW = Math.round(56 * sc),
    bCH = Math.round(76 * sc);
  const bGap = Math.max(4, Math.round(10 * sc)),
    bPad = Math.max(8, Math.round(14 * sc));
  const pavGap = Math.max(6, Math.round(14 * sc));
  const cW = isMobile ? Math.max(38, Math.floor((winW - 90) / 5) - 4) : 56;
  const cH = Math.round((cW * 76) / 56);

  const activeLg =
    LEAGUES.find((l) => l.id === (gs.leagueId || "kanto")) || LEAGUES[0];
  const curSd = gs.sdAmount || SD_DEFAULT;
  const isMyTurn = gs.cur === myIdx;
  const me = gs.players[myIdx];
  const n = gs.players.length;
  const right = gs.players[(myIdx + 1) % n] || null;
  const top = gs.players[(myIdx + 2) % n] || null;
  const left = gs.players[(myIdx + 3) % n] || null;

  const canSd =
    isMyTurn &&
    gs.phase === "discard" &&
    !gs.showdownUsed[me?.name] &&
    (gs.coins[me?.name] || 0) >= curSd;
  const isDisc = (p) =>
    roomCode &&
    !p.isAI &&
    p.id !== myIdx &&
    heartbeats[p.id] &&
    Date.now() - heartbeats[p.id] > 12000;

  const me_hand = gs.players[myIdx]?.hand || [];
  const maxSets = gs.wildRule === "4set" ? 4 : 3;
  const mySetCardIds = (() => {
    if (!setHighlight || !me_hand.length) return new Set();
    const sets = findSets(me_hand, maxSets);
    if (!sets?.length) return new Set();
    return new Set(
      sets
        .filter((set) => !set.some((c) => c.isJoker))
        .flat()
        .map((c) => c.id)
    );
  })();

  const myTeamId = gs.teamMode && gs.teams ? getTeamOf(myIdx, gs.teams) : null;
  const enemyTeam =
    gs.teamMode && myTeamId ? (myTeamId === "A" ? "B" : "A") : null;
  const dangerThreshold = gs.wildRule === "4set" ? 3 : 2;
  const enemyDanger =
    gs.teamMode && enemyTeam && gs.teams
      ? (gs.teams[enemyTeam] || []).some(
          (idx) =>
            gs.players[idx] &&
            (findSets(gs.players[idx].hand, maxSets) || []).length >=
              dangerThreshold
        )
      : false;

  let teammatePlayer = null;
  if (gs.teamMode && gs.teams && myTeamId) {
    const myTeamArr = gs.teams[myTeamId] || [];
    const tmIdx = myTeamArr.find((i) => i !== myIdx);
    if (tmIdx !== undefined) teammatePlayer = gs.players[tmIdx] || null;
  }
  const getTeammateSets = (player) =>
    player ? findSets(player.hand, maxSets) || [] : null;
  const teamProps = (player) => {
    if (!gs.teamMode || !player) return {};
    const tId = getTeamOf(player.id, gs.teams);
    const isTM = tId === myTeamId && player.id !== myIdx;
    return {
      teamId: tId,
      isTeammate: isTM,
      teammateSets: isTM ? getTeammateSets(player) : null,
    };
  };

  const handBorderColor = gs.teamMode
    ? myTeamId
      ? getTeamColor(myTeamId)
      : "#4ADE80"
    : isMyTurn
    ? "#4ADE80"
    : "#e5e7eb";
  const handPulseAnim = gs.teamMode
    ? myTeamId === "A"
      ? "teamAPulse 1.6s ease-in-out infinite"
      : "teamBPulse 1.6s ease-in-out infinite"
    : "handPulse 1.6s ease-in-out infinite";

  // 버림패 금지 룰
  const noDiscard = gs.wildRule === "no_discard";

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        background: gameBg
          ? `url(${gameBg}) center/cover no-repeat`
          : "#020508",
        fontFamily: "system-ui,sans-serif",
        display: "flex",
        flexDirection: "column",
        userSelect: "none",
        position: "relative",
      }}
    >
      <style>{GAME_STYLES}</style>
      <StadiumBg />

      {/* 파티클 */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 400,
        }}
      >
        {cardEffects.map((ef) => {
          const cnt = ef.type === "set" ? 16 : 6;
          const colors =
            ef.type === "draw"
              ? ["#4ADE80", "#86EFAC", "#fff"]
              : ef.type === "discard"
              ? ["#F87171", "#FCA5A5", "#fff"]
              : [
                  "#FBBF24",
                  "#FDE68A",
                  "#A78BFA",
                  "#60A5FA",
                  "#4ADE80",
                  "#F87171",
                  "#fff",
                  "#FB923C",
                ];
          return (
            <div key={ef.id}>
              {Array.from({ length: cnt }).map((_, i) => {
                const ang = (i / cnt) * 360,
                  dist =
                    ef.type === "set"
                      ? 80 + Math.random() * 50
                      : 35 + Math.random() * 25;
                const dx = Math.cos((ang * Math.PI) / 180) * dist,
                  dy = Math.sin((ang * Math.PI) / 180) * dist;
                const sz =
                    ef.type === "set"
                      ? 7 + Math.random() * 7
                      : 3 + Math.random() * 4,
                  col = colors[i % colors.length];
                return (
                  <div
                    key={i}
                    style={{
                      position: "fixed",
                      left: ef.x,
                      top: ef.y,
                      width: sz,
                      height: sz,
                      borderRadius: "50%",
                      background: col,
                      transform: "translate(-50%,-50%)",
                      animation: "particleBurst 0.8s ease-out forwards",
                      animationDelay: i * 20 + "ms",
                      "--dx": dx + "px",
                      "--dy": dy + "px",
                      boxShadow: ef.type === "set" ? "0 0 8px " + col : "none",
                    }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {showHandReveal && (
        <HandReveal
          gs={gs}
          images={images}
          tImgs={tImgs}
          onClose={() => onSetShowHandReveal(false)}
        />
      )}

      {localShowdown && (
        <div
          key={localShowdown?.key}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 350,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at center,rgba(220,30,30,0.55) 0%,rgba(0,0,0,0) 70%)",
              animation: "sdFlash 2s ease forwards",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "42%",
              left: "50%",
              textAlign: "center",
              animation: "sdReveal 2s ease forwards",
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: "#fff",
                lineHeight: 1,
                textShadow: "0 0 40px rgba(255,60,0,1)",
              }}
            >
              ⚡ 더블 배팅!
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "rgba(255,200,150,0.9)",
                marginTop: 8,
              }}
            >
              {localShowdown.name}
            </div>
          </div>
        </div>
      )}

      {showRules && (
        <RulesModal onClose={() => onSetShowRules(false)} sdAmt={curSd} />
      )}

      {/* 세트 공개 오버레이 */}
      {setReveal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 180,
            pointerEvents: "none",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: "0 0 220px",
          }}
        >
          <div
            style={{
              background: "rgba(6,182,212,0.12)",
              border: "1.5px solid rgba(6,182,212,0.5)",
              borderRadius: 14,
              padding: "10px 14px",
              animation: "popIn 0.3s ease",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#06b6d4",
                fontWeight: 800,
                marginBottom: 6,
              }}
            >
              👁️ 세트 공개 — {setReveal.player.name.replace(" (AI)", "")}
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {setReveal.sets.flat().map((card) => (
                <CardFace
                  key={card.id}
                  card={card}
                  images={images}
                  w={36}
                  h={50}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "6px 8px" : "8px 16px",
          background: "rgba(2,6,16,0.82)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(40,80,180,0.4)",
          position: "relative",
          zIndex: 10,
          minHeight: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 4 : 8,
          }}
        >
          <span
            style={{
              color: "#58a8ff",
              fontWeight: 900,
              fontSize: isMobile ? 12 : 15,
              fontFamily: "monospace",
            }}
          >
            {"⚡" + (isMobile ? "" : " POKÉSET")}
          </span>
          {gs.teamMode && (
            <span
              style={{
                background: "rgba(59,130,246,0.2)",
                border: "1px solid rgba(59,130,246,0.5)",
                borderRadius: 10,
                padding: "1px 7px",
                color: "#60A5FA",
                fontSize: isMobile ? 9 : 11,
                fontWeight: 800,
              }}
            >
              👥 팀배틀
            </span>
          )}
          <span
            style={{
              background: "rgba(99,102,241,0.2)",
              border: "1px solid " + activeLg.color + "55",
              borderRadius: 10,
              padding: "1px 7px",
              color: activeLg.color,
              fontSize: isMobile ? 9 : 11,
              fontWeight: 800,
            }}
          >
            {activeLg.emoji + " " + activeLg.name}
          </span>
          {/* 배틀프런티어 룰 뱃지 */}
          {gs.wildRule && WILD_RULES[gs.wildRule] && (
            <span
              style={{
                background: WILD_RULES[gs.wildRule].color + "22",
                border: "1px solid " + WILD_RULES[gs.wildRule].color + "55",
                borderRadius: 10,
                padding: "1px 7px",
                color: WILD_RULES[gs.wildRule].color,
                fontSize: isMobile ? 9 : 11,
                fontWeight: 800,
              }}
            >
              {WILD_RULES[gs.wildRule].emoji} {WILD_RULES[gs.wildRule].name}
            </span>
          )}
          <span
            style={{
              background: "rgba(255,208,60,0.18)",
              border: "1px solid rgba(255,208,60,0.5)",
              borderRadius: 12,
              padding: "2px 8px",
              color: "#ffd060",
              fontSize: isMobile ? 10 : 12,
              fontWeight: 800,
              fontFamily: "monospace",
            }}
          >
            {"💰판돈 " + gs.pot}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div
            style={{
              background: "rgba(4,12,30,0.9)",
              border:
                "1px solid " +
                (isMyTurn ? "rgba(74,222,128,0.6)" : "rgba(40,80,160,0.5)"),
              borderRadius: 20,
              padding: "3px 8px",
            }}
          >
            <span
              style={{
                color: isMyTurn ? "#4ADE80" : "#4a80c0",
                fontWeight: 700,
                fontSize: isMobile ? 9 : 11,
                fontFamily: "monospace",
              }}
            >
              {gs.winner
                ? gs.teamMode && gs.winnerTeam
                  ? "🏆 " + gs.winnerTeam + "팀 승!"
                  : "🏆 " + gs.winner.replace(" (AI)", "") + " 승!"
                : isMyTurn
                ? gs.phase === "draw"
                  ? "▶ 뽑기"
                  : "▶ 버리기"
                : gs.players[gs.cur]?.name.replace(" (AI)", "") + "의 차례"}
            </span>
          </div>
          <div
            style={{
              background: "rgba(0,0,0,0.6)",
              border:
                "2px solid " +
                (timeLeft <= 10
                  ? "#EF4444"
                  : timeLeft <= 20
                  ? "#F59E0B"
                  : "#4ADE80"),
              borderRadius: 20,
              padding: "3px 10px",
            }}
          >
            <span
              style={{
                color:
                  timeLeft <= 10
                    ? "#EF4444"
                    : timeLeft <= 20
                    ? "#F59E0B"
                    : "#4ADE80",
                fontWeight: 900,
                fontSize: isMobile ? 14 : 18,
                fontFamily: "monospace",
                minWidth: 22,
                textAlign: "center",
              }}
            >
              {timeLeft + "s"}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          {gs.teamMode && myTeamId && (
            <span
              style={{
                background: getTeamColor(myTeamId) + "33",
                border: "1px solid " + getTeamColor(myTeamId) + "88",
                borderRadius: 8,
                padding: "3px 7px",
                color: getTeamColor(myTeamId),
                fontSize: isMobile ? 9 : 11,
                fontWeight: 900,
              }}
            >
              {getTeamEmoji(myTeamId)}
              {myTeamId}팀
            </span>
          )}
          {enemyDanger && (
            <span
              style={{
                background: "#7f1d1d",
                border: "1px solid #ef4444",
                borderRadius: 8,
                padding: "3px 7px",
                color: "#fca5a5",
                fontSize: isMobile ? 9 : 11,
                fontWeight: 900,
                animation: "sdBtnPulse 1s ease-in-out infinite",
              }}
            >
              🚨 위험
            </span>
          )}
          <span
            style={{
              color: "#ffd060",
              fontWeight: 900,
              fontSize: isMobile ? 11 : 13,
              background: "rgba(255,208,60,0.12)",
              border: "1px solid rgba(255,208,60,0.4)",
              borderRadius: 8,
              padding: "3px 6px",
            }}
          >
            {"💰" + (gs.coins[me.name] || 0)}
          </span>
          {!roomCode && !isMobile && (
            <button
              onClick={onRerollAI}
              style={{
                padding: "3px 6px",
                borderRadius: 6,
                border: "1px solid rgba(255,160,60,0.5)",
                background: "rgba(40,20,0,0.7)",
                color: "#ffaa44",
                cursor: "pointer",
                fontSize: 10,
                fontWeight: 600,
              }}
            >
              🔀
            </button>
          )}
          <button
            onClick={onToggleHighlight}
            style={{
              padding: "3px 6px",
              borderRadius: 6,
              border: "1px solid rgba(251,191,36,0.5)",
              background: setHighlight
                ? "rgba(251,191,36,0.2)"
                : "rgba(4,12,30,0.8)",
              color: setHighlight ? "#FBBF24" : "rgba(255,255,255,0.3)",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            ✨
          </button>
          <button
            onClick={onToggleMute}
            style={{
              padding: "3px 6px",
              borderRadius: 6,
              border: "1px solid rgba(40,80,160,0.5)",
              background: "rgba(4,12,30,0.8)",
              color: "#7aacff",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <button
            onClick={() => onSetShowRules((p) => !p)}
            style={{
              padding: "3px 6px",
              borderRadius: 6,
              border: "1px solid rgba(40,80,160,0.5)",
              background: "rgba(4,12,30,0.8)",
              color: "#7aacff",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            ❓
          </button>
          <button
            onClick={() => onSetShowExitConfirm(true)}
            style={{
              padding: "3px 6px",
              borderRadius: 6,
              border: "1px solid rgba(239,68,68,0.5)",
              background: "rgba(60,0,0,0.7)",
              color: "#f87171",
              cursor: "pointer",
              fontSize: isMobile ? 10 : 11,
              fontWeight: 600,
            }}
          >
            나가기
          </button>
        </div>
      </div>

      {/* 보드 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "6px 4px " + (isMobile ? 165 : 205) + "px",
          gap: 6,
          position: "relative",
          zIndex: 5,
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        <div
          style={{ flexShrink: 0, display: "flex", justifyContent: "center" }}
        >
          {top ? (
            <PlayerAvatar
              player={top}
              active={gs.cur === top.id}
              tImgs={tImgs}
              coins={gs.coins[top.name]}
              thinking={aiThinking === top.id}
              sdUsed={gs.showdownUsed[top.name]}
              disconnected={isDisc(top)}
              emote={activeEmotes[top.id]}
              size={pavSz}
              timeLeft={gs.cur === top.id ? timeLeft : null}
              {...teamProps(top)}
            />
          ) : (
            <div style={{ height: pavSz + 30 }} />
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: pavGap,
          }}
        >
          {left ? (
            <PlayerAvatar
              player={left}
              active={gs.cur === left.id}
              tImgs={tImgs}
              coins={gs.coins[left.name]}
              thinking={aiThinking === left.id}
              sdUsed={gs.showdownUsed[left.name]}
              disconnected={isDisc(left)}
              emote={activeEmotes[left.id]}
              size={pavSz}
              timeLeft={gs.cur === left.id ? timeLeft : null}
              {...teamProps(left)}
            />
          ) : (
            <div style={{ width: pavSz + 20 }} />
          )}

          {/* 중앙 보드 */}
          <div
            style={{
              background: "rgba(4,14,36,0.72)",
              backdropFilter: "blur(14px)",
              borderRadius: 18,
              border: "1.5px solid rgba(50,100,220,0.45)",
              padding: bPad,
              display: "grid",
              gridTemplateColumns:
                bCW +
                Math.round(40 * sc) +
                "px " +
                (bCW + Math.round(28 * sc)) +
                "px " +
                (bCW + Math.round(40 * sc)) +
                "px",
              gridTemplateRows:
                bCH +
                Math.round(30 * sc) +
                "px " +
                (bCH + Math.round(20 * sc)) +
                "px " +
                (bCH + Math.round(30 * sc)) +
                "px",
              gap: bGap,
              boxShadow:
                "0 0 0 1px rgba(80,140,255,0.12),0 8px 40px rgba(0,0,0,0.7)",
            }}
          >
            <div />
            {/* 버림패 금지: 각 DiscardSlot을 감싸서 🚫 오버레이 */}
            <div style={{ position: "relative" }}>
              <DiscardSlot
                player={top}
                images={images}
                canTake={isMyTurn && gs.phase === "draw" && !!top && !noDiscard}
                onTake={() => top && onDrawDiscard(top.id)}
                cw={bCW}
                ch={bCH}
                dataTut="top-discard"
              />
              {noDiscard && top?.discardPile?.[0] && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 8,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                    pointerEvents: "none",
                  }}
                >
                  <span style={{ fontSize: 20 }}>🚫</span>
                </div>
              )}
            </div>
            <div />
            <div style={{ position: "relative" }}>
              <DiscardSlot
                player={left}
                images={images}
                canTake={
                  isMyTurn && gs.phase === "draw" && !!left && !noDiscard
                }
                onTake={() => left && onDrawDiscard(left.id)}
                cw={bCW}
                ch={bCH}
              />
              {noDiscard && left?.discardPile?.[0] && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 8,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                    pointerEvents: "none",
                  }}
                >
                  <span style={{ fontSize: 20 }}>🚫</span>
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                data-tut="deck"
                onClick={
                  isMyTurn && gs.phase === "draw" ? onDrawDeck : undefined
                }
                style={{
                  cursor:
                    isMyTurn && gs.phase === "draw" ? "pointer" : "default",
                  position: "relative",
                }}
              >
                {gs.deck.length > 0 ? (
                  <div
                    style={{
                      padding: 3,
                      borderRadius: 11,
                      background: "rgba(60,100,200,0.2)",
                      boxShadow: "0 0 0 1.5px rgba(80,140,255,0.4)",
                    }}
                  >
                    <CardBack w={bCW} h={bCH} />
                  </div>
                ) : (
                  <div
                    style={{
                      width: bCW,
                      height: bCH,
                      borderRadius: 8,
                      border: "2px dashed rgba(80,140,255,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "rgba(80,140,255,0.3)",
                      fontSize: 10,
                    }}
                  >
                    빈
                  </div>
                )}
                {gs.deck.length > 0 && isMyTurn && gs.phase === "draw" && (
                  <div
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "#4ADE80",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <span
                      style={{
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: 800,
                        lineHeight: 1,
                      }}
                    >
                      +
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <DiscardSlot
                player={right}
                images={images}
                canTake={
                  isMyTurn && gs.phase === "draw" && !!right && !noDiscard
                }
                onTake={() => right && onDrawDiscard(right.id)}
                cw={bCW}
                ch={bCH}
              />
              {noDiscard && right?.discardPile?.[0] && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 8,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                    pointerEvents: "none",
                  }}
                >
                  <span style={{ fontSize: 20 }}>🚫</span>
                </div>
              )}
            </div>
            <div />
            <DiscardSlot
              player={me}
              images={images}
              canTake={false}
              onTake={null}
              cw={bCW}
              ch={bCH}
            />
            <div />
          </div>

          {right ? (
            <PlayerAvatar
              player={right}
              active={gs.cur === right.id}
              tImgs={tImgs}
              coins={gs.coins[right.name]}
              thinking={aiThinking === right.id}
              sdUsed={gs.showdownUsed[right.name]}
              disconnected={isDisc(right)}
              emote={activeEmotes[right.id]}
              size={pavSz}
              timeLeft={gs.cur === right.id ? timeLeft : null}
              {...teamProps(right)}
            />
          ) : (
            <div style={{ width: pavSz + 20 }} />
          )}
        </div>

        {/* 하단 패널 */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            padding: "0 6px",
          }}
        >
          {!gs.winner && isMyTurn && (
            <div
              style={{
                width: "100%",
                maxWidth: 720,
                height: 8,
                background: "rgba(0,0,0,0.35)",
                borderRadius: 4,
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <div
                ref={timerBarRef}
                style={{
                  height: "100%",
                  width: "100%",
                  background: "#4ADE80",
                  borderRadius: 4,
                }}
              />
            </div>
          )}

          {gs.teamMode && teammatePlayer && (
            <div
              style={{
                width: "100%",
                maxWidth: 720,
                background: getTeamColor(myTeamId) + "18",
                border: "1.5px solid " + getTeamColor(myTeamId) + "55",
                borderRadius: 10,
                padding: "6px 10px",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  flexShrink: 0,
                }}
              >
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      width: 22,
                      height: 24,
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <TrainerPortrait
                      name={
                        teammatePlayer.portraitName ||
                        teammatePlayer.name.replace(" (AI)", "")
                      }
                      size={20}
                      tImgs={tImgs}
                    />
                  </div>
                  {teammatePlayer.profile?.badge && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: -3,
                        right: -3,
                        zIndex: 5,
                      }}
                    >
                      <BadgeIcon
                        badge={teammatePlayer.profile.badge}
                        size={10}
                      />
                    </div>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    color: getTeamColor(myTeamId),
                    whiteSpace: "nowrap",
                  }}
                >
                  {teammatePlayer.profile?.title && (
                    <TitleBadge
                      titleKey={teammatePlayer.profile.title}
                      fontSize={8}
                    />
                  )}
                  🤝 {teammatePlayer.name.replace(" (AI)", "")}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  flexWrap: "nowrap",
                  overflowX: "auto",
                  alignItems: "center",
                }}
              >
                {(teammatePlayer.hand || []).map((card) => {
                  const grp = card.isJoker ? null : GMAP[card.group];
                  return (
                    <div
                      key={card.id}
                      style={{
                        width: 36,
                        height: 50,
                        borderRadius: 6,
                        border: card.isJoker
                          ? "2px solid #a78bfa"
                          : "2px solid " + (grp?.color || "#ccc"),
                        background: card.isJoker
                          ? "#fdf4ff"
                          : grp?.bg || "#fff",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: 14,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      }}
                    >
                      <span>{card.isJoker ? "🌀" : grp?.emoji}</span>
                      {!card.isJoker && (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 800,
                            color: grp?.color,
                          }}
                        >
                          {card.type}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {gs.showdownUsed[teammatePlayer.name] && (
                <span
                  style={{
                    fontSize: 9,
                    background: "#dc2626",
                    color: "#fff",
                    borderRadius: 6,
                    padding: "1px 5px",
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  ⚔️ 선언중
                </span>
              )}
            </div>
          )}

          {/* 더블배팅 버튼 */}
          <div
            style={{
              width: "100%",
              maxWidth: 720,
              padding: "0 0 4px",
              flexShrink: 0,
            }}
          >
            {!gs.showdownUsed[me.name] ? (
              <button
                onClick={canSd ? onUseShowdown : undefined}
                style={{
                  width: "100%",
                  padding: isMobile ? "10px 0" : "13px 0",
                  border: "none",
                  borderRadius: 12,
                  background: canSd
                    ? "linear-gradient(135deg,#dc2626,#b91c1c)"
                    : "rgba(100,100,100,0.3)",
                  color: canSd ? "#fff" : "rgba(255,255,255,0.3)",
                  fontWeight: 900,
                  fontSize: isMobile ? 16 : 20,
                  cursor: canSd ? "pointer" : "not-allowed",
                  letterSpacing: 2,
                  animation: canSd
                    ? "sdBtnPulse 1.6s ease-in-out infinite"
                    : undefined,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                ⚡ 더블 배팅!
                <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.85 }}>
                  {isMobile
                    ? "이길 것 같을 때!"
                    : "팟을 1.5배로! · 배팅비용 -" +
                      curSd +
                      "코인" +
                      (gs.wildRule === "jackpot" ? " (잭팟: ×3)" : "")}
                </span>
              </button>
            ) : (
              <div
                style={{
                  width: "100%",
                  padding: "8px 0",
                  borderRadius: 12,
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  textAlign: "center",
                  color: "#fca5a5",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                ⚡ 더블 배팅 중 · 결과를 기다리세요
              </div>
            )}
          </div>

          {/* 내 패 */}
          <div
            style={{
              width: "100%",
              maxWidth: 720,
              background: "#ffffff",
              borderRadius: "14px 14px 0 0",
              padding: "10px " + (isMobile ? 8 : 16) + "px",
              border: "2px solid " + handBorderColor,
              borderBottom: "none",
              animation: isMyTurn ? handPulseAnim : undefined,
              transition: "border 0.3s",
              boxShadow: "0 -4px 20px rgba(0,0,0,0.3)",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <div
              style={{ position: "absolute", top: -48, right: 8, zIndex: 30 }}
            >
              <button
                onClick={() => onSetShowEmotePicker((p) => !p)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: "2px solid rgba(99,102,241,0.5)",
                  background: "rgba(4,12,30,0.9)",
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                😊
              </button>
              {showEmotePicker && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "110%",
                    right: 0,
                    background: "rgba(4,14,36,0.97)",
                    borderRadius: 14,
                    padding: 8,
                    border: "1px solid rgba(80,140,255,0.35)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                    zIndex: 50,
                  }}
                >
                  {emoteLoadout.length === 0 ? (
                    <div
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 11,
                        padding: "8px 12px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      가방에서 이모티콘을 장착하세요!
                    </div>
                  ) : ownedEmotes.length === 0 ? (
                    <div
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 11,
                        padding: "8px 12px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      상점에서 구매하세요!
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3,1fr)",
                        gap: 6,
                      }}
                    >
                      {ownedEmotes.map((e) => (
                        <button
                          key={e.id}
                          onClick={() => onUseEmote(e.id, e.imgUrl)}
                          title={e.name}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            border: "1px solid rgba(255,255,255,0.15)",
                            background: "rgba(255,255,255,0.08)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {e.imgUrl ? (
                            <EmoteMedia src={e.imgUrl} size={34} />
                          ) : (
                            <span style={{ fontSize: 22 }}>{e.emoji}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            {activeEmotes[myIdx] && (
              <div
                style={{
                  position: "absolute",
                  top: -60,
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 40,
                  animation: "emoteFloat 3s ease forwards",
                  pointerEvents: "none",
                }}
              >
                {typeof activeEmotes[myIdx] === "string" &&
                activeEmotes[myIdx].startsWith("http") ? (
                  <EmoteMedia src={activeEmotes[myIdx]} size={48} />
                ) : (
                  <span style={{ fontSize: 42 }}>{activeEmotes[myIdx]}</span>
                )}
              </div>
            )}
            {isMyTurn && (
              <div
                style={{
                  position: "absolute",
                  top: -14,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: gs.teamMode
                    ? myTeamId === "A"
                      ? "linear-gradient(135deg,#1D4ED8,#2563EB)"
                      : "linear-gradient(135deg,#B91C1C,#DC2626)"
                    : "linear-gradient(135deg,#16a34a,#15803d)",
                  border:
                    "2px solid " +
                    (gs.teamMode
                      ? myTeamId === "A"
                        ? "#3B82F6"
                        : "#EF4444"
                      : "#4ADE80"),
                  borderRadius: 20,
                  padding: "3px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  boxShadow:
                    "0 0 16px " +
                    (gs.teamMode
                      ? myTeamId === "A"
                        ? "rgba(59,130,246,0.5)"
                        : "rgba(239,68,68,0.5)"
                      : "rgba(74,222,128,0.5)"),
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: gs.teamMode
                      ? myTeamId === "A"
                        ? "#60A5FA"
                        : "#F87171"
                      : "#4ADE80",
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: isMobile ? 10 : 12,
                    letterSpacing: 1,
                  }}
                >
                  {gs.phase === "draw" ? "🃏 카드 뽑기" : "🗑️ 버릴 카드 선택"}
                </span>
              </div>
            )}
            {drawnCard && (
              <div
                key={drawnKey}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                  paddingBottom: 8,
                  borderBottom: "1px solid #f0f0f0",
                  animation: "cardSlideIn 0.3s ease",
                }}
              >
                <span
                  style={{
                    color: "#f59e0b",
                    fontSize: 11,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  DRAW
                </span>
                <div
                  data-tut="drawn-card"
                  onClick={(e) => {
                    if (gs.phase === "discard")
                      onCardTap(drawnCard.id, e.currentTarget);
                  }}
                >
                  <CardFace
                    card={drawnCard}
                    images={images}
                    selected={selId === drawnCard.id}
                    discarding={discardingId === drawnCard.id}
                    inSet={mySetCardIds.has(drawnCard.id)}
                    w={cW}
                    h={cH}
                  />
                </div>
                {!isMobile && (
                  <>
                    <div
                      style={{
                        width: 1,
                        height: cH,
                        background: "#e5e7eb",
                        margin: "0 2px",
                      }}
                    />
                    <span style={{ color: "#9ca3af", fontSize: 10 }}>HAND</span>
                  </>
                )}
              </div>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: isMobile ? 4 : 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: isMobile ? 4 : 6,
                  flexWrap: "wrap",
                  alignItems: "flex-end",
                  minHeight: cH,
                  flex: 1,
                }}
              >
                {(gs.players[myIdx]?.hand || []).map((card, i) => {
                  const nonSetCards = (gs.players[myIdx]?.hand || []).filter(
                    (c) => !mySetCardIds.has(c.id)
                  );
                  const isDiscardTarget = nonSetCards[0]?.id === card.id;
                  return (
                    <div
                      key={card.id}
                      data-tut={i === 0 ? "hand-card" : undefined}
                      data-tut-discard={isDiscardTarget ? "true" : undefined}
                      style={{
                        animation:
                          "dealStagger 0.2s ease " + i * 0.04 + "s both",
                        position: "relative",
                        zIndex: mySetCardIds.has(card.id) ? 2 : 1,
                      }}
                      onClick={(e) => {
                        if (gs.phase === "discard")
                          onCardTap(card.id, e.currentTarget);
                      }}
                    >
                      {mySetCardIds.has(card.id) && (
                        <div
                          style={{
                            position: "absolute",
                            inset: -2,
                            borderRadius: 11,
                            border: "2px solid rgba(251,191,36,0.7)",
                            boxShadow: "0 0 6px 1px rgba(251,191,36,0.3)",
                            zIndex: 3,
                            pointerEvents: "none",
                          }}
                        />
                      )}
                      <CardFace
                        card={card}
                        images={images}
                        selected={selId === card.id}
                        discarding={discardingId === card.id}
                        inSet={mySetCardIds.has(card.id)}
                        w={cW}
                        h={cH}
                      />
                    </div>
                  );
                })}
              </div>
              {gs.phase === "discard" && isMyTurn && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: isMobile ? 52 : 68,
                    height: cH,
                    gap: 4,
                    flexShrink: 0,
                  }}
                >
                  <button
                    onClick={(e) =>
                      selId && onDiscardById(selId, e.currentTarget)
                    }
                    disabled={!selId}
                    style={{
                      width: isMobile ? 48 : 64,
                      height: isMobile ? 48 : 64,
                      borderRadius: 12,
                      border: "none",
                      background: selId
                        ? "linear-gradient(135deg,#ef4444,#b91c1c)"
                        : "rgba(150,150,150,0.18)",
                      color: selId ? "#fff" : "rgba(180,180,180,0.5)",
                      fontWeight: 900,
                      fontSize: 12,
                      cursor: selId ? "pointer" : "not-allowed",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                      animation: selId
                        ? "discardBtnPulse 1.4s ease-in-out infinite"
                        : undefined,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>🗑️</span>
                    <span style={{ fontSize: 9 }}>버리기</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCinematic && (
        <WinCinematic
          gs={gs}
          myIdx={myIdx}
          tImgs={tImgs}
          images={images}
          onDone={() => {
            setShowCinematic(false);
            setShowWinModal(true);
          }}
        />
      )}
      {!showCinematic && showWinModal && gs.winner && (
        <WinModal
          gs={gs}
          myIdx={myIdx}
          roomCode={roomCode}
          isHost={isHost}
          images={images}
          tImgs={tImgs}
          heartbeats={heartbeats}
          isMobile={isMobile}
          waitingForNext={waitingForNext}
          nextReadyMap={nextReadyMap}
          onNextGame={onNextGame}
          onReset={onReset}
          onHostForceStart={onHostForceStart}
          onSetShowHandReveal={onSetShowHandReveal}
        />
      )}
    </div>
  );
}
