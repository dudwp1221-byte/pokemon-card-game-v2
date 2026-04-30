import {
  LEAGUES,
  TRAINER_POOL,
  TYPES,
  SD_DEFAULT,
  TEAM_A_COLOR,
  TEAM_B_COLOR,
} from "./constants";

// ── 팀 헬퍼 ──
export function getTeamOf(playerIdx, teams) {
  if (!teams) return null;
  if ((teams.A || []).includes(playerIdx)) return "A";
  if ((teams.B || []).includes(playerIdx)) return "B";
  return null;
}
export function getTeamColor(teamId) {
  return teamId === "A" ? TEAM_A_COLOR : TEAM_B_COLOR;
}
export function getTeamEmoji(teamId) {
  return teamId === "A" ? "🔵" : "🔴";
}
export function getTeammateIdx(myIdx, teams) {
  if (!teams) return null;
  const myTeam = getTeamOf(myIdx, teams);
  if (!myTeam) return null;
  const found = (teams[myTeam] || []).find((i) => i !== myIdx);
  return found !== undefined ? found : null;
}

// ── 덱 빌더 ──
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// copies: 각 카드 장수 (기본 4장, 4세트 룰은 6장)
export function buildDeck(groups, copies = 4) {
  const cards = [];
  let id = 0;
  for (const g of groups)
    for (const t of TYPES)
      for (let i = 0; i < copies; i++)
        cards.push({ id: id++, group: g.id, type: t, isJoker: false });
  cards.push(
    { id: id++, group: "joker", type: "1", isJoker: true },
    { id: id++, group: "joker", type: "2", isJoker: true }
  );
  return shuffle(cards);
}

export function buildDeckTeam(groups, copies = 4) {
  const cards = [];
  let id = 0;
  for (const g of groups)
    for (const t of TYPES)
      for (let i = 0; i < copies; i++)
        cards.push({ id: id++, group: g.id, type: t, isJoker: false });
  cards.push(
    { id: id++, group: "joker", type: "1", isJoker: true },
    { id: id++, group: "joker", type: "2", isJoker: true }
  );
  return shuffle(cards);
}

// ── 세트 판정 ──
export function isValidSet(c) {
  if (c.length !== 3) return false;
  const j = c.filter((x) => x.isJoker),
    n = c.filter((x) => !x.isJoker);
  if (j.length >= 2) return true;
  if (j.length === 1) {
    if (n.length !== 2) return false;
    return n[0].group === n[1].group;
  }
  const gs = c.map((x) => x.group),
    ts = c.map((x) => x.type);
  if (!gs.every((g) => g === gs[0])) return false;
  return ts.every((t) => t === ts[0]) || new Set(ts).size === 3;
}

export function canFormSets(cards, n) {
  if (n === 0) return cards.length === 0;
  if (cards.length < 3) return false;
  for (let i = 0; i < cards.length - 2; i++)
    for (let j = i + 1; j < cards.length - 1; j++)
      for (let k = j + 1; k < cards.length; k++) {
        if (isValidSet([cards[i], cards[j], cards[k]])) {
          if (
            canFormSets(
              cards.filter((_, x) => x !== i && x !== j && x !== k),
              n - 1
            )
          )
            return true;
        }
      }
  return false;
}

export function findSets(cards, maxSets = 3) {
  if (!cards || cards.length < 3) return null;
  let best = null;

  function bt(remaining, found) {
    if (!best || found.length > best.length) best = [...found];
    if (found.length === maxSets || remaining.length < 3) return;
    for (let i = 0; i < remaining.length - 2; i++) {
      for (let j = i + 1; j < remaining.length - 1; j++) {
        for (let k = j + 1; k < remaining.length; k++) {
          if (isValidSet([remaining[i], remaining[j], remaining[k]])) {
            bt(
              remaining.filter((_, x) => x !== i && x !== j && x !== k),
              [...found, [remaining[i], remaining[j], remaining[k]]]
            );
            if (best && best.length === maxSets) return;
          }
        }
      }
    }
  }

  bt(cards, []);
  return best && best.length > 0 ? best : null;
}

