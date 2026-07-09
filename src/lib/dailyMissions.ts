export const PREMIUM_BREAD_ID = "champion";

const STORAGE_KEY = "pokeset_daily_missions";

const todayStr = () => {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
};

export const MISSIONS = [
  {
    id: "play3",
    icon: "🎮",
    title: "오늘의 도전",
    desc: "게임 3판 플레이",
    target: 3,
    reward: 1, // 빵
    coins: 30, // 코인
  },
  {
    id: "win2",
    icon: "🏆",
    title: "연승 도전",
    desc: "오늘 2번 승리",
    target: 2,
    reward: 1,
    coins: 50,
  },
  {
    id: "doubleBet",
    icon: "⚡",
    title: "승부사",
    desc: "더블 배팅으로 승리 1회",
    target: 1,
    reward: 1,
    coins: 80,
  },
  {
    id: "getSeal",
    icon: "🍞",
    title: "씰 수집가",
    desc: "띠부띠부씰 1개 획득",
    target: 1,
    reward: 1,
    coins: 20,
  },
  {
    id: "playTournament",
    icon: "✨",
    title: "이로치 도전자",
    desc: "이로치 토너먼트 1회 참가",
    target: 1,
    reward: 1,
    coins: 60,
  },
];

function defaultProgress() {
  return Object.fromEntries(
    MISSIONS.map((m) => [m.id, { current: 0, claimed: false }])
  );
}

function init() {
  return { date: todayStr(), progress: defaultProgress(), bonusClaimed: false };
}

export function loadDailyMissions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return init();
    const data = JSON.parse(raw);
    if (data.date !== todayStr()) return init();
    if (data.bonusClaimed === undefined) data.bonusClaimed = false;
    MISSIONS.forEach((m) => {
      if (!data.progress[m.id])
        data.progress[m.id] = { current: 0, claimed: false };
    });
    return data;
  } catch {
    return init();
  }
}

export function saveDailyMissions(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function restoreDailyMissionsFromCloud(cloudData) {
  if (!cloudData) return;
  const today = todayStr();
  if (cloudData.date !== today) return;

  const local = loadDailyMissions();

  if (local.date === today) {
    const merged = {
      date: today,
      bonusClaimed: local.bonusClaimed || !!cloudData.bonusClaimed,
      progress: {},
    };
    MISSIONS.forEach((m) => {
      const lp = local.progress[m.id] || { current: 0, claimed: false };
      const cp = cloudData.progress?.[m.id] || { current: 0, claimed: false };
      merged.progress[m.id] = {
        current: Math.max(lp.current, cp.current),
        claimed: lp.claimed || cp.claimed,
      };
    });
    saveDailyMissions(merged);
  } else {
    saveDailyMissions(cloudData);
  }
}

export function incrementMission(id) {
  const data = loadDailyMissions();
  const mission = MISSIONS.find((m) => m.id === id);
  if (!mission) return { data, justCompleted: false };

  const prog = data.progress[id] || { current: 0, claimed: false };
  if (prog.claimed || prog.current >= mission.target)
    return { data, justCompleted: false };

  const prev = prog.current;
  const next = Math.min(prev + 1, mission.target);
  data.progress[id] = { ...prog, current: next };
  saveDailyMissions(data);
  _syncToCloud(data);

  return {
    data,
    justCompleted: next >= mission.target && prev < mission.target,
  };
}

// { bread, coins } 반환
export function claimMissionReward(id) {
  const data = loadDailyMissions();
  const mission = MISSIONS.find((m) => m.id === id);
  if (!mission) return { bread: 0, coins: 0 };

  const prog = data.progress[id] || { current: 0, claimed: false };
  if (prog.claimed || prog.current < mission.target)
    return { bread: 0, coins: 0 };

  data.progress[id] = { ...prog, claimed: true };
  saveDailyMissions(data);
  _syncToCloud(data);
  return { bread: mission.reward, coins: mission.coins || 0 };
}

export function canClaimBonus() {
  const data = loadDailyMissions();
  if (data.bonusClaimed) return false;
  return MISSIONS.every((m) => data.progress[m.id]?.claimed);
}

export function claimBonusReward() {
  const data = loadDailyMissions();
  if (data.bonusClaimed) return false;
  if (!MISSIONS.every((m) => data.progress[m.id]?.claimed)) return false;

  data.bonusClaimed = true;
  saveDailyMissions(data);
  _syncToCloud(data);
  return true;
}

export function hasUnclaimedMissions() {
  const data = loadDailyMissions();
  const hasIndividual = MISSIONS.some((m) => {
    const p = data.progress[m.id];
    return p && p.current >= m.target && !p.claimed;
  });
  return hasIndividual || canClaimBonus();
}

function _syncToCloud(data) {
  try {
    const save = (window as any).__cloudSave;
    if (typeof save === "function")
      save({ dailyMissions: data }).catch(() => {});
  } catch {}
}
