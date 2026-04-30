import { CLEAN } from "./constants";
import { useEffect, useCallback, useState } from "react";

export const SOUND_SLOTS = [
  { id: "bgm", label: "BGM", icon: "🎵", loop: true },
  { id: "draw", label: "카드 드로우", icon: "🃏" },
  { id: "select", label: "카드 선택", icon: "👆" },
  { id: "discard", label: "카드 버리기", icon: "🗑️" },
  { id: "pickDiscard", label: "버린카드 집기", icon: "🔄" },
  { id: "myTurn", label: "내 턴 알림", icon: "⚡" },
  { id: "showdown", label: "승부 선언", icon: "⚔️" },
  { id: "win", label: "승리", icon: "🏆" },
  { id: "lose", label: "패배", icon: "💀" },
  { id: "setComplete", label: "세트 완성", icon: "✨" },
  { id: "aiPlay", label: "AI 플레이", icon: "🤖" },
  { id: "roulette", label: "룰렛 결과", icon: "🎯" },
  { id: "breadOpen", label: "빵 뜯기", icon: "🍞" },
  { id: "sealReveal", label: "씰 공개", icon: "🌟" },
  { id: "coinGet", label: "코인 획득", icon: "💰" },
  { id: "buttonClick", label: "버튼 클릭", icon: "🖱️" },

  // ══════════════ 포켓 페스티벌 미니게임 ══════════════
  // 공통
  { id: "countdown", label: "카운트다운", icon: "3️⃣" },
  { id: "goSignal", label: "GO 신호", icon: "🏁" },
  { id: "newRecord", label: "신기록", icon: "🏅" },
  { id: "gameOverMG", label: "게임 종료", icon: "🔚" },
  { id: "patternMsg", label: "패턴 알림", icon: "📢" },

  // 🕳️ 디그다
  { id: "digdaPop", label: "디그다 타격", icon: "🕳️" },
  { id: "daktrioPop", label: "닥트리오 타격", icon: "🕳️" },
  { id: "alolaPop", label: "알로라 타격", icon: "✨" },
  { id: "geodudeHit", label: "데구리 꽝", icon: "❌" },
  { id: "comboBonus", label: "콤보 보너스", icon: "🔥" },
  { id: "comboBreak", label: "콤보 끊김", icon: "💔" },
  { id: "feverStart", label: "피버 시작", icon: "🔥" },
  { id: "timeWarning", label: "시간 경고", icon: "⏰" },
  { id: "digdaBgm", label: "디그다 BGM", icon: "🎵", loop: true },

  // 🔥 리자몽 타이밍
  { id: "timingPerfect", label: "PERFECT", icon: "🌟" },
  { id: "timingGreat", label: "GREAT", icon: "👍" },
  { id: "timingGood", label: "GOOD", icon: "✅" },
  { id: "timingOk", label: "OK", icon: "➖" },
  { id: "timingMiss", label: "MISS", icon: "❌" },
  { id: "charizardBgm", label: "리자몽 BGM", icon: "🎵", loop: true },

  // 💜 메타몽
  { id: "dittoTone", label: "메타몽 버튼", icon: "🎹" }, // playbackRate로 10가지 톤
  { id: "dittoWrong", label: "메타몽 오답", icon: "❌" },
  { id: "dittoLevelUp", label: "레벨업", icon: "⬆️" },
  { id: "dittoCleared", label: "전체 클리어", icon: "🎉" },
  { id: "dittoBgm", label: "메타몽 BGM", icon: "🎵", loop: true },

  // 🧬 진화 퀴즈
  { id: "quizCorrect", label: "정답", icon: "✅" },
  { id: "quizWrong", label: "오답", icon: "❌" },
  { id: "quizTimeout", label: "시간 초과", icon: "⏰" },
  { id: "quizTick", label: "타이머", icon: "⏱️" },
  { id: "evolutionBgm", label: "진화 BGM", icon: "🎵", loop: true },

  // ⚡ 피카츄 런
  { id: "runJump", label: "점프", icon: "⬆️" },
  { id: "runDoubleJump", label: "2단 점프", icon: "⏫" },
  { id: "runHit", label: "충돌", icon: "💥" },
  { id: "runBgm", label: "런 BGM", icon: "🎵", loop: true },

  // 🐟 잉어킹
  { id: "magikarpFlap", label: "잉어 튀기", icon: "🐟" },
  { id: "magikarpPass", label: "폭포 통과", icon: "⬆️" },
  { id: "magikarpGolden", label: "황금 획득", icon: "⭐" },
  { id: "magikarpEvolveGyarados", label: "갸라도스 진화", icon: "🐉" },
  { id: "magikarpEvolveGolden", label: "이로치 진화", icon: "✨" },
  { id: "magikarpEvolveRed", label: "붉은갸라도스", icon: "🔴" },
  { id: "magikarpCollide", label: "잉어 충돌", icon: "💥" },
  { id: "magikarpRevive", label: "잉어 부활", icon: "💛" },
  { id: "magikarpBgm", label: "잉어 BGM", icon: "🎵", loop: true },

  // 🔮 뮤 기억
  { id: "cardFlip", label: "카드 뒤집기", icon: "🔄" },
  { id: "cardMatch", label: "카드 매치", icon: "✅" },
  { id: "cardNoMatch", label: "카드 불일치", icon: "❌" },
  { id: "mewMemoryBgm", label: "뮤 BGM", icon: "🎵", loop: true },

  // 💫 뮤츠 피하기
  { id: "dodgeHit", label: "피격", icon: "💔" },
  { id: "dodgeWave", label: "웨이브", icon: "🌊" },
  { id: "mewtwoBgm", label: "뮤츠 BGM", icon: "🎵", loop: true },

  // 😴 잠만보
  { id: "catchSmall", label: "작은 열매", icon: "🫐" },
  { id: "catchMedium", label: "보통 열매", icon: "🍑" },
  { id: "catchBig", label: "큰 열매", icon: "⭐" },
  { id: "catchPepper", label: "고추 피격", icon: "🌶️" },
  { id: "catchPattern", label: "패턴 시작", icon: "🌈" },
  { id: "snorlaxBgm", label: "잠만보 BGM", icon: "🎵", loop: true },

  // ⚡ 포켓 핀볼
  { id: "pinballLaunch", label: "볼 발사", icon: "🚀" },
  { id: "pinballBounce", label: "벽 튕김", icon: "💫" },
  { id: "pinballHit", label: "몬스터 타격", icon: "💥" },
  { id: "pinballCrit", label: "크리티컬", icon: "💫" },
  { id: "pinballKill", label: "처치", icon: "⭐" },
  { id: "pinballBossKill", label: "보스 처치", icon: "👑" },
  { id: "pinballPikaHit", label: "피카츄 피격", icon: "💔" },
  { id: "pinballRoundClear", label: "라운드 클리어", icon: "🎉" },
  { id: "pinballBuff", label: "버프 획득", icon: "🎁" },
  { id: "pinballBgm", label: "핀볼 BGM", icon: "🎵", loop: true },

  // 🚀 로켓단
  { id: "rocketMove", label: "이동", icon: "👆" },
  { id: "rocketEscape", label: "탈출", icon: "🏁" },
  { id: "rocketHit", label: "로켓 충돌", icon: "💥" },
  { id: "rocketBgm", label: "로켓 BGM", icon: "🎵", loop: true },

  // ❓ 실루엣
  { id: "silhouetteReveal", label: "실루엣 공개", icon: "💡" },
  { id: "silhouetteCorrect", label: "실루엣 정답", icon: "✅" },
  { id: "silhouetteWrong", label: "실루엣 오답", icon: "❌" },
  { id: "silhouetteTimeout", label: "실루엣 시간", icon: "⏰" },
  { id: "silhouetteStreak", label: "연속 정답", icon: "🔥" },
  { id: "silhouetteBgm", label: "실루엣 BGM", icon: "🎵", loop: true },
];

