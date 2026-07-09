// src/games/SilhouetteQuizGame.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { recordScore, getBestScore } from "../lib/miniGameLogic";
import { useSFX, useBGM } from "../lib/sounds"; // ⭐ 사운드 import

const POKEMON_POOL = [
  // ── Gen 1 ──
  { id: 1, name: "이상해씨" },
  { id: 2, name: "이상해풀" },
  { id: 3, name: "이상해꽃" },
  { id: 4, name: "파이리" },
  { id: 5, name: "리자드" },
  { id: 6, name: "리자몽" },
  { id: 7, name: "꼬부기" },
  { id: 8, name: "어니부기" },
  { id: 9, name: "거북왕" },
  { id: 10, name: "캐터피" },
  { id: 11, name: "단데기" },
  { id: 12, name: "버터플" },
  { id: 13, name: "뿔충이" },
  { id: 14, name: "딱충이" },
  { id: 15, name: "독침붕" },
  { id: 16, name: "구구" },
  { id: 17, name: "피죤" },
  { id: 18, name: "피죤투" },
  { id: 19, name: "꼬렛" },
  { id: 20, name: "레트라" },
  { id: 23, name: "아보" },
  { id: 24, name: "아보크" },
  { id: 25, name: "피카츄" },
  { id: 26, name: "라이츄" },
  { id: 27, name: "모래두지" },
  { id: 28, name: "고지" },
  { id: 35, name: "삐삐" },
  { id: 36, name: "픽시" },
  { id: 37, name: "식스테일" },
  { id: 38, name: "나인테일" },
  { id: 39, name: "푸린" },
  { id: 40, name: "푸크린" },
  { id: 41, name: "주뱃" },
  { id: 42, name: "골뱃" },
  { id: 43, name: "뚜벅쵸" },
  { id: 44, name: "냄새꼬" },
  { id: 45, name: "라플레시아" },
  { id: 50, name: "디그다" },
  { id: 51, name: "닥트리오" },
  { id: 52, name: "나옹" },
  { id: 53, name: "페르시온" },
  { id: 54, name: "고라파덕" },
  { id: 55, name: "골덕" },
  { id: 56, name: "망키" },
  { id: 57, name: "성원숭" },
  { id: 60, name: "발챙이" },
  { id: 61, name: "슈륙챙이" },
  { id: 62, name: "강챙이" },
  { id: 63, name: "캐이시" },
  { id: 64, name: "윤겔라" },
  { id: 65, name: "후딘" },
  { id: 66, name: "알통몬" },
  { id: 67, name: "근육몬" },
  { id: 68, name: "괴력몬" },
  { id: 74, name: "꼬마돌" },
  { id: 75, name: "데구리" },
  { id: 76, name: "딱구리" },
  { id: 77, name: "포니타" },
  { id: 78, name: "날쌩마" },
  { id: 79, name: "야돈" },
  { id: 80, name: "야도란" },
  { id: 81, name: "코일" },
  { id: 82, name: "레어코일" },
  { id: 86, name: "쥬쥬" },
  { id: 87, name: "쥬레곤" },
  { id: 88, name: "질퍽이" },
  { id: 89, name: "질뻐기" },
  { id: 90, name: "셀러" },
  { id: 91, name: "파르셀" },
  { id: 92, name: "고오스" },
  { id: 93, name: "고우스트" },
  { id: 94, name: "팬텀" },
  { id: 95, name: "롱스톤" },
  { id: 96, name: "슬리프" },
  { id: 97, name: "슬리퍼" },
  { id: 100, name: "찌리리공" },
  { id: 101, name: "붐볼" },
  { id: 102, name: "아라리" },
  { id: 103, name: "나시" },
  { id: 104, name: "탕구리" },
  { id: 105, name: "텅구리" },
  { id: 106, name: "시라소몬" },
  { id: 107, name: "홍수몬" },
  { id: 108, name: "내루미" },
  { id: 109, name: "또가스" },
  { id: 110, name: "또도가스" },
  { id: 111, name: "뿔카노" },
  { id: 112, name: "코뿌리" },
  { id: 113, name: "럭키" },
  { id: 114, name: "덩쿠리" },
  { id: 116, name: "쏘드라" },
  { id: 117, name: "시드라" },
  { id: 118, name: "콘치" },
  { id: 119, name: "왕콘치" },
  { id: 120, name: "별가사리" },
  { id: 121, name: "아쿠스타" },
  { id: 122, name: "마임맨" },
  { id: 123, name: "스라크" },
  { id: 124, name: "루주라" },
  { id: 125, name: "에레브" },
  { id: 126, name: "마그마르" },
  { id: 127, name: "쁘사이저" },
  { id: 128, name: "켄타로스" },
  { id: 129, name: "잉어킹" },
  { id: 130, name: "갸라도스" },
  { id: 131, name: "라프라스" },
  { id: 132, name: "메타몽" },
  { id: 133, name: "이브이" },
  { id: 134, name: "샤미드" },
  { id: 135, name: "쥬피썬더" },
  { id: 136, name: "부스터" },
  { id: 137, name: "폴리곤" },
  { id: 138, name: "암나이트" },
  { id: 139, name: "암스타" },
  { id: 140, name: "투구" },
  { id: 141, name: "투구푸스" },
  { id: 142, name: "프테라" },
  { id: 143, name: "잠만보" },
  { id: 147, name: "미뇽" },
  { id: 148, name: "신뇽" },
  { id: 149, name: "망나뇽" },
  { id: 150, name: "뮤츠" },
  { id: 151, name: "뮤" },
  // ── Gen 2 ──
  { id: 152, name: "치코리타" },
  { id: 153, name: "베이리프" },
  { id: 154, name: "메가니움" },
  { id: 155, name: "브케인" },
  { id: 156, name: "마그케인" },
  { id: 157, name: "블레이범" },
  { id: 158, name: "리아코" },
  { id: 159, name: "엘리게이" },
  { id: 160, name: "장크로다일" },
  { id: 161, name: "꼬리선" },
  { id: 162, name: "다꼬리" },
  { id: 163, name: "부우부" },
  { id: 164, name: "야부엉" },
  { id: 165, name: "레디바" },
  { id: 166, name: "레디안" },
  { id: 172, name: "피츄" },
  { id: 173, name: "삐" },
  { id: 174, name: "푸푸린" },
  { id: 175, name: "토게피" },
  { id: 176, name: "토게틱" },
  { id: 179, name: "메리프" },
  { id: 180, name: "보송송" },
  { id: 181, name: "전룡" },
  { id: 183, name: "마릴" },
  { id: 184, name: "마릴리" },
  { id: 185, name: "꼬지모" },
  { id: 186, name: "왕구리" },
  { id: 190, name: "에이팜" },
  { id: 193, name: "왕자리" },
  { id: 194, name: "우파" },
  { id: 195, name: "누오" },
  { id: 196, name: "에브이" },
  { id: 197, name: "블래키" },
  { id: 199, name: "야도킹" },
  { id: 200, name: "무우마" },
  { id: 202, name: "마자용" },
  { id: 206, name: "노고치" },
  { id: 209, name: "블루" },
  { id: 210, name: "그랑블루" },
  { id: 211, name: "침바루" },
  { id: 212, name: "핫삼" },
  { id: 213, name: "단단지" },
  { id: 214, name: "헤라크로스" },
  { id: 215, name: "포푸니" },
  { id: 216, name: "깜지곰" },
  { id: 217, name: "링곰" },
  { id: 218, name: "마그마그" },
  { id: 219, name: "마그카르고" },
  { id: 220, name: "꾸꾸리" },
  { id: 221, name: "메꾸리" },
  { id: 223, name: "총어" },
  { id: 224, name: "대포무노" },
  { id: 225, name: "딜리버드" },
  { id: 226, name: "만타인" },
  { id: 227, name: "무장조" },
  { id: 228, name: "델빌" },
  { id: 229, name: "헬가" },
  { id: 230, name: "킹드라" },
  { id: 233, name: "폴리곤2" },
  { id: 236, name: "배루키" },
  { id: 237, name: "카포에라" },
  { id: 238, name: "뽀뽀라" },
  { id: 242, name: "해피너스" },
  { id: 246, name: "애버라스" },
  { id: 247, name: "데기라스" },
  { id: 248, name: "마기라스" },
  { id: 249, name: "루기아" },
  { id: 250, name: "칠색조" },
  // ── Gen 3 ──
  { id: 252, name: "나무지기" },
  { id: 253, name: "나무돌이" },
  { id: 254, name: "나무킹" },
  { id: 255, name: "아차모" },
  { id: 256, name: "영치코" },
  { id: 257, name: "번치코" },
  { id: 258, name: "물짱이" },
  { id: 259, name: "늪짱이" },
  { id: 260, name: "대짱이" },
  { id: 265, name: "나티" },
  { id: 267, name: "뷰티플라이" },
  { id: 269, name: "독케일" },
  { id: 276, name: "테일로" },
  { id: 277, name: "스왈로" },
  { id: 280, name: "랄토스" },
  { id: 281, name: "킬리아" },
  { id: 282, name: "가디안" },
  { id: 285, name: "버섯꼬" },
  { id: 286, name: "버섯모" },
  { id: 287, name: "게으르" },
  { id: 289, name: "게을킹" },
  { id: 290, name: "토중몬" },
  { id: 291, name: "아이스크" },
  { id: 292, name: "껍질몬" },
  { id: 293, name: "소곤룡" },
  { id: 294, name: "노공룡" },
  { id: 295, name: "폭음룡" },
  { id: 296, name: "마크탕" },
  { id: 297, name: "하리뭉" },
  { id: 302, name: "깜까미" },
  { id: 311, name: "볼비트" },
  { id: 312, name: "네오비트" },
  { id: 315, name: "로젤리아" },
  { id: 320, name: "혹등고래" },
  { id: 321, name: "성조고래" },
  { id: 324, name: "코터스" },
  { id: 327, name: "도롱도롱" },
  { id: 333, name: "파비코" },
  { id: 334, name: "파비코리" },
  { id: 335, name: "자리끼" },
  { id: 336, name: "자리나" },
  { id: 337, name: "루나톤" },
  { id: 338, name: "솔록" },
  { id: 341, name: "어시카꼬" },
  { id: 342, name: "킹어시카" },
  { id: 349, name: "피비" },
  { id: 350, name: "밀로틱" },
  { id: 352, name: "켈리몬" },
  { id: 353, name: "요마" },
  { id: 354, name: "앙마" },
  { id: 355, name: "해골몽" },
  { id: 357, name: "트로피우스" },
  { id: 359, name: "앱솔" },
  { id: 361, name: "눈꼬마" },
  { id: 362, name: "얼음귀신" },
  { id: 366, name: "진주몽" },
  { id: 367, name: "헌테일" },
  { id: 368, name: "분홍장이" },
  { id: 371, name: "아공이" },
  { id: 372, name: "쉘곤" },
  { id: 373, name: "보만다" },
  { id: 374, name: "메탕" },
  { id: 375, name: "메탕구" },
  { id: 376, name: "메타그로스" },
  { id: 377, name: "레지락" },
  { id: 378, name: "레지아이스" },
  { id: 379, name: "레지스틸" },
  { id: 380, name: "라티아스" },
  { id: 381, name: "라티오스" },
  { id: 382, name: "가이오가" },
  { id: 383, name: "그란돈" },
  { id: 384, name: "레쿠쟈" },
  { id: 385, name: "지라치" },
  { id: 386, name: "데옥시스" },
];

