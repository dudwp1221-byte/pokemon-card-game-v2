// src/lib/bfEventLogic.js
// 주간 미션 시스템 (특수룰 + 일반 강화)

const STORAGE_KEY = "pokeset_bf_event";

// ── 전체 미션 풀 (매주 3개씩 랜덤 추출) ─────────────────
const MISSION_POOL = [
  {
    id: "bf_any_win_1",
    title: "🏟️ 특수룰 입문",
    desc: "특수룰 게임에서 1승",
    goal: 5,
    coins: 800,
    check: ({ won }) => won,
  },
  {
    id: "bf_any_win_3",
    title: "🔥 연속 도전",
    desc: "특수룰 게임에서 3승",
    goal: 8,
    coins: 1500,
    check: ({ won }) => won,
  },
  {
    id: "bf_jackpot_win_2",
    title: "💥 잭팟 사냥꾼",
    desc: "잭팟 룰에서 2승",
    goal: 5,
    coins: 1200,
    rule: "jackpot",
    check: ({ won, wildRule }) => won && wildRule === "jackpot",
  },
  {
    id: "bf_speed_win_3",
    title: "⚡ 번개 주먹",
    desc: "전광석화 룰에서 3승",
    goal: 6,
    coins: 1400,
    rule: "speed",
    check: ({ won, wildRule }) => won && wildRule === "speed",
  },
  {
    id: "bf_nodiscard_win_2",
    title: "🚫 버팀목",
    desc: "버림패 금지 룰에서 2승",
    goal: 5,
    coins: 1200,
    rule: "no_discard",
    check: ({ won, wildRule }) => won && wildRule === "no_discard",
  },
  {
    id: "bf_reveal_win_2",
    title: "👁️ 꿰뚫는 눈",
    desc: "세트 공개 룰에서 2승",
    goal: 5,
    coins: 1200,
    rule: "reveal",
    check: ({ won, wildRule }) => won && wildRule === "reveal",
  },
  {
    id: "bf_fourset_win_1",
    title: "🌀 4세트 도전",
    desc: "4세트 룰에서 1승",
    goal: 3,
    coins: 1800,
    rule: "4set",
    check: ({ won, wildRule }) => won && wildRule === "4set",
  },
  {
    id: "bf_bonus_play_3",
    title: "🎁 보너스 파티",
    desc: "보너스타임 룰 3판 참여",
    goal: 30,
    coins: 1800,
    rule: "bonus",
    check: ({ wildRule }) => wildRule === "bonus",
  },
  {
    id: "bf_any_play_5",
    title: "📅 열정적인 도전",
    desc: "특수룰 게임 5판 참여",
    goal: 20,
    coins: 1200,
    check: () => true,
  },
  {
    id: "bf_sd_win_2",
    title: "💰 과감한 베팅",
    desc: "특수룰에서 더블배팅 성공 2회",
    goal: 6,
    coins: 1500,
    check: ({ sdWon }) => !!sdWon,
  },
  {
    id: "bf_nodiscard_play_3",
    title: "🛡️ 인내의 시간",
    desc: "버림패 금지 룰 3판 참여",
    goal: 10,
    coins: 900,
    rule: "no_discard",
    check: ({ wildRule }) => wildRule === "no_discard",
  },
  {
    id: "bf_jackpot_sd",
    title: "🎰 잭팟 승부사",
    desc: "잭팟 룰에서 더블배팅 성공",
    goal: 3,
    coins: 2200,
    rule: "jackpot",
    check: ({ sdWon, wildRule }) => !!sdWon && wildRule === "jackpot",
  },
  // ── 추가 미션 ───────────────────────────────────────────
  {
    id: "bf_any_win_5",
    title: "🏅 특수룰 마스터",
    desc: "특수룰 게임에서 5승",
    goal: 15,
    coins: 2500,
    check: ({ won }) => won,
  },
  {
    id: "bf_reveal_play_3",
    title: "🔍 정보전 전문가",
    desc: "세트 공개 룰 3판 참여",
    goal: 12,
    coins: 1000,
    rule: "reveal",
    check: ({ wildRule }) => wildRule === "reveal",
  },
  {
    id: "bf_speed_play_3",
    title: "💨 쾌속 도전자",
    desc: "전광석화 룰 3판 참여",
    goal: 12,
    coins: 1000,
    rule: "speed",
    check: ({ wildRule }) => wildRule === "speed",
  },
  {
    id: "bf_fourset_play_2",
    title: "🃏 4세트 애호가",
    desc: "4세트 룰 2판 참여",
    goal: 6,
    coins: 1200,
    rule: "4set",
    check: ({ wildRule }) => wildRule === "4set",
  },
  {
    id: "bf_any_win_2_nodiscard",
    title: "🧱 철벽 수비수",
    desc: "버림패 금지 룰에서 2승",
    goal: 6,
    coins: 1400,
    rule: "no_discard",
    check: ({ won, wildRule }) => won && wildRule === "no_discard",
  },
  {
    id: "bf_sd_win_3",
    title: "💎 대박 연타",
    desc: "특수룰에서 더블배팅 성공 3회",
    goal: 8,
    coins: 1800,
    check: ({ sdWon }) => !!sdWon,
  },
  {
    id: "bf_bonus_win_2",
    title: "🎊 보너스 사냥꾼",
    desc: "보너스타임 룰에서 2승",
    goal: 5,
    coins: 1300,
    rule: "bonus",
    check: ({ won, wildRule }) => won && wildRule === "bonus",
  },
  {
    id: "bf_any_play_10",
    title: "🔥 불굴의 도전자",
    desc: "특수룰 게임 10판 참여",
    goal: 10,
    coins: 1000,
    check: () => true,
  },
  {
    id: "bf_jackpot_play_2",
    title: "🎲 잭팟 중독자",
    desc: "잭팟 룰 2판 참여",
    goal: 8,
    coins: 1100,
    rule: "jackpot",
    check: ({ wildRule }) => wildRule === "jackpot",
  },
  {
    id: "bf_win_any_rule",
    title: "🌟 룰 파괴자",
    desc: "서로 다른 특수룰로 각 1승",
    goal: 3,
    coins: 1800,
    check: ({ won, wildRule }) => won && !!wildRule, // 특수룰 승리 카운트 (3회 달성)
  },
  // ── 일반 미션 강화버전 ──────────────────────────────────
  {
    id: "weekly_play5",
    title: "🎮 주간 도전자",
    desc: "이번 주 게임 5판 플레이",
    goal: 25,
    coins: 600,
    check: () => true, // 모든 게임 카운트
  },
  {
    id: "weekly_win5",
    title: "🏆 주간 연승",
    desc: "이번 주 5번 승리",
    goal: 20,
    coins: 1000,
    check: ({ won }) => won,
  },
  {
    id: "weekly_win10",
    title: "👑 주간 챔피언",
    desc: "이번 주 10번 승리",
    goal: 35,
    coins: 1800,
    check: ({ won }) => won,
  },
  {
    id: "weekly_double3",
    title: "⚡ 더블 러쉬",
    desc: "이번 주 더블배팅 성공 3회",
    goal: 12,
    coins: 1200,
    check: ({ sdWon }) => !!sdWon,
  },
  {
    id: "weekly_seal3",
    title: "🍞 씰 폭식가",
    desc: "이번 주 씰 3개 획득",
    goal: 10,
    coins: 800,
    check: ({ sealGained }) => !!sealGained,
  },
  {
    id: "weekly_play15",
    title: "🔥 주간 열정",
    desc: "이번 주 게임 15판 플레이",
    goal: 50,
    coins: 1500,
    check: () => true,
  },
  {
    id: "weekly_win_streak3",
    title: "💫 3연승",
    desc: "이번 주 3연승 달성",
    goal: 3,
    coins: 700,
    check: ({ won }) => won, // 연승 체크는 recordBFEvent에서 별도 처리
  },
];

