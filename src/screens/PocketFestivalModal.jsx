// src/screens/PocketFestivalModal.jsx
import { useState, useEffect } from "react";
import {
  MINI_GAMES,
  loadGameScoresAsync, // ★ 변경!
  getTotalBestScore,
  getClearedGameCount,
} from "../lib/miniGameLogic";
import {
  getWeeklyCosplaySeal,
  getMsUntilNextReset,
} from "../lib/miniGameLeaderboardLogic";
import DigdaGame from "../games/DigdaGame";
import MagikarpGame from "../games/MagikarpGame";
import MewMemoryGame from "../games/MewMemoryGame";
import PikachuCatchGame from "../games/PikachuCatchGame";
import GengarRunGame from "../games/GengarRunGame";
import SilhouetteQuizGame from "../games/SilhouetteQuizGame";
import CharizardTimingGame from "../games/CharizardTimingGame";
import DittoMemoryGame from "../games/DittoMemoryGame";
import PokeballThrowGame from "../games/PokeballThrowGame";
import RocketDodgeGame from "../games/RocketDodgeGame";
import MewtwoDodgeGame from "../games/MewtwoDodgeGame";
import EvolutionOrderGame from "../games/EvolutionOrderGame";

const GAME_COMPONENTS = {
  diglett: DigdaGame,
  magikarp: MagikarpGame,
  mew_memory: MewMemoryGame,
  pikachu_catch: PikachuCatchGame,
  gengar_run: GengarRunGame,
  silhouette_quiz: SilhouetteQuizGame,
  charizard_timing: CharizardTimingGame,
  ditto_memory: DittoMemoryGame,
  pokeball_throw: PokeballThrowGame,
  rocket_dodge: RocketDodgeGame,
  mewtwo_dodge: MewtwoDodgeGame,
  evolution_order: EvolutionOrderGame,
};

