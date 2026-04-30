// src/lib/miniGameLogic.js
// 미니게임 점수 저장 / 랭킹 로직

import { db, getPlayerUid } from "./db";
import { getCurrentWeekKey } from "./miniGameLeaderboardLogic";

const SCORES_KEY = "pokeset_minigame_scores";

// ── 게임 정의 ─────────────────────────────────────────────
export const MINI_GAMES = [
  {
    id: "diglett",
    name: "디그다 잡기",
    emoji: "🐾",
    pokemonImg:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/50.png",
    desc: "구멍에서 튀어나오는 디그다를 잡아라!",
    color: "#c2410c",
    gradient: "linear-gradient(135deg,#7c2d12,#c2410c)",
    available: true,
    scoreUnit: "점",
  },
  {
    id: "magikarp",
    name: "잉어킹의 도전",
    emoji: "🐟",
    pokemonImg:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/129.png",
    desc: "폭포를 올라 갸라도스로 진화하라!",
    color: "#ef4444",
    gradient: "linear-gradient(135deg,#991b1b,#ef4444)",
    available: true,
    scoreUnit: "m",
  },
  {
    id: "mew_memory",
    name: "뮤의 기억게임",
    emoji: "🔮",
    pokemonImg:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png",
    desc: "뮤가 숨겨놓은 포켓몬 카드를 찾아라!",
    color: "#db2777",
    gradient: "linear-gradient(135deg,#831843,#db2777)",
    available: true,
    scoreUnit: "점",
  },
  {
    id: "pikachu_catch",
    name: "잠만보 간식타임",
    emoji: "😴",
    pokemonImg:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png",
    desc: "잠만보가 좋아하는 간식을 받아라!",
    color: "#d97706",
    gradient: "linear-gradient(135deg,#92400e,#d97706)",
    available: true,
    scoreUnit: "마리",
  },
  {
    id: "gengar_run",
    name: "피카츄런",
    emoji: "⚡",
    pokemonImg:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
    desc: "천둥의 돌을 피해 피카츄런!",
    color: "#ea580c",
    gradient: "linear-gradient(135deg,#7c2d12,#ea580c)",
    available: true,
    scoreUnit: "m",
  },
  {
    id: "silhouette_quiz",
    name: "오늘의 포켓몬은?",
    emoji: "❓",
    pokemonImg: "https://play.pokemonshowdown.com/sprites/trainers/oak.png",
    desc: "실루엣만 보고 포켓몬을 맞혀라!",
    color: "#0369a1",
    gradient: "linear-gradient(135deg,#0c4a6e,#0369a1)",
    available: true,
    scoreUnit: "점",
  },
  {
    id: "charizard_timing",
    name: "리자몽 타이밍",
    emoji: "🔥",
    pokemonImg:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
    desc: "리자몽의 불꽃이 목표 지점에서 탭!",
    color: "#ea580c",
    gradient: "linear-gradient(135deg,#7c2d12,#ea580c)",
    available: true,
    scoreUnit: "점",
  },
  {
    id: "ditto_memory",
    name: "메타몽 따라하기",
    emoji: "💜",
    pokemonImg:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/132.png",
    desc: "메타몽의 변신 순서를 따라 탭하라!",
    color: "#9333ea",
    gradient: "linear-gradient(135deg,#581c87,#9333ea)",
    available: true,
    scoreUnit: "점",
  },
  {
    id: "pokeball_throw",
    name: "포켓 핀볼",
    emoji: "⚡",
    pokemonImg:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
    desc: "피카츄와 함께 각도를 조준해 포켓몬을 물리쳐라!",
    color: "#ef4444",
    gradient: "linear-gradient(135deg,#991b1b,#ef4444)",
    available: true,
    scoreUnit: "점",
  },
  {
    id: "rocket_dodge",
    name: "로켓단 피하기",
    emoji: "🚀",
    pokemonImg:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png",
    desc: "로켓단의 폭탄을 피해 살아남아라!",
    color: "#7c3aed",
    gradient: "linear-gradient(135deg,#4c1d95,#7c3aed)",
    available: true,
    scoreUnit: "점",
  },
  {
    id: "mewtwo_dodge",
    name: "뮤츠 피하기",
    emoji: "🔮",
    pokemonImg:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png",
    desc: "뮤츠의 사이코키네시스를 피하라!",
    color: "#9333ea",
    gradient: "linear-gradient(135deg,#581c87,#9333ea)",
    available: true,
    scoreUnit: "점",
  },
  {
    id: "evolution_order",
    name: "진화 순서 맞추기",
    emoji: "🧬",
    pokemonImg:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png",
    desc: "섞인 포켓몬을 진화 순서대로 탭!",
    color: "#4f46e5",
    gradient: "linear-gradient(135deg,#3730a3,#4f46e5)",
    available: true,
    scoreUnit: "점",
  },
];

// ── 점수 저장 { [gameId]: { best, history: [{score, date}] } }

