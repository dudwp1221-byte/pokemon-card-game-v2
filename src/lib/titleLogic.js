// src/lib/titleLogic.js

export const TITLES = [
  // ── 총 승리 단계
  {
    key: "firstblood",
    label: "🐣 새내기 트레이너",
    desc: "첫 승리",
    flavor: "긴 여정의 첫 걸음",
    check: (w, s) => (w.total ?? 0) >= 1,
  },
  {
    key: "total30",
    label: "⚡ 실력파 트레이너",
    desc: "총 30승",
    flavor: "슬슬 감이 잡히기 시작했다",
    check: (w, s) => (w.total ?? 0) >= 30,
  },
  {
    key: "total100",
    label: "🎖️ 엘리트 트레이너",
    desc: "총 100승",
    flavor: "진정한 실력자의 반열에 오르다",
    check: (w, s) => (w.total ?? 0) >= 100,
  },
  {
    key: "total300",
    label: "🛡️ 체육관 관장",
    desc: "총 300승",
    flavor: "이미 많은 도전자들을 물리쳤다",
    check: (w, s) => (w.total ?? 0) >= 300,
  },
  {
    key: "total500",
    label: "🏆 사천왕",
    desc: "총 500승",
    flavor: "챔피언 로드의 수문장, 그 중 하나가 되다",
    check: (w, s) => (w.total ?? 0) >= 500,
  },
  {
    key: "champion",
    label: "👑 챔피언",
    desc: "총 777승",
    flavor: "포켓몬 세계의 정점, 챔피언의 자리에 오르다",
    check: (w, s) => (w.total ?? 0) >= 777,
  },
  {
    key: "legend",
    label: "🌈 전설의 트레이너",
    desc: "총 1000승",
    flavor: "그 이름은 역사에 새겨졌다",
    check: (w, s) => (w.total ?? 0) >= 1000,
  },

  // ── 솔로
  {
    key: "loner",
    label: "🗡️ 싱글 헌터",
    desc: "솔로 10승",
    flavor: "혼자서도 충분해",
    check: (w, s) => (w.solo ?? 0) >= 10,
  },
  {
    key: "solo30",
    label: "🤖 AI 학살자",
    desc: "솔로 30승",
    flavor: "AI의 눈물은 데이터일 뿐",
    check: (w, s) => (w.solo ?? 0) >= 30,
  },

  // ── 멀티
  {
    key: "partner",
    label: "🤝 배틀 파트너",
    desc: "멀티 5승",
    flavor: "진짜 실력은 사람과 겨뤄야 안다",
    check: (w, s) => (w.multi ?? 0) >= 5,
  },
  {
    key: "multi20",
    label: "👑 배틀 로얄",
    desc: "멀티 20승",
    flavor: "진정한 강자는 대결에서 드러난다",
    check: (w, s) => (w.multi ?? 0) >= 20,
  },

  // ── 연승
  {
    key: "streak3",
    label: "🔥 승리의 불꽃",
    desc: "3연승 달성",
    flavor: "한 번 붙으면 꺼지지 않는다",
    check: (w, s) => (s.maxStreak ?? 0) >= 3,
  },
  {
    key: "streak5",
    label: "⚔️ 상승세",
    desc: "5연승 달성",
    flavor: "기세를 탄 자는 누구도 막지 못한다",
    check: (w, s) => (s.maxStreak ?? 0) >= 5,
  },
  {
    key: "streak10",
    label: "🌩️ 연승가도",
    desc: "10연승 달성",
    flavor: "멈추는 법을 모르는 자",
    check: (w, s) => (s.maxStreak ?? 0) >= 10,
  },
  {
    key: "streak20",
    label: "👑 무패신화",
    desc: "20연승 달성",
    flavor: "전설은 만들어지는 것이 아니라 증명되는 것",
    check: (w, s) => (s.maxStreak ?? 0) >= 20,
  },

  // ── 특수 플레이
  {
    key: "perfecthand",
    label: "🎯 퍼펙트 핸드",
    desc: "카드 뽑자마자 즉시 승리 3회",
    flavor: "뽑는 순간 이미 끝났다",
    check: (w, s) => (s.perfectWin ?? 0) >= 3,
  },
  {
    key: "allset",
    label: "🌀 콤보 마스터",
    desc: "세트 3개 동시 완성으로 승리 5회",
    flavor: "손패가 예술이 되는 순간",
    check: (w, s) => (s.multiKill ?? 0) >= 5,
  },
  {
    key: "veteran",
    label: "🛡️ 역전의 용사",
    desc: "코인 바닥 후 컴백 승리 3회",
    flavor: "벼랑 끝이 진짜 시작이다",
    check: (w, s) => (s.broke ?? 0) >= 3,
  },

  // ── 더블배팅
  {
    key: "doublex10",
    label: "💰 하이롤러",
    desc: "더블배팅 성공 10회",
    flavor: "리스크가 클수록 짜릿하다",
    check: (w, s) => (s.doubleWin ?? 0) >= 10,
  },
  {
    key: "double_agent",
    label: "⚡ 승부사",
    desc: "더블배팅 성공 20회",
    flavor: "패가 좋을 때 배팅을 두 배로",
    check: (w, s) => (s.doubleWin ?? 0) >= 20,
  },

  // ── 리그 도전자
  {
    key: "kanto_master",
    label: "🔴 관동 리그 도전자",
    desc: "관동 리그 도전자",
    flavor: "관동의 모든 체육관을 정복했다",
    check: (w, s) => (w.kantoSolo ?? 0) >= 120,
  },
  {
    key: "johto_master",
    label: "🟣 성도 리그 도전자",
    desc: "성도 리그 도전자",
    flavor: "성도의 모든 체육관을 정복했다",
    check: (w, s) => (w.johtoSolo ?? 0) >= 120,
  },
  {
    key: "hoenn_master",
    label: "🔵 호연 리그 도전자",
    desc: "호연 리그 도전자",
    flavor: "호연의 모든 체육관을 정복했다",
    check: (w, s) => (w.hoennSolo ?? 0) >= 120,
  },

  // ── 히든 칭호 (업적 달성 보상)
  {
    key: "ach_speedy",
    label: "⚡ 속전속결",
    desc: "업적 달성 보상 (히든)",
    flavor: "눈 깜짝할 새에 끝났다",
    check: () => false,
  },
  {
    key: "ach_broke",
    label: "💀 빈털터리",
    desc: "업적 달성 보상 (히든)",
    flavor: "바닥을 쳐봤다",
    check: () => false,
  },
  {
    key: "ach_first_blood",
    label: "🎯 선빵러",
    desc: "업적 달성 보상 (히든)",
    flavor: "선제공격이 최선의 방어",
    check: () => false,
  },
  {
    key: "ach_greedy",
    label: "🦅 욕심쟁이",
    desc: "업적 달성 보상 (히든)",
    flavor: "남의 것이 더 맛있다",
    check: () => false,
  },
  {
    key: "ach_slowpoke",
    label: "🐢 느림보",
    desc: "업적 달성 보상 (히든)",
    flavor: "천천히, 하지만 확실하게",
    check: () => false,
  },
  {
    key: "ach_bf_addict",
    label: "🏟️ 프런티어 중독",
    desc: "업적 달성 보상 (히든)",
    flavor: "오늘도 프런티어",
    check: () => false,
  },
  {
    key: "ach_shiny_addict",
    label: "✨ 이로치 중독",
    desc: "업적 달성 보상 (히든)",
    flavor: "이로치가 너무 좋아",
    check: () => false,
  },
];

