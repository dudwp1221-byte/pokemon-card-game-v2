// src/games/PokeballThrowGame.jsx — 포켓 핀볼도사
import { useState, useEffect, useRef, useCallback } from "react";
import { recordScore, getBestScore } from "../lib/miniGameLogic";
import { useSFX, useBGM } from "../lib/sounds"; // ⭐ 사운드 import

// ── 보드 설정 ──
const COLS = 7;
const ROWS = 7;
const SVG_W = 100;
const SVG_H = 160;

const MON_TOP = 8;
const MON_BOT = 104;
const CELL_W = SVG_W / COLS;
const CELL_H = (MON_BOT - MON_TOP) / ROWS;

const PIKA_Y = 140;
const BALL_START_Y = 128;
const FLOOR_Y = 130;

const BALL_R = 2.0;
const GRAVITY = 0.02;
const BOUNCE_LOSS = 0.92;
const SHOOT_SPEED = 5.5;

// ⭐ 몬스터 크기 시스템: sizeW(가로 칸수), sizeH(세로 칸수)
//    기본 1x1, 보스는 2x2 / 2x1 / 1x2 로 다양하게
const MONS = [
  // ── 일반 몹 (1x1) ──
  {
    id: 16,
    name: "피죤",
    hp: 5,
    pts: 10,
    color: "#fb923c",
    sizeW: 1,
    sizeH: 1,
  },
  {
    id: 41,
    name: "주뱃",
    hp: 7,
    pts: 15,
    color: "#a78bfa",
    sizeW: 1,
    sizeH: 1,
  },
  {
    id: 52,
    name: "나옹",
    hp: 9,
    pts: 20,
    color: "#94a3b8",
    sizeW: 1,
    sizeH: 1,
  },
  {
    id: 74,
    name: "꼬마돌",
    hp: 14,
    pts: 30,
    color: "#78716c",
    sizeW: 1,
    sizeH: 1,
  },
  // ── ⭐ 질퍽이: 세로로 긴 중간 몹 (1x2) ──
  {
    id: 88,
    name: "질퍽이",
    hp: 22,
    pts: 50,
    color: "#6d28d9",
    sizeW: 1,
    sizeH: 2,
    midBoss: true,
  },
  {
    id: 109,
    name: "또가스",
    hp: 12,
    pts: 30,
    color: "#4ade80",
    sizeW: 1,
    sizeH: 1,
  }, // (미사용, 호환성 유지)
  {
    id: 109,
    name: "또가스",
    hp: 12,
    pts: 30,
    color: "#4ade80",
    sizeW: 1,
    sizeH: 1,
  },
  {
    id: 100,
    name: "찌리리공",
    hp: 18,
    pts: 40,
    color: "#fbbf24",
    sizeW: 1,
    sizeH: 1,
  },
  // ── 👑 잠만보: 2x2 보스 ──
  {
    id: 143,
    name: "잠만보",
    hp: 40,
    pts: 120,
    color: "#86efac",
    boss: true,
    sizeW: 2,
    sizeH: 2,
  },
  {
    id: 94,
    name: "팬텀",
    hp: 22,
    pts: 50,
    color: "#818cf8",
    sizeW: 1,
    sizeH: 1,
  },
  // ── 👑 라프라스: 2x1 보스 (가로로 긴 수영 포켓몬) ──
  {
    id: 131,
    name: "라프라스",
    hp: 45,
    pts: 100,
    color: "#38bdf8",
    boss: true,
    sizeW: 2,
    sizeH: 1,
  },
  // ── 👑 리자몽: 1x2 보스 (세로로 큰 날개) ──
  {
    id: 6,
    name: "리자몽",
    hp: 55,
    pts: 140,
    color: "#ef4444",
    boss: true,
    sizeW: 1,
    sizeH: 2,
  },
  // ── 👑 뮤츠: 2x2 최종보스 ──
  {
    id: 150,
    name: "뮤츠",
    hp: 75,
    pts: 250,
    color: "#c084fc",
    boss: true,
    sizeW: 2,
    sizeH: 2,
  },
  {
    id: 54,
    name: "고라파덕",
    hp: 8,
    pts: 35,
    color: "#38bdf8",
    sizeW: 1,
    sizeH: 1,
    ranged: true,
    rangedDmg: 1,
    rangedInterval: 2,
  },
  // ── ⭐ 또도가스(Weezing, #110): 2x1 폭발 중보스 💥 ──
  {
    id: 110,
    name: "또도가스",
    hp: 25,
    pts: 55,
    color: "#86efac",
    sizeW: 2,
    sizeH: 1,
    midBoss: true,
    ranged: true,
    rangedDmg: 1,
    rangedInterval: 2,
    explosive: true,
  },
  {
    id: 122,
    name: "마임맨",
    hp: 10,
    pts: 45,
    color: "#f472b6",
    sizeW: 1,
    sizeH: 1,
    ranged: true,
    rangedDmg: 2,
    rangedInterval: 3,
  },
  {
    id: 77,
    name: "포니타",
    hp: 15,
    pts: 55,
    color: "#f97316",
    sizeW: 1,
    sizeH: 1,
    ranged: true,
    rangedDmg: 1,
    rangedInterval: 2,
    burning: true,
    burnDmg: 1,
  },
];