// ★ Firebase에서 점수 가져오기 추가!
export async function loadGameScoresFromFirebase() {
  try {
    const weekKey = getCurrentWeekKey();
    const userId = getPlayerUid();

    const scores = {};

    // 각 게임별로 Firebase에서 점수 가져오기
    for (const game of MINI_GAMES) {
      const path = `miniGameScores/${weekKey}/${game.id}/${userId}`;
      const data = await db.get(path).catch(() => null);

      if (data?.score) {
        scores[game.id] = {
          best: data.score,
          history: [], // history는 localStorage에만
        };
      }
    }

    return scores;
  } catch (e) {
    console.error("Firebase 점수 로드 실패:", e);
    return {};
  }
}

// ★ localStorage + Firebase 병합
export function loadGameScores() {
  try {
    const localScores = JSON.parse(localStorage.getItem(SCORES_KEY) || "{}");

    // Firebase 점수도 비동기로 가져와서 병합 (선택적)
    // 일단은 localStorage 우선 반환
    return localScores;
  } catch {
    return {};
  }
}

// ★ 동기 + 비동기 버전 (React에서 사용)
export async function loadGameScoresAsync() {
  const localScores = loadGameScores();
  const firebaseScores = await loadGameScoresFromFirebase();

  // Firebase 점수가 더 높으면 덮어쓰기
  const merged = { ...localScores };

  for (const [gameId, fbData] of Object.entries(firebaseScores)) {
    const localBest = merged[gameId]?.best ?? 0;
    const fbBest = fbData.best ?? 0;

    if (fbBest > localBest) {
      merged[gameId] = {
        ...merged[gameId],
        best: fbBest,
      };
    }
  }

  return merged;
}

export function saveGameScores(scores) {
  try {
    localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
  } catch {}
}

function _syncToCloud(scores) {
  try {
    const save = window.__cloudSave;
    if (typeof save === "function")
      save({ miniGameScores: scores }).catch(() => {});
  } catch {}
}

export function getBestScore(gameId) {
  const scores = loadGameScores();
  return scores[gameId]?.best ?? 0;
}

// 점수 기록 (best 갱신 + history 최근 10개 유지)
export function recordScore(gameId, score) {
  const scores = loadGameScores();
  if (!scores[gameId]) scores[gameId] = { best: 0, history: [] };

  const isNew = score > scores[gameId].best;
  if (isNew) scores[gameId].best = score;

  scores[gameId].history = [
    { score, date: new Date().toISOString() },
    ...(scores[gameId].history || []),
  ].slice(0, 10);

  saveGameScores(scores);
  _syncToCloud(scores);
  return { isNew, best: scores[gameId].best };
}

// ══════════════════════════════════════════════════════════
// ★★★ 게임별 만점 기준 (실제 플레이 데이터 기반 재조정) ★★★
//
// 기준: 현재 4명 베타 유저의 1등 점수를 "70% 지점"으로 설정
//       → 현 1등도 아직 만점까지 갈 여지가 있어서 도전 동기 부여
//       → 편차 최소화로 종합 랭킹 공정성 확보
//
// 이 값을 달성하면 해당 게임 1000점 만점
// ══════════════════════════════════════════════════════════
export const GAME_MAX_SCORES = {
  // 시간 지날수록 계속 누적되는 게임들 (넉넉하게)
  diglett: 2500, // 현 1등 1668 → 2500 (67% 달성)
  pikachu_catch: 300, // 현 1등 198 → 300 (66%)
  rocket_dodge: 200, // 현 1등 100 → 200 (50%) ★ 로켓단은 점수 낮아서 조정
  mewtwo_dodge: 1100, // 현 1등 740 → 1100 (67%)
  pokeball_throw: 120000, // 현 1등 77865 → 120000 (65%, 30라운드 확장 반영)

  // 자연 상한이 있는 게임들 (현 1등의 1.2~1.5배)
  magikarp: 80, // 현 1등 63 → 80 (79%)
  gengar_run: 900, // 현 1등 588 → 900 (65%)
  ditto_memory: 1000, // 현 1등 700 → 1000 (70%, 10단계 완클 기준)
  evolution_order: 600, // 현 1등 376 → 600 (63%)

  // 문제/점수 기반 게임들
  mew_memory: 1800, // 현 1등 1150 → 1800 (64%)
  silhouette_quiz: 5500, // 현 1등 3790 → 5500 (69%)
  charizard_timing: 1000, // 현 1등 660 → 1000 (66%)
};

// 게임별 점수를 0~1000점으로 정규화
export function getNormalizedScore(gameId, score) {
  const max = GAME_MAX_SCORES[gameId] ?? 1000;
  return Math.min(1000, Math.round((score / max) * 1000));
}

// 종합 점수 = 각 게임 정규화 점수 합산 (최대 12000점)
export function getTotalBestScore() {
  const scores = loadGameScores();
  return MINI_GAMES.reduce((sum, g) => {
    const best = scores[g.id]?.best ?? 0;
    return sum + getNormalizedScore(g.id, best);
  }, 0);
}

export function getClearedGameCount() {
  const scores = loadGameScores();
  return Object.keys(scores).filter((id) => (scores[id]?.best || 0) > 0).length;
}
