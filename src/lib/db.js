// src/lib/db.js
import { ALL_SEALS } from "./sealLogic";

const FIREBASE_URL =
  "https://yeongje-pocketchallenge-default-rtdb.firebaseio.com";

export const db = {
  async set(p, d) {
    const r = await fetch(`${FIREBASE_URL}/${p}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    });
    if (!r.ok) throw new Error();
    return r.json();
  },
  async get(p) {
    const r = await fetch(`${FIREBASE_URL}/${p}.json`);
    if (!r.ok) throw new Error();
    return r.json();
  },
  async update(p, d) {
    const r = await fetch(`${FIREBASE_URL}/${p}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    });
    if (!r.ok) throw new Error();
    return r.json();
  },
  async remove(p) {
    await fetch(`${FIREBASE_URL}/${p}.json`, { method: "DELETE" });
  },

  async transaction(p, updateFn, maxRetries = 5) {
    for (let i = 0; i < maxRetries; i++) {
      const r = await fetch(`${FIREBASE_URL}/${p}.json`, {
        headers: { "X-Firebase-ETag": "true" },
      });
      if (!r.ok) throw new Error("transaction read failed");
      const etag = r.headers.get("ETag");
      const current = await r.json();

      const next = updateFn(current);
      if (next === undefined) return null;

      const w = await fetch(`${FIREBASE_URL}/${p}.json`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "if-match": etag,
        },
        body: JSON.stringify(next),
      });

      if (w.ok) return next;
      if (w.status === 412) continue;
      throw new Error("transaction write failed: " + w.status);
    }
    throw new Error("transaction max retries exceeded");
  },

  onValue(path, cb, ms = 800) {
    let ok = true;
    let lastRequestId = 0;
    let lastSeq = -1;

    const poll = async () => {
      if (!ok) return;
      const myId = ++lastRequestId;
      try {
        const data = await db.get(path);
        if (!ok) return;
        if (myId < lastRequestId) return;

        const incomingSeq = data?.gs?._seq ?? -1;
        const isNewGame = incomingSeq === 0 || incomingSeq === 1;

        if (!isNewGame && incomingSeq !== -1 && incomingSeq < lastSeq) return;
        if (incomingSeq !== -1) lastSeq = incomingSeq;

        cb(data);
      } catch (e) {}
    };

    poll();
    const id = setInterval(poll, ms);
    return () => {
      ok = false;
      clearInterval(id);
    };
  },
};

// ── 유저 인증 ──────────────────────────────────────────────
const hashPass = (pass) => {
  let h = 0;
  for (let i = 0; i < pass.length; i++)
    h = (Math.imul(31, h) + pass.charCodeAt(i)) | 0;
  return h.toString(36);
};

const nickToKey = (nick) => encodeURIComponent(nick.trim()).replace(/%/g, "_");

export async function registerUser(nickname, password) {
  const key = nickToKey(nickname);
  const existing = await db.get(`users/${key}`).catch(() => null);
  if (existing) throw new Error("이미 사용 중인 닉네임이에요.");

  const now = Date.now();
  const permanentUid = now.toString(36) + Math.random().toString(36).slice(2);

  const user = {
    nickname: nickname.trim(),
    password: hashPass(password),
    uid: permanentUid,
    coins: 300,
    sealDex: {},
    wins: { solo: 0, multi: 0, total: 0 },
    createdAt: now,
  };

  await db.set(`users/${key}`, user);
  await saveLeaderboard(nickname.trim(), 300, {});
  await db.update(`leaderboard/${key}`, { registeredAt: now }).catch(() => {});

  // ★★★ 수정: 닉네임도 즉시 저장 (UID 일관성 보장) ★★★
  localStorage.setItem("pks_nickname", nickname.trim());
  localStorage.setItem("pks_user_uid", permanentUid);

  return { ...user, isNew: true };
}

export async function loginUser(nickname, password) {
  const key = nickToKey(nickname);
  const user = await db.get(`users/${key}`).catch(() => null);
  if (!user) throw new Error("존재하지 않는 닉네임이에요.");
  if (user.password !== hashPass(password))
    throw new Error("비밀번호가 틀렸어요.");

  if (!user.uid) {
    const permanentUid =
      Date.now().toString(36) + Math.random().toString(36).slice(2);
    user.uid = permanentUid;
    await db.update(`users/${key}`, { uid: permanentUid }).catch(() => {});
  }

  // ★★★ 수정: 닉네임도 즉시 저장 (UID 일관성 보장) ★★★
  //         - App.tsx의 handleLogin 이 실행되기 전이라도
  //           getPlayerUid() 가 닉네임 기반 UID 를 반환하도록
  localStorage.setItem("pks_nickname", nickname.trim());
  localStorage.setItem("pks_user_uid", user.uid);

  return user;
}

