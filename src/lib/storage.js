import { db } from "./db";

// ── persistImgs / loadImgs ─────────────────────────────────────────────────
export async function persistImgs(k, d) {
  try {
    const json = JSON.stringify(d);
    localStorage.setItem(k, json);
    window.storage?.set(k, json);
  } catch (e) {}
}

export async function loadImgs(k) {
  try {
    if (window.storage) {
      const r = await window.storage.get(k).catch(() => null);
      if (r?.value) return JSON.parse(r.value);
    }
    const local = localStorage.getItem(k);
    return local ? JSON.parse(local) : null;
  } catch (e) {
    try {
      const local = localStorage.getItem(k);
      return local ? JSON.parse(local) : null;
    } catch {
      return null;
    }
  }
}

// ── 코인 ──────────────────────────────────────────────────────────────────
async function getCoinUid() {
  let uid = localStorage.getItem("pks_coin_uid");
  if (!uid) {
    uid = Date.now().toString(36) + Math.random().toString(36).slice(2);
    localStorage.setItem("pks_coin_uid", uid);
  }
  return uid;
}

export async function persistCoins(c) {
  await persistImgs("pks_mycoins", c);
  try {
    const uid = await getCoinUid();
    if (uid) await db.update(`shop/coins/${uid}`, { coins: c, ts: Date.now() });
  } catch (e) {}
}

export async function loadCoins() {
  const s = await loadImgs("pks_mycoins");
  if (s != null) return s;
  try {
    const uid = await getCoinUid();
    if (!uid) return null;
    const d = await db.get(`shop/coins/${uid}`);
    if (d?.coins != null) return d.coins;
  } catch (e) {}
  return null;
}

// ── 상점 UID ──────────────────────────────────────────────────────────────
export const getShopUid = () => {
  let u = localStorage.getItem("pks_uid");
  if (!u) {
    u = Date.now().toString(36) + Math.random().toString(36).slice(2);
    localStorage.setItem("pks_uid", u);
  }
  return u;
};

// ── 닉네임 키 헬퍼 ────────────────────────────────────────────────────────
const nickToKey = (nick) => encodeURIComponent(nick.trim()).replace(/%/g, "_");

// ── 인벤토리 ──────────────────────────────────────────────────────────────
// ✅ 수정: uid 기반 + 계정 기반 둘 다 조회해서 병합 (더 많은 쪽 우선)
// 기존: uid 조회 성공하면 계정 조회 안 함 → uid 바뀌면 데이터 유실
// 수정: 항상 둘 다 조회해서 합집합으로 반환
export const getInventory = async () => {
  try {
    const uid = getShopUid();
    const nick = localStorage.getItem("pks_nickname");

    // 두 소스를 병렬로 조회
    const [deviceInv, accountInv] = await Promise.all([
      db.get(`shop/inv/${uid}`).catch(() => null),
      nick
        ? db.get(`users/${nickToKey(nick)}/inventory`).catch(() => null)
        : Promise.resolve(null),
    ]);

    // 둘 다 없으면 빈 객체
    if (!deviceInv && !accountInv) return {};

    // 합집합으로 병합 (어느 쪽에라도 있으면 보유한 것으로 처리)
    const merged = {
      ...(accountInv || {}),
      ...(deviceInv || {}),
    };

    // 병합 결과를 두 경로 모두에 동기화 (이후 조회 때 일관성 보장)
    if (Object.keys(merged).length > 0) {
      db.update(`shop/inv/${uid}`, merged).catch(() => {});
      if (nick) {
        db.update(`users/${nickToKey(nick)}/inventory`, merged).catch(() => {});
      }
    }

    return merged;
  } catch (e) {
    return {};
  }
};

// ── 장착 아이템 ───────────────────────────────────────────────────────────
export const getEquipped = async () => {
  try {
    return (await db.get(`shop/eq/${getShopUid()}`)) || {};
  } catch (e) {
    return {};
  }
};

// ── 구매: uid + 계정 양쪽 저장 ───────────────────────────────────────────
export const buyItem = async (id) => {
  try {
    const uid = getShopUid();
    const nick = localStorage.getItem("pks_nickname");

    // 두 경로에 동시 저장 (어느 쪽이 실패해도 다른 쪽은 저장)
    await Promise.all([
      db.update(`shop/inv/${uid}`, { [id]: true }),
      nick
        ? db
            .update(`users/${nickToKey(nick)}/inventory`, { [id]: true })
            .catch(() => {})
        : Promise.resolve(),
    ]);
    return true;
  } catch (e) {
    return false;
  }
};

export const equipItem = async (type, id) => {
  try {
    await db.update(`shop/eq/${getShopUid()}`, { [type]: id || null });
    return true;
  } catch (e) {
    return false;
  }
};