const TOTAL_ROUNDS = 20;
const TIME_PER_Q = 5;

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function makeQuestion(used) {
  const remaining = POKEMON_POOL.filter((p) => !used.has(p.id));
  const pool = remaining.length >= 4 ? remaining : POKEMON_POOL;
  const answer = pool[Math.floor(Math.random() * pool.length)];
  const wrongs = shuffle(POKEMON_POOL.filter((p) => p.id !== answer.id)).slice(
    0,
    3
  );
  const choices = shuffle([answer, ...wrongs]);
  return { answer, choices };
}

export default function SilhouetteQuizGame({ onClose, onGameEnd }) {
  const [phase, setPhase] = useState("ready");
  const [q, setQ] = useState(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [selected, setSelected] = useState(null);
  const [streak, setStreak] = useState(0);
  const [result, setResult] = useState(null);
  const [revealed, setRevealed] = useState(false);

  // ⭐ 사운드 훅
  const { play } = useSFX();
  useBGM("silhouetteBgm", { enabled: phase === "playing" });

  const scoreRef = useRef(0);
  const roundRef = useRef(0);
  const streakRef = useRef(0);
  const usedRef = useRef(new Set());
  const timerRef = useRef(null);
  const phaseRef = useRef("ready");
  const timeLeftRef = useRef(TIME_PER_Q);

  const best = getBestScore("silhouette_quiz");

  const endGame = useCallback(() => {
    clearInterval(timerRef.current);
    phaseRef.current = "result";
    setPhase("result");
    const res = recordScore("silhouette_quiz", scoreRef.current);
    setResult({ score: scoreRef.current, ...res });
    // ⭐ 게임 종료
    play("gameOverMG");
    if (res.isNew) setTimeout(() => play("newRecord"), 700);
    onGameEnd?.(scoreRef.current);
  }, [onGameEnd, play]);

  const nextQuestion = useCallback(() => {
    clearInterval(timerRef.current);
    if (roundRef.current >= TOTAL_ROUNDS) {
      endGame();
      return;
    }
    const question = makeQuestion(usedRef.current);
    usedRef.current.add(question.answer.id);
    setQ(question);
    setSelected(null);
    setRevealed(false);
    setTimeLeft(TIME_PER_Q);
    timeLeftRef.current = TIME_PER_Q;
    phaseRef.current = "playing";
    setPhase("playing");

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        const next = t - 1;
        timeLeftRef.current = next;
        if (next <= 0) {
          clearInterval(timerRef.current);
          phaseRef.current = "timeout";
          setSelected({ id: null, correct: false });
          setRevealed(true);
          play("silhouetteTimeout"); // ⭐ 시간 초과
          play("silhouetteReveal"); // ⭐ 실루엣 공개
          streakRef.current = 0;
          setStreak(0);
          roundRef.current++;
          setRound(roundRef.current);
          setTimeout(nextQuestion, 1200);
          return 0;
        }
        return next;
      });
    }, 1000);
  }, [endGame, play]);

  const startGame = useCallback(() => {
    scoreRef.current = 0;
    roundRef.current = 0;
    streakRef.current = 0;
    usedRef.current = new Set();
    setScore(0);
    setRound(0);
    setStreak(0);
    setResult(null);
    nextQuestion();
  }, [nextQuestion]);

  const handleAnswer = useCallback(
    (choice) => {
      if (phaseRef.current !== "playing") return;
      phaseRef.current = "answered";
      clearInterval(timerRef.current);

      const correct = choice.id === q?.answer?.id;
      setSelected({ id: choice.id, correct });
      setRevealed(true);
      play("silhouetteReveal"); // ⭐ 실루엣 공개

      if (correct) {
        const speedBonus = Math.floor(timeLeftRef.current * 12);
        const newStreak = streakRef.current + 1;
        const streakBonus = newStreak >= 4 ? 50 : newStreak >= 2 ? 20 : 0;
        const pts = 100 + speedBonus + streakBonus;
        scoreRef.current += pts;
        streakRef.current = newStreak;
        setScore(scoreRef.current);
        setStreak(newStreak);
        // ⭐ 정답 + 스트릭
        play("silhouetteCorrect");
        if (newStreak >= 2) setTimeout(() => play("silhouetteStreak"), 250);
      } else {
        streakRef.current = 0;
        setStreak(0);
        play("silhouetteWrong"); // ⭐ 오답
      }

      roundRef.current++;
      setRound(roundRef.current);
      setTimeout(nextQuestion, correct ? 800 : 1500);
    },
    [q, nextQuestion, play]
  );

  useEffect(() => () => clearInterval(timerRef.current), []);

  const timerColor =
    timeLeft <= 2 ? "#ef4444" : timeLeft <= 3 ? "#fbbf24" : "#4ade80";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "linear-gradient(160deg,#0a001a,#1a1040,#0a001a)",
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
          padding: "10px 16px",
          background: "rgba(0,0,0,0.4)",
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
            fontSize: 13,
            padding: "5px 12px",
            cursor: "pointer",
          }}
        >
          ← 나가기
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 18 }}>❓</span>
          <span style={{ fontWeight: 900, color: "#fff", fontSize: 16 }}>
            오늘의 포켓몬은?
          </span>
        </div>
        <div
          style={{
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.35)",
            borderRadius: 10,
            padding: "4px 10px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>
            최고
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#a5b4fc" }}>
            {best > 0 ? best : "—"}
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
            gap: 20,
            padding: 32,
          }}
        >
          <div style={{ fontSize: 52 }}>❓</div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#fff",
                marginBottom: 8,
              }}
            >
              오늘의 포켓몬은?
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.9,
              }}
            >
              실루엣만 보고 포켓몬을 맞혀라!
              <br />
              빠를수록 높은 점수 · {TOTAL_ROUNDS}문제 도전
            </div>
          </div>
          <button
            onClick={startGame}
            style={{
              background: "linear-gradient(135deg,#4f46e5,#6366f1)",
              border: "none",
              borderRadius: 20,
              color: "#fff",
              fontWeight: 900,
              fontSize: 18,
              padding: "14px 48px",
              cursor: "pointer",
              boxShadow: "0 6px 0 #312e81",
            }}
          >
            시작!
          </button>
        </div>
      )}

      {phase === "playing" && q && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
            padding: "12px 16px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              maxWidth: 380,
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
              {round + 1} / {TOTAL_ROUNDS}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {streak >= 2 && (
                <span
                  style={{ fontSize: 12, fontWeight: 800, color: "#fb923c" }}
                >
                  🔥 ×{streak}
                </span>
              )}
              <span style={{ fontSize: 15, fontWeight: 900, color: "#fcd34d" }}>
                {score}
              </span>
            </div>
          </div>
          <div
            style={{
              width: "100%",
              maxWidth: 380,
              height: 6,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 99,
              overflow: "hidden",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                height: "100%",
                width:
                  phase === "playing" && phaseRef.current === "playing"
                    ? `${(timeLeft / TIME_PER_Q) * 100}%`
                    : phaseRef.current === "answered"
                    ? `${(timeLeft / TIME_PER_Q) * 100}%`
                    : "0%",
                background: timerColor,
                borderRadius: 99,
                transition:
                  phaseRef.current === "playing"
                    ? "width 1s linear, background 0.3s"
                    : "none",
              }}
            />
          </div>
          <div style={{ position: "relative", marginBottom: 20 }}>
            <div
              style={{
                width: 170,
                height: 170,
                borderRadius: "50%",
                background: "#fff",
                boxShadow:
                  "0 0 0 6px rgba(255,255,255,0.15), 0 4px 20px rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <img
                src={`https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/${q.answer.id}.png`}
                alt="?"
                style={{
                  width: 148,
                  height: 148,
                  objectFit: "contain",
                  filter: revealed ? "none" : "brightness(0)",
                  transition: revealed ? "filter 0.3s ease" : "none",
                }}
              />
            </div>
            {revealed && (
              <div
                style={{
                  position: "absolute",
                  bottom: -10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(0,0,0,0.85)",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 14,
                  padding: "3px 14px",
                  borderRadius: 99,
                  whiteSpace: "nowrap",
                  zIndex: 10,
                }}
              >
                {q.answer.name}
              </div>
            )}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              width: "100%",
              maxWidth: 380,
            }}
          >
            {q.choices.map((choice) => {
              const isSelected = selected?.id === choice.id;
              const isAnswer = revealed && choice.id === q.answer.id;
              const isWrong = isSelected && !selected?.correct;
              return (
                <button
                  key={choice.id}
                  onClick={() => handleAnswer(choice)}
                  style={{
                    padding: "14px 10px",
                    borderRadius: 14,
                    border: isAnswer
                      ? "2px solid #4ade80"
                      : isWrong
                      ? "2px solid #ef4444"
                      : "1.5px solid rgba(255,255,255,0.12)",
                    background: isAnswer
                      ? "rgba(34,197,94,0.2)"
                      : isWrong
                      ? "rgba(239,68,68,0.2)"
                      : "rgba(255,255,255,0.05)",
                    color: isAnswer ? "#4ade80" : isWrong ? "#ef4444" : "#fff",
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: selected ? "default" : "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {choice.name}
                </button>
              );
            })}
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
            gap: 20,
            padding: 32,
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
          <div style={{ fontSize: 52 }}>❓</div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.5)",
                marginBottom: 4,
              }}
            >
              최종 점수
            </div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                color: "#a5b4fc",
                lineHeight: 1,
              }}
            >
              {result.score}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={startGame}
              style={{
                background: "linear-gradient(135deg,#4f46e5,#6366f1)",
                border: "none",
                borderRadius: 16,
                color: "#fff",
                fontWeight: 900,
                fontSize: 16,
                padding: "12px 32px",
                cursor: "pointer",
                boxShadow: "0 4px 0 #312e81",
              }}
            >
              다시 하기
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
    </div>
  );
}