const _saveQueues = {};

export async function saveUserData(nickname, patch = {}) {
  const key = nickToKey(nickname);

  const prev = _saveQueues[key] ?? Promise.resolve();
  const next = prev.then(async () => {
    const {
      coins,
      sealDex,
      inventory,
      emoteLoadout,
      trainerId,
      bio,
      borderStyle,
      wins,
      title,
      badge,
      stats,
      featuredSealIds,
      freeBreadCount,
      freePremiumBreadCount,
      breadTutorialDone,
      likesReceived,
      dailyMissions,
      attendance,
      shinyDex,
      capDex,
      tournament,
      pendingShinySeals,
      miniGameScores,
      eventProg,
      miniGameSeals,
      miniGameTitles,
    } = patch;

    const data = { updatedAt: Date.now() };

    if (coins !== undefined) data.coins = coins;
    if (sealDex !== undefined) data.sealDex = sealDex;
    if (shinyDex !== undefined) data.shinyDex = shinyDex;
    if (capDex !== undefined) data.capDex = capDex;
    if (tournament !== undefined) data.tournament = tournament;
    if (pendingShinySeals !== undefined)
      data.pendingShinySeals = pendingShinySeals;
    if (miniGameScores !== undefined) data.miniGameScores = miniGameScores;
    if (eventProg !== undefined) data.eventProg = eventProg;
    if (inventory !== undefined) data.inventory = inventory;
    if (emoteLoadout !== undefined) data.emoteLoadout = emoteLoadout;
    if (trainerId !== undefined) data.trainerId = trainerId;
    if (bio !== undefined) data.bio = bio;
    if (borderStyle !== undefined) data.borderStyle = borderStyle;
    if (wins !== undefined) data.wins = wins;
    if (title !== undefined) data.title = title;
    if (badge !== undefined) data.badge = badge;
    if (stats !== undefined) data.stats = stats;
    if (featuredSealIds !== undefined) data.featuredSealIds = featuredSealIds;
    if (freeBreadCount !== undefined) data.freeBreadCount = freeBreadCount;
    if (freePremiumBreadCount !== undefined)
      data.freePremiumBreadCount = freePremiumBreadCount;
    if (breadTutorialDone !== undefined)
      data.breadTutorialDone = breadTutorialDone;
    if (likesReceived !== undefined) data.likesReceived = likesReceived;
    if (dailyMissions !== undefined) data.dailyMissions = dailyMissions;
    if (attendance !== undefined) data.attendance = attendance;
    if (miniGameSeals !== undefined) data.miniGameSeals = miniGameSeals;
    if (miniGameTitles !== undefined) data.miniGameTitles = miniGameTitles;

    await db.update(`users/${key}`, data).catch(() => {});
  });

  _saveQueues[key] = next.catch(() => {});
  return next;
}