// ── Web Audio API 폴백 효과음 ──────────────────────────────
const _ac = (() => {
  try {
    return new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    return null;
  }
})();

function synth(type, freq, dur, opts = {}) {
  if (!_ac) return;
  try {
    const { gain = 0.18, detune = 0, fadeOut = true, freqEnd = null } = opts;
    const ctx = _ac;
    if (ctx.state === "suspended") ctx.resume();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    if (detune) o.detune.setValueAtTime(detune, ctx.currentTime);
    if (freqEnd)
      o.frequency.linearRampToValueAtTime(freqEnd, ctx.currentTime + dur);
    g.gain.setValueAtTime(gain, ctx.currentTime);
    if (fadeOut)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + dur);
  } catch (e) {}
}

// ═══════════════ 공용 합성 헬퍼 (미니게임용) ═══════════════
const noise = (
  dur = 0.05,
  {
    filterType = "lowpass",
    freq = 1000,
    Q = 1,
    gain = 0.3,
    attack = 0.003,
  } = {}
) => {
  if (!_ac) return;
  try {
    const ctx = _ac;
    if (ctx.state === "suspended") ctx.resume();
    const bufLen = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = filterType;
    f.frequency.value = freq;
    f.Q.value = Q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(gain, ctx.currentTime + attack);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(f);
    f.connect(g);
    g.connect(ctx.destination);
    src.start(ctx.currentTime);
    src.stop(ctx.currentTime + dur + 0.01);
  } catch (e) {}
};

const arp = (freqs, gap = 80, dur = 0.15, gain = 0.16, type = "sine") => {
  freqs.forEach((f, i) =>
    setTimeout(() => synth(type, f, dur, { gain }), i * gap)
  );
};