// ── 체육관 뱃지
const CDN =
  "https://raw.githubusercontent.com/dudwp1221-byte/pokeset-images/main";

export const GYM_BADGES = {
  kanto: {
    label: "관동",
    color: "#EF4444",
    winType: "kantoSolo",
    winLabel: "관동 지방 싱글 승리",
    badges: [
      {
        key: "boulder",
        label: "회색배지",
        emoji: "🪨",
        threshold: 5,
        img: `${CDN}/badge_kanto_1.png`,
      },
      {
        key: "cascade",
        label: "블루배지",
        emoji: "💧",
        threshold: 10,
        img: `${CDN}/badge_kanto_2.png`,
      },
      {
        key: "thunder",
        label: "오렌지배지",
        emoji: "⚡",
        threshold: 20,
        img: `${CDN}/badge_kanto_3.png`,
      },
      {
        key: "rainbow",
        label: "무지개배지",
        emoji: "🌈",
        threshold: 30,
        img: `${CDN}/badge_kanto_4.png`,
      },
      {
        key: "soul",
        label: "핑크배지",
        emoji: "💗",
        threshold: 50,
        img: `${CDN}/badge_kanto_5.png`,
      },
      {
        key: "marsh",
        label: "골드배지",
        emoji: "🥇",
        threshold: 70,
        img: `${CDN}/badge_kanto_6.png`,
      },
      {
        key: "volcano",
        label: "진홍색배지",
        emoji: "🌋",
        threshold: 90,
        img: `${CDN}/badge_kanto_7.png`,
      },
      {
        key: "earth",
        label: "그린배지",
        emoji: "🌿",
        threshold: 120,
        img: `${CDN}/badge_kanto_8.png`,
      },
    ],
  },
  johto: {
    label: "성도",
    color: "#8B5CF6",
    winType: "johtoSolo",
    winLabel: "성도 지방 싱글 승리",
    badges: [
      {
        key: "zephyr",
        label: "윙배지",
        emoji: "🦅",
        threshold: 5,
        img: `${CDN}/badge_johto_1.png`,
      },
      {
        key: "hive",
        label: "인섹트배지",
        emoji: "🐝",
        threshold: 10,
        img: `${CDN}/badge_johto_2.png`,
      },
      {
        key: "plain",
        label: "레귤러배지",
        emoji: "🌾",
        threshold: 20,
        img: `${CDN}/badge_johto_3.png`,
      },
      {
        key: "fog",
        label: "팬텀배지",
        emoji: "👻",
        threshold: 30,
        img: `${CDN}/badge_johto_4.png`,
      },
      {
        key: "storm",
        label: "쇼크배지",
        emoji: "⚡",
        threshold: 50,
        img: `${CDN}/badge_johto_5.png`,
      },
      {
        key: "mineral",
        label: "스틸배지",
        emoji: "🔩",
        threshold: 70,
        img: `${CDN}/badge_johto_6.png`,
      },
      {
        key: "glacier",
        label: "아이스배지",
        emoji: "🧊",
        threshold: 90,
        img: `${CDN}/badge_johto_7.png`,
      },
      {
        key: "rising",
        label: "라이징배지",
        emoji: "🔮",
        threshold: 120,
        img: `${CDN}/badge_johto_8.png`,
      },
    ],
  },
  hoenn: {
    label: "호연",
    color: "#0EA5E9",
    winType: "hoennSolo",
    winLabel: "호연 지방 싱글 승리",
    badges: [
      {
        key: "stone",
        label: "스톤배지",
        emoji: "🪨",
        threshold: 5,
        img: `${CDN}/badge_hoenn_1.png`,
      },
      {
        key: "knuckle",
        label: "너클배지",
        emoji: "👊",
        threshold: 10,
        img: `${CDN}/badge_hoenn_2.png`,
      },
      {
        key: "dynamo",
        label: "다이나모배지",
        emoji: "⚙️",
        threshold: 20,
        img: `${CDN}/badge_hoenn_3.png`,
      },
      {
        key: "heat",
        label: "히트배지",
        emoji: "🔥",
        threshold: 30,
        img: `${CDN}/badge_hoenn_4.png`,
      },
      {
        key: "balance",
        label: "밸런스배지",
        emoji: "⚖️",
        threshold: 50,
        img: `${CDN}/badge_hoenn_5.png`,
      },
      {
        key: "feather",
        label: "깃털배지",
        emoji: "🪶",
        threshold: 70,
        img: `${CDN}/badge_hoenn_6.png`,
      },
      {
        key: "mind",
        label: "마인드배지",
        emoji: "🔮",
        threshold: 90,
        img: `${CDN}/badge_hoenn_7.png`,
      },
      {
        key: "rain",
        label: "레인배지",
        emoji: "🌧️",
        threshold: 120,
        img: `${CDN}/badge_hoenn_8.png`,
      },
    ],
  },
};