// ⭐ 레이아웃 범례 (MONS 배열 인덱스):
//   0: 피죤         1: 주뱃           2: 나옹         3: 꼬마돌
//   4: 질퍽이(1x2)⭐ 5: 또가스(중복)    6: 또가스        7: 찌리리공💣
//   8: 잠만보(2x2)👑 9: 팬텀            10: 라프라스(2x1)👑
//   11: 리자몽(1x2)👑 12: 뮤츠(2x2)👑
//   13: 고라파덕🎯     14: 또도가스(2x1)⭐🎯💥
//   15: 마임맨🎯       16: 포니타🔥🎯
//
// ⚠️ 큰 몬스터(sizeW/sizeH > 1)는 좌상단 기준 배치
//    예: 2x2 잠만보를 (row=0, col=2)에 두면 (0,2)(0,3)(1,2)(1,3) 차지
//    → 나머지 칸은 null로 비워둘 것!
const ROUND_LAYOUTS = [
  // ─── R1: 튜토리얼 ───
  [
    [null, 0, null, 0, null, 0, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
  ],
  // ─── R2: 2종류 ───
  [
    [0, null, 0, null, 0, null, 0],
    [null, 1, null, 1, null, 1, null],
    [null, null, null, null, null, null, null],
  ],
  // ─── R3: 원거리 첫등장 ───
  [
    [null, 2, null, 13, null, 2, null],
    [null, null, 1, null, 1, null, null],
    [null, null, null, null, null, null, null],
  ],
  // ─── R4: 양옆 배치 (어긋나게) ───
  [
    [3, null, 3, null, 3, null, 3],
    [null, 2, null, 2, null, 2, null],
    [null, null, null, null, null, null, null],
  ],
  // ─── R5: 다양화 ───
  [
    [null, 6, null, 6, null, 6, null],
    [3, null, 3, null, 3, null, 3],
    [13, null, null, null, null, null, 13],
  ],
  // ─── R6: 팬텀 등장 ───
  [
    [null, 9, null, 9, null, 9, null],
    [null, null, 9, null, 9, null, null],
    [3, null, null, 3, null, null, 3],
  ],
  // ─── R7: 또가스 + 꼬마돌 (어긋나게) ───
  [
    [6, null, 6, null, 6, null, 6],
    [null, 3, null, 3, null, 3, null],
    [null, null, null, 13, null, null, null],
  ],
  // ─── R8: ⭐질퍽이(1x2) 첫등장! ───
  [
    [3, null, 4, null, 3, null, 3], // 질퍽이 (0,2) → (0,2)(1,2) 차지
    [null, null, null, null, null, 15, null],
    [null, null, null, null, null, null, null],
  ],
  // ─── R9: 👑잠만보(2x2) 첫 보스! 🎉 ───
  [
    [null, null, null, 8, null, null, null], // 잠만보 (0,3) → (0,3)(0,4)(1,3)(1,4)
    [null, null, null, null, null, null, null],
    [3, 13, null, null, null, 13, 3],
  ],
  // ─── R10: 👑라프라스(2x1) 듀얼 ───
  [
    [10, null, null, null, null, 10, null], // 라프라스 (0,0)(0,1) & (0,5)(0,6)
    [null, null, 6, null, 6, null, null],
    [null, null, null, 3, null, null, null],
  ],
  // ─── R11: 🌸 쉬어가기 (찌리리공 💣) ───
  [
    [9, null, 9, null, 9, null, 9],
    [null, 7, null, 7, null, 7, null],
    [null, null, 13, null, 13, null, null],
  ],
  // ─── R12: 👑리자몽(1x2) 듀얼 ───
  [
    [11, null, 3, null, 3, null, 11], // 리자몽 (0,0)(1,0) & (0,6)(1,6)
    [null, null, null, null, null, null, null],
    [null, 13, null, null, null, 13, null],
  ],
  // ─── R13: ⭐또도가스(2x1) 등장 ───
  [
    [null, 14, null, null, null, 14, null], // 또도가스 (0,1)(0,2) & (0,5)(0,6)
    [null, null, null, null, null, null, null],
    [6, null, 6, null, 6, null, 6],
  ],
  // ─── R14: 👑뮤츠(2x2) 첫등장!!! ───
  [
    [null, null, 12, null, null, null, null], // 뮤츠 (0,2)(0,3)(1,2)(1,3)
    [16, null, null, null, null, null, null],
    [null, 3, null, null, null, 3, null],
  ],
  // ─── R15: 리자몽 + 잡몹 (어긋나게) ───
  [
    [11, null, 6, null, 6, null, 11],
    [null, null, null, null, null, null, null],
    [null, 3, null, 3, null, 3, null],
  ],
  // ─── R16: 원거리 난타 ───
  [
    [16, null, 15, 3, 15, null, 16],
    [null, 9, null, null, null, 9, null],
    [null, null, null, null, null, null, null],
  ],
  // ─── R17: 또가스+팬텀+포니타 (밀도 감소) ───
  [
    [6, null, 6, null, 6, null, 6],
    [null, 9, null, 9, null, 9, null],
    [16, null, null, 3, null, null, 16],
  ],
  // ─── R18: 라프라스 + 잠만보 콤보 ───
  [
    [10, null, null, 8, null, null, null], // 라프라스 (0,0)(0,1) + 잠만보 (0,3)(0,4)(1,3)(1,4)
    [null, null, null, null, null, null, null],
    [3, null, 3, null, 3, null, 3],
  ],
  // ─── R19: 뮤츠 더블 🚨 ───
  [
    [12, null, null, null, null, 12, null], // 뮤츠 (0,0)(0,1)(1,0)(1,1) & (0,5)(0,6)(1,5)(1,6)
    [null, null, null, null, null, null, null],
    [null, 16, 3, 9, 3, 16, null],
  ],
  // ─── R20: 보스 대격돌 (라프라스 (0,5)로 이동) ───
  [
    [11, null, null, 8, null, 10, null], // 리자몽(0,0)(1,0) + 잠만보(0,3)~(1,4) + 라프라스(0,5)(0,6)
    [null, null, null, null, null, null, null],
    [11, null, null, 3, 15, null, 15], // 리자몽(2,0)(3,0 → 바닥) + 마임맨 × 2
  ],

  // ━━━━━━━━━━ 🌋 EXTREME 21~30 🌋 ━━━━━━━━━━

  // ─── R21: X자 패턴 ───
  [
    [4, null, null, 13, null, null, 4], // 질퍽이 양쪽
    [null, 3, null, null, null, 3, null],
    [null, null, 3, null, 3, null, null],
  ],
  // ─── R22: 계단 패턴 (어긋나게) ───
  [
    [16, null, null, null, null, null, 16],
    [null, 9, 3, null, 3, 9, null],
    [null, null, 9, 6, 9, null, null],
  ],
  // ─── R23: 또도가스 폭발 지옥 ───
  [
    [14, null, null, null, 14, null, null], // 또도가스 (0,0)(0,1) & (0,4)(0,5)
    [null, null, 3, null, null, null, 3],
    [9, null, null, 3, null, null, 9],
  ],
  // ─── R24: 🌸 쉬어가기 (찌리리공 💣 + 팬텀) ───
  [
    [9, null, 9, null, 9, null, 9],
    [null, 7, null, 7, null, 7, null],
    [null, 16, null, 3, null, 16, null],
  ],
  // ─── R25: 질퍽이 성문 ───
  [
    [4, null, null, 8, null, null, 4], // 질퍽이 (0,0)(1,0) + 잠만보(0,3)(0,4)(1,3)(1,4) + 질퍽이 (0,6)(1,6)
    [null, null, null, null, null, null, null],
    [null, 16, null, 3, null, 16, null],
  ],
  // ─── R26: 라프라스 듀얼 + 또도가스 ───
  [
    [10, null, null, null, null, 10, null], // 라프라스 × 2
    [null, null, 14, null, null, null, null], // 또도가스 2x1
    [null, 9, null, 3, null, 9, null],
  ],
  // ─── R27: 시계 패턴 (마임맨 위치 수정) ───
  [
    [4, 9, null, 12, null, 9, 4], // 뮤츠 2x2 중앙 + 질퍽이 양쪽 (0,0)(1,0) & (0,6)(1,6)
    [null, null, null, null, null, null, null],
    [15, null, 16, 3, 16, null, 15], // 마임맨 양쪽 끝 (질퍽이 아래 아님)
  ],
  // ─── R28: 리자몽 4연발 ───
  [
    [11, null, 9, null, 9, null, 11], // 리자몽 × 2
    [null, null, null, null, null, null, null],
    [null, 15, null, 13, null, 15, null], // 마임맨 × 2
  ],
  // ─── R29: 심연의 제왕 ───
  [
    [12, null, null, null, null, 11, null], // 뮤츠 2x2 + 리자몽 1x2
    [null, null, null, null, null, null, null],
    [null, 14, null, 16, null, null, null], // 또도가스 + 포니타
  ],
  // ─── R30: 최종 러시 🔥🔥🔥 ───
  [
    [12, null, null, 8, null, 11, null], // 뮤츠 + 잠만보 + 리자몽
    [null, null, null, null, null, null, null],
    [null, 15, null, 9, null, 15, null], // 마임맨 × 2 + 팬텀
  ],
];

// ⭐ HP 배율 곡선: 초반 빠르게, 후반 완만하게
function getHpMult(round) {
  if (round <= 10) return 1 + (round - 1) * 0.2; // R1: 1.0 ~ R10: 2.8
  if (round <= 20) return 2.8 + (round - 10) * 0.15; // R11: 2.95 ~ R20: 4.3
  return 4.3 + (round - 20) * 0.1; // R21: 4.4 ~ R30: 5.3
}

function makeMonsters(round) {
  const layout = ROUND_LAYOUTS[Math.min(round - 1, ROUND_LAYOUTS.length - 1)];
  const hm = getHpMult(round);
  const monsters = [];
  layout.forEach((rowArr, ri) => {
    rowArr.forEach((monIdx, ci) => {
      if (monIdx === null) return;
      const m = MONS[monIdx];
      const sizeW = m.sizeW ?? 1;
      const sizeH = m.sizeH ?? 1;
      // ⚠️ 보드 밖 배치 방지
      if (ci + sizeW > COLS) return;
      monsters.push({
        uid: `${round}_${ri}_${ci}`,
        monIdx,
        col: ci,
        row: ri,
        sizeW,
        sizeH,
        hp: Math.round(m.hp * hm),
        maxHp: Math.round(m.hp * hm),
        pts: m.pts,
        color: m.color,
        name: m.name,
        pokeId: m.id,
        boss: !!m.boss,
        midBoss: !!m.midBoss,
        flashing: false,
        ranged: !!m.ranged,
        rangedDmg: m.rangedDmg ?? 0,
        rangedInterval: m.rangedInterval ?? 1,
        rangedTurnCount: 0,
        rangedAttacking: false,
        explosiveOnDeath: !!m.explosive,
        burning: !!m.burning,
        burnDmg: m.burnDmg ?? 2,
      });
    });
  });
  return monsters;
}

// ⭐ 몬스터 중심점 계산 (크기 반영)
function monXY(col, row, sizeW = 1, sizeH = 1) {
  return {
    x: (col + sizeW / 2) * CELL_W,
    y: MON_TOP + (row + sizeH / 2) * CELL_H,
  };
}

const SPECIAL_BALLS = {
  fire: {
    type: "fire",
    color: "#ef4444",
    glow: "#ff6b35",
    label: "🔥",
    name: "불꽃볼",
    desc: "매 턴 화상 데미지(2)",
  },
  ice: {
    type: "ice",
    color: "#38bdf8",
    glow: "#a5f3fc",
    label: "❄️",
    name: "얼음볼",
    desc: "맞은 적 1턴 동결(이동 불가)",
  },
  thunder: {
    type: "thunder",
    color: "#fbbf24",
    glow: "#fde68a",
    label: "⚡",
    name: "번개볼",
    desc: "관통 +1회",
  },
  explode: {
    type: "explode",
    color: "#f97316",
    glow: "#fed7aa",
    label: "💥",
    name: "폭발볼",
    desc: "충돌 시 주변 폭발",
  },
  pierce: {
    type: "pierce",
    color: "#a78bfa",
    glow: "#ddd6fe",
    label: "🌀",
    name: "관통볼",
    desc: "관통 +2회",
  },
  crit: {
    type: "crit",
    color: "#f472b6",
    glow: "#fbcfe8",
    label: "💫",
    name: "크리티컬볼",
    desc: "급소 50% 확률 3배",
  },
  heavy: {
    type: "heavy",
    color: "#78716c",
    glow: "#d6d3d1",
    label: "🪨",
    name: "돌볼",
    desc: "공격력 ×3, 느리게 이동",
  },
  ghost: {
    type: "ghost",
    color: "#818cf8",
    glow: "#c7d2fe",
    label: "👻",
    name: "고스트볼",
    desc: "벽 통과, 관통 무한",
  },
};

const BUFF_POOL = [
  {
    id: "atk1",
    type: "stat",
    icon: "⚔️",
    name: "공격 강화",
    desc: "모든 공 공격력 +50%",
    apply: (s) => {
      s.atkMult += 0.5;
    },
  },
  {
    id: "atk2",
    type: "stat",
    icon: "🗡️",
    name: "공격 대강화",
    desc: "모든 공 공격력 +100%",
    apply: (s) => {
      s.atkMult += 1.0;
    },
  },
  {
    id: "bounce",
    type: "stat",
    icon: "🌀",
    name: "슈퍼바운스",
    desc: "최대 튕김 +5회",
    apply: (s) => {
      s.maxBounce += 3;
    },
  },
  {
    id: "spd1",
    type: "stat",
    icon: "🚀",
    name: "가속",
    desc: "발사 속도 +30%",
    apply: (s) => {
      s.speedMult += 0.25;
    },
  },
  {
    id: "crit_s",
    type: "stat",
    icon: "💥",
    name: "급소 강화",
    desc: "급소 확률 +20%",
    apply: (s) => {
      s.critChance += 0.2;
    },
  },
  {
    id: "extra",
    type: "stat",
    icon: "🎱",
    name: "일반볼 추가",
    desc: "일반 볼 +2개",
    apply: (s) => {
      s.ballCount += 2;
    },
  },
  {
    id: "heal1",
    type: "heal",
    icon: "💚",
    name: "체력 회복",
    desc: "HP +1 회복",
    apply: (s) => {
      s.hp = Math.min(s.hp + 1, s.maxHp);
    },
  },
  {
    id: "heal2",
    type: "heal",
    icon: "💊",
    name: "대회복",
    desc: "HP +2 회복",
    apply: (s) => {
      s.hp = Math.min(s.hp + 2, s.maxHp);
    },
  },
  {
    id: "maxhp",
    type: "heal",
    icon: "❤️",
    name: "체력 증가",
    desc: "최대 HP +1, HP +1",
    apply: (s) => {
      s.maxHp += 1;
      s.hp = Math.min(s.hp + 1, s.maxHp);
    },
  },
  {
    id: "ball_fire",
    type: "ball",
    ballType: "fire",
    icon: "🔥",
    name: "불꽃볼 추가",
    desc: "불꽃볼 +1개 (매 턴 화상 2)",
    apply: (s) => {
      s.specialBalls.push("fire");
    },
  },
  {
    id: "ball_ice",
    type: "ball",
    ballType: "ice",
    icon: "❄️",
    name: "얼음볼 추가",
    desc: "얼음볼 +1개 (1턴 동결)",
    apply: (s) => {
      s.specialBalls.push("ice");
    },
  },
  {
    id: "ball_thunder",
    type: "ball",
    ballType: "thunder",
    icon: "⚡",
    name: "번개볼 추가",
    desc: "번개볼 +1개 (관통+1)",
    apply: (s) => {
      s.specialBalls.push("thunder");
    },
  },
  {
    id: "ball_explode",
    type: "ball",
    ballType: "explode",
    icon: "💥",
    name: "폭발볼 추가",
    desc: "폭발볼 +1개 (주변 폭발)",
    apply: (s) => {
      s.specialBalls.push("explode");
    },
  },
  {
    id: "ball_pierce",
    type: "ball",
    ballType: "pierce",
    icon: "🌀",
    name: "관통볼 추가",
    desc: "관통볼 +1개 (관통+2)",
    apply: (s) => {
      s.specialBalls.push("pierce");
    },
  },
  {
    id: "ball_crit",
    type: "ball",
    ballType: "crit",
    icon: "💫",
    name: "크리볼 추가",
    desc: "크리볼 +1개 (급소 50%)",
    apply: (s) => {
      s.specialBalls.push("crit");
    },
  },
  {
    id: "ball_heavy",
    type: "ball",
    ballType: "heavy",
    icon: "🪨",
    name: "돌볼 추가",
    desc: "돌볼 +1개 (공격력×3)",
    apply: (s) => {
      s.specialBalls.push("heavy");
    },
  },
  {
    id: "ball_ghost",
    type: "ball",
    ballType: "ghost",
    icon: "👻",
    name: "고스트볼 추가",
    desc: "고스트볼 +1개 (무한관통)",
    apply: (s) => {
      s.specialBalls.push("ghost");
    },
  },
];

function randBuffs(n = 3, exclude = []) {
  return [...BUFF_POOL]
    .filter((b) => !exclude.includes(b.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, n);
}

export default function PokeballThrowGame({ onClose, onGameEnd }) {
  const [phase, setPhase] = useState("ready");
  const [, forceUpdate] = useState(0);
  const [result, setResult] = useState(null);
  const [aimAngle, setAimAngle] = useState(90);
  const [buffCards, setBuffCards] = useState([]);
  const [hitAnims, setHitAnims] = useState([]);
  const [roundBanner, setRoundBanner] = useState(null);
  const [advancing, setAdvancing] = useState(false);
  const [hitShake, setHitShake] = useState(false);
  const [hitFlash, setHitFlash] = useState(false);
  const [hitCount, setHitCount] = useState(0);

  // ⭐ 사운드 훅
  const { play } = useSFX();
  useBGM("pinballBgm", {
    enabled:
      phase === "aiming" || phase === "shooting" || phase === "advancing",
  });

  const stateRef = useRef({
    round: 1,
    totalScore: 0,
    hp: 5,
    maxHp: 5,
    ballCount: 2,
    atkMult: 1,
    speedMult: 1,
    pierce: 0,
    maxBounce: 20,
    split: 0,
    critChance: 0,
    explosive: 0,
    specialBalls: [],
    monsters: [],
    balls: [],
  });

  const phaseRef = useRef("ready");
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);
  const gameAreaRef = useRef(null);
  const aimAngleRef = useRef(90);
  const hitIdRef = useRef(0);
  const bounceSoundCooldown = useRef(0);

  const best = getBestScore("pokeball_throw");

  const addHit = useCallback((x, y, dmg, color) => {
    const id = hitIdRef.current++;
    setHitAnims((p) => [...p, { id, x, y, dmg, color }]);
    setTimeout(() => setHitAnims((p) => p.filter((h) => h.id !== id)), 800);
  }, []);

  const endGame = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    phaseRef.current = "result";
    setPhase("result");
    const s = stateRef.current;
    const res = recordScore("pokeball_throw", s.totalScore);
    setResult({ score: s.totalScore, round: s.round, ...res });
    // ⭐ 게임 종료
    play("gameOverMG");
    if (res.isNew) setTimeout(() => play("newRecord"), 700);
    onGameEnd?.(s.totalScore);
  }, [onGameEnd, play]);

  const startRound = useCallback((round) => {
    const s = stateRef.current;
    s.monsters = makeMonsters(round);
    s.balls = [];
    lastTimeRef.current = null;
    setAdvancing(false);
    setRoundBanner(`Round ${round}`);
    setTimeout(() => setRoundBanner(null), 1200);
    phaseRef.current = "aiming";
    setPhase("aiming");
    forceUpdate((n) => n + 1);
  }, []);

  const advanceMons = useCallback(() => {
    const s = stateRef.current;
    setAdvancing(true);

    setTimeout(() => {
      let tookDamage = false;
      const survivors = [];

      for (const m of s.monsters) {
        if (m.burning) m.hp -= m.burnDmg ?? 2;
      }
      s.monsters = s.monsters.filter((m) => {
        if (m.hp <= 0) {
          s.totalScore += m.pts;
          return false;
        }
        return true;
      });

      let rangedDmgTotal = 0;
      for (const m of s.monsters) {
        if (!m.ranged || m.rangedDmg <= 0) continue;
        m.rangedTurnCount = (m.rangedTurnCount ?? 0) + 1;
        if (m.rangedTurnCount >= m.rangedInterval) {
          m.rangedTurnCount = 0;
          m.rangedAttacking = true;
          rangedDmgTotal += m.rangedDmg;
          setTimeout(() => {
            m.rangedAttacking = false;
          }, 400);
        }
      }
      if (rangedDmgTotal > 0) {
        s.hp = Math.max(0, s.hp - rangedDmgTotal);
        tookDamage = true;
      }

      // ⭐ 전진 로직 (몬스터 크기 반영)
      // 이동 가능 여부: 1칸 내려갈 때 다른 몬스터와 겹치지 않는지
      const canMoveDown = (m) => {
        const newBottomRow = m.row + 1 + m.sizeH - 1; // 이동 후 맨 아래 행
        if (newBottomRow > ROWS - 1) return false; // 바닥 초과
        for (const other of s.monsters) {
          if (other.uid === m.uid) continue;
          // 가로 겹침 (AABB)
          const hOverlap =
            m.col < other.col + (other.sizeW ?? 1) &&
            other.col < m.col + (m.sizeW ?? 1);
          if (!hOverlap) continue;
          // 세로 겹침 (이동 후 기준)
          const myNewTop = m.row + 1;
          const myNewBottom = myNewTop + m.sizeH - 1;
          const otherTop = other.row;
          const otherBottom = otherTop + (other.sizeH ?? 1) - 1;
          if (myNewTop <= otherBottom && myNewBottom >= otherTop) return false;
        }
        return true;
      };

      // 아래쪽 몬스터부터 이동 (도미노 방식)
      const sortedForMove = [...s.monsters].sort(
        (a, b) => b.row + b.sizeH - (a.row + a.sizeH)
      );
      for (const m of sortedForMove) {
        if (m.frozen) continue;
        const bottomRow = m.row + m.sizeH - 1;
        if (bottomRow < ROWS - 1) {
          // 아직 바닥 아님 → 이동 시도
          if (canMoveDown(m)) {
            m.row += 1;
            if (m.row + m.sizeH - 1 === ROWS - 1) m.justArrived = true;
          }
        } else {
          // 이미 바닥 도달
          if (m.justArrived) {
            m.justArrived = false;
          } else {
            s.hp = Math.max(0, s.hp - 1);
            tookDamage = true;
            m.attacking = true;
            setTimeout(() => {
              m.attacking = false;
            }, 400);
          }
        }
      }

      for (const m of s.monsters) survivors.push(m);
      for (const m of survivors) {
        if (m.frozen) {
          m.frozenTurns = (m.frozenTurns ?? 1) - 1;
          if (m.frozenTurns <= 0) m.frozen = false;
        }
      }
      s.monsters = survivors;
      setAdvancing(false);

      const proceed = () => {
        if (s.hp <= 0) {
          endGame();
          return;
        }
        if (s.monsters.length === 0) {
          s.ballCount += 1;
          s.round += 1;
          play("pinballRoundClear"); // ⭐ 라운드 클리어
          if ((s.round - 1) % 3 === 0) {
            phaseRef.current = "buff";
            setBuffCards(randBuffs(3));
            setPhase("buff");
          } else {
            startRound(s.round);
          }
        } else {
          phaseRef.current = "aiming";
          setPhase("aiming");
        }
        forceUpdate((n) => n + 1);
      };

      if (tookDamage) {
        // ⭐ 피카츄 피격 사운드
        play("pinballPikaHit");
        setHitFlash(true);
        setHitShake(true);
        setHitCount((n) => n + 1);
        forceUpdate((n) => n + 1);
        setTimeout(() => {
          setHitFlash(false);
          setHitShake(false);
          setTimeout(proceed, 150);
        }, 600);
      } else {
        proceed();
      }
    }, 600);
  }, [endGame, startRound, play]);

  const physicsLoop = useCallback(
    (timestamp) => {
      if (phaseRef.current !== "shooting") return;
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 16.67, 2);
      lastTimeRef.current = timestamp;

      const s = stateRef.current;
      const newBalls = [];
      bounceSoundCooldown.current = Math.max(
        0,
        bounceSoundCooldown.current - dt
      );

      for (const ball of s.balls) {
        if (!ball.active) continue;
        let { x, y, vx, vy, bounces, pierceLeft, splitDone } = ball;

        vy += GRAVITY * dt;
        x += vx * dt;
        y += vy * dt;

        let bouncedThisFrame = false;
        if (x - BALL_R < 0) {
          x = BALL_R;
          vx = Math.abs(vx) * BOUNCE_LOSS;
          bounces++;
          bouncedThisFrame = true;
        }
        if (x + BALL_R > SVG_W) {
          x = SVG_W - BALL_R;
          vx = -Math.abs(vx) * BOUNCE_LOSS;
          bounces++;
          bouncedThisFrame = true;
        }
        if (y - BALL_R < 2) {
          y = 2 + BALL_R;
          vy = Math.abs(vy) * BOUNCE_LOSS;
          bounces++;
          bouncedThisFrame = true;
        }

        // ⭐ 벽 튕김 사운드 (연속 방지)
        if (bouncedThisFrame && bounceSoundCooldown.current <= 0) {
          play("pinballBounce");
          bounceSoundCooldown.current = 4;
        }

        if (y > FLOOR_Y || bounces > s.maxBounce) continue;

        for (const m of s.monsters) {
          if (m.hp <= 0) continue;
          const { x: mx, y: my } = monXY(m.col, m.row, m.sizeW, m.sizeH);
          // ⭐ 히트박스 크기 반영 (2x2 몬스터는 4배 영역)
          const hw = CELL_W * 0.44 * m.sizeW,
            hh = CELL_H * 0.44 * m.sizeH;
          if (
            x > mx - hw - BALL_R &&
            x < mx + hw + BALL_R &&
            y > my - hh - BALL_R &&
            y < my + hh + BALL_R
          ) {
            const ballAtkMult = ball.atkMult ?? 1.0;
            const ballCritBonus = ball.critBonus ?? 0;
            const isCrit = Math.random() < s.critChance + ballCritBonus;
            const dmg = Math.max(
              1,
              Math.round(s.atkMult * ballAtkMult * (isCrit ? 3 : 1))
            );
            m.hp -= dmg;
            m.flashing = true;
            setTimeout(() => {
              m.flashing = false;
            }, 150);

            // ⭐ 타격 사운드
            if (isCrit) play("pinballCrit");
            else play("pinballHit");

            if (ball.freezes && !m.frozen) {
              m.frozen = true;
              m.frozenTurns = 1;
            }
            if (ball.fireDmg > 0 && !m.burning) {
              m.burning = true;
              m.burnDmg = ball.fireDmg;
            }

            s.totalScore += Math.round(m.pts * (isCrit ? 2 : 1) * ballAtkMult);
            addHit(
              mx,
              my,
              dmg,
              isCrit
                ? "#ffd700"
                : SPECIAL_BALLS[ball.ballType]?.color ?? m.color
            );

            // ⭐ 몬스터 처치
            if (m.hp <= 0) {
              setTimeout(
                () => play(m.boss ? "pinballBossKill" : "pinballKill"),
                80
              );
            }

            if (ball.explodes) {
              for (const n of s.monsters) {
                if (n.uid === m.uid || n.hp <= 0) continue;
                const { x: nx, y: ny } = monXY(n.col, n.row, n.sizeW, n.sizeH);
                if (
                  Math.abs(nx - mx) < CELL_W * 1.8 &&
                  Math.abs(ny - my) < CELL_H * 1.8
                ) {
                  const ed = Math.max(1, Math.round(dmg * 0.6));
                  n.hp -= ed;
                  addHit(nx, ny, ed, "#f97316");
                  if (n.hp <= 0)
                    setTimeout(
                      () => play(n.boss ? "pinballBossKill" : "pinballKill"),
                      120
                    );
                }
              }
            }

            if (!splitDone && s.split > 0) {
              splitDone = true;
              for (let si = 0; si < s.split; si++) {
                const a = Math.random() * Math.PI * 2;
                newBalls.push({
                  id: Date.now() + Math.random(),
                  x,
                  y,
                  vx: Math.cos(a) * 4,
                  vy: Math.sin(a) * 4 - 1.5,
                  bounces: bounces + 2,
                  pierceLeft: 0,
                  splitDone: true,
                  active: true,
                  ballType: "normal",
                });
              }
            }

            if (pierceLeft <= 0) {
              const overlapX = Math.min(
                x + BALL_R - (mx - hw),
                mx + hw - (x - BALL_R)
              );
              const overlapY = Math.min(
                y + BALL_R - (my - hh),
                my + hh - (y - BALL_R)
              );
              if (overlapX < overlapY) {
                vx = -vx * BOUNCE_LOSS;
                x += vx > 0 ? 0.3 : -0.3;
              } else {
                vy = -vy * BOUNCE_LOSS;
                y += vy > 0 ? 0.3 : -0.3;
              }
              bounces++;
              break;
            } else {
              pierceLeft--;
            }
          }
        }

        s.monsters = s.monsters.filter((m) => m.hp > 0);
        newBalls.push({
          ...ball,
          x,
          y,
          vx,
          vy,
          bounces,
          pierceLeft,
          splitDone,
        });
      }

      s.balls = newBalls;
      forceUpdate((n) => n + 1);

      if (s.balls.length === 0 && phaseRef.current === "shooting") {
        phaseRef.current = "advancing";
        setPhase("advancing");
        advanceMons();
        return;
      }

      rafRef.current = requestAnimationFrame(physicsLoop);
    },
    [advanceMons, addHit, play]
  );

  const shoot = useCallback(() => {
    if (phaseRef.current !== "aiming") return;
    const s = stateRef.current;
    const angle = aimAngleRef.current;
    const rad = (angle * Math.PI) / 180;
    const spd = SHOOT_SPEED * s.speedMult;

    play("pinballLaunch"); // ⭐ 발사 사운드
    phaseRef.current = "shooting";
    setPhase("shooting");

    const allBalls = [];
    for (let i = 0; i < s.ballCount; i++) allBalls.push("normal");
    for (const t of s.specialBalls) allBalls.push(t);
    const total = allBalls.length;

    s.balls = [];
    const makeBall = (idx, btype, cx) => {
      const sp = SPECIAL_BALLS[btype];
      const spdMult = btype === "heavy" ? 0.55 : btype === "ghost" ? 1.15 : 1.0;
      return {
        id: Date.now() + idx + Math.random(),
        x: cx,
        y: BALL_START_Y,
        vx: -Math.cos(rad) * spd * spdMult + (Math.random() - 0.5) * 0.2,
        vy: -Math.sin(rad) * spd * spdMult,
        bounces: 0,
        pierceLeft:
          btype === "pierce"
            ? s.pierce + 2
            : btype === "thunder"
            ? s.pierce + 1
            : btype === "ghost"
            ? 999
            : s.pierce,
        splitDone: false,
        active: true,
        ballType: btype,
        fireDmg: btype === "fire" ? 2 : 0,
        freezes: btype === "ice",
        explodes: btype === "explode" || s.explosive > 0,
        critBonus: btype === "crit" ? 0.5 : 0,
        atkMult: btype === "heavy" ? 3.0 : 1.0,
      };
    };

    // ⭐ 수정: 모든 공을 x=50 (정중앙)에서 발사
    //    기존: cx가 공마다 달라서 좌우로 퍼져서 나감 → 지인이 "다른 위치에서 쏜다" 피드백
    //    이제: 같은 위치에서 발사, vx 랜덤(±0.1)으로 자연스럽게 분산
    s.balls.push(makeBall(0, allBalls[0], 50));

    for (let i = 1; i < total; i++) {
      setTimeout(() => {
        stateRef.current.balls.push(makeBall(i, allBalls[i], 50));
      }, i * 110);
    }

    lastTimeRef.current = null;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(physicsLoop);
  }, [physicsLoop, play]);

  const handleAimMove = useCallback((e) => {
    if (phaseRef.current !== "aiming") return;
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = e.clientX ?? e.touches?.[0]?.clientX;
    const cy = e.clientY ?? e.touches?.[0]?.clientY;
    if (cx == null || cy == null) return;
    const px = ((cx - rect.left) / rect.width) * SVG_W;
    const py = ((cy - rect.top) / rect.height) * SVG_H;
    const dx = px - 50;
    const dy = py - PIKA_Y;
    let angle = (Math.atan2(-dy, -dx) * 180) / Math.PI;
    angle = Math.max(25, Math.min(155, angle));
    aimAngleRef.current = angle;
    setAimAngle(angle);
  }, []);

  const selectBuff = useCallback(
    (buff) => {
      const s = stateRef.current;
      buff.apply(s);
      play("pinballBuff"); // ⭐ 버프 선택
      startRound(s.round);
    },
    [startRound, play]
  );

  const startGame = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const s = stateRef.current;
    Object.assign(s, {
      round: 1,
      totalScore: 0,
      hp: 5,
      maxHp: 5,
      ballCount: 2,
      atkMult: 1,
      speedMult: 1,
      pierce: 0,
      maxBounce: 20,
      split: 0,
      critChance: 0,
      explosive: 0,
      specialBalls: [],
      monsters: [],
      balls: [],
    });
    aimAngleRef.current = 90;
    setAimAngle(90);
    setHitAnims([]);
    setBuffCards([]);
    setAdvancing(false);
    startRound(1);
  }, [startRound]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const s = stateRef.current;
  const isAiming = phase === "aiming";

  const aimRad = (aimAngle * Math.PI) / 180;
  const aimDots = isAiming
    ? Array.from({ length: 10 }, (_, i) => ({
        x: 50 - Math.cos(aimRad) * (i + 1) * 8,
        y: PIKA_Y - Math.sin(aimRad) * (i + 1) * 8,
      })).filter((d) => d.y > 2 && d.y < PIKA_Y && d.x > 0 && d.x < SVG_W)
    : [];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "linear-gradient(180deg,#0f0328,#1a0550,#0f0328)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui,sans-serif",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 14px",
          background: "rgba(0,0,0,0.5)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 99,
            color: "rgba(255,255,255,0.65)",
            fontSize: 12,
            padding: "4px 10px",
            cursor: "pointer",
          }}
        >
          ← 나가기
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 900, color: "#fff", fontSize: 14 }}>
            ⚡ 포켓 핀볼
          </span>
          {(phase === "aiming" ||
            phase === "shooting" ||
            phase === "advancing") && (
            <span
              style={{
                fontSize: 11,
                color: "rgba(255,215,0,0.8)",
                fontWeight: 700,
              }}
            >
              Round {s.round}
            </span>
          )}
        </div>
        <div
          style={{
            background: "rgba(250,204,21,0.1)",
            border: "1px solid rgba(250,204,21,0.3)",
            borderRadius: 8,
            padding: "3px 8px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>
            최고
          </div>
          <div style={{ fontSize: 12, fontWeight: 900, color: "#fde047" }}>
            {best > 0 ? best.toLocaleString() : "—"}
          </div>
        </div>
      </div>

      {phase === "ready" && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            padding: 28,
          }}
        >
          <img
            src="https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/25.png"
            alt="피카츄"
            style={{
              width: 110,
              height: 110,
              objectFit: "contain",
              filter: "drop-shadow(0 0 24px #ffd700)",
              animation: "pikaBounce 1s ease-in-out infinite",
            }}
          />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#fff",
                marginBottom: 12,
              }}
            >
              ⚡ 포켓 핀볼
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: 16,
                padding: "14px 18px",
                fontSize: 13,
                color: "rgba(255,255,255,0.8)",
                lineHeight: 2.1,
                textAlign: "left",
              }}
            >
              <div>
                👆 <b>드래그</b>로 발사 각도 조준
              </div>
              <div>🎱 공이 튕기며 포켓몬 HP를 깎습니다</div>
              <div>
                ⬇️ 매 턴마다 적이 <b>한 칸 전진</b>합니다
              </div>
              <div>
                💀 적이 피카츄에 닿으면 <b>HP -1</b>
              </div>
              <div>
                🃏 <b>3라운드</b>마다 버프 카드 선택
              </div>
              <div>✨ 콤보, 관통, 폭발 등 강력한 버프!</div>
            </div>
          </div>
          <button
            onClick={startGame}
            style={{
              background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
              border: "none",
              borderRadius: 20,
              color: "#000",
              fontWeight: 900,
              fontSize: 18,
              padding: "14px 48px",
              cursor: "pointer",
              boxShadow: "0 6px 0 #92400e",
            }}
          >
            시작!
          </button>
        </div>
      )}

      {(phase === "aiming" ||
        phase === "shooting" ||
        phase === "advancing") && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "6px 14px",
              background: "rgba(0,0,0,0.45)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", gap: 3 }}>
              {Array(s.maxHp)
                .fill(0)
                .map((_, i) => (
                  <span
                    key={i}
                    style={{ fontSize: 14, opacity: i < s.hp ? 1 : 0.2 }}
                  >
                    ❤️
                  </span>
                ))}
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: "#fde047",
                textShadow: "0 0 10px rgba(253,224,71,0.5)",
              }}
            >
              {s.totalScore.toLocaleString()}
            </div>
            <div
              style={{
                textAlign: "right",
                fontSize: 11,
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.6,
              }}
            >
              <div>🎱 ×{s.ballCount + s.specialBalls.length}</div>
              {s.atkMult > 1 && <div>⚡ ×{s.atkMult.toFixed(1)}</div>}
              {s.specialBalls.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "flex-end",
                    flexWrap: "wrap",
                    maxWidth: 60,
                  }}
                >
                  {s.specialBalls.map((t, i) => (
                    <span key={i} style={{ fontSize: 10 }}>
                      {SPECIAL_BALLS[t]?.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {hitFlash && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 100,
                pointerEvents: "none",
                background: "rgba(239,68,68,0.45)",
                animation: "hitFlashAnim 0.5s ease-out forwards",
              }}
            />
          )}

          <div
            ref={gameAreaRef}
            style={{
              flex: 1,
              position: "relative",
              overflow: "hidden",
              cursor: isAiming ? "crosshair" : "default",
              touchAction: "none",
              animation: hitShake ? "hitShakeAnim 0.45s ease-out" : "none",
            }}
            onMouseMove={handleAimMove}
            onTouchMove={(e) => {
              e.preventDefault();
              handleAimMove(e.touches[0]);
            }}
            onMouseDown={() => {
              if (isAiming) shoot();
            }}
            onTouchEnd={() => {
              if (isAiming) shoot();
            }}
          >
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                inset: 0,
                display: "block",
              }}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f0328" />
                  <stop offset="100%" stopColor="#1a0550" />
                </linearGradient>
              </defs>
              <rect width={SVG_W} height={SVG_H} fill="url(#bgGrad)" />
              {Array(COLS + 1)
                .fill(0)
                .map((_, i) => (
                  <line
                    key={`vg${i}`}
                    x1={i * CELL_W}
                    y1={MON_TOP}
                    x2={i * CELL_W}
                    y2={MON_BOT}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="0.3"
                  />
                ))}
              {Array(ROWS + 1)
                .fill(0)
                .map((_, i) => (
                  <line
                    key={`hg${i}`}
                    x1={0}
                    y1={MON_TOP + i * CELL_H}
                    x2={SVG_W}
                    y2={MON_TOP + i * CELL_H}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="0.3"
                  />
                ))}
              <line
                x1={0}
                y1={MON_TOP + 5 * CELL_H}
                x2={SVG_W}
                y2={MON_TOP + 5 * CELL_H}
                stroke="rgba(239,68,68,0.4)"
                strokeWidth="0.6"
                strokeDasharray="3,2"
              />
              <line
                x1={0}
                y1={MON_BOT + 4}
                x2={SVG_W}
                y2={MON_BOT + 4}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="0.8"
              />

              {s.monsters.map((m) => {
                const { x: mx, y: my } = monXY(m.col, m.row, m.sizeW, m.sizeH);
                // ⭐ 크기 반영: 2x2는 4배 영역
                const cw = CELL_W * 0.88 * m.sizeW,
                  ch = CELL_H * 0.88 * m.sizeH;
                const hpR = Math.max(0, m.hp / m.maxHp);
                const isDanger = m.row + m.sizeH - 1 >= ROWS - 2;
                return (
                  <g key={m.uid}>
                    <rect
                      x={mx - cw / 2 + 1}
                      y={my - ch / 2 + 1}
                      width={cw}
                      height={ch}
                      rx="2"
                      fill="rgba(0,0,0,0.4)"
                    />
                    <rect
                      x={mx - cw / 2}
                      y={my - ch / 2}
                      width={cw}
                      height={ch}
                      rx="2"
                      fill={m.flashing ? "#fff" : `${m.color}33`}
                      stroke={isDanger ? "#ef4444" : m.color}
                      strokeWidth={m.boss ? "0.9" : "0.6"}
                      style={{ transition: "fill 0.1s" }}
                    />
                    <rect
                      x={mx - cw / 2}
                      y={my + ch / 2 - 2.8}
                      width={cw}
                      height={2.2}
                      rx="0.5"
                      fill="rgba(0,0,0,0.6)"
                    />
                    <rect
                      x={mx - cw / 2}
                      y={my + ch / 2 - 2.8}
                      width={cw * hpR}
                      height={2.2}
                      rx="0.5"
                      fill={
                        hpR > 0.6
                          ? "#4ade80"
                          : hpR > 0.3
                          ? "#fbbf24"
                          : "#ef4444"
                      }
                    />
                    <image
                      href={`https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/${m.pokeId}.png`}
                      x={mx - cw * 0.38}
                      y={my - ch * 0.44}
                      width={cw * 0.76}
                      height={ch * 0.72}
                      style={{ imageRendering: "pixelated" }}
                    />
                    <text
                      x={mx}
                      y={my + ch * 0.3}
                      textAnchor="middle"
                      fontSize="2.8"
                      fill="rgba(255,255,255,0.9)"
                      fontWeight="bold"
                    >
                      {m.hp}
                    </text>
                    {m.boss && (
                      <text
                        x={mx}
                        y={my - ch * 0.38}
                        textAnchor="middle"
                        fontSize={m.sizeW >= 2 && m.sizeH >= 2 ? "6" : "4"}
                      >
                        👑
                      </text>
                    )}
                    {m.midBoss && !m.boss && (
                      <text
                        x={mx}
                        y={my - ch * 0.38}
                        textAnchor="middle"
                        fontSize="3"
                      >
                        ⭐
                      </text>
                    )}
                    {m.ranged && (
                      <text
                        x={mx + cw * 0.38}
                        y={my - ch * 0.32}
                        textAnchor="middle"
                        fontSize="2.8"
                      >
                        {m.rangedAttacking ? "💥" : "🎯"}
                      </text>
                    )}
                    {m.rangedAttacking && (
                      <rect
                        x={mx - cw / 2}
                        y={my - ch / 2}
                        width={cw}
                        height={ch}
                        rx="2"
                        fill="rgba(239,68,68,0.3)"
                        stroke="#ef4444"
                        strokeWidth="1.2"
                      />
                    )}
                    {m.burning && (
                      <text
                        x={mx + cw * 0.38}
                        y={my - ch * 0.32}
                        textAnchor="middle"
                        fontSize="3"
                      >
                        🔥
                      </text>
                    )}
                    {m.frozen && (
                      <>
                        <rect
                          x={mx - cw / 2}
                          y={my - ch / 2}
                          width={cw}
                          height={ch}
                          rx="2"
                          fill="rgba(56,189,248,0.35)"
                          stroke="#38bdf8"
                          strokeWidth="0.8"
                        />
                        <text
                          x={mx}
                          y={my + ch * 0.1}
                          textAnchor="middle"
                          fontSize="4"
                        >
                          ❄️
                        </text>
                      </>
                    )}
                    {isDanger && (
                      <rect
                        x={mx - cw / 2}
                        y={my - ch / 2}
                        width={cw}
                        height={ch}
                        rx="2"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="1"
                        strokeDasharray="2,1"
                        opacity="0.7"
                      />
                    )}
                    {m.row + m.sizeH - 1 >= ROWS - 1 && (
                      <>
                        <rect
                          x={mx - cw / 2}
                          y={my - ch / 2}
                          width={cw}
                          height={ch}
                          rx="2"
                          fill={
                            m.attacking
                              ? "rgba(239,68,68,0.5)"
                              : "rgba(239,68,68,0.15)"
                          }
                          stroke="#ef4444"
                          strokeWidth="1.5"
                        />
                        <text
                          x={mx}
                          y={my - ch * 0.1}
                          textAnchor="middle"
                          fontSize="4"
                        >
                          {m.attacking ? "💥" : "⚠️"}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}

              {aimDots.map((d, i) => (
                <circle
                  key={i}
                  cx={d.x}
                  cy={d.y}
                  r={0.9}
                  fill="#fde047"
                  opacity={1 - i * 0.09}
                />
              ))}

              {s.balls.map((ball) => {
                const sp = SPECIAL_BALLS[ball.ballType];
                const bc = sp ? sp.color : "#ef4444";
                const bg = sp ? sp.glow : "rgba(239,68,68,0.3)";
                const br = ball.ballType === "heavy" ? BALL_R * 1.5 : BALL_R;
                return (
                  <g key={ball.id}>
                    <circle
                      cx={ball.x}
                      cy={ball.y}
                      r={br + 1.8}
                      fill={bg}
                      opacity="0.5"
                    />
                    <circle
                      cx={ball.x}
                      cy={ball.y}
                      r={br}
                      fill={bc}
                      stroke="rgba(255,255,255,0.8)"
                      strokeWidth="0.5"
                    />
                    {!sp && (
                      <>
                        <line
                          x1={ball.x - br * 0.7}
                          y1={ball.y}
                          x2={ball.x + br * 0.7}
                          y2={ball.y}
                          stroke="rgba(255,255,255,0.6)"
                          strokeWidth="0.35"
                        />
                        <circle
                          cx={ball.x}
                          cy={ball.y}
                          r={br * 0.38}
                          fill="white"
                        />
                      </>
                    )}
                    {ball.ballType === "fire" && (
                      <>
                        <circle
                          cx={ball.x}
                          cy={ball.y - br * 0.6}
                          r={br * 0.6}
                          fill="#fbbf24"
                          opacity="0.7"
                        />
                        <circle
                          cx={ball.x}
                          cy={ball.y - br * 0.9}
                          r={br * 0.35}
                          fill="#fff"
                          opacity="0.5"
                        />
                      </>
                    )}
                    {ball.ballType === "ice" && (
                      <>
                        <polygon
                          points={`${ball.x},${ball.y - br * 0.9} ${
                            ball.x + br * 0.8
                          },${ball.y - br * 0.45} ${ball.x + br * 0.8},${
                            ball.y + br * 0.45
                          } ${ball.x},${ball.y + br * 0.9} ${
                            ball.x - br * 0.8
                          },${ball.y + br * 0.45} ${ball.x - br * 0.8},${
                            ball.y - br * 0.45
                          }`}
                          fill="none"
                          stroke="rgba(255,255,255,0.8)"
                          strokeWidth="0.4"
                        />
                        <circle
                          cx={ball.x}
                          cy={ball.y}
                          r={br * 0.3}
                          fill="white"
                          opacity="0.8"
                        />
                      </>
                    )}
                    {ball.ballType === "thunder" && (
                      <polyline
                        points={`${ball.x - br * 0.3},${ball.y - br * 0.8} ${
                          ball.x + br * 0.1
                        },${ball.y - br * 0.1} ${ball.x - br * 0.2},${
                          ball.y + br * 0.1
                        } ${ball.x + br * 0.3},${ball.y + br * 0.8}`}
                        fill="none"
                        stroke="white"
                        strokeWidth="0.5"
                      />
                    )}
                    {ball.ballType === "pierce" && (
                      <>
                        <circle
                          cx={ball.x}
                          cy={ball.y}
                          r={br * 0.6}
                          fill="none"
                          stroke="rgba(255,255,255,0.6)"
                          strokeWidth="0.5"
                        />
                        <circle
                          cx={ball.x}
                          cy={ball.y}
                          r={br * 0.25}
                          fill="white"
                          opacity="0.9"
                        />
                      </>
                    )}
                    {ball.ballType === "crit" && (
                      <polygon
                        points={`${ball.x},${ball.y - br * 0.85} ${
                          ball.x + br * 0.25
                        },${ball.y - br * 0.25} ${ball.x + br * 0.85},${
                          ball.y - br * 0.25
                        } ${ball.x + br * 0.35},${ball.y + br * 0.2} ${
                          ball.x + br * 0.55
                        },${ball.y + br * 0.8} ${ball.x},${
                          ball.y + br * 0.45
                        } ${ball.x - br * 0.55},${ball.y + br * 0.8} ${
                          ball.x - br * 0.35
                        },${ball.y + br * 0.2} ${ball.x - br * 0.85},${
                          ball.y - br * 0.25
                        } ${ball.x - br * 0.25},${ball.y - br * 0.25}`}
                        fill="white"
                        opacity="0.7"
                      />
                    )}
                    {ball.ballType === "heavy" && (
                      <>
                        <line
                          x1={ball.x - br * 0.3}
                          y1={ball.y - br * 0.5}
                          x2={ball.x + br * 0.1}
                          y2={ball.y + br * 0.5}
                          stroke="rgba(255,255,255,0.5)"
                          strokeWidth="0.5"
                        />
                        <line
                          x1={ball.x + br * 0.4}
                          y1={ball.y - br * 0.3}
                          x2={ball.x - br * 0.2}
                          y2={ball.y + br * 0.3}
                          stroke="rgba(255,255,255,0.4)"
                          strokeWidth="0.4"
                        />
                      </>
                    )}
                    {ball.ballType === "ghost" && (
                      <>
                        <circle
                          cx={ball.x}
                          cy={ball.y}
                          r={br}
                          fill={bc}
                          opacity="0.4"
                          stroke="none"
                        />
                        <circle
                          cx={ball.x - br * 0.25}
                          cy={ball.y - br * 0.2}
                          r={br * 0.2}
                          fill="white"
                          opacity="0.7"
                        />
                        <circle
                          cx={ball.x + br * 0.2}
                          cy={ball.y - br * 0.15}
                          r={br * 0.15}
                          fill="white"
                          opacity="0.7"
                        />
                      </>
                    )}
                  </g>
                );
              })}

              <image
                href="https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/25.png"
                x="36"
                y={PIKA_Y - 14}
                width="28"
                height="28"
                style={{
                  filter: hitFlash
                    ? "drop-shadow(0 0 12px #ef4444) brightness(1.5)"
                    : "drop-shadow(0 0 4px #ffd700)",
                  transition: "filter 0.1s",
                }}
              />
              <circle
                cx="50"
                cy={PIKA_Y - 2}
                r="1.2"
                fill="#fde047"
                opacity="0.9"
              />

              {advancing &&
                s.monsters.map((m) => {
                  const { x: mx, y: my } = monXY(
                    m.col,
                    m.row,
                    m.sizeW,
                    m.sizeH
                  );
                  return (
                    <text
                      key={m.uid + "a"}
                      x={mx}
                      y={my + CELL_H * m.sizeH * 0.3}
                      textAnchor="middle"
                      fontSize="4"
                      opacity="0.6"
                    >
                      ↓
                    </text>
                  );
                })}
            </svg>

            {hitAnims.map((h) => {
              const px = (h.x / SVG_W) * 100;
              const py = (h.y / SVG_H) * 100;
              return (
                <div
                  key={h.id}
                  style={{
                    position: "absolute",
                    left: `${px}%`,
                    top: `${py}%`,
                    transform: "translate(-50%,-50%)",
                    fontSize: 13,
                    fontWeight: 900,
                    color: h.color,
                    textShadow: `0 0 6px ${h.color}`,
                    pointerEvents: "none",
                    zIndex: 20,
                    animation: "hitUp 0.8s ease-out forwards",
                  }}
                >
                  -{h.dmg}
                </div>
              );
            })}

            {roundBanner && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 30,
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 900,
                    color: "#fde047",
                    textShadow: "0 0 30px #ffd700, 0 2px 8px rgba(0,0,0,0.8)",
                    animation: "bannerPop 1.2s ease-out forwards",
                    background: "rgba(0,0,0,0.5)",
                    padding: "10px 28px",
                    borderRadius: 16,
                    border: "2px solid rgba(253,224,71,0.4)",
                  }}
                >
                  {roundBanner}
                </div>
              </div>
            )}

            {hitFlash && (
              <div
                style={{
                  position: "absolute",
                  bottom: "18%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: 22,
                  fontWeight: 900,
                  color: "#ef4444",
                  textShadow: "0 0 16px #ef4444, 0 2px 6px rgba(0,0,0,0.8)",
                  pointerEvents: "none",
                  zIndex: 50,
                  whiteSpace: "nowrap",
                  animation: "hitPopupAnim 0.5s ease-out forwards",
                }}
              >
                💥 피카츄가 맞았다!
              </div>
            )}

            {isAiming && (
              <div
                style={{
                  position: "absolute",
                  bottom: 8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.45)",
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                }}
              >
                드래그로 조준 · 탭하면 발사
              </div>
            )}
          </div>
        </div>
      )}

      {phase === "buff" && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: 20,
            background: "linear-gradient(160deg,#0f0328,#1a0550)",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#fde047",
              textShadow: "0 0 20px #ffd700",
            }}
          >
            🎉 Round {s.round} 클리어!
          </div>
          <div
            style={{
              background: "rgba(251,191,36,0.15)",
              border: "1.5px solid rgba(251,191,36,0.4)",
              borderRadius: 10,
              padding: "6px 16px",
              fontSize: 13,
              color: "#fbbf24",
              fontWeight: 700,
            }}
          >
            🎱 볼 자동 +1 → 현재 {s.ballCount}개 | 다음 버프:{" "}
            {3 - (s.round % 3 === 0 ? 3 : s.round % 3)}라운드 후
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
            버프를 선택하세요
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              width: "100%",
              maxWidth: 340,
            }}
          >
            {buffCards.map((buff) => (
              <button
                key={buff.id}
                onClick={() => selectBuff(buff)}
                style={{
                  background:
                    buff.type === "ball"
                      ? `linear-gradient(135deg,${
                          SPECIAL_BALLS[buff.ballType]?.color ?? "#6366f1"
                        }22,rgba(255,255,255,0.03))`
                      : buff.type === "heal"
                      ? "linear-gradient(135deg,rgba(74,222,128,0.15),rgba(255,255,255,0.03))"
                      : "linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))",
                  border:
                    buff.type === "ball"
                      ? `1.5px solid ${
                          SPECIAL_BALLS[buff.ballType]?.color ?? "#6366f1"
                        }66`
                      : buff.type === "heal"
                      ? "1.5px solid rgba(74,222,128,0.4)"
                      : "1.5px solid rgba(255,255,255,0.18)",
                  borderRadius: 16,
                  padding: "14px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  textAlign: "left",
                  color: "#fff",
                  width: "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.borderColor = "rgba(253,224,71,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    flexShrink: 0,
                    background:
                      buff.type === "ball"
                        ? `${
                            SPECIAL_BALLS[buff.ballType]?.color ?? "#6366f1"
                          }33`
                        : buff.type === "heal"
                        ? "rgba(74,222,128,0.15)"
                        : "rgba(255,255,255,0.08)",
                    border:
                      buff.type === "ball"
                        ? `1px solid ${
                            SPECIAL_BALLS[buff.ballType]?.color ?? "#6366f1"
                          }66`
                        : "1px solid rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                  }}
                >
                  {buff.icon}
                </div>
                <div>
                  <div
                    style={{ fontWeight: 900, fontSize: 15, marginBottom: 3 }}
                  >
                    {buff.name}
                  </div>
                  <div
                    style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}
                  >
                    {buff.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              marginTop: 4,
            }}
          >
            공 {s.ballCount}개 | 공격력 ×{s.atkMult.toFixed(1)} | HP {s.hp}/
            {s.maxHp}
          </div>
        </div>
      )}

      {phase === "result" && result && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: 28,
          }}
        >
          {result.isNew && (
            <div
              style={{
                background: "linear-gradient(135deg,#ffd700,#ff8c00)",
                color: "#000",
                fontWeight: 900,
                fontSize: 15,
                padding: "6px 24px",
                borderRadius: 99,
              }}
            >
              🏆 최고 기록 갱신!
            </div>
          )}
          <img
            src="https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/25.png"
            alt="피카츄"
            style={{
              width: 90,
              height: 90,
              objectFit: "contain",
              filter: "drop-shadow(0 0 20px #ffd700)",
              animation: "pikaBounce 1s ease-in-out infinite",
            }}
          />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                marginBottom: 2,
              }}
            >
              Round {result.round} 도달
            </div>
            <div
              style={{
                fontSize: 56,
                fontWeight: 900,
                color: "#fde047",
                lineHeight: 1,
              }}
            >
              {result.score.toLocaleString()}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={startGame}
              style={{
                background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
                border: "none",
                borderRadius: 16,
                color: "#000",
                fontWeight: 900,
                fontSize: 16,
                padding: "12px 32px",
                cursor: "pointer",
                boxShadow: "0 4px 0 #92400e",
              }}
            >
              다시 도전!
            </button>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 16,
                color: "rgba(255,255,255,0.75)",
                fontWeight: 700,
                fontSize: 16,
                padding: "12px 32px",
                cursor: "pointer",
              }}
            >
              나가기
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pikaBounce   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes hitUp        { 0%{opacity:1;transform:translate(-50%,-50%) scale(1.1)} 100%{opacity:0;transform:translate(-50%,-160%) scale(0.8)} }
        @keyframes bannerPop    { 0%{opacity:0;transform:scale(0.6)} 20%{opacity:1;transform:scale(1.08)} 80%{opacity:1;transform:scale(1)} 100%{opacity:0} }
        @keyframes hitFlashAnim { 0%{opacity:1} 100%{opacity:0} }
        @keyframes hitShakeAnim { 0%{transform:translateX(0)} 10%{transform:translateX(-12px) rotate(-1deg)} 25%{transform:translateX(10px) rotate(1deg)} 40%{transform:translateX(-8px)} 55%{transform:translateX(8px)} 70%{transform:translateX(-4px)} 85%{transform:translateX(4px)} 100%{transform:translateX(0)} }
        @keyframes hitPopupAnim { 0%{opacity:1;transform:translateX(-50%) translateY(0) scale(1.2)} 60%{opacity:0.9;transform:translateX(-50%) translateY(-20px) scale(1)} 100%{opacity:0;transform:translateX(-50%) translateY(-40px) scale(0.8)} }
      `}</style>
    </div>
  );
}