// 각 이벤트별 Web Audio 폴백
const FALLBACK = {
  draw: () => synth("sine", 440, 0.12, { gain: 0.12, freqEnd: 520 }),
  select: () => synth("sine", 600, 0.08, { gain: 0.1 }),
  discard: () => {
    if (!_ac) return;
    try {
      const ctx = _ac;
      if (ctx.state === "suspended") ctx.resume();

      // 노이즈만으로 탁 치는 소리
      const bufLen = ctx.sampleRate * 0.08;
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

      const noise = ctx.createBufferSource();
      noise.buffer = buf;

      // 아주 낮은 로우패스 — 고음 완전 차단
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

      // 게인 — 앞부분 빠르게 치고 바로 감쇠
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 0.003);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      noise.connect(filter);
      filter.connect(g);
      g.connect(ctx.destination);
      noise.start(ctx.currentTime);
      noise.stop(ctx.currentTime + 0.09);
    } catch (e) {}
  },
  pickDiscard: () => synth("sine", 520, 0.12, { gain: 0.12, freqEnd: 600 }),
  myTurn: () => {
    synth("sine", 660, 0.12, { gain: 0.15 });
    setTimeout(() => synth("sine", 880, 0.15, { gain: 0.15 }), 120);
  },
  showdown: () => {
    synth("sawtooth", 110, 0.3, { gain: 0.22, freqEnd: 55 });
    setTimeout(
      () => synth("square", 220, 0.4, { gain: 0.18, freqEnd: 440 }),
      100
    );
  },
  win: () => {
    [0, 100, 200, 320].forEach((t, i) => {
      const freqs = [523, 659, 784, 1047];
      setTimeout(() => synth("sine", freqs[i], 0.25, { gain: 0.18 }), t);
    });
  },
  lose: () => {
    synth("sawtooth", 300, 0.2, { gain: 0.15, freqEnd: 150 });
    setTimeout(
      () => synth("sawtooth", 200, 0.3, { gain: 0.15, freqEnd: 80 }),
      200
    );
  },
  setComplete: () => {
    [0, 80, 160].forEach((t, i) => {
      const freqs = [784, 988, 1175];
      setTimeout(() => synth("sine", freqs[i], 0.18, { gain: 0.15 }), t);
    });
  },
  aiPlay: () => {
    if (!_ac) return;
    try {
      const ctx = _ac;
      if (ctx.state === "suspended") ctx.resume();
      const bufLen = Math.floor(ctx.sampleRate * 0.06);
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(350, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.06);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0);
      g.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 0.003);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      noise.connect(filter);
      filter.connect(g);
      g.connect(ctx.destination);
      noise.start(ctx.currentTime);
      noise.stop(ctx.currentTime + 0.07);
    } catch (e) {}
  },
  roulette: () => {
    if (!_ac) return;
    try {
      const ctx = _ac;
      if (ctx.state === "suspended") ctx.resume();

      // 룰렛 돌아가는 틱틱틱 — 처음엔 빠르고 점점 느려짐
      const ticks = [];
      let t = 0;
      const totalDur = 3.0;
      // 간격이 점점 넓어지도록
      for (let i = 0; i < 32; i++) {
        const ratio = i / 31;
        const gap = 0.03 + ratio * ratio * 0.22;
        ticks.push(t);
        t += gap;
        if (t > totalDur - 0.1) break;
      }

      ticks.forEach((tickTime, i) => {
        const isLast = i === ticks.length - 1;
        const bufLen = Math.floor(ctx.sampleRate * 0.018);
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let j = 0; j < bufLen; j++) data[j] = Math.random() * 2 - 1;

        const src = ctx.createBufferSource();
        src.buffer = buf;

        const f = ctx.createBiquadFilter();
        f.type = "bandpass";
        f.frequency.value = isLast ? 600 : 1200;
        f.Q.value = 2;

        const g = ctx.createGain();
        const vol = isLast ? 0.35 : 0.18;
        g.gain.setValueAtTime(0, ctx.currentTime + tickTime);
        g.gain.linearRampToValueAtTime(vol, ctx.currentTime + tickTime + 0.002);
        g.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + tickTime + 0.018
        );

        src.connect(f);
        f.connect(g);
        g.connect(ctx.destination);
        src.start(ctx.currentTime + tickTime);
        src.stop(ctx.currentTime + tickTime + 0.02);
      });

      // 결과 징 소리
      const ringTime = t + 0.05;
      [0, 0.12, 0.24].forEach((dt, i) => {
        const freqs = [880, 1100, 1320];
        const o = ctx.createOscillator();
        const og = ctx.createGain();
        o.type = "sine";
        o.frequency.value = freqs[i];
        og.gain.setValueAtTime(0.22, ctx.currentTime + ringTime + dt);
        og.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + ringTime + dt + 0.5
        );
        o.connect(og);
        og.connect(ctx.destination);
        o.start(ctx.currentTime + ringTime + dt);
        o.stop(ctx.currentTime + ringTime + dt + 0.5);
      });
    } catch (e) {}
  },
  breadOpen: () => synth("sawtooth", 180, 0.18, { gain: 0.13, freqEnd: 220 }),
  sealReveal: () => {
    synth("sine", 880, 0.3, { gain: 0.18 });
    setTimeout(() => synth("sine", 1100, 0.3, { gain: 0.16 }), 150);
    setTimeout(() => synth("sine", 1320, 0.4, { gain: 0.14 }), 300);
  },
  coinGet: () => {
    synth("sine", 660, 0.1, { gain: 0.14 });
    setTimeout(() => synth("sine", 880, 0.12, { gain: 0.14 }), 90);
  },
  buttonClick: () => {
    if (!_ac) return;
    try {
      const ctx = _ac;
      if (ctx.state === "suspended") ctx.resume();
      // 짧고 깔끔한 클릭 — 고음 노이즈 + 빠른 감쇠
      const bufLen = Math.floor(ctx.sampleRate * 0.025);
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 3000;
      filter.Q.value = 1.5;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.002);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);
      noise.connect(filter);
      filter.connect(g);
      g.connect(ctx.destination);
      noise.start(ctx.currentTime);
      noise.stop(ctx.currentTime + 0.03);
    } catch (e) {}
  },

  // ════════════════ 미니게임 폴백 ════════════════
  // ── 공통 ──
  countdown: () => synth("sine", 880, 0.12, { gain: 0.18 }),
  goSignal: () => {
    synth("sine", 660, 0.1, { gain: 0.18 });
    setTimeout(() => synth("sine", 880, 0.15, { gain: 0.2 }), 80);
    setTimeout(() => synth("sine", 1320, 0.2, { gain: 0.22 }), 180);
  },
  newRecord: () => arp([784, 988, 1175, 1568], 90, 0.2, 0.18),
  gameOverMG: () => {
    synth("sawtooth", 330, 0.25, { gain: 0.17, freqEnd: 165 });
    setTimeout(
      () => synth("sawtooth", 220, 0.35, { gain: 0.15, freqEnd: 110 }),
      220
    );
  },
  patternMsg: () => {
    synth("square", 523, 0.08, { gain: 0.14 });
    setTimeout(() => synth("square", 784, 0.12, { gain: 0.14 }), 80);
  },

  // ── 🕳️ 디그다 ──
  digdaPop: () => synth("square", 520, 0.08, { gain: 0.18, freqEnd: 780 }),
  daktrioPop: () => {
    synth("square", 420, 0.09, { gain: 0.2, freqEnd: 640 });
    setTimeout(
      () => synth("square", 520, 0.08, { gain: 0.15, freqEnd: 720 }),
      40
    );
  },
  alolaPop: () => arp([784, 988, 1318], 50, 0.12, 0.2, "sine"),
  geodudeHit: () => {
    synth("sawtooth", 180, 0.22, { gain: 0.22, freqEnd: 80 });
    noise(0.15, { filterType: "lowpass", freq: 300, gain: 0.35 });
  },
  comboBonus: () => arp([659, 880, 1175], 50, 0.1, 0.16),
  comboBreak: () => synth("sawtooth", 440, 0.3, { gain: 0.15, freqEnd: 180 }),
  feverStart: () => arp([523, 659, 784, 1047, 1319], 60, 0.18, 0.2),
  timeWarning: () => synth("square", 1046, 0.1, { gain: 0.2 }),
  // BGM은 CDN 로드 전용 (합성 BGM 없음)

  // ── 🔥 리자몽 타이밍 ──
  timingPerfect: () => arp([1046, 1318, 1568], 35, 0.12, 0.2),
  timingGreat: () => arp([880, 1175], 50, 0.12, 0.18),
  timingGood: () => synth("sine", 784, 0.15, { gain: 0.17 }),
  timingOk: () => synth("sine", 523, 0.12, { gain: 0.14 }),
  timingMiss: () => synth("sawtooth", 220, 0.25, { gain: 0.16, freqEnd: 110 }),

  // ── 💜 메타몽: playbackRate 대신 합성이라 기본 톤 (호출시 freq 조절하고 싶으면 SE.dittoTone(idx) 사용) ──
  dittoTone: () => synth("sine", 523, 0.2, { gain: 0.18 }),
  dittoWrong: () => synth("sawtooth", 196, 0.3, { gain: 0.18, freqEnd: 110 }),
  dittoLevelUp: () => arp([659, 880], 80, 0.15, 0.18),
  dittoCleared: () => arp([523, 659, 784, 1047, 1319, 1568], 100, 0.25, 0.2),

  // ── 🧬 진화 퀴즈 ──
  quizCorrect: () => arp([784, 1047], 60, 0.15, 0.17),
  quizWrong: () => synth("sawtooth", 260, 0.25, { gain: 0.16, freqEnd: 140 }),
  quizTimeout: () => {
    synth("square", 440, 0.15, { gain: 0.16 });
    setTimeout(
      () => synth("square", 330, 0.2, { gain: 0.16, freqEnd: 220 }),
      150
    );
  },
  quizTick: () => synth("square", 1200, 0.05, { gain: 0.12 }),

  // ── ⚡ 피카츄 런 ──
  runJump: () => synth("sine", 440, 0.12, { gain: 0.15, freqEnd: 880 }),
  runDoubleJump: () => {
    synth("sine", 523, 0.08, { gain: 0.14, freqEnd: 1046 });
    setTimeout(
      () => synth("sine", 1046, 0.1, { gain: 0.14, freqEnd: 1568 }),
      50
    );
  },
  runHit: () => {
    synth("sawtooth", 150, 0.3, { gain: 0.2, freqEnd: 60 });
    noise(0.2, { filterType: "lowpass", freq: 400, gain: 0.4 });
  },

  // ── 🐟 잉어킹 ──
  magikarpFlap: () => synth("sine", 660, 0.08, { gain: 0.13, freqEnd: 880 }),
  magikarpPass: () => synth("sine", 880, 0.12, { gain: 0.14, freqEnd: 1175 }),
  magikarpGolden: () => arp([1047, 1319, 1568, 2093], 60, 0.18, 0.2),
  magikarpEvolveGyarados: () => arp([440, 554, 659, 880, 1175], 80, 0.25, 0.2),
  magikarpEvolveGolden: () => arp([1319, 1568, 1976, 2349], 70, 0.22, 0.2),
  magikarpEvolveRed: () => arp([587, 740, 880, 1175, 1480], 90, 0.28, 0.22),
  magikarpCollide: () => {
    synth("sawtooth", 200, 0.3, { gain: 0.2, freqEnd: 80 });
    noise(0.2, { filterType: "lowpass", freq: 350, gain: 0.4 });
  },
  magikarpRevive: () => arp([659, 880, 1319, 1760], 100, 0.3, 0.2),

  // ── 🔮 뮤 기억 ──
  cardFlip: () => synth("sine", 1000, 0.06, { gain: 0.12, freqEnd: 1400 }),
  cardMatch: () => arp([784, 1047, 1319], 60, 0.14, 0.17),
  cardNoMatch: () => synth("sawtooth", 220, 0.2, { gain: 0.14, freqEnd: 130 }),

  // ── 💫 뮤츠 피하기 ──
  dodgeHit: () => {
    synth("sawtooth", 170, 0.25, { gain: 0.2, freqEnd: 70 });
    noise(0.15, { filterType: "lowpass", freq: 400, gain: 0.35 });
  },
  dodgeWave: () => synth("square", 523, 0.1, { gain: 0.13, freqEnd: 784 }),

  // ── 😴 잠만보 ──
  catchSmall: () => synth("sine", 880, 0.08, { gain: 0.13 }),
  catchMedium: () => arp([784, 1047], 40, 0.1, 0.15),
  catchBig: () => arp([1047, 1319, 1568], 50, 0.15, 0.18),
  catchPepper: () => {
    synth("sawtooth", 200, 0.2, { gain: 0.2, freqEnd: 100 });
    noise(0.12, { filterType: "bandpass", freq: 1500, gain: 0.3 });
  },
  catchPattern: () => arp([659, 784, 988], 70, 0.12, 0.16),

  // ── ⚡ 핀볼 ──
  pinballLaunch: () => synth("square", 220, 0.2, { gain: 0.18, freqEnd: 880 }),
  pinballBounce: () => synth("sine", 660, 0.04, { gain: 0.08, freqEnd: 880 }),
  pinballHit: () => {
    synth("square", 440, 0.06, { gain: 0.16, freqEnd: 660 });
    noise(0.04, { filterType: "bandpass", freq: 800, gain: 0.2 });
  },
  pinballCrit: () => arp([880, 1319, 1760], 30, 0.12, 0.2),
  pinballKill: () => arp([784, 1047], 50, 0.14, 0.18),
  pinballBossKill: () => arp([523, 784, 1047, 1319, 1760], 80, 0.22, 0.22),
  pinballPikaHit: () => {
    synth("sawtooth", 300, 0.2, { gain: 0.18, freqEnd: 150 });
    noise(0.1, { filterType: "lowpass", freq: 500, gain: 0.3 });
  },
  pinballRoundClear: () => arp([659, 784, 988, 1319], 90, 0.22, 0.2),
  pinballBuff: () => arp([523, 659, 880, 1175], 60, 0.15, 0.18),

  // ── 🚀 로켓단 ──
  rocketMove: () => synth("sine", 440, 0.04, { gain: 0.1 }),
  rocketEscape: () => arp([659, 880, 1319], 60, 0.15, 0.18),
  rocketHit: () => {
    synth("sawtooth", 200, 0.25, { gain: 0.18, freqEnd: 80 });
    noise(0.15, { filterType: "lowpass", freq: 400, gain: 0.35 });
  },

  // ── ❓ 실루엣 ──
  silhouetteReveal: () => synth("sine", 523, 0.3, { gain: 0.15, freqEnd: 880 }),
  silhouetteCorrect: () => arp([784, 1047], 50, 0.14, 0.17),
  silhouetteWrong: () =>
    synth("sawtooth", 220, 0.25, { gain: 0.16, freqEnd: 110 }),
  silhouetteTimeout: () => arp([440, 330, 220], 120, 0.2, 0.16, "square"),
  silhouetteStreak: () => arp([880, 1175, 1568, 2093], 50, 0.12, 0.2),
};