export function getUnlockedTitles(wins = {}, stats = {}) {
  return TITLES.filter((t) => t.check(wins, stats));
}
export function isTitleUnlocked(key, wins = {}, stats = {}) {
  return TITLES.find((t) => t.key === key)?.check(wins, stats) ?? false;
}
export function getUnlockedBadges(wins = {}) {
  const result = {};
  for (const [region, def] of Object.entries(GYM_BADGES)) {
    const val = wins[def.winType] ?? 0;
    result[region] = new Set(
      def.badges.filter((b) => val >= b.threshold).map((b) => b.key)
    );
  }
  return result;
}
export function isBadgeUnlocked(regionKey, badgeKey, wins = {}) {
  const def = GYM_BADGES[regionKey];
  if (!def) return false;
  const badge = def.badges.find((b) => b.key === badgeKey);
  if (!badge) return false;
  return (wins[def.winType] ?? 0) >= badge.threshold;
}
export function addWin(wins = {}, mode = "solo", leagueId = "kanto") {
  const next = { ...wins };
  if (mode === "solo") {
    next.solo = (next.solo ?? 0) + 1;
    if (leagueId === "kanto") next.kantoSolo = (next.kantoSolo ?? 0) + 1;
    else if (leagueId === "johto") next.johtoSolo = (next.johtoSolo ?? 0) + 1;
    else if (leagueId === "hoenn") next.hoennSolo = (next.hoennSolo ?? 0) + 1;
  } else if (mode === "multi") {
    next.multi = (next.multi ?? 0) + 1;
  }
  next.total = (next.total ?? 0) + 1;
  return next;
}
export function updateStats(stats = {}, payload = {}) {
  const s = { ...stats };
  const { isDoubleWin, isPerfectWin, isMultiKill, isBroke, isWin } = payload;
  if (isDoubleWin) s.doubleWin = (s.doubleWin ?? 0) + 1;
  if (isPerfectWin) s.perfectWin = (s.perfectWin ?? 0) + 1;
  if (isMultiKill) s.multiKill = (s.multiKill ?? 0) + 1;
  if (isBroke) s.broke = (s.broke ?? 0) + 1;
  if (isWin) {
    s.streak = (s.streak ?? 0) + 1;
    s.maxStreak = Math.max(s.maxStreak ?? 0, s.streak);
  } else s.streak = 0;
  return s;
}
export function getNextTitle(wins = {}, stats = {}) {
  return (
    TITLES.find((t) => !t.check(wins, stats) && t.check != (() => false)) ??
    null
  );
}
export function getNextBadge(wins = {}) {
  for (const [region, def] of Object.entries(GYM_BADGES)) {
    const val = wins[def.winType] ?? 0;
    const next = def.badges.find((b) => val < b.threshold);
    if (next)
      return {
        region,
        regionLabel: def.label,
        winLabel: def.winLabel,
        badge: next,
        remaining: next.threshold - val,
        winType: def.winType,
      };
  }
  return null;
}
