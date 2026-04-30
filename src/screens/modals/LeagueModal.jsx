import { useState } from "react";
import { LEAGUES } from "../../lib/constants";
import { loadLeagueCards } from "../../lib/assets";
import { GYM_BADGES, getUnlockedBadges } from "../../lib/titleLogic";

const art = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

const POKEMON_STYLE = {
  hoenn: { right: -55 },
};

const BG_POKEMON = {
  kanto: 151,
  johto: 249,
  hoenn: 383,
  sinnoh: 483,
  unova: 643,
  kalos: 716,
  alola: 791,
  galar: 888,
};

const THEME = {
  kanto: { bg: "linear-gradient(135deg,#052e16,#15803d)", tier: "입문자" },
  johto: { bg: "linear-gradient(135deg,#1e3a8a,#1d4ed8)", tier: "중급자" },
  hoenn: { bg: "linear-gradient(135deg,#7c2d12,#ea580c)", tier: "상급자" },
  sinnoh: { bg: "linear-gradient(135deg,#3b0764,#7c3aed)", tier: "전문가" },
  unova: { bg: "linear-gradient(135deg,#831843,#db2777)", tier: "마스터" },
  kalos: { bg: "linear-gradient(135deg,#0c4a6e,#0891b2)", tier: "엘리트" },
  alola: { bg: "linear-gradient(135deg,#78350f,#d97706)", tier: "레전드" },
  galar: { bg: "linear-gradient(135deg,#7f1d1d,#dc2626)", tier: "챔피언" },
};

function getNextTargetBadge(regionId, wins) {
  const reg = GYM_BADGES[regionId];
  if (!reg?.badges?.length) return null;
  const unlockedSet = getUnlockedBadges(wins)[regionId] ?? new Set();
  const next = reg.badges.find((b) => !unlockedSet.has(b.key));
  return next ?? reg.badges[reg.badges.length - 1];
}

function getBadgeProgress(regionId, wins) {
  const reg = GYM_BADGES[regionId];
  if (!reg) return null;
  const current = wins[reg.winType] ?? 0;
  const unlockedSet = getUnlockedBadges(wins)[regionId] ?? new Set();
  const nextBadge = reg.badges.find((b) => !unlockedSet.has(b.key));
  if (!nextBadge) return null;

  const idx = reg.badges.indexOf(nextBadge);
  const prevThreshold = idx > 0 ? reg.badges[idx - 1].threshold : 0;
  const remaining = nextBadge.threshold - current;
  const progress = Math.min(
    100,
    ((current - prevThreshold) / (nextBadge.threshold - prevThreshold)) * 100
  );

  return { current, remaining, nextBadge, progress };
}

function Chip({ icon, label, bg, border, color }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 99,
        padding: "4px 10px",
      }}
    >
      <span style={{ fontSize: 11 }}>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: 800, color }}>{label}</span>
    </div>
  );
}