// ── 승리 판정 ──
// 기본:  핸드 9장(뽑은 후) → 3세트(9장) 완성
// 4set:  핸드 13장(뽑은 후) → 어떤 1장을 버려도 4세트(12장) 완성
//        핸드 12장(버린 후) → 4세트(12장) 완성
export function checkWin(h, wildRule) {
  if (wildRule === "4set") {
    // 버린 후: 12장 전부 4세트
    if (h.length === 12) return canFormSets(h, 4);
    // 뽑은 후: 13장 중 1장 제거 시 4세트
    if (h.length === 13)
      return h.some((_, i) =>
        canFormSets(
          h.filter((_, j) => j !== i),
          4
        )
      );
    return false;
  }
  return h.length === 9 && canFormSets(h, 3);
}

export function sortHand(hand, groups) {
  return [...hand].sort((a, b) => {
    if (a.isJoker && !b.isJoker) return 1;
    if (!a.isJoker && b.isJoker) return -1;
    const gi = groups.findIndex((g) => g.id === a.group);
    const gj = groups.findIndex((g) => g.id === b.group);
    if (gi !== gj) return gi - gj;
    return a.type.localeCompare(b.type);
  });
}

function scoreHand(cards) {
  let score = 0;
  const used = new Set();
  for (let i = 0; i < cards.length - 2; i++)
    for (let j = i + 1; j < cards.length - 1; j++)
      for (let k = j + 1; k < cards.length; k++) {
        if (used.has(i) || used.has(j) || used.has(k)) continue;
        if (isValidSet([cards[i], cards[j], cards[k]])) {
          score += 100;
          used.add(i);
          used.add(j);
          used.add(k);
        }
      }
  for (let i = 0; i < cards.length; i++) {
    if (used.has(i)) continue;
    for (let j = i + 1; j < cards.length; j++) {
      if (used.has(j)) continue;
      const a = cards[i],
        b = cards[j];
      if (!a.isJoker && !b.isJoker && a.group === b.group) score += 10;
    }
  }
  for (let i = 0; i < cards.length; i++)
    if (!used.has(i) && cards[i].isJoker) score += 30;
  return score;
}

// ── AI 설정 ──
const AI_PROFILE = {
  kanto: { mistakeRate: 0.45, sdRate: 0.2, pileGainThreshold: 30 },
  johto: { mistakeRate: 0.2, sdRate: 0.45, pileGainThreshold: 20 },
  hoenn: { mistakeRate: 0.1, sdRate: 0.65, pileGainThreshold: 10 },
  multi: { mistakeRate: 0.2, sdRate: 0.45, pileGainThreshold: 20 },
  sinnoh: { mistakeRate: 0.0, sdRate: 0.7, pileGainThreshold: 5 },
  unova: { mistakeRate: 0.0, sdRate: 0.75, pileGainThreshold: 3 },
  kalos: { mistakeRate: 0.0, sdRate: 0.78, pileGainThreshold: 3 },
  alola: { mistakeRate: 0.0, sdRate: 0.8, pileGainThreshold: 2 },
  galar: { mistakeRate: 0.0, sdRate: 0.82, pileGainThreshold: 2 },
};

function getAiProfile(leagueId) {
  return AI_PROFILE[leagueId] || AI_PROFILE.hoenn;
}

