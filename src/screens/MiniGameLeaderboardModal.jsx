// src/screens/MiniGameLeaderboardModal.jsx
import { useState, useEffect, useCallback } from "react";
import { MINI_GAMES } from "../lib/miniGameLogic";
import {
  getTopScores,
  getUserRank,
  getOverallTopScores,
  getOverallUserRank,
  getCurrentWeekKey,
  getMsUntilNextReset,
  weekKeyToDateStr,
  getWeeklyCosplaySeal,
  FESTIVAL_TITLES,
} from "../lib/miniGameLeaderboardLogic";
import { getPlayerUid } from "../lib/db";

const RANK_MEDAL = ["🥇", "🥈", "🥉"];

function msToCountdown(ms) {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (d > 0) return `${d}일 ${h}시간 후 초기화`;
  if (h > 0) return `${h}시간 ${m}분 후 초기화`;
  return `${m}분 후 초기화`;
}

function RankRow({ entry, isMe }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        background: isMe ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${
          isMe ? "rgba(251,191,36,0.35)" : "rgba(255,255,255,0.07)"
        }`,
        borderRadius: 12,
        marginBottom: 6,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background:
            entry.rank <= 3
              ? ["#fcd34d", "#9ca3af", "#c2410c"][entry.rank - 1]
              : "rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: entry.rank <= 3 ? 14 : 12,
          fontWeight: 900,
          color: entry.rank <= 3 ? "#000" : "rgba(255,255,255,0.4)",
          flexShrink: 0,
        }}
      >
        {entry.rank <= 3 ? RANK_MEDAL[entry.rank - 1] : entry.rank}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: isMe ? 900 : 700,
            color: isMe ? "#fcd34d" : "#fff",
          }}
        >
          {entry.nickname ?? "트레이너"}
          {isMe && (
            <span style={{ fontSize: 10, marginLeft: 5, color: "#fcd34d" }}>
              나
            </span>
          )}
        </div>
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 900,
          color:
            entry.rank === 1
              ? "#fcd34d"
              : entry.rank <= 3
              ? "#e5e7eb"
              : "rgba(255,255,255,0.6)",
        }}
      >
        {(entry.score ?? entry.total ?? 0).toLocaleString()}
      </div>
    </div>
  );
}

export default function MiniGameLeaderboardModal({ myProfile, onClose }) {
  const [tab, setTab] = useState("overall");
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [countdown, setCountdown] = useState("");

  const myUid = getPlayerUid();
  const myNickname = myProfile?.nickname ?? myProfile?.name ?? "트레이너";
  const currentGame = MINI_GAMES.find((g) => g.id === tab);
  const weeklySeal = getWeeklyCosplaySeal(); // 이번 주 코스프레 피카츄

  const mySealIds = myProfile?.miniGameSeals ?? [];
  const myTitleKeys = myProfile?.miniGameTitles ?? [];
  const sealOwned = mySealIds.includes(weeklySeal.id);
  const inTop10 = myRank !== null && myRank <= 10;

  // 카운트다운
  useEffect(() => {
    const update = () => setCountdown(msToCountdown(getMsUntilNextReset()));
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setScores([]);
    setMyRank(null);
    try {
      if (tab === "overall") {
        const data = await getOverallTopScores(10);
        setScores(data);
        const me = data.find((e) => e.uid === myUid);
        if (me) {
          setMyRank(me.rank);
        } else {
          const info = await getOverallUserRank(myUid);
          setMyRank(info ? info.rank : null);
        }
      } else {
        const data = await getTopScores(tab, 10);
        setScores(data);
        const inTop = data.find((e) => e.uid === myUid);
        if (inTop) {
          setMyRank(inTop.rank);
        } else {
          const r = await getUserRank(tab, myUid);
          setMyRank(r);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [tab, myUid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const weekLabel = weekKeyToDateStr(getCurrentWeekKey());

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 210,
        background: "linear-gradient(160deg,#050010,#0a0020,#050010)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui,sans-serif",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: "rgba(0,0,0,0.45)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 99,
            color: "rgba(255,255,255,0.65)",
            fontSize: 13,
            padding: "5px 12px",
            cursor: "pointer",
          }}
        >
          ← 뒤로
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 900, color: "#fff", fontSize: 16 }}>
            🏆 포켓 페스티벌 랭킹
          </div>
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.35)",
              marginTop: 1,
            }}
          >
            {weekLabel} 주차 · {countdown}
          </div>
        </div>
        <button
          onClick={loadData}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 99,
            color: "rgba(255,255,255,0.55)",
            fontSize: 12,
            padding: "5px 10px",
            cursor: "pointer",
          }}
        >
          ↻
        </button>
      </div>

      {/* 탭 */}
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "10px 14px",
          overflowX: "auto",
          flexShrink: 0,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <button
          onClick={() => setTab("overall")}
          style={{
            flexShrink: 0,
            padding: "6px 14px",
            borderRadius: 99,
            border: `1px solid ${
              tab === "overall"
                ? "rgba(251,191,36,0.5)"
                : "rgba(255,255,255,0.1)"
            }`,
            background:
              tab === "overall"
                ? "rgba(251,191,36,0.15)"
                : "rgba(255,255,255,0.04)",
            color: tab === "overall" ? "#fcd34d" : "rgba(255,255,255,0.5)",
            fontSize: 12,
            fontWeight: tab === "overall" ? 900 : 400,
            cursor: "pointer",
          }}
        >
          🏆 종합
        </button>
        {MINI_GAMES.map((g) => (
          <button
            key={g.id}
            onClick={() => setTab(g.id)}
            style={{
              flexShrink: 0,
              padding: "6px 14px",
              borderRadius: 99,
              border: `1px solid ${
                tab === g.id ? `${g.color}80` : "rgba(255,255,255,0.1)"
              }`,
              background:
                tab === g.id ? `${g.color}20` : "rgba(255,255,255,0.04)",
              color: tab === g.id ? "#fff" : "rgba(255,255,255,0.5)",
              fontSize: 12,
              fontWeight: tab === g.id ? 900 : 400,
              cursor: "pointer",
            }}
          >
            {g.emoji}{" "}
            {g.name
              .replace(
                /의 도전|의 기억게임| 따라하기| 런| 번개잡기| 타이밍| 게임/,
                ""
              )
              .slice(0, 5)}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {/* 내 순위 + 보상 배너 (종합 탭에서만) */}
        {tab === "overall" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: inTop10
                ? "linear-gradient(135deg,rgba(252,211,77,0.12),rgba(251,146,60,0.06))"
                : "rgba(255,255,255,0.04)",
              border: `1.5px solid ${
                inTop10 ? "rgba(252,211,77,0.4)" : "rgba(255,255,255,0.08)"
              }`,
              borderRadius: 16,
              padding: "12px 14px",
              marginBottom: 14,
            }}
          >
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${weeklySeal.pokeId}.png`}
              alt={weeklySeal.name}
              style={{
                width: 48,
                height: 48,
                objectFit: "contain",
                filter: inTop10
                  ? "drop-shadow(0 0 10px rgba(252,211,77,0.7))"
                  : "grayscale(0.7) brightness(0.5)",
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  color: sealOwned
                    ? "#4ade80"
                    : inTop10
                    ? "#fcd34d"
                    : "rgba(255,255,255,0.35)",
                  marginBottom: 2,
                }}
              >
                {sealOwned
                  ? "✅ 이번 주 씰 보유 중"
                  : inTop10
                  ? "🎉 TOP 10 달성! 주간 보상 대상"
                  : "TOP 10 달성 시 보상"}
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>
                {weeklySeal.emoji} {weeklySeal.name}{" "}
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                  이번 주 한정
                </span>
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.35)",
                  marginTop: 2,
                }}
              >
                {inTop10
                  ? `코인 ${
                      [
                        5000, 3500, 2500, 1500, 1500, 1000, 1000, 1000, 1000,
                        1000,
                      ][myRank - 1] ?? 1000
                    } + 씰 + 칭호`
                  : "11위~ : 코인 500 + 랜덤 띠부씰"}
              </div>
            </div>
            {myRank && (
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: inTop10 ? "#fcd34d" : "rgba(255,255,255,0.4)",
                  background: inTop10
                    ? "rgba(252,211,77,0.1)"
                    : "rgba(255,255,255,0.05)",
                  borderRadius: 99,
                  padding: "3px 10px",
                  border: `1px solid ${
                    inTop10 ? "rgba(252,211,77,0.3)" : "rgba(255,255,255,0.08)"
                  }`,
                }}
              >
                내 {myRank}위
              </div>
            )}
          </div>
        )}

        {/* 랭킹 목록 */}
        <div
          style={{
            fontSize: 13,
            fontWeight: 900,
            color: "rgba(255,255,255,0.45)",
            marginBottom: 8,
          }}
        >
          {tab === "overall"
            ? "🏆 합산 순위"
            : `${currentGame?.emoji} ${currentGame?.name} 순위`}
        </div>
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              color: "rgba(255,255,255,0.3)",
              fontSize: 14,
            }}
          >
            로딩 중...
          </div>
        ) : scores.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              color: "rgba(255,255,255,0.25)",
              fontSize: 14,
              lineHeight: 2,
            }}
          >
            아직 기록이 없어요
            <br />첫 번째 도전자가 되세요!
          </div>
        ) : (
          <>
            {scores.map((e) => (
              <RankRow key={e.uid} entry={e} isMe={e.uid === myUid} />
            ))}
            {myRank && myRank > 10 && !scores.find((e) => e.uid === myUid) && (
              <>
                <div
                  style={{
                    textAlign: "center",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.2)",
                    margin: "6px 0",
                  }}
                >
                  ···
                </div>
                <RankRow
                  entry={{
                    rank: myRank,
                    nickname: myNickname,
                    uid: myUid,
                    score: 0,
                  }}
                  isMe
                />
              </>
            )}
          </>
        )}

        {/* 코스프레 피카츄 씰 컬렉션 현황 */}
        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              color: "rgba(255,255,255,0.4)",
              marginBottom: 10,
            }}
          >
            ✨ 코스프레 피카츄 씰 수집 현황
          </div>
          {[
            {
              id: "cosplay_rockstar",
              name: "록스타 피카츄",
              emoji: "🎸",
              pokeId: 10080,
            },
            {
              id: "cosplay_belle",
              name: "벨 피카츄",
              emoji: "👗",
              pokeId: 10081,
            },
            {
              id: "cosplay_popstar",
              name: "팝스타 피카츄",
              emoji: "🎤",
              pokeId: 10082,
            },
            {
              id: "cosplay_phd",
              name: "박사 피카츄",
              emoji: "🎓",
              pokeId: 10083,
            },
            {
              id: "cosplay_libre",
              name: "레슬러 피카츄",
              emoji: "🤼",
              pokeId: 10084,
            },
            {
              id: "cosplay_base",
              name: "코스프레 피카츄",
              emoji: "✨",
              pokeId: 10085,
            },
          ].map((s) => {
            const owned = mySealIds.includes(s.id);
            const isCurrent = weeklySeal.id === s.id;
            return (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  background: owned
                    ? "rgba(252,211,77,0.08)"
                    : "rgba(255,255,255,0.02)",
                  border: `1px solid ${
                    isCurrent
                      ? "rgba(252,211,77,0.5)"
                      : owned
                      ? "rgba(252,211,77,0.2)"
                      : "rgba(255,255,255,0.06)"
                  }`,
                  borderRadius: 12,
                  marginBottom: 6,
                  opacity: owned ? 1 : 0.55,
                }}
              >
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${s.pokeId}.png`}
                  alt={s.name}
                  style={{
                    width: 32,
                    height: 32,
                    objectFit: "contain",
                    filter: owned ? "none" : "grayscale(1) brightness(0.4)",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: owned ? "#fff" : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {s.emoji} {s.name}
                  </div>
                  {isCurrent && (
                    <div
                      style={{ fontSize: 9, color: "#fcd34d", marginTop: 1 }}
                    >
                      ← 이번 주 보상
                    </div>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    color: owned ? "#fcd34d" : "rgba(255,255,255,0.2)",
                    background: owned ? "rgba(252,211,77,0.1)" : "transparent",
                    border: `1px solid ${
                      owned ? "rgba(252,211,77,0.3)" : "transparent"
                    }`,
                    borderRadius: 99,
                    padding: "2px 7px",
                  }}
                >
                  {owned ? "보유" : "미보유"}
                </div>
              </div>
            );
          })}
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.2)",
              textAlign: "center",
              marginTop: 8,
            }}
          >
            매주 다른 코스프레 씰 지급 · TOP 10 한정
          </div>
        </div>
      </div>
    </div>
  );
}
