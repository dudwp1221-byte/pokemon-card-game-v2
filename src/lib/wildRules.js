// src/lib/wildRules.js
// 배틀프런티어 특수룰 정의

export const WILD_RULES = {
  no_discard: {
    id: "no_discard",
    name: "버림패 금지",
    emoji: "🚫",
    desc: "상대 버린패를 가져올 수 없어요. 덱에서만 뽑을 수 있어요.",
    color: "#ef4444",
    bg: "#450a0a",
  },
  jackpot: {
    id: "jackpot",
    name: "잭팟",
    emoji: "💥",
    desc: "더블배팅 성공 시 보너스가 3배로 올라가요!",
    color: "#f59e0b",
    bg: "#451a03",
  },
  speed: {
    id: "speed",
    name: "전광석화",
    emoji: "⚡",
    desc: "턴 제한시간이 15초로 짧아져요. 빠르게 결정해야 해요!",
    color: "#6366f1",
    bg: "#1e1b4b",
  },
  reveal: {
    id: "reveal",
    name: "세트 공개",
    emoji: "👁️",
    desc: "세트를 완성할 때마다 그 플레이어의 패가 잠깐 공개돼요.",
    color: "#06b6d4",
    bg: "#083344",
  },
  "4set": {
    id: "4set",
    name: "4세트",
    emoji: "🌀",
    desc: "패가 12장으로 늘어나고, 세트 4개를 완성해야 이겨요!",
    color: "#8b5cf6",
    bg: "#1e1b4b",
  },
  bonus: {
    id: "bonus",
    name: "보너스타임",
    emoji: "🎁",
    desc: "이기든 지든 보너스 코인을 받아요! 승자 +500, 패자 +200",
    color: "#10b981",
    bg: "#022c22",
  },
};

// 솔로 룰 확률 (전광석화 제외)
export const SOLO_RULE_WEIGHTS = [
  { id: "no_discard", w: 25 },
  { id: "jackpot", w: 25 },
  { id: "reveal", w: 25 },
  { id: "4set", w: 20 },
  { id: "bonus", w: 5 },
];

// 멀티 룰 확률 (전체)
export const MULTI_RULE_WEIGHTS = [
  { id: "no_discard", w: 20 },
  { id: "jackpot", w: 20 },
  { id: "speed", w: 20 },
  { id: "reveal", w: 20 },
  { id: "4set", w: 15 },
  { id: "bonus", w: 5 },
];

export function selectWildRule(isMulti) {
  const weights = isMulti ? MULTI_RULE_WEIGHTS : SOLO_RULE_WEIGHTS;
  const total = weights.reduce((s, r) => s + r.w, 0);
  let rand = Math.random() * total;
  for (const r of weights) {
    rand -= r.w;
    if (rand <= 0) return r.id;
  }
  return weights[0].id;
}