export async function incGames() {
  try {
    const r = await fetch(`${FIREBASE_URL}/stats/totalGames.json`, {
      headers: { "X-Firebase-ETag": "true" },
    });
    const etag = r.headers.get("ETag");
    const c = (await r.json()) || 0;
    await fetch(`${FIREBASE_URL}/stats/totalGames.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "if-match": etag },
      body: JSON.stringify(c + 1),
    });
  } catch (e) {}
}

export async function saveLeaderboard(
  name,
  coins,
  sealDex = {},
  {
    trainerId,
    bio,
    borderStyle,
    wins,
    title,
    badge,
    featuredSealIds,
    displayName,
  } = {}
) {
  if (!name) return;
  if (name === "admin") return;

  const k = encodeURIComponent(name).replace(/%/g, "_");

  const total = ALL_SEALS.length;
  const collected = Object.values(sealDex).filter((v) => v?.count > 0).length;
  const percent = Math.round((collected / total) * 100);

  const HOLO_IDS = new Set(
    ALL_SEALS.filter((s) => s.grade === "HOLO").map((s) => String(s.id))
  );
  const holoCount = Object.entries(sealDex).filter(
    ([id, v]) => HOLO_IDS.has(id) && v?.count > 0
  ).length;

  const patch = {
    name: displayName || name,
    coins,
    collected,
    percent,
    holoCount,
    updatedAt: Date.now(),
  };
  if (trainerId !== undefined && trainerId !== null)
    patch.trainerId = trainerId;
  if (bio !== undefined) patch.bio = bio;
  if (borderStyle !== undefined) patch.borderStyle = borderStyle;
  if (wins !== undefined) patch.wins = wins;
  if (title !== undefined) patch.title = title;
  if (badge !== undefined) patch.badge = badge;
  if (featuredSealIds !== undefined) patch.featuredSealIds = featuredSealIds;

  try {
    await db.update(`leaderboard/${k}`, patch);
  } catch (e) {}
}

export async function fetchLeaderboard() {
  try {
    const d = await db.get("leaderboard");
    if (!d) return [];
    return Object.entries(d).map(([key, val]) => ({ ...val, _key: key }));
  } catch (e) {
    return [];
  }
}

// ★★★ 닉네임 기반 UID (기기 간 동기화) ★★★
export const getPlayerUid = () => {
  const nickname = localStorage.getItem("pks_nickname");

  // ★ 닉네임이 있으면 닉네임 기반 UID 사용 (기기 간 동일)
  if (nickname) {
    const nicknameBasedUid = `user_${encodeURIComponent(
      nickname.trim()
    ).replace(/%/g, "_")}`;

    // localStorage에 저장 (기존 호환성 유지)
    localStorage.setItem("pks_user_uid", nicknameBasedUid);
    localStorage.setItem("pks_player_uid", nicknameBasedUid);

    return nicknameBasedUid;
  }

  // ★ 닉네임 없으면 기존 방식 (로그인 전)
  let uid = localStorage.getItem("pks_user_uid");

  if (!uid) {
    const oldUid = localStorage.getItem("pks_player_uid");
    if (oldUid) {
      uid = oldUid;
      localStorage.setItem("pks_user_uid", uid);
    } else {
      uid = Date.now().toString(36) + Math.random().toString(36).slice(2);
      localStorage.setItem("pks_user_uid", uid);
    }
  }

  // ★ 양쪽 동기화 유지 (안전)
  if (uid && !localStorage.getItem("pks_player_uid")) {
    localStorage.setItem("pks_player_uid", uid);
  }

  return uid;
};

export const registerPresence = async () => {
  const uid = getPlayerUid();
  try {
    await db.update(`players/${uid}`, { joinedAt: Date.now(), online: true });
    const off = () =>
      fetch(`${FIREBASE_URL}/players/${uid}/online.json`, {
        method: "PUT",
        body: "false",
        keepalive: true,
      });
    window.addEventListener("beforeunload", off);
  } catch (e) {}
};

const compressImage = (dataUrl, maxPx = 160, q = 0.78) =>
  new Promise((res) => {
    if (!dataUrl || !dataUrl.startsWith("data:image")) return res(dataUrl);
    const img = new Image();
    img.onload = () => {
      const r = Math.min(1, maxPx / img.width, maxPx / img.height);
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * r);
      c.height = Math.round(img.height * r);
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL("image/jpeg", q));
    };
    img.onerror = () => res(dataUrl);
    img.src = dataUrl;
  });

export const uploadRoomAssets = async (code, cards, trainers, customs) => {
  const compress = async (obj, px) => {
    const out = {};
    for (const [k, v] of Object.entries(obj))
      out[k] = await compressImage(v, px);
    return out;
  };
  const tasks = [];
  if (Object.keys(cards).length > 0)
    tasks.push(
      db.set(`rooms/${code}/img_c`, await compress(cards, 200)).catch(() => {})
    );
  if (Object.keys(trainers).length > 0)
    tasks.push(
      db
        .set(`rooms/${code}/img_t`, await compress(trainers, 120))
        .catch(() => {})
    );
  if (customs?.length > 0)
    tasks.push(db.set(`rooms/${code}/img_x`, customs).catch(() => {}));
  await Promise.all(tasks);
};

export const downloadRoomAssets = async (code) => {
  const [rc, rt, rx] = await Promise.allSettled([
    db.get(`rooms/${code}/img_c`),
    db.get(`rooms/${code}/img_t`),
    db.get(`rooms/${code}/img_x`),
  ]);
  return {
    cards: rc.status === "fulfilled" ? rc.value : null,
    trainers: rt.status === "fulfilled" ? rt.value : null,
    customs: rx.status === "fulfilled" ? rx.value : null,
  };
};