// ── SE 싱글턴 ──────────────────────────────────────────────
export const SE = (() => {
  let _s = {},
    _a = {},
    _muteBGM = false,
    _muteSFX = false;

  // ── 미니게임 BGM 관리 ──
  let _miniBgmId = null; // 현재 미니게임 BGM id
  let _mainBgmPlayingBefore = false; // 미니 BGM 시작 전 메인 BGM 상태

  const _listeners = new Set();
  const _emit = () =>
    _listeners.forEach((fn) => {
      try {
        fn({
          bgmMuted: _muteBGM,
          sfxMuted: _muteSFX,
          muted: _muteBGM && _muteSFX,
        });
      } catch {}
    });

  const get = (id) => {
    if (!_s[id]?.data) return null;
    if (!_a[id]) {
      _a[id] = new Audio(_s[id].data);
      if (SOUND_SLOTS.find((s) => s.id === id)?.loop) _a[id].loop = true;
    }
    return _a[id];
  };

  const play = (id) => {
    if (_muteSFX) return;
    const a = get(id);
    if (a) {
      try {
        a.currentTime = 0;
        a.play();
      } catch (e) {}
    } else {
      FALLBACK[id]?.();
    }
  };

  return {
    load(s) {
      Object.values(_a).forEach((a) => {
        try {
          a.pause();
          a.currentTime = 0;
        } catch (e) {}
      });
      _s = { ...s };
      Object.keys(_a).forEach((k) => delete _a[k]);
    },
    startBGM() {
      const a = get("bgm");
      if (!a || _muteBGM) return;
      if (!a.paused) return;
      a.volume = 0.3;
      try {
        a.play();
      } catch (e) {}
    },
    stopBGM() {
      const a = _a["bgm"];
      if (a)
        try {
          a.pause();
          a.currentTime = 0;
        } catch (e) {}
    },
    // 전체 음소거 (기존 호환)
    mute() {
      _muteBGM = true;
      _muteSFX = true;
      Object.values(_a).forEach((a) => {
        try {
          a.pause();
        } catch (e) {}
      });
      _emit();
    },
    unmute() {
      _muteBGM = false;
      _muteSFX = false;
      const a = get("bgm");
      if (a && a.paused)
        try {
          a.play();
        } catch (e) {}
      _emit();
    },
    isMuted() {
      return _muteBGM && _muteSFX;
    },

    // BGM 개별
    muteBGM() {
      _muteBGM = true;
      const a = _a["bgm"];
      if (a)
        try {
          a.pause();
        } catch (e) {}
      const m = _miniBgmId && _a[_miniBgmId];
      if (m)
        try {
          m.pause();
        } catch (e) {}
      _emit();
    },
    unmuteBGM() {
      _muteBGM = false;
      if (_miniBgmId) {
        const m = _a[_miniBgmId];
        if (m)
          try {
            m.play();
          } catch (e) {}
      } else {
        this.startBGM();
      }
      _emit();
    },
    isBGMMuted() {
      return _muteBGM;
    },

    // 효과음 개별
    muteSFX() {
      _muteSFX = true;
      _emit();
    },
    unmuteSFX() {
      _muteSFX = false;
      _emit();
    },
    isSFXMuted() {
      return _muteSFX;
    },

    // 구독 (React 훅용)
    subscribe(fn) {
      _listeners.add(fn);
      return () => _listeners.delete(fn);
    },

    draw() {
      play("draw");
    },
    select() {
      play("select");
    },
    discard() {
      play("discard");
    },
    pickDiscard() {
      play("pickDiscard");
    },
    myTurn() {
      play("myTurn");
    },
    showdown() {
      play("showdown");
    },
    roundWin() {
      play("win");
    },
    lose() {
      play("lose");
    },
    setComplete() {
      play("setComplete");
    },
    aiPlay() {
      play("aiPlay");
    },
    roulette() {
      play("roulette");
    },
    breadOpen() {
      play("breadOpen");
    },
    sealReveal() {
      play("sealReveal");
    },
    coinGet() {
      play("coinGet");
    },
    buttonClick() {
      play("buttonClick");
    },

    // ════════════ 미니게임 API ════════════
    // 제네릭 효과음 재생 (훅에서 사용)
    playSFX(id) {
      play(id);
    },

    // 메타몽 10개 버튼: 피치 다르게
    // freq = 기본 C5(523) 기준, 펜타토닉 배율
    dittoTone(idx = 0, opts = {}) {
      if (_muteSFX) return;
      const a = get("dittoTone");
      const pentatonic = [
        1.0, 1.122, 1.26, 1.498, 1.682, 2.0, 2.245, 2.52, 2.997, 3.363,
      ];
      const rate = pentatonic[idx % 10] || 1.0;
      if (a) {
        try {
          const clone = a.cloneNode();
          clone.playbackRate = rate;
          clone.volume = opts.volume ?? 1.0;
          clone.currentTime = 0;
          clone.play();
        } catch (e) {}
      } else {
        // 합성 폴백: 펜타토닉 음계로 freq 계산
        const baseFreq = 523; // C5
        synth("sine", baseFreq * rate, 0.2, { gain: 0.18 });
      }
    },

    // 미니게임 BGM 재생 (카드 게임 BGM은 pause됨)
    playMiniBGM(id) {
      if (!id) return;
      // 이미 같은 BGM이면 무시
      if (_miniBgmId === id) return;
      // 메인 BGM 상태 기억하고 중지
      const mainA = _a["bgm"];
      if (mainA && !mainA.paused) {
        _mainBgmPlayingBefore = true;
        try {
          mainA.pause();
        } catch (e) {}
      }
      // 이전 미니 BGM 정지
      if (_miniBgmId) {
        const prev = _a[_miniBgmId];
        if (prev)
          try {
            prev.pause();
            prev.currentTime = 0;
          } catch (e) {}
      }
      _miniBgmId = id;
      if (_muteBGM) return;
      const a = get(id);
      if (a) {
        a.volume = 0.3;
        try {
          a.currentTime = 0;
          a.play();
        } catch (e) {}
      }
      // 합성 BGM 폴백은 없음 (음원 파일이 있어야 BGM 재생)
    },

    stopMiniBGM() {
      if (_miniBgmId) {
        const a = _a[_miniBgmId];
        if (a)
          try {
            a.pause();
            a.currentTime = 0;
          } catch (e) {}
        _miniBgmId = null;
      }
      // 메인 BGM 복구
      if (_mainBgmPlayingBefore && !_muteBGM) {
        const mainA = get("bgm");
        if (mainA)
          try {
            mainA.play();
          } catch (e) {}
      }
      _mainBgmPlayingBefore = false;
    },
  };
})();