export default function LeagueModal({ coins, onSelect, onClose, wins = {} }) {
  const [loading, setLoading] = useState(null);

  const go = async (lg) => {
    if (coins < lg.minCoins) return;
    if (coins < lg.bet) return;
    setLoading(lg.id);
    let imgs = null;
    if (lg.cardPrefix) imgs = await loadLeagueCards(lg.cardPrefix, lg.fileMap);
    setLoading(null);
    onSelect(lg, imgs);
  };

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
          animation: "lgPop 0.25s ease",
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
              ⚡ 리그 선택
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                background: "rgba(0,0,0,0.3)",
                borderRadius: 10,
                padding: "4px 10px",
                border: "1px solid rgba(255,208,60,0.35)",
              }}
            >
              <span
                style={{
                  color: "#fbbf24",
                  fontWeight: 900,
                  fontSize: 12,
                  fontFamily: "monospace",
                }}
              >
                💰 {coins.toLocaleString()}
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
          <div style={{ padding: "8px 14px" }}>
            <div
              style={{
                color: "rgba(74,222,128,0.65)",
                fontSize: 9,
                fontFamily: "monospace",
                letterSpacing: 1,
                marginBottom: 1,
              }}
            >
              LEAGUE SELECT
            </div>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: 14 }}>
              🏆 도전할 리그를 선택하세요
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
            padding: 10,
            boxShadow: "inset 0 2px 0 #fff,inset 0 -2px 0 rgba(180,0,0,0.12)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              maxHeight: "62vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {LEAGUES.map((lg) => {
              const ok = coins >= lg.minCoins && coins >= lg.bet;
              const isLoad = loading === lg.id;
              const bgPokeId = BG_POKEMON[lg.id];
              const theme = THEME[lg.id] || {
                bg: "linear-gradient(135deg,#374151,#4b5563)",
                tier: "",
              };
              const topBg = ok
                ? theme.bg
                : "linear-gradient(135deg,#374151,#4b5563)";
              const badge = getNextTargetBadge(lg.id, wins);
              const prog = getBadgeProgress(lg.id, wins);

              return (
                <div
                  key={lg.id}
                  onClick={() => ok && !loading && go(lg)}
                  style={{
                    borderRadius: 14,
                    overflow: "hidden",
                    boxShadow: ok
                      ? "0 4px 20px rgba(0,0,0,0.18)"
                      : "0 2px 8px rgba(0,0,0,0.08)",
                    cursor: ok && !loading ? "pointer" : "not-allowed",
                    opacity: ok ? 1 : 0.55,
                    transition: "transform 0.15s,box-shadow 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (ok && !loading) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 28px rgba(0,0,0,0.22)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow = ok
                      ? "0 4px 20px rgba(0,0,0,0.18)"
                      : "0 2px 8px rgba(0,0,0,0.08)";
                  }}
                >
                  <div
                    style={{
                      background: topBg,
                      padding: "14px 16px 13px",
                      position: "relative",
                      overflow: "hidden",
                      minHeight: 82,
                    }}
                  >
                    {bgPokeId && (
                      <img
                        src={art(bgPokeId)}
                        alt=""
                        style={{
                          position: "absolute",
                          right: POKEMON_STYLE[lg.id]?.right ?? -18,
                          top: POKEMON_STYLE[lg.id]?.top ?? -32,
                          width: POKEMON_STYLE[lg.id]?.width ?? 210,
                          objectFit: "contain",
                          opacity: ok ? 0.72 : 0.18,
                          filter: ok
                            ? "drop-shadow(0 4px 16px rgba(0,0,0,0.45))"
                            : "grayscale(1) opacity(0.25)",
                          transform:
                            lg.id === "hoenn" ? "scaleX(-1)" : undefined,
                          pointerEvents: "none",
                          userSelect: "none",
                        }}
                      />
                    )}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "radial-gradient(ellipse at 75% 50%,rgba(255,255,255,0.07),transparent 65%)",
                        pointerEvents: "none",
                      }}
                    />

                    <div
                      style={{
                        position: "relative",
                        zIndex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div style={{ flexShrink: 0, textAlign: "center" }}>
                        <div
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            border: "2px solid rgba(255,255,255,0.6)",
                            boxShadow: "0 0 10px rgba(255,255,255,0.25)",
                          }}
                        >
                          {badge?.img ? (
                            <img
                              src={badge.img}
                              alt={badge.label}
                              style={{
                                width: 40,
                                height: 40,
                                objectFit: "contain",
                                filter: ok
                                  ? "drop-shadow(0 1px 4px rgba(0,0,0,0.35))"
                                  : "grayscale(1) opacity(0.5)",
                              }}
                            />
                          ) : badge?.emoji ? (
                            <span style={{ fontSize: 28 }}>{badge.emoji}</span>
                          ) : (
                            <span style={{ fontSize: 26 }}>{lg.emoji}</span>
                          )}
                        </div>
                        {badge && (
                          <div
                            style={{
                              marginTop: 3,
                              fontSize: 8,
                              color: "rgba(255,255,255,0.75)",
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {badge.label}
                          </div>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: prog ? 6 : 5,
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              color: "#fff",
                              fontWeight: 900,
                              fontSize: 17,
                              textShadow: "0 1px 6px rgba(0,0,0,0.4)",
                            }}
                          >
                            {lg.name}
                          </span>
                          {theme.tier && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 800,
                                color: "rgba(255,255,255,0.95)",
                                background: "rgba(255,255,255,0.2)",
                                border: "1px solid rgba(255,255,255,0.3)",
                                borderRadius: 99,
                                padding: "2px 9px",
                              }}
                            >
                              {theme.tier}
                            </span>
                          )}
                        </div>

                        {prog ? (
                          <div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 3,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 9,
                                  color: "rgba(255,255,255,0.7)",
                                  fontWeight: 700,
                                }}
                              >
                                🏅 다음 뱃지까지
                              </span>
                              <span
                                style={{
                                  fontSize: 10,
                                  color: "#fff",
                                  fontWeight: 900,
                                  fontFamily: "monospace",
                                }}
                              >
                                {prog.current} / {prog.nextBadge.threshold}승
                                &nbsp;
                                <span style={{ color: "#fbbf24" }}>
                                  ({prog.remaining}승 남음)
                                </span>
                              </span>
                            </div>
                            <div
                              style={{
                                height: 5,
                                borderRadius: 99,
                                background: "rgba(0,0,0,0.3)",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  width: `${prog.progress}%`,
                                  borderRadius: 99,
                                  background:
                                    "linear-gradient(90deg,#4ade80,#22c55e)",
                                  transition: "width 0.4s ease",
                                }}
                              />
                            </div>
                          </div>
                        ) : GYM_BADGES[lg.id] ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <div
                              style={{
                                height: 5,
                                flex: 1,
                                borderRadius: 99,
                                background: "rgba(0,0,0,0.3)",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  width: "100%",
                                  borderRadius: 99,
                                  background:
                                    "linear-gradient(90deg,#fbbf24,#f59e0b)",
                                }}
                              />
                            </div>
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 800,
                                color: "#fbbf24",
                                whiteSpace: "nowrap",
                              }}
                            >
                              🏆 뱃지 전부 획득!
                            </span>
                          </div>
                        ) : (
                          lg.minCoins > 0 && (
                            <span
                              style={{
                                fontSize: 10,
                                color: "rgba(255,255,255,0.65)",
                              }}
                            >
                              {lg.minCoins.toLocaleString()}코인 이상 보유시
                              참여 가능
                            </span>
                          )
                        )}
                      </div>

                      {isLoad ? (
                        <div
                          style={{
                            fontSize: 20,
                            animation: "spin 0.8s linear infinite",
                            flexShrink: 0,
                          }}
                        >
                          ⚙️
                        </div>
                      ) : ok ? (
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            flexShrink: 0,
                            background: "rgba(255,255,255,0.22)",
                            border: "1.5px solid rgba(255,255,255,0.35)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                          }}
                        >
                          <span
                            style={{
                              color: "#fff",
                              fontSize: 14,
                              fontWeight: 900,
                            }}
                          >
                            ▶
                          </span>
                        </div>
                      ) : (
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            flexShrink: 0,
                            background: "rgba(0,0,0,0.25)",
                            border: "1.5px solid rgba(255,255,255,0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 16,
                          }}
                        >
                          🔒
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#fff",
                      padding: "9px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      flexWrap: "wrap",
                      borderTop: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <Chip
                      icon="🪙"
                      label={`배팅금 ${lg.bet}`}
                      bg="#FFFBEB"
                      border="#FDE68A"
                      color="#D97706"
                    />
                    <Chip
                      icon="🏆"
                      label={`승리시 ${lg.bet * 4}`}
                      bg="#F0FDF4"
                      border="#BBF7D0"
                      color="#16a34a"
                    />
                    <Chip
                      icon="⚡"
                      label={`더블배팅 ${lg.sdAmount}`}
                      bg="#FEF2F2"
                      border="#FECACA"
                      color="#DC2626"
                    />
                    {!ok && (
                      <div
                        style={{
                          marginLeft: "auto",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          background: "#FEF2F2",
                          border: "1px solid #FECACA",
                          borderRadius: 99,
                          padding: "3px 10px",
                        }}
                      >
                        <span style={{ fontSize: 11 }}>💔</span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            color: "#DC2626",
                          }}
                        >
                          {(
                            Math.max(lg.minCoins, lg.bet) - coins
                          ).toLocaleString()}{" "}
                          부족
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
        </div>
      </div>

      <style>{`
        @keyframes scanLine { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes lgPop    { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
        @keyframes spin     { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