function GameCard({ game, bestScore, onClick }) {
  const cleared = bestScore > 0;

  return (
    <div
      onClick={game.available ? onClick : undefined}
      style={{
        background: game.available ? game.gradient : "rgba(255,255,255,0.04)",
        border: `1.5px solid ${
          game.available ? game.color + "55" : "rgba(255,255,255,0.07)"
        }`,
        borderRadius: 20,
        padding: "16px 18px",
        cursor: game.available ? "pointer" : "default",
        opacity: game.available ? 1 : 0.5,
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        if (game.available) {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = `0 10px 28px ${game.color}44`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div
        style={{
          position: "absolute",
          right: -14,
          top: -14,
          width: 68,
          height: 68,
          borderRadius: "50%",
          background: game.available ? `${game.color}30` : "transparent",
          pointerEvents: "none",
        }}
      />

      {!game.available && (
        <div
          style={{
            position: "absolute",
            top: 9,
            right: 9,
            background: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.35)",
            fontSize: 10,
            fontWeight: 800,
            padding: "2px 8px",
            borderRadius: 99,
          }}
        >
          준비 중
        </div>
      )}
      {game.available && cleared && (
        <div
          style={{
            position: "absolute",
            top: 9,
            right: 9,
            background: "rgba(34,197,94,0.2)",
            color: "#4ade80",
            fontSize: 10,
            fontWeight: 800,
            padding: "2px 8px",
            borderRadius: 99,
            border: "1px solid rgba(34,197,94,0.3)",
          }}
        >
          기록 있음
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        {game.pokemonImg ? (
          <img
            src={game.pokemonImg}
            alt={game.name}
            style={{
              width: 40,
              height: 40,
              objectFit: "contain",
              filter: game.available
                ? "drop-shadow(0 2px 6px rgba(0,0,0,0.4))"
                : "grayscale(1) opacity(0.3)",
            }}
          />
        ) : (
          <span
            style={{
              fontSize: 30,
              filter: game.available ? "none" : "grayscale(1) opacity(0.3)",
            }}
          >
            {game.emoji}
          </span>
        )}
        <div>
          <div
            style={{
              fontWeight: 900,
              fontSize: 14,
              color: game.available ? "#fff" : "rgba(255,255,255,0.35)",
            }}
          >
            {game.name}
          </div>
          <div
            style={{
              fontSize: 11,
              color: game.available
                ? "rgba(255,255,255,0.55)"
                : "rgba(255,255,255,0.2)",
              lineHeight: 1.4,
              marginTop: 2,
            }}
          >
            {game.desc}
          </div>
        </div>
      </div>

      {game.available && (
        <div
          style={{
            paddingTop: 10,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
            최고 기록
          </span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: cleared ? "#fcd34d" : "rgba(255,255,255,0.2)",
            }}
          >
            {cleared ? `${bestScore.toLocaleString()} ${game.scoreUnit}` : "—"}
          </span>
        </div>
      )}
    </div>
  );
}

function LeaderboardView({ scores }) {
  const entries = MINI_GAMES.filter((g) => scores[g.id]?.best > 0)
    .map((g) => ({ ...g, best: scores[g.id].best }))
    .sort((a, b) => b.best - a.best);

  const RANK_STYLE = ["#fcd34d", "#9ca3af", "#c2410c"];

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
      {/* 종합 통계 */}
      <div
        style={{
          background:
            "linear-gradient(135deg,rgba(251,191,36,0.12),rgba(245,158,11,0.08))",
          border: "1.5px solid rgba(251,191,36,0.25)",
          borderRadius: 18,
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
            합산 최고 점수
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 900,
              color: "#fcd34d",
              marginTop: 2,
            }}
          >
            {getTotalBestScore().toLocaleString()}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
            클리어한 게임
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 900,
              color: "#a78bfa",
              marginTop: 2,
            }}
          >
            {getClearedGameCount()} / {MINI_GAMES.length}
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 52,
            color: "rgba(255,255,255,0.3)",
            fontSize: 14,
            lineHeight: 2,
          }}
        >
          아직 기록이 없어요 🎮
          <br />
          게임을 플레이해보세요!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map((g, i) => (
            <div
              key={g.id}
              style={{
                background:
                  i === 0
                    ? "linear-gradient(135deg,rgba(253,211,77,0.1),rgba(245,158,11,0.05))"
                    : "rgba(255,255,255,0.04)",
                border: `1px solid ${
                  i === 0 ? "rgba(253,211,77,0.25)" : "rgba(255,255,255,0.07)"
                }`,
                borderRadius: 14,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: i < 3 ? RANK_STYLE[i] : "rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 900,
                  color: i < 3 ? "#000" : "rgba(255,255,255,0.35)",
                }}
              >
                {i + 1}
              </div>
              {g.pokemonImg ? (
                <img
                  src={g.pokemonImg}
                  alt={g.name}
                  style={{ width: 28, height: 28, objectFit: "contain" }}
                />
              ) : (
                <span style={{ fontSize: 22 }}>{g.emoji}</span>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                  {g.name}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{ fontSize: 18, fontWeight: 900, color: "#fcd34d" }}
                >
                  {g.best.toLocaleString()}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                  {g.scoreUnit}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 미플레이 */}
      {MINI_GAMES.filter((g) => g.available && !(scores[g.id]?.best > 0))
        .length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.25)",
              marginBottom: 8,
              paddingLeft: 2,
            }}
          >
            미플레이
          </div>
          {MINI_GAMES.filter(
            (g) => g.available && !(scores[g.id]?.best > 0)
          ).map((g) => (
            <div
              key={g.id}
              style={{
                background: "rgba(255,255,255,0.02)",
                borderRadius: 12,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 6,
                opacity: 0.45,
              }}
            >
              {g.pokemonImg ? (
                <img
                  src={g.pokemonImg}
                  alt={g.name}
                  style={{ width: 22, height: 22, objectFit: "contain" }}
                />
              ) : (
                <span style={{ fontSize: 18 }}>{g.emoji}</span>
              )}
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                {g.name}
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.2)",
                }}
              >
                기록 없음
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PocketFestivalModal({
  onClose,
  onGameEnd,
  myProfile,
  db = null,
  onShowLeaderboard,
}) {
  const [view, setView] = useState("hub");
  const [activeGame, setActiveGame] = useState(null);
  const [scores, setScores] = useState({}); // ★ state로 변경!
  const [loading, setLoading] = useState(true); // ★ 로딩 추가!

  // ★ Firebase에서 점수 로드
  useEffect(() => {
    loadGameScoresAsync().then((loadedScores) => {
      setScores(loadedScores);
      setLoading(false);
    });
  }, []);

  const weeklySeal = getWeeklyCosplaySeal();
  const msLeft = getMsUntilNextReset();
  const daysLeft = Math.floor(msLeft / 86400000);
  const hoursLeft = Math.floor((msLeft % 86400000) / 3600000);
  const resetLabel =
    daysLeft > 0 ? `${daysLeft}일 후 교체` : `${hoursLeft}시간 후 교체`;

  // 활성 게임 컴포넌트 렌더
  if (activeGame) {
    const GameComponent = GAME_COMPONENTS[activeGame];
    if (GameComponent) {
      return (
        <GameComponent
          onClose={() => setActiveGame(null)}
          onGameEnd={(score) => {
            onGameEnd?.(activeGame, score);
            // 점수 갱신
            loadGameScoresAsync().then(setScores);
          }}
        />
      );
    }
  }

  if (loading) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 150,
          background: "linear-gradient(160deg,#0a001a,#0d0d2b,#0a001a)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 18,
        }}
      >
        점수 불러오는 중...
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 150,
        background: "linear-gradient(160deg,#0a001a,#0d0d2b,#0a001a)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui,sans-serif",
      }}
    >
      {/* 헤더 — 포켓덱스 스타일 */}
      <div
        style={{
          background: "linear-gradient(160deg,#E8190A,#C01208)",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "3px solid #8B0000",
          flexShrink: 0,
          boxShadow:
            "0 4px 12px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,130,110,0.4)",
        }}
      >
        {/* 파란 공 */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            flexShrink: 0,
            background:
              "radial-gradient(circle at 32% 28%,#bfdbfe,#2563EB 55%,#1e3a8a)",
            boxShadow:
              "0 0 0 3px rgba(255,255,255,0.3), 0 0 12px rgba(59,130,246,0.6)",
            border: "2px solid rgba(255,255,255,0.4)",
            position: "relative",
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
        {/* 신호등 */}
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
        {/* 타이틀 */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <span
            style={{
              color: "#fff",
              fontWeight: 900,
              fontSize: 16,
              letterSpacing: 1,
              textShadow: "0 1px 4px rgba(0,0,0,0.5)",
            }}
          >
            🎪 포켓 페스티벌
          </span>
        </div>
        {/* 랭킹 + 닫기 */}
        <button
          onClick={() => onShowLeaderboard?.()}
          style={{
            background:
              view === "leaderboard"
                ? "rgba(251,191,36,0.25)"
                : "rgba(255,255,255,0.15)",
            border: `1.5px solid ${
              view === "leaderboard"
                ? "rgba(251,191,36,0.5)"
                : "rgba(255,255,255,0.25)"
            }`,
            borderRadius: 99,
            color:
              view === "leaderboard" ? "#fcd34d" : "rgba(255,255,255,0.85)",
            fontSize: 12,
            padding: "4px 10px",
            cursor: "pointer",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          🏆
        </button>
        <button
          onClick={onClose}
          style={{
            width: 28,
            height: 28,
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

      {view === "leaderboard" ? (
        <LeaderboardView scores={scores} />
      ) : (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* 이번 주 TOP 10 보상 씰 배너 - 크고 눈에 띄게 */}
          <div
            onClick={() => onShowLeaderboard?.()}
            style={{
              margin: "14px 16px 0",
              background:
                "linear-gradient(135deg,rgba(252,211,77,0.2),rgba(245,158,11,0.12),rgba(252,211,77,0.08))",
              border: "2px solid rgba(252,211,77,0.6)",
              borderRadius: 18,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              cursor: "pointer",
              boxShadow:
                "0 4px 20px rgba(252,211,77,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            {/* 씰 이미지 - 크게 */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 14,
                background: "rgba(255,255,255,0.12)",
                border: "1.5px solid rgba(252,211,77,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <img
                src={`https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/${weeklySeal.pokeId}.png`}
                alt={weeklySeal.name}
                style={{
                  width: 66,
                  height: 66,
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 14px rgba(252,211,77,0.8))",
                  animation: "sealFloat 2s ease-in-out infinite",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 10,
                  color: "#fbbf24",
                  fontWeight: 800,
                  marginBottom: 4,
                  letterSpacing: 0.5,
                }}
              >
                🏆 이번 주 TOP 10 보상
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 900,
                  color: "#fff",
                  marginBottom: 3,
                }}
              >
                {weeklySeal.emoji} {weeklySeal.name}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.5)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    background: "rgba(252,211,77,0.2)",
                    borderRadius: 99,
                    padding: "1px 6px",
                    color: "#fbbf24",
                    fontWeight: 700,
                  }}
                >
                  랭킹 보기 ›
                </span>
                <span>{resetLabel}</span>
              </div>
            </div>
          </div>

          {/* 허브 배너 */}
          <div
            style={{
              padding: "14px 20px 14px",
              background:
                "linear-gradient(135deg,rgba(139,92,246,0.18),rgba(99,102,241,0.08))",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              marginTop: 12,
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.45)",
                marginBottom: 6,
              }}
            >
              포켓몬 테마 미니게임 {MINI_GAMES.length}종
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                  클리어
                </div>
                <div
                  style={{ fontSize: 22, fontWeight: 900, color: "#a78bfa" }}
                >
                  {getClearedGameCount()}
                  <span
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.3)",
                      fontWeight: 400,
                    }}
                  >
                    {" "}
                    / {MINI_GAMES.length}
                  </span>
                </div>
              </div>
              <div
                style={{
                  width: 1,
                  height: 30,
                  background: "rgba(255,255,255,0.1)",
                }}
              />
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                  합산 최고 점수
                </div>
                <div
                  style={{ fontSize: 22, fontWeight: 900, color: "#fcd34d" }}
                >
                  {getTotalBestScore().toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* 게임 그리드 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(158px,1fr))",
              gap: 12,
              padding: 16,
            }}
          >
            {MINI_GAMES.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                bestScore={scores[game.id]?.best ?? 0}
                onClick={() => setActiveGame(game.id)}
              />
            ))}
          </div>

          <div
            style={{
              margin: "0 16px 24px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14,
              padding: "11px 15px",
              fontSize: 12,
              color: "rgba(255,255,255,0.3)",
              lineHeight: 1.8,
            }}
          >
            🎮 새로운 미니게임이 계속 추가될 예정이에요
            <br />
            🏆 최고 기록이 랭킹에 자동으로 반영됩니다
          </div>
        </div>
      )}
    </div>
  );
}