// ── CDN에서 사운드 파일 로딩 ──────────────────────────────
export const loadSoundsFromCDN = async () => {
  const files = {
    bgm: "bgm",
    draw: "draw",
    select: "select",
    discard: "discard",
    pickDiscard: "pickDiscard",
    myTurn: "myTurn",
    showdown: "showdown",
    win: "win",
    lose: "lose",
    setComplete: "setComplete",
    aiPlay: "aiPlay",
    roulette: "roulette",
    breadOpen: "breadOpen",
    sealReveal: "sealReveal",
    coinGet: "coinGet",
    buttonClick: "buttonClick",

    // 미니게임: 같은 이름으로 CDN에 올리면 자동 로드. 없으면 합성 폴백.
    // (전체 추가 — CDN에 파일 없으면 자연스럽게 skip됨)
    countdown: "countdown",
    goSignal: "goSignal",
    newRecord: "newRecord",
    gameOverMG: "gameOverMG",
    patternMsg: "patternMsg",
    digdaPop: "digdaPop",
    daktrioPop: "daktrioPop",
    alolaPop: "alolaPop",
    geodudeHit: "geodudeHit",
    comboBonus: "comboBonus",
    comboBreak: "comboBreak",
    feverStart: "feverStart",
    timeWarning: "timeWarning",
    digdaBgm: "digdaBgm",
    timingPerfect: "timingPerfect",
    timingGreat: "timingGreat",
    timingGood: "timingGood",
    timingOk: "timingOk",
    timingMiss: "timingMiss",
    charizardBgm: "charizardBgm",
    dittoTone: "dittoTone",
    dittoWrong: "dittoWrong",
    dittoLevelUp: "dittoLevelUp",
    dittoCleared: "dittoCleared",
    dittoBgm: "dittoBgm",
    quizCorrect: "quizCorrect",
    quizWrong: "quizWrong",
    quizTimeout: "quizTimeout",
    quizTick: "quizTick",
    evolutionBgm: "evolutionBgm",
    runJump: "runJump",
    runDoubleJump: "runDoubleJump",
    runHit: "runHit",
    runBgm: "runBgm",
    magikarpFlap: "magikarpFlap",
    magikarpPass: "magikarpPass",
    magikarpGolden: "magikarpGolden",
    magikarpEvolveGyarados: "magikarpEvolveGyarados",
    magikarpEvolveGolden: "magikarpEvolveGolden",
    magikarpEvolveRed: "magikarpEvolveRed",
    magikarpCollide: "magikarpCollide",
    magikarpRevive: "magikarpRevive",
    magikarpBgm: "magikarpBgm",
    cardFlip: "cardFlip",
    cardMatch: "cardMatch",
    cardNoMatch: "cardNoMatch",
    mewMemoryBgm: "mewMemoryBgm",
    dodgeHit: "dodgeHit",
    dodgeWave: "dodgeWave",
    mewtwoBgm: "mewtwoBgm",
    catchSmall: "catchSmall",
    catchMedium: "catchMedium",
    catchBig: "catchBig",
    catchPepper: "catchPepper",
    catchPattern: "catchPattern",
    snorlaxBgm: "snorlaxBgm",
    pinballLaunch: "pinballLaunch",
    pinballBounce: "pinballBounce",
    pinballHit: "pinballHit",
    pinballCrit: "pinballCrit",
    pinballKill: "pinballKill",
    pinballBossKill: "pinballBossKill",
    pinballPikaHit: "pinballPikaHit",
    pinballRoundClear: "pinballRoundClear",
    pinballBuff: "pinballBuff",
    pinballBgm: "pinballBgm",
    rocketMove: "rocketMove",
    rocketEscape: "rocketEscape",
    rocketHit: "rocketHit",
    rocketBgm: "rocketBgm",
    silhouetteReveal: "silhouetteReveal",
    silhouetteCorrect: "silhouetteCorrect",
    silhouetteWrong: "silhouetteWrong",
    silhouetteTimeout: "silhouetteTimeout",
    silhouetteStreak: "silhouetteStreak",
    silhouetteBgm: "silhouetteBgm",
  };
  const chk = async (u) => {
    try {
      const r = await fetch(u);
      return r.ok ? u : null;
    } catch (e) {
      return null;
    }
  };
  const entries = await Promise.all(
    Object.entries(files).map(async ([id, fname]) => {
      for (const pre of [`${CLEAN}/sounds/`, `${CLEAN}/`])
        for (const ext of ["mp3", "ogg", "wav"]) {
          const f = await chk(`${pre}${fname}.${ext}`);
          if (f) return [id, { data: f, name: `${fname}.${ext}` }];
        }
      return null;
    })
  );
  return Object.fromEntries(entries.filter(Boolean));
};

