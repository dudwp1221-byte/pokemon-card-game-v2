const KEY = "pokeset_attendance";

export interface AttendanceData {
  lastCheckIn: string | null;
  streak: number;
  claimed: boolean[];
}

export interface DayReward {
  day: number;
  coins: number;
  bread: number;
  premiumBread: number;
  holoSeal: boolean;
  emoji: string;
  label: string;
}

export const DAY_REWARDS: DayReward[] = [
  {
    day: 1,
    coins: 300,
    bread: 0,
    premiumBread: 0,
    holoSeal: false,
    emoji: "💰",
    label: "300 코인",
  },
  {
    day: 2,
    coins: 300,
    bread: 0,
    premiumBread: 0,
    holoSeal: false,
    emoji: "💰",
    label: "300 코인",
  },
  {
    day: 3,
    coins: 0,
    bread: 0,
    premiumBread: 1,
    holoSeal: false,
    emoji: "🌟",
    label: "피카피카빵",
  },
  {
    day: 4,
    coins: 300,
    bread: 0,
    premiumBread: 0,
    holoSeal: false,
    emoji: "💰",
    label: "300 코인",
  },
  {
    day: 5,
    coins: 0,
    bread: 0,
    premiumBread: 1,
    holoSeal: false,
    emoji: "🌟",
    label: "피카피카빵",
  },
  {
    day: 6,
    coins: 300,
    bread: 0,
    premiumBread: 0,
    holoSeal: false,
    emoji: "💰",
    label: "300 코인",
  },
  {
    day: 7,
    coins: 0,
    bread: 0,
    premiumBread: 0,
    holoSeal: true,
    emoji: "✨",
    label: "홀로 띠부씰 1개",
  },
];

// ✅ 수정: UTC 대신 KST(한국시간) 기준 날짜 문자열 반환
function today(): string {
  const now = new Date();
  // KST = UTC+9
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

// ✅ 수정: 날짜 문자열 차이 계산도 KST 기준으로 정확하게
function dayDiff(from: string, to: string): number {
  const fromMs = new Date(from + "T00:00:00+09:00").getTime();
  const toMs = new Date(to + "T00:00:00+09:00").getTime();
  return Math.round((toMs - fromMs) / 86_400_000);
}

function emptyData(): AttendanceData {
  return { lastCheckIn: null, streak: 0, claimed: Array(7).fill(false) };
}

export function getAttendance(): AttendanceData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw) as AttendanceData;
      if (!Array.isArray(d.claimed) || d.claimed.length !== 7)
        d.claimed = Array(7).fill(false);
      return d;
    }
  } catch {}
  return emptyData();
}

function saveAttendance(data: AttendanceData) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function restoreAttendanceFromCloud(cloudData: any) {
  if (!cloudData) return;
  if (!Array.isArray(cloudData.claimed) || cloudData.claimed.length !== 7)
    cloudData.claimed = Array(7).fill(false);
  const local = getAttendance();
  const localDate = local.lastCheckIn ?? "0000-00-00";
  const cloudDate = cloudData.lastCheckIn ?? "0000-00-00";
  if (cloudDate >= localDate) {
    saveAttendance(cloudData as AttendanceData);
  }
}

export function isStreakBroken(): boolean {
  const { lastCheckIn } = getAttendance();
  if (!lastCheckIn) return false;
  return dayDiff(lastCheckIn, today()) >= 2;
}

export function canCheckInToday(): boolean {
  const { lastCheckIn } = getAttendance();
  if (!lastCheckIn) return true;
  return dayDiff(lastCheckIn, today()) >= 1;
}

export function hasAttendanceBadge(): boolean {
  return canCheckInToday();
}

export function checkIn(): { data: AttendanceData; reward: DayReward } {
  let data = getAttendance();
  const t = today();

  if (data.lastCheckIn && dayDiff(data.lastCheckIn, t) >= 2) {
    data = emptyData();
  }

  if (data.streak >= 7) {
    data = emptyData();
  }

  const dayIndex = data.streak;
  const reward = DAY_REWARDS[dayIndex];

  data.streak += 1;
  data.lastCheckIn = t;
  data.claimed[dayIndex] = true;

  saveAttendance(data);
  _syncToCloud(data);

  return { data, reward };
}

function _syncToCloud(data: AttendanceData) {
  try {
    const save = (window as any).__cloudSave;
    if (typeof save === "function") save({ attendance: data }).catch(() => {});
  } catch {}
}