// ── 주차 계산 (월요일 00:00 KST 기준) ────────────────────
const KST_OFFSET = 9 * 60 * 60 * 1000; // UTC+9
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// 고정 에폭: 2024-01-01 월요일 00:00 KST (= 2023-12-31 15:00 UTC)
const MONDAY_EPOCH_UTC = Date.UTC(2023, 11, 31, 15, 0, 0);

// 현재 KST 기준 이번 주 월요일 00:00의 UTC 타임스탬프
function getMondayStartUTC(now = Date.now()) {
  const kstDate = new Date(now + KST_OFFSET);
  const dow = kstDate.getUTCDay(); // 0=일,1=월,...,6=토
  const daysSinceMonday = dow === 0 ? 6 : dow - 1; // 일요일이면 6일 전이 월요일
  kstDate.setUTCDate(kstDate.getUTCDate() - daysSinceMonday);
  kstDate.setUTCHours(0, 0, 0, 0);
  return kstDate.getTime() - KST_OFFSET; // UTC 타임스탬프로 변환
}

export function getWeekNum() {
  return Math.floor((getMondayStartUTC() - MONDAY_EPOCH_UTC) / WEEK_MS);
}

export function getWeekBounds() {
  const start = getMondayStartUTC();
  return { start, end: start + WEEK_MS };
}