export const loadShopAudio = async (file) => {
  for (const ext of ["mp3", "ogg", "wav"]) {
    const url = `${CLEAN}/${file}.${ext}`;
    try {
      const r = await fetch(url);
      if (r.ok) return url;
    } catch (e) {}
  }
  return null;
};

// ════════════════ React 훅 (미니게임용) ════════════════
// 기존 카드 게임 코드에는 영향 없음 — 추가만 된 상태

export function useSFX() {
  const play = useCallback((id, opts) => {
    if (id === "dittoTone") return; // dittoTone은 아래 useDittoTone로 쓰세요
    SE.playSFX(id);
  }, []);
  // 메타몽 전용
  const playDitto = useCallback((idx, opts) => SE.dittoTone(idx, opts), []);
  return { play, playDitto };
}

// 미니게임 마운트 시 해당 BGM 재생, 언마운트 시 메인 BGM 복구
export function useBGM(id, { enabled = true } = {}) {
  useEffect(() => {
    if (!enabled || !id) return;
    SE.playMiniBGM(id);
    return () => SE.stopMiniBGM();
  }, [id, enabled]);
}

// BGM/SFX 음소거 상태 훅 (SoundToggle 컴포넌트에서 사용)
export function useSoundSettings() {
  const [state, setState] = useState({
    bgmMuted: SE.isBGMMuted(),
    sfxMuted: SE.isSFXMuted(),
    muted: SE.isMuted(),
  });
  useEffect(() => SE.subscribe(setState), []);
  return {
    ...state,
    toggleAll: () => (state.muted ? SE.unmute() : SE.mute()),
    toggleBGM: () => (state.bgmMuted ? SE.unmuteBGM() : SE.muteBGM()),
    toggleSFX: () => (state.sfxMuted ? SE.unmuteSFX() : SE.muteSFX()),
  };
}