export function aiDiscard(nine, leagueId) {
  const profile = getAiProfile(leagueId);
  const nonJokerIdxs = nine
    .map((c, i) => (c.isJoker ? -1 : i))
    .filter((i) => i >= 0);
  if (nonJokerIdxs.length === 0) return nine.length - 1;
  if (profile.mistakeRate > 0 && Math.random() < profile.mistakeRate) {
    return nonJokerIdxs[Math.floor(Math.random() * nonJokerIdxs.length)];
  }
  let bestScore = -1,
    bestIdx = nonJokerIdxs[0];
  for (const i of nonJokerIdxs) {
    const score = scoreHand(nine.filter((_, j) => j !== i));
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  return bestIdx;
}

export function aiDiscardTeam(nine, teammateHand, leagueId) {
  if (!teammateHand || teammateHand.length === 0)
    return aiDiscard(nine, leagueId);
  const profile = getAiProfile(leagueId);
  const tmGroups = {};
  for (const c of teammateHand)
    if (!c.isJoker) tmGroups[c.group] = (tmGroups[c.group] || 0) + 1;
  const tmWants = new Set(
    Object.entries(tmGroups)
      .filter(([, v]) => v >= 2)
      .map(([k]) => k)
  );
  const nonJokerIdxs = nine
    .map((c, i) => (c.isJoker ? -1 : i))
    .filter((i) => i >= 0);
  if (nonJokerIdxs.length === 0) return nine.length - 1;
  if (profile.mistakeRate > 0 && Math.random() < profile.mistakeRate) {
    return nonJokerIdxs[Math.floor(Math.random() * nonJokerIdxs.length)];
  }
  let bestScore = -1,
    bestIdx = nonJokerIdxs[0];
  for (const i of nonJokerIdxs) {
    let score = scoreHand(nine.filter((_, j) => j !== i));
    if (tmWants.has(nine[i].group)) score += 15;
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  return bestIdx;
}

// wildRule: 'no_discard' → AI도 버린패 가져가기 불가
export function aiFindBestDiscardPile(
  players,
  curIdx,
  hand,
  leagueId,
  wildRule
) {
  if (wildRule === "no_discard") return null;
  const profile = getAiProfile(leagueId);
  const currentScore = scoreHand(hand);
  let bestGain = profile.pileGainThreshold,
    bestPile = null;
  for (let i = 0; i < players.length; i++) {
    if (i === curIdx) continue;
    const topCard = players[i].discardPile?.[0];
    if (!topCard) continue;
    const withCard = [...hand, topCard];
    const discardIdx = aiDiscard(withCard, leagueId);
    const gain =
      scoreHand(withCard.filter((_, j) => j !== discardIdx)) - currentScore;
    if (gain > bestGain) {
      bestGain = gain;
      bestPile = { playerIdx: i, card: topCard };
    }
  }
  return bestPile;
}

export function getAiSdRate(leagueId) {
  return getAiProfile(leagueId).sdRate;
}

export function reshuffleDeck(g) {
  const cards = [];
  for (const p of g.players) {
    const keep = p.discardPile.slice(0, 3),
      take = p.discardPile.slice(3);
    p.discardPile = keep;
    cards.push(...take);
  }
  if (cards.length === 0) {
    for (const p of g.players) {
      if (p.discardPile.length > 1) {
        const extra = p.discardPile.splice(1);
        cards.push(...extra);
      }
    }
  }
  shuffle(cards);
  g.deck = cards;
}

export function applyWinner(g, winnerName) {
  g.winner = winnerName;
  const basePot = g.basePot || g.pot || 0;

  if (g.teamMode && g.teams) {
    const winnerIdx = g.players.findIndex((p) => p.name === winnerName);
    const winTeam = getTeamOf(winnerIdx, g.teams);
    g.winnerTeam = winTeam;
    const teammateIdx = getTeammateIdx(winnerIdx, g.teams);
    const teammateName = g.players[teammateIdx]?.name;
    const winnerDeclared = !!g.showdownUsed[winnerName];
    const teammateDeclared = !!(teammateName && g.showdownUsed[teammateName]);
    let winnerGain = Math.floor(basePot / 2);
    let teammateGain = Math.floor(basePot / 2);
    const sdMult = g.wildRule === "jackpot" ? 3 : 1.5;
    if (winnerDeclared) winnerGain += Math.floor(g.sdAmount * sdMult);
    if (teammateDeclared) teammateGain += Math.floor(g.sdAmount * sdMult);
    g.coins[winnerName] = (g.coins[winnerName] || 0) + winnerGain;
    if (teammateName)
      g.coins[teammateName] = (g.coins[teammateName] || 0) + teammateGain;
  } else {
    let winAmount = basePot;
    if (g.showdownUsed[winnerName]) {
      const sdMult = g.wildRule === "jackpot" ? 3 : 1.5;
      winAmount += Math.floor(g.sdAmount * sdMult);
    }
    g.coins[winnerName] = (g.coins[winnerName] || 0) + winAmount;
  }

  // 보너스타임: 이기든 지든 추가 코인 지급
  if (g.wildRule === "bonus") {
    for (const p of g.players) {
      const bonus = p.name === winnerName ? 500 : 200;
      g.coins[p.name] = (g.coins[p.name] || 0) + bonus;
    }
  }
}

export function normalizeGs(g) {
  if (!g) return g;
  return {
    ...g,
    _seq: g._seq || 0,
    turnStartedAt: g.turnStartedAt || Date.now(),
    deck: g.deck || [],
    players: (g.players || []).map((p) => ({
      ...p,
      hand: p.hand || [],
      discardPile: p.discardPile || [],
    })),
    showdownUsed: g.showdownUsed || {},
    coins: g.coins || {},
    preGameCoins: g.preGameCoins || {},
    bet: g.bet || 10,
    sdAmount: g.sdAmount || 20,
    basePot: g.basePot || 0,
    leagueId: g.leagueId || "kanto",
    teamMode: g.teamMode || false,
    teams: g.teams || null,
    winnerTeam: g.winnerTeam || null,
    wildRule: g.wildRule || null,
  };
}

// wildRule: '4set' → 핸드 12장, 덱 6장씩
export function initGs(players, coins, startIdx, bet, leagueId, wildRule) {
  const lg = LEAGUES.find((l) => l.id === leagueId) || LEAGUES[0];
  const groups = lg.groups;
  const is4Set = wildRule === "4set";
  const deckCopies = is4Set ? 6 : 4;
  const handSize = is4Set ? 12 : 8;
  const deck = buildDeck(groups, deckCopies);
  const ps = players.map((p, i) => ({
    ...p,
    id: i,
    hand: [],
    discardPile: [],
    aiSpeed: p.isAI ? p.aiSpeed || 0.3 + Math.random() * 0.7 : 1.0,
  }));
  let d = [...deck];
  for (const p of ps) p.hand = sortHand(d.splice(0, handSize), groups);
  const preGameCoins = {};
  for (const p of players) preGameCoins[p.name] = coins[p.name] ?? 300;
  const gameCoins = {};
  for (const p of players)
    gameCoins[p.name] = Math.max(0, (coins[p.name] ?? 300) - bet);
  const basePot = players.length * bet;
  return {
    players: ps,
    deck: d,
    phase: "draw",
    cur: startIdx || 0,
    winner: null,
    winnerTeam: null,
    teamMode: false,
    teams: null,
    coins: gameCoins,
    preGameCoins,
    pot: basePot,
    basePot,
    showdownUsed: Object.fromEntries(players.map((p) => [p.name, false])),
    _seq: 0,
    turnStartedAt: Date.now(),
    bet,
    sdAmount: bet,
    leagueId: leagueId || "kanto",
    wildRule: wildRule || null,
  };
}

export function initGsTeam(players, coins, startIdx, bet, leagueId, wildRule) {
  const lg = LEAGUES.find((l) => l.id === leagueId) || LEAGUES[0];
  const groups = lg.groups;
  const is4Set = wildRule === "4set";
  const deckCopies = is4Set ? 6 : 4;
  const handSize = is4Set ? 12 : 8;
  const deck = buildDeckTeam(groups, deckCopies);
  const ps = players.map((p, i) => ({
    ...p,
    id: i,
    hand: [],
    discardPile: [],
    aiSpeed: p.isAI ? p.aiSpeed || 0.3 + Math.random() * 0.7 : 1.0,
  }));
  let d = [...deck];
  for (const p of ps) p.hand = sortHand(d.splice(0, handSize), groups);
  const preGameCoins = {};
  for (const p of players) preGameCoins[p.name] = coins[p.name] ?? 300;
  const gameCoins = {};
  for (const p of players)
    gameCoins[p.name] = Math.max(0, (coins[p.name] ?? 300) - bet);
  const basePot = players.length * bet;
  return {
    players: ps,
    deck: d,
    phase: "draw",
    cur: startIdx || 0,
    winner: null,
    winnerTeam: null,
    teamMode: true,
    teams: { A: [0, 2], B: [1, 3] },
    coins: gameCoins,
    preGameCoins,
    pot: basePot,
    basePot,
    showdownUsed: Object.fromEntries(players.map((p) => [p.name, false])),
    _seq: 0,
    turnStartedAt: Date.now(),
    bet,
    sdAmount: bet,
    leagueId: leagueId || "kanto",
    wildRule: wildRule || null,
  };
}

export function pickTrainers(n, ex) {
  const pool = [
    ...TRAINER_POOL,
    ...(window.__customTrainers || []).map((name) => ({ n: name, e: "🎭" })),
  ].filter((t) => t.n !== ex);
  const r = [];
  while (r.length < n && pool.length) {
    const i = Math.floor(Math.random() * pool.length);
    r.push(pool.splice(i, 1)[0]);
  }
  return r;
}

export function refreshBrokeAI(players, coins, bet) {
  return players.map((p) => {
    if (!p.isAI || (coins[p.name] || 0) >= bet) return p;
    const [na] = pickTrainers(1, null);
    if (!na) return p;
    const newName = `${na.n} (AI)`;
    coins[newName] = Math.max(bet * 6, 300);
    delete coins[p.name];
    return { name: newName, emoji: na.e, isAI: true, portraitName: na.n };
  });
}

export const randCode = () => String(Math.floor(1000 + Math.random() * 9000));
