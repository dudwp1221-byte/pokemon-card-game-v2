import { CLEAN, KANTO_MAP, T } from "./constants";

// ── 이미지 테스트 헬퍼 ──
const testImg = (url) =>
  new Promise((res) => {
    const i = new Image();
    i.onload = () => res(true);
    i.onerror = () => res(false);
    setTimeout(() => res(false), 8000);
    i.src = url;
  });

// ── 상점 에셋 로딩 ──
export async function loadShopAsset(file, exts) {
  for (const ext of exts) {
    const url = `${CLEAN}/${file}.${ext}`;
    let ok = false;
    if (ext === "mp4") {
      try {
        const r = await fetch(url, { method: "HEAD" });
        ok = r.ok;
      } catch (e) {}
    } else {
      ok = await testImg(url);
    }
    if (ok) return url;
  }
  return null;
}

// ── Kanto(기본) 카드 로딩 ──
export async function loadFromGithubCDN() {
  let fp = null,
    fe = null;
  for (const pre of [`${CLEAN}/cards/`, `${CLEAN}/`])
    for (const ext of ["png", "jpg", "jpeg", "webp"]) {
      if (await testImg(`${pre}${KANTO_MAP.electric_A}.${ext}`)) {
        fp = pre;
        fe = ext;
        break;
      }
      if (fp) break;
    }
  if (!fp) return { cards: {}, trainers: {} };

  const cards = Object.fromEntries(
    Object.entries(KANTO_MAP).map(([k, f]) => [k, `${fp}${f}.${fe}`])
  );
  const te = await Promise.all(
    Object.keys(T).map(async (name) => {
      for (const ext of [fe, "png", "jpg", "jpeg", "webp"]) {
        const u = `${fp}${name}.${ext}`;
        if (await testImg(u)) return [name, u];
      }
      return null;
    })
  );
  return { cards, trainers: Object.fromEntries(te.filter(Boolean)) };
}

// ── 리그별 카드 로딩 ──
export async function loadLeagueCards(prefix, fileMap) {
  if (!prefix) return null;
  let ext = null;
  for (const e of ["png", "jpg", "jpeg", "webp"]) {
    if (await testImg(`${CLEAN}/${prefix}_${fileMap.electric_A}.${e}`)) {
      ext = e;
      break;
    }
  }
  if (!ext) return null;
  return Object.fromEntries(
    Object.entries(fileMap).map(([k, f]) => [
      k,
      `${CLEAN}/${prefix}_${f}.${ext}`,
    ])
  );
}

// ── 배경/로딩 이미지 ──
export async function loadBgImages() {
  const tryLoad = async (n) => {
    for (const ext of ["png", "jpg", "jpeg", "webp"]) {
      const url = `${CLEAN}/${n}.${ext}`;
      if (await testImg(url)) return url;
    }
    return null;
  };
  const [lb, ld, gb] = await Promise.all([
    tryLoad("lobby_bg"),
    tryLoad("loading_bg"),
    tryLoad("game_bg"),
  ]);
  return { lobbyBg: lb, loadingBg: ld, gameBg: gb };
}

export const isVid = (u) =>
  !!(u && (u.endsWith(".mp4") || u.includes(".mp4?")));