export function getDaysLeft() {
  const { end } = getWeekBounds();
  const ms = end - Date.now();
  return Math.max(0, Math.floor(ms / (24 * 60 * 60 * 1000)));
}

// ── 주차 기반 결정론적 셔플 ───────────────────────────────
function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── 이번 주 미션 3개 ──────────────────────────────────────
export function getCurrentWeeklyMissions() {
  const weekNum = getWeekNum();
  return seededShuffle(MISSION_POOL, weekNum).slice(0, 5);
}

// ── 진행도 로드/저장 ──────────────────────────────────────
export function loadBFEventProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (raw.weekNum !== getWeekNum()) {
      // 새 주차 → 리셋
      return { weekNum: getWeekNum(), missions: {} };
    }
    return raw;
  } catch {
    return { weekNum: getWeekNum(), missions: {} };
  }
}

export function saveBFEventProgress(prog) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prog));
  } catch {}
}

// ── BF 게임 결과 기록 ─────────────────────────────────────
export function recordBFEvent({ won, wildRule, sdWon, sealGained = false }) {
  const missions = getCurrentWeeklyMissions();
  const prog = loadBFEventProgress();
  if (!prog.missions) prog.missions = {};

  let changed = false;
  for (const m of missions) {
    if (prog.missions[m.id]?.claimed) continue;
    const cur = prog.missions[m.id]?.count || 0;
    if (cur >= m.goal) continue;
    if (m.check({ won, wildRule, sdWon })) {
      prog.missions[m.id] = { ...prog.missions[m.id], count: cur + 1 };
      changed = true;
    }
  }
  if (changed) saveBFEventProgress(prog);
  return prog;
}

// ── 보상 수령 (coins 반환, 실패 시 null) ──────────────────
export function claimBFMission(missionId) {
  const prog = loadBFEventProgress();
  const missions = getCurrentWeeklyMissions();
  const m = missions.find((x) => x.id === missionId);
  if (!m) return null;
  const cur = prog.missions[missionId]?.count || 0;
  if (cur < m.goal) return null;
  if (prog.missions[missionId]?.claimed) return null;
  prog.missions[missionId] = { ...prog.missions[missionId], claimed: true };
  saveBFEventProgress(prog);
  return m.coins;
}

// ── 미수령 보상 개수 ──────────────────────────────────────
export function getBFEventUnclaimedCount() {
  const missions = getCurrentWeeklyMissions();
  const prog = loadBFEventProgress();
  return missions.filter((m) => {
    const p = prog.missions[m.id];
    return (p?.count || 0) >= m.goal && !p?.claimed;
  }).length;
}
