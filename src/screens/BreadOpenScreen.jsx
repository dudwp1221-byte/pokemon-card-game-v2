import { useState, useCallback, useEffect, useRef } from "react";
import { BREAD_TYPES, rollSeal, acquireSeal } from "../lib/sealLogic";
import { PREMIUM_BREAD_ID } from "../lib/dailyMissions";

const TYPE_COLORS = {
  fire: "#E8763A",
  water: "#4FC3F7",
  grass: "#66BB6A",
  electric: "#F5C400",
  psychic: "#E91E8C",
  ice: "#80DEEA",
  dragon: "#7E57C2",
  dark: "#546E7A",
  fairy: "#F48FB1",
  normal: "#A8A878",
  fighting: "#C03028",
  flying: "#89AAE3",
  poison: "#A040A0",
  ground: "#E0C068",
  rock: "#B8A038",
  bug: "#A8B820",
  ghost: "#705898",
  steel: "#B8B8D0",
};
const typeColorCache = {};
async function fetchTypeColor(pokeId) {
  if (typeColorCache[pokeId]) return typeColorCache[pokeId];
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeId}`);
    const data = await res.json();
    const color = TYPE_COLORS[data.types[0].type.name] || "#A8A878";
    typeColorCache[pokeId] = color;
    return color;
  } catch {
    return "#A8A878";
  }
}

const GRADE_FX = {
  COMMON: { label: "일반", color: "#aaaaaa" },
  RARE: { label: "레어", color: "#4fc3f7" },
  SR: { label: "슈퍼레어", color: "#ce93d8" },
  LEGENDARY: { label: "레전더리", color: "#ffd700" },
  HOLO: { label: "홀로그램", color: "#ff80ab" },
};
const CARD_W = 180,
  CARD_H = 207,
  IMG_SZ = 156;

const HOLO_FX_TYPE = {
  6: "fire",
  25: "lightning",
  3: "grass",
  9: "water",
  149: "dragon",
  150: "psychic",
  151: "psychic",
  133: "sparkle",
  129: "golden",
  130: "dragon",
};

function HoloEffect({ pokeId }) {
  const type = HOLO_FX_TYPE[pokeId] || "sparkle";
  if (type === "fire")
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {[
          { l: "4%", d: "0s", s: 14, h: 10 },
          { l: "14%", d: "0.18s", s: 16, h: 22 },
          { l: "25%", d: "0.07s", s: 12, h: 35 },
          { l: "36%", d: "0.32s", s: 17, h: 15 },
          { l: "48%", d: "0.05s", s: 13, h: 28 },
          { l: "59%", d: "0.24s", s: 15, h: 10 },
          { l: "70%", d: "0.14s", s: 14, h: 32 },
          { l: "81%", d: "0.38s", s: 12, h: 20 },
          { l: "91%", d: "0.1s", s: 16, h: 8 },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: "2%",
              left: p.l,
              width: p.s,
              height: p.s * 2,
              borderRadius: "50% 50% 25% 75% / 60% 60% 40% 40%",
              background: `hsl(${p.h},100%,55%)`,
              boxShadow: `0 0 14px hsl(${p.h},100%,65%)`,
              animation: `holoFireRise ${0.55 + i * 0.08}s ease-out infinite`,
              animationDelay: p.d,
            }}
          />
        ))}
      </div>
    );
  if (type === "lightning")
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        {[
          { l: "8%", t: "10%", d: "0s", r: "40deg" },
          { l: "55%", t: "8%", d: "0.45s", r: "-30deg" },
          { l: "28%", t: "52%", d: "0.22s", r: "25deg" },
          { l: "72%", t: "55%", d: "0.65s", r: "-48deg" },
          { l: "18%", t: "30%", d: "0.1s", r: "-20deg" },
          { l: "82%", t: "28%", d: "0.55s", r: "35deg" },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.l,
              top: p.t,
              width: 13,
              height: 26,
              background: "linear-gradient(to bottom,#ffffff,#ffe000,#ff9900)",
              boxShadow: "0 0 12px #ffe000",
              clipPath:
                "polygon(50% 0%,15% 45%,42% 45%,5% 100%,85% 42%,55% 42%)",
              transform: `rotate(${p.r})`,
              animation: `holoSpark ${0.8 + i * 0.12}s ease-in-out infinite`,
              animationDelay: p.d,
            }}
          />
        ))}
      </div>
    );
  if (type === "sparkle")
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        {[
          { l: "6%", t: "10%", d: "0s", s: 11, c: "#ffd700" },
          { l: "75%", t: "14%", d: "0.38s", s: 9, c: "#ff80ab" },
          { l: "15%", t: "65%", d: "0.18s", s: 10, c: "#a78bfa" },
          { l: "68%", t: "60%", d: "0.55s", s: 12, c: "#60d4f0" },
          { l: "44%", t: "30%", d: "0.08s", s: 8, c: "#ffd700" },
          { l: "86%", t: "38%", d: "0.72s", s: 9, c: "#ff80ab" },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.l,
              top: p.t,
              width: p.s,
              height: p.s,
              background: p.c,
              boxShadow: `0 0 10px ${p.c}`,
              clipPath:
                "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
              animation: `holoSparkle ${0.7 + i * 0.12}s ease-in-out infinite`,
              animationDelay: p.d,
            }}
          />
        ))}
      </div>
    );
  return null;
}

function SealSticker({ seal, typeColor }) {
  const isHolo = seal.grade === "HOLO";
  const fx = GRADE_FX[seal.grade];
  return (
    <div
      style={{
        width: CARD_W,
        height: CARD_H,
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        border: "1px solid #c8c8c8",
        overflow: "hidden",
        flexShrink: 0,
        boxShadow: `0 8px 32px ${fx.color}66`,
      }}
    >
      <div
        style={{
          padding: "0px 4px 0px",
          marginTop: "-1px",
          background: "#fff",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "stretch",
            border: "1px solid #bbb",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: typeColor,
              padding: "1px 6px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 900, color: "#111" }}>
              {String(seal.pokeId).padStart(3, "0")}
            </span>
          </div>
          <div
            style={{
              background: "#fff",
              padding: "1px 8px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>
              {seal.name}
            </span>
          </div>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          position: "relative",
          background: isHolo
            ? "linear-gradient(135deg,#fff0f8,#f0f8ff,#fffff0)"
            : "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {isHolo && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "conic-gradient(rgba(255,128,171,0.2),rgba(79,195,247,0.2),rgba(255,215,0,0.2),rgba(255,128,171,0.2))",
              animation: "ddSpin 4s linear infinite",
              maskImage:
                "radial-gradient(ellipse at center,black 50%,transparent 80%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at center,black 50%,transparent 80%)",
            }}
          />
        )}
        {isHolo && <HoloEffect pokeId={seal.pokeId} />}
        <img
          src={seal.artwork}
          alt={seal.name}
          style={{
            width: IMG_SZ,
            height: IMG_SZ,
            objectFit: "contain",
            position: "relative",
            zIndex: 1,
            filter: isHolo ? `drop-shadow(0 0 12px ${fx.color})` : "none",
            animation: isHolo ? "ddFloat 2s ease-in-out infinite" : "none",
          }}
        />
      </div>
      <div
        style={{
          padding: "2px 6px",
          display: "flex",
          justifyContent: "flex-end",
          background: "#fff",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 9, color: "#bbb" }}>©Pokémon</span>
      </div>
    </div>
  );
}

// ── 파티클 ──────────────────────────────────────────────
function StarParticles({ count = 16, color = "#ffd700", size = 8 }) {
  const [particles] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      dur: 1.5 + Math.random() * 2,
      sz: size * (0.5 + Math.random()),
    }))
  );
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: "-10px",
            width: p.sz,
            height: p.sz,
            background: color,
            borderRadius: "50%",
            boxShadow: `0 0 ${p.sz * 2}px ${color}`,
            animation: `srStarFall ${p.dur}s ${p.delay}s ease-in infinite`,
          }}
        />
      ))}
    </div>
  );
}

function SealReveal({ result, onClose }) {
  const { seal, isNew, count, shardsGained } = result;
  const fx = GRADE_FX[seal.grade];
  const [typeColor, setTypeColor] = useState("#A8A878");
  const [stage, setStage] = useState(0);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    fetchTypeColor(seal.pokeId).then(setTypeColor);
  }, [seal.pokeId]);

  const grade = seal.grade;

  // 등급별 배경색
  const bgColor =
    grade === "HOLO"
      ? "#0d0010"
      : grade === "LEGENDARY"
      ? "#0a0808"
      : grade === "SR"
      ? "#0d0015"
      : grade === "RARE"
      ? "#0a1628"
      : "rgba(0,0,0,0.92)";

  const handleReveal = () => {
    if (stage !== 0) return;
    if (grade === "LEGENDARY") {
      setFlash(true);
      setTimeout(() => {
        setFlash(false);
        setStage(1);
      }, 300);
      setTimeout(() => setStage(2), 1200);
      setTimeout(() => setStage(3), 3000);
    } else if (grade === "HOLO") {
      setFlash(true);
      setTimeout(() => {
        setFlash(false);
        setStage(1);
      }, 300);
      setTimeout(() => setStage(2), 1400);
      setTimeout(() => setStage(3), 3500);
    } else {
      // COMMON / RARE / SR 동일
      setStage(1);
      setTimeout(() => setStage(2), 700);
    }
  };

  // HOLO/LEGENDARY 최종 단계 (3=공개완료)
  const finalStage = grade === "LEGENDARY" || grade === "HOLO" ? 3 : 2;
  const revealed = stage === finalStage;

  // 실루엣 배경색/필터
  const silBg =
    grade === "HOLO"
      ? "#0d0010"
      : grade === "LEGENDARY"
      ? "#050303"
      : grade === "SR"
      ? "#0d0015"
      : grade === "RARE"
      ? "#050d1a"
      : "#111";

  const silFilter =
    grade === "HOLO"
      ? "brightness(0) sepia(1) hue-rotate(290deg) opacity(0.2)"
      : grade === "LEGENDARY"
      ? "brightness(0) sepia(1) hue-rotate(30deg) opacity(0.2)"
      : grade === "SR"
      ? "brightness(0) sepia(1) hue-rotate(240deg) opacity(0.25)"
      : grade === "RARE"
      ? "brightness(0) sepia(1) hue-rotate(180deg) opacity(0.2)"
      : "brightness(0) invert(1) opacity(0.15)";

  // 카드 글로우
  const spinGradient =
    grade === "HOLO"
      ? "conic-gradient(from 0deg,#ff80ab,#f472b6,#e040fb,#c084fc,#ff80ab,#60a5fa,#ff80ab)"
      : grade === "LEGENDARY"
      ? "conic-gradient(from 0deg,#ffd700,#ff8c00,#ffd700,#fff176,#ffd700)"
      : grade === "SR"
      ? "conic-gradient(from 0deg,#ff80ab,#f472b6,#e040fb,#c084fc,#ff80ab)"
      : null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: bgColor,
        animation: "fadeIn 0.3s ease",
        gap: 20,
        overflow: "hidden",
      }}
    >
      {/* 플래시 */}
      {flash && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: grade === "HOLO" ? "#ff80ab" : "#fff",
            zIndex: 9999,
            animation: "srFlashFade 0.3s ease forwards",
            pointerEvents: "none",
          }}
        />
      )}

      {/* 배경 방사형 글로우 */}
      {(grade === "SR" || grade === "LEGENDARY" || grade === "HOLO") && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 50% 40%, ${fx.color}22 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* 별 파티클 */}
      {stage >= (grade === "LEGENDARY" || grade === "HOLO" ? 2 : finalStage) &&
        (grade === "HOLO" ? (
          <>
            <StarParticles count={30} color="#ff80ab" size={8} />
            <StarParticles count={20} color="#e040fb" size={5} />
            <StarParticles count={15} color="#60a5fa" size={6} />
          </>
        ) : grade === "LEGENDARY" ? (
          <>
            <StarParticles count={30} color="#ffd700" size={9} />
            <StarParticles count={15} color="#ffffff" size={5} />
          </>
        ) : grade === "SR" ? (
          <StarParticles count={16} color="#ce93d8" size={7} />
        ) : null)}

      {/* HOLO/LEGENDARY 강림 타이틀 */}
      {stage === 2 && (grade === "LEGENDARY" || grade === "HOLO") && (
        <div
          style={{
            textAlign: "center",
            animation: "srTitleFadeIn 1s ease forwards",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: `${fx.color}aa`,
              letterSpacing: 4,
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            {grade === "HOLO" ? "— 홀로그램 씰 등장 —" : "— 전설의 씰 등장 —"}
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: fx.color,
              textShadow: `0 0 20px ${fx.color}88`,
              letterSpacing: 2,
            }}
          >
            ✦ {seal.name} ✦
          </div>
        </div>
      )}

      {/* 등급 뱃지 (공개 후) */}
      {revealed && (
        <div
          style={{
            background: fx.color,
            color: "#000",
            fontWeight: 900,
            fontSize: 14,
            padding: "4px 18px",
            borderRadius: 99,
            letterSpacing: 2,
          }}
        >
          {fx.label}
        </div>
      )}

      {/* 카드 영역 */}
      <div
        style={{
          perspective: 800,
          cursor: stage === 0 ? "pointer" : "default",
        }}
        onClick={handleReveal}
      >
        {/* 실루엣 */}
        {stage === 0 && (
          <div
            style={{
              width: CARD_W,
              height: CARD_H,
              background: silBg,
              border: `1.5px solid ${fx.color}44`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              animation: "silhouettePulse 2s ease-in-out infinite",
              boxShadow: `0 0 30px ${fx.color}22`,
            }}
          >
            <img
              src={seal.artwork}
              alt="?"
              style={{
                width: IMG_SZ,
                height: IMG_SZ,
                objectFit: "contain",
                filter: silFilter,
              }}
            />
            <div
              style={{
                marginTop: 12,
                fontSize: 13,
                color: `${fx.color}aa`,
                fontWeight: 700,
              }}
            >
              탭하여 공개
            </div>
            <div
              style={{
                position: "absolute",
                width: grade === "HOLO" || grade === "LEGENDARY" ? 80 : 64,
                height: grade === "HOLO" || grade === "LEGENDARY" ? 80 : 64,
                borderRadius: "50%",
                border: `2px solid ${fx.color}66`,
                animation: "hintPulse 1.5s ease-out infinite",
              }}
            />
          </div>
        )}

        {/* 스핀 (LEGENDARY/HOLO 제외) */}
        {stage === 1 && grade !== "LEGENDARY" && grade !== "HOLO" && (
          <div
            style={{
              width: CARD_W,
              height: CARD_H,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation:
                "sealSpinAir 1s cubic-bezier(0.25,0.46,0.45,0.94) forwards",
            }}
          >
            <img
              src={seal.artwork}
              alt="?"
              style={{
                width: IMG_SZ,
                height: IMG_SZ,
                objectFit: "contain",
                filter: "brightness(0) opacity(0.07)",
              }}
            />
          </div>
        )}

        {/* 암전 (LEGENDARY/HOLO) */}
        {stage === 1 && (grade === "LEGENDARY" || grade === "HOLO") && (
          <div
            style={{
              width: CARD_W,
              height: CARD_H,
              background: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "srBlackout 1.2s ease forwards",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: fx.color,
                boxShadow: `0 0 20px ${fx.color}`,
                animation: "srDotPulse 0.5s ease-in-out infinite",
              }}
            />
          </div>
        )}

        {/* 강림 (LEGENDARY/HOLO stage 2) */}
        {stage === 2 && (grade === "LEGENDARY" || grade === "HOLO") && (
          <div
            style={{
              animation:
                "srDescend 1.8s cubic-bezier(0.22,0.61,0.36,1) forwards",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: -16,
                borderRadius: 10,
                background: spinGradient,
                animation: `srSpin ${
                  grade === "HOLO" ? "1s" : "1.2s"
                } linear infinite`,
                zIndex: -1,
                filter: "blur(2px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: -13,
                borderRadius: 8,
                background: bgColor,
                zIndex: -1,
              }}
            />
            <SealSticker seal={seal} typeColor={typeColor} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(105deg,transparent 10%,rgba(255,255,255,0.9) 50%,transparent 90%)",
                animation: `srShimmer ${
                  grade === "HOLO" ? "1.2s" : "1.4s"
                } ease-in-out infinite`,
                pointerEvents: "none",
              }}
            />
          </div>
        )}

        {/* COMMON/RARE/SR 공개 */}
        {stage === 2 && grade !== "LEGENDARY" && grade !== "HOLO" && (
          <div
            style={{ animation: "sealPop 0.45s cubic-bezier(.34,1.56,.64,1)" }}
          >
            <SealSticker seal={seal} typeColor={typeColor} />
          </div>
        )}

        {/* LEGENDARY/HOLO 최종 공개 (stage 3) */}
        {stage === 3 && (grade === "LEGENDARY" || grade === "HOLO") && (
          <div
            style={{
              animation: "srZoomIn 0.5s cubic-bezier(.34,1.56,.64,1)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: -16,
                borderRadius: 10,
                background: spinGradient,
                animation: `srSpin ${
                  grade === "HOLO" ? "1s" : "1.2s"
                } linear infinite`,
                zIndex: -1,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: -13,
                borderRadius: 8,
                background: bgColor,
                zIndex: -1,
              }}
            />
            <SealSticker seal={seal} typeColor={typeColor} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(105deg,transparent 10%,rgba(255,255,255,0.9) 50%,transparent 90%)",
                animation: `srShimmer ${
                  grade === "HOLO" ? "1.2s" : "1.4s"
                } ease-in-out infinite`,
                pointerEvents: "none",
              }}
            />
          </div>
        )}
      </div>

      {/* 힌트 텍스트 */}
      {stage === 0 && (
        <div style={{ color: `${fx.color}88`, fontSize: 13 }}>
          어떤 씰일까요?
        </div>
      )}

      {/* 획득 메시지 */}
      {revealed &&
        isNew &&
        (grade === "HOLO" ? (
          <div
            style={{
              textAlign: "center",
              animation: "srTitleFadeIn 0.5s ease forwards",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: `${fx.color}aa`,
                letterSpacing: 3,
                marginBottom: 4,
              }}
            >
              — 홀로그램 씰 획득 —
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: fx.color,
                textShadow: `0 0 30px ${fx.color}`,
                animation: "srBadgePulse 1.5s ease-in-out infinite",
              }}
            >
              ✨ {seal.name} ✨
            </div>
          </div>
        ) : grade === "LEGENDARY" ? (
          <div
            style={{
              textAlign: "center",
              animation: "srTitleFadeIn 0.5s ease forwards",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: `${fx.color}aa`,
                letterSpacing: 3,
                marginBottom: 4,
              }}
            >
              — 레전더리 씰 획득 —
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: fx.color,
                textShadow: `0 0 30px ${fx.color}`,
                animation: "srBadgePulse 1.5s ease-in-out infinite",
              }}
            >
              🌟 {seal.name} 🌟
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "linear-gradient(135deg,#ffd700,#ff8c00)",
              color: "#000",
              fontWeight: 900,
              fontSize: 16,
              padding: "8px 24px",
              borderRadius: 99,
            }}
          >
            ✨ 새로운 씰 획득!
          </div>
        ))}
      {revealed && !isNew && (
        <div style={{ color: "#888", fontSize: 14, textAlign: "center" }}>
          {count}번째 수집
          {shardsGained > 0 && (
            <span style={{ color: "#4fc3f7", marginLeft: 8 }}>
              +{shardsGained} 씰조각
            </span>
          )}
        </div>
      )}

      {/* 확인 버튼 */}
      {revealed && (
        <button
          onClick={onClose}
          style={{
            background:
              grade === "HOLO"
                ? "linear-gradient(135deg,#ff80ab,#e040fb)"
                : grade === "LEGENDARY"
                ? "linear-gradient(135deg,#ffd700,#ff8c00)"
                : fx.color,
            color: "#000",
            border: "none",
            borderRadius: 12,
            padding:
              grade === "HOLO" || grade === "LEGENDARY"
                ? "12px 40px"
                : "10px 36px",
            fontWeight: 900,
            fontSize: grade === "HOLO" || grade === "LEGENDARY" ? 16 : 15,
            cursor: "pointer",
            boxShadow:
              grade === "HOLO" || grade === "LEGENDARY"
                ? `0 0 30px ${fx.color}66`
                : "none",
            animation:
              grade === "HOLO" || grade === "LEGENDARY"
                ? "srBadgePulse 2s ease-in-out infinite"
                : "none",
          }}
        >
          확인
        </button>
      )}
    </div>
  );
}

function BreadCard({
  bread,
  onSelect,
  coins,
  hasLeagueWin,
  isFree,
  isPremiumFree,
}) {
  const locked = bread.requiresLeagueWin && !hasLeagueWin;
  const canAfford = isFree || isPremiumFree || coins >= bread.price;
  const disabled = locked || !canAfford;
  const freeLabel = isPremiumFree
    ? "🎁 미션 보상!"
    : isFree
    ? "🎁 무료!"
    : null;
  return (
    <div
      onClick={() => !disabled && onSelect(bread.id)}
      style={{
        position: "relative",
        background: disabled ? "#1a1a1a" : bread.gradient,
        border: `2px solid ${disabled ? "#333" : bread.color}`,
        borderRadius: 20,
        padding: "24px 20px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "transform 0.15s,box-shadow 0.15s",
        textAlign: "center",
        minWidth: 150,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = `0 8px 24px ${bread.color}66`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      {locked && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "#ff4444",
            color: "#fff",
            fontSize: 10,
            fontWeight: 900,
            padding: "2px 8px",
            borderRadius: 99,
          }}
        >
          리그우승 필요
        </div>
      )}
      {freeLabel && !locked && (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            background: isPremiumFree
              ? "linear-gradient(135deg,#7C3AED,#6D28D9)"
              : "linear-gradient(135deg,#10B981,#059669)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 900,
            padding: "3px 10px",
            borderRadius: 99,
            animation: "pulse 1s ease infinite alternate",
          }}
        >
          {freeLabel}
        </div>
      )}
      <div
        style={{
          width: 130,
          height: 130,
          margin: "0 auto 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {bread.imgUrl ? (
          <img
            src={bread.imgUrl}
            alt={bread.name}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentNode.innerHTML =
                '<span style="font-size:48px">🍞</span>';
            }}
          />
        ) : (
          <span style={{ fontSize: 48 }}>🍞</span>
        )}
      </div>
      <div
        style={{
          fontWeight: 900,
          fontSize: 15,
          color: "#fff",
          margin: "0 0 4px",
        }}
      >
        {bread.name}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "#ffffffaa",
          marginBottom: 10,
          lineHeight: 1.4,
        }}
      >
        {bread.desc}
      </div>
      <div
        style={{
          background: "rgba(0,0,0,0.4)",
          borderRadius: 99,
          padding: "4px 16px",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 15,
          fontWeight: 900,
          color:
            isFree || isPremiumFree
              ? "#4ADE80"
              : !canAfford
              ? "#ff6b6b"
              : "#ffd700",
        }}
      >
        {isFree || isPremiumFree
          ? "🎁 무료"
          : `🪙 ${bread.price.toLocaleString()}`}
      </div>
      {!canAfford && !isFree && !isPremiumFree && !locked && (
        <div
          style={{
            marginTop: 6,
            fontSize: 11,
            color: "#ff6b6b",
            fontWeight: 700,
          }}
        >
          코인 부족
        </div>
      )}
      <div
        style={{
          marginTop: 10,
          fontSize: 11,
          color: "#ffffff88",
          lineHeight: 1.8,
        }}
      >
        {Object.entries(bread.pool)
          .filter(([, v]) => v > 0)
          .map(([g, v]) => (
            <div key={g}>
              <span style={{ color: GRADE_FX[g].color }}>
                {GRADE_FX[g].label}
              </span>{" "}
              {(v * 100).toFixed(0)}%
            </div>
          ))}
      </div>
    </div>
  );
}

function BreadBagVisual({ bread }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: bread.gradient,
      }}
    >
      {bread.imgUrl ? (
        <img
          src={bread.imgUrl}
          alt={bread.name}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const s = document.createElement("span");
            s.style.fontSize = "80px";
            s.textContent = "🍞";
            e.currentTarget.parentNode.appendChild(s);
          }}
        />
      ) : (
        <span style={{ fontSize: 80 }}>🍞</span>
      )}
    </div>
  );
}

function BreadTearing({ bread, onTearComplete }) {
  const [tearX, setTearX] = useState(0);
  const [isDragging, setDrag] = useState(false);
  const [startX, setStartX] = useState(0);
  const [done, setDone] = useState(false);

  const handleStart = (x) => {
    if (done) return;
    setDrag(true);
    setStartX(x);
  };
  const handleMove = (x) => {
    if (!isDragging || done) return;
    const next = Math.min(100, Math.max(0, (Math.abs(x - startX) / 80) * 100));
    setTearX(next);
    if (next >= 30) {
      setDrag(false);
      setDone(true);
      setTimeout(onTearComplete, 400);
    }
  };
  const handleEnd = () => setDrag(false);
  const handleClick = () => {
    if (done || isDragging) return;
    setDone(true);
    setTearX(100);
    setTimeout(onTearComplete, 400);
  };
  const handleSkip = () => {
    if (done) return;
    setDone(true);
    setTearX(100);
    setTimeout(onTearComplete, 200);
  };
  const offset = (tearX / 100) * 55;

  const getBreadInner = () => {
    if (bread.id === PREMIUM_BREAD_ID) {
      return (
        <g>
          <rect x="44" y="224" width="152" height="20" rx="6" fill="#b87820" />
          <rect x="44" y="218" width="152" height="14" rx="6" fill="#c88a30" />
          <rect x="44" y="148" width="152" height="72" rx="8" fill="#fff8d0" />
          <rect x="44" y="148" width="152" height="52" rx="8" fill="#fff5c0" />
          <rect x="44" y="148" width="152" height="30" rx="8" fill="#ffd040" />
          <rect x="44" y="165" width="152" height="13" fill="#ffd040" />
          <rect
            x="44"
            y="148"
            width="152"
            height="94"
            rx="8"
            fill="none"
            stroke="#d8a820"
            strokeWidth="2"
          />
          <ellipse cx="84" cy="143" rx="14" ry="11" fill="#ee2244" />
          <polygon points="84,130 78,143 90,143" fill="#ee2244" />
          <ellipse cx="84" cy="130" rx="3.5" ry="4.5" fill="#22aa44" />
          <ellipse cx="120" cy="141" rx="16" ry="12" fill="#ee2244" />
          <polygon points="120,128 113,141 127,141" fill="#ee2244" />
          <ellipse cx="120" cy="128" rx="4" ry="5" fill="#22aa44" />
          <ellipse cx="156" cy="143" rx="14" ry="11" fill="#ee2244" />
          <polygon points="156,130 150,143 162,143" fill="#ee2244" />
          <ellipse cx="156" cy="130" rx="3.5" ry="4.5" fill="#22aa44" />
          <rect
            x="56"
            y="153"
            width="55"
            height="9"
            rx="4"
            fill="white"
            opacity="0.4"
          />
          <rect x="44" y="202" width="152" height="10" fill="#fff8d0" />
        </g>
      );
    }
    if (bread.id === "basic") {
      return (
        <g>
          <ellipse cx="120" cy="190" rx="90" ry="60" fill="#c8873a" />
          <ellipse cx="120" cy="178" rx="82" ry="50" fill="#dba04e" />
          <ellipse cx="120" cy="168" rx="72" ry="40" fill="#eca85a" />
          <ellipse
            cx="120"
            cy="162"
            rx="40"
            ry="22"
            fill="#e05050"
            opacity="0.85"
          />
          <ellipse
            cx="120"
            cy="158"
            rx="30"
            ry="15"
            fill="#ff8080"
            opacity="0.7"
          />
          <ellipse
            cx="120"
            cy="155"
            rx="18"
            ry="8"
            fill="#fff8e7"
            opacity="0.9"
          />
        </g>
      );
    }
    if (bread.id === "cream") {
      return (
        <g>
          <ellipse cx="120" cy="180" rx="80" ry="60" fill="#c07830" />
          <ellipse cx="120" cy="172" rx="74" ry="54" fill="#d9964a" />
          <ellipse cx="120" cy="164" rx="68" ry="48" fill="#eca855" />
          <ellipse cx="120" cy="171" rx="46" ry="26" fill="#fffbec" />
          <ellipse cx="120" cy="168" rx="38" ry="20" fill="#fff8d8" />
          <ellipse
            cx="120"
            cy="165"
            rx="27"
            ry="13"
            fill="#ffffff"
            opacity="0.88"
          />
          <ellipse
            cx="98"
            cy="151"
            rx="17"
            ry="9"
            fill="white"
            opacity="0.22"
          />
        </g>
      );
    }
    return (
      <g>
        <ellipse
          cx="120"
          cy="192"
          rx="88"
          ry="58"
          fill="#c8873a"
          opacity="0.6"
        />
        <ellipse
          cx="120"
          cy="180"
          rx="78"
          ry="48"
          fill="#dba04e"
          opacity="0.85"
        />
        <ellipse cx="120" cy="170" rx="68" ry="38" fill="#eca855" />
        <ellipse cx="120" cy="162" rx="38" ry="20" fill="#fff" opacity="0.18" />
        <ellipse cx="120" cy="157" rx="24" ry="12" fill="#fff" opacity="0.32" />
        <ellipse cx="120" cy="153" rx="14" ry="7" fill="#fff" opacity="0.55" />
      </g>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
        padding: 24,
      }}
    >
      <div
        style={{
          color: "#fff",
          fontSize: 16,
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        {done
          ? "✅ 완료!"
          : isDragging
          ? `뜯는 중... ${Math.round(tearX)}%`
          : "봉지를 양쪽으로 잡아당기세요!"}
      </div>
      <div
        style={{
          position: "relative",
          width: 240,
          height: 310,
          cursor: done ? "default" : isDragging ? "grabbing" : "grab",
          userSelect: "none",
          touchAction: "none",
        }}
        onClick={handleClick}
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              bread.id === "cream"
                ? "#f5ede0"
                : bread.id === PREMIUM_BREAD_ID
                ? "#fffbcc"
                : bread.id === "choco"
                ? "#1a0a05"
                : "#e8f0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <svg width="240" height="310" style={{ position: "absolute" }}>
            {getBreadInner()}
          </svg>
          {done && (
            <div
              style={{
                position: "absolute",
                bottom: 16,
                background: "rgba(0,0,0,0.7)",
                color: "#ffd700",
                fontWeight: 900,
                fontSize: 13,
                padding: "4px 16px",
                borderRadius: 99,
              }}
            >
              씰이 들어있어요! ✨
            </div>
          )}
        </div>

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: "50%",
            transform: `translateX(${-offset}%) rotate(${-offset * 0.06}deg)`,
            transformOrigin: "left center",
            transition: isDragging ? "none" : "transform 0.15s",
            overflow: "hidden",
            zIndex: 2,
            filter: `drop-shadow(${4 + offset * 0.1}px 0 ${
              8 + offset * 0.2
            }px rgba(0,0,0,0.7))`,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 240,
              height: "100%",
              overflow: "hidden",
            }}
          >
            <BreadBagVisual bread={bread} />
          </div>
          <svg
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 16,
              height: "100%",
            }}
            viewBox="0 0 16 310"
            preserveAspectRatio="none"
          >
            <path
              d="M16,0 L7,25 L13,55 L5,85 L11,115 L3,145 L10,175 L4,205 L12,235 L6,265 L16,310 Z"
              fill="rgba(0,0,0,0.45)"
            />
          </svg>
        </div>

        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "50%",
            transform: `translateX(${offset}%) rotate(${offset * 0.06}deg)`,
            transformOrigin: "right center",
            transition: isDragging ? "none" : "transform 0.15s",
            overflow: "hidden",
            zIndex: 2,
            filter: `drop-shadow(${-(4 + offset * 0.1)}px 0 ${
              8 + offset * 0.2
            }px rgba(0,0,0,0.7))`,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: -120,
              width: 240,
              height: "100%",
              overflow: "hidden",
            }}
          >
            <BreadBagVisual bread={bread} />
          </div>
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 16,
              height: "100%",
            }}
            viewBox="0 0 16 310"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 L9,25 L3,55 L11,85 L5,115 L13,145 L6,175 L12,205 L4,235 L10,265 L0,310 Z"
              fill="rgba(0,0,0,0.45)"
            />
          </svg>
        </div>

        {!isDragging && tearX === 0 && (
          <>
            <div
              style={{
                position: "absolute",
                left: "18%",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                zIndex: 5,
                display: "flex",
                alignItems: "center",
                gap: 3,
                animation: "arrowLeft 1s ease-in-out infinite",
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 10,
                    height: 10,
                    borderLeft: "3px solid rgba(255,255,255,0.9)",
                    borderBottom: "3px solid rgba(255,255,255,0.9)",
                    transform: "rotate(45deg)",
                    opacity: 1 - i * 0.25,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                position: "absolute",
                right: "18%",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                zIndex: 5,
                display: "flex",
                alignItems: "center",
                gap: 3,
                animation: "arrowRight 1s ease-in-out infinite",
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 10,
                    height: 10,
                    borderRight: "3px solid rgba(255,255,255,0.9)",
                    borderTop: "3px solid rgba(255,255,255,0.9)",
                    transform: "rotate(45deg)",
                    opacity: 1 - i * 0.25,
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div
        style={{
          width: 200,
          height: 8,
          background: "#333",
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${tearX}%`,
            height: "100%",
            background: `linear-gradient(to right,${bread.color},#fff)`,
            borderRadius: 99,
            transition: isDragging ? "none" : "width 0.1s",
            boxShadow: `0 0 8px ${bread.color}`,
          }}
        />
      </div>
      {!done && (
        <button
          onClick={handleSkip}
          style={{
            marginTop: 8,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 99,
            color: "rgba(255,255,255,0.5)",
            fontSize: 13,
            padding: "6px 20px",
            cursor: "pointer",
          }}
        >
          스킵 ▶
        </button>
      )}
    </div>
  );
}

function SealDexPreview({ seal, onClose }) {
  const fx = GRADE_FX[seal.grade];
  const [typeColor, setTypeColor] = useState("#A8A878");
  useEffect(() => {
    fetchTypeColor(seal.pokeId).then(setTypeColor);
  }, [seal.pokeId]);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(0,0,0,0.95)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: 24,
      }}
    >
      <div
        style={{
          color: "#FBBF24",
          fontWeight: 900,
          fontSize: 22,
          letterSpacing: 2,
        }}
      >
        📖 씰 도감
      </div>
      <div
        style={{
          color: "rgba(255,255,255,0.7)",
          fontSize: 14,
          textAlign: "center",
          lineHeight: 1.8,
        }}
      >
        획득한 씰은 도감에 자동으로 등록돼요!
        <br />
        도감에서 수집 현황을 확인할 수 있어요 ✨
      </div>
      <div
        style={{
          background: "rgba(255,255,255,0.07)",
          borderRadius: 20,
          padding: 24,
          border: `2px solid ${fx.color}66`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <SealSticker seal={seal} typeColor={typeColor} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: fx.color,
            }}
          />
          <span style={{ color: fx.color, fontWeight: 900, fontSize: 14 }}>
            {fx.label}
          </span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
            1종 수집!
          </span>
        </div>
      </div>
      <div
        style={{
          color: "rgba(255,255,255,0.5)",
          fontSize: 12,
          textAlign: "center",
        }}
      >
        로비 → 씰 도감 버튼에서 언제든 확인 가능해요
      </div>
      <button
        onClick={onClose}
        style={{
          padding: "14px 48px",
          borderRadius: 40,
          border: "none",
          background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
          color: "#fff",
          fontWeight: 900,
          fontSize: 16,
          cursor: "pointer",
        }}
      >
        🏠 로비로 가기
      </button>
    </div>
  );
}

function TutorialGuide({ step, onNext }) {
  const guides = {
    bread_select: {
      title: "🍞 포켓몬 빵 뽑기",
      desc: "게임에서 코인을 모아 포켓몬 빵을 살 수 있어요!\n지금은 무료로 한 번 뽑을 수 있어요 🎁",
      btn: "빵 선택하기 →",
    },
  };
  const g = guides[step];
  if (!g) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 500,
        padding: "0 16px 24px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.97)",
          borderRadius: 14,
          padding: "14px 18px",
          border: "2px solid #6366F1",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.5)",
          pointerEvents: "all",
        }}
      >
        <div
          style={{
            fontWeight: 900,
            fontSize: 15,
            color: "#1e3a5f",
            marginBottom: 4,
          }}
        >
          {g.title}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#4B5563",
            lineHeight: 1.6,
            whiteSpace: "pre-line",
            marginBottom: 10,
          }}
        >
          {g.desc}
        </div>
        <button
          onClick={onNext}
          style={{
            width: "100%",
            padding: "10px 0",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
            color: "#fff",
            fontWeight: 800,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          {g.btn}
        </button>
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
export default function BreadOpenScreen({
  coins,
  hasLeagueWin = false,
  onSpendCoins,
  onCloudSave,
  onClose,
  isTutorial = false,
  freeBreadCount = 0,
  freePremiumBreadCount = 0,
  onUsedFreeBread,
  onUsedPremiumFreeBread,
  onBreadOpened, // ← 추가: 빵 1개 뽑을 때마다 호출 (업적 연동)
}) {
  const [localFreeBread, setLocalFreeBread] = useState(freeBreadCount);
  const [localPremiumFreeBread, setLocalPremiumFreeBread] = useState(
    freePremiumBreadCount
  );

  const isFreeAvailable = isTutorial || localFreeBread > 0;
  const isPremiumFreeAvail = localPremiumFreeBread > 0;

  const [phase, setPhase] = useState("select");
  const [selectedBread, setBread] = useState(null);
  const [sealResult, setResult] = useState(null);
  const [showDexPreview, setDexPrev] = useState(false);
  const [tutGuide, setTutGuide] = useState(isTutorial ? "bread_select" : null);

  const tearCalledRef = useRef(false);

  useEffect(() => {
    tearCalledRef.current = false;
  }, []);

  const handleSelectBread = (breadId) => {
    const bread = BREAD_TYPES[breadId];
    const isBasicFree = isFreeAvailable && breadId === "basic";
    const isPremiumFree = isPremiumFreeAvail && breadId === PREMIUM_BREAD_ID;
    const isFree = isBasicFree || isPremiumFree;
    if (!isFree && coins < bread.price) return;
    setBread({ ...bread, _isFree: isFree, _isPremium: isPremiumFree });
    setTutGuide(null);
    setPhase("tearing");
  };

  const handleTearComplete = useCallback(() => {
    if (tearCalledRef.current) return;
    tearCalledRef.current = true;

    const seal = rollSeal(selectedBread.id);
    const result = acquireSeal(seal);
    const dex = JSON.parse(localStorage.getItem("pokeset_sealdex") || "{}");

    if (!selectedBread._isFree) {
      onSpendCoins(selectedBread.price);
      onCloudSave?.({ sealDex: dex });
    } else if (isTutorial) {
      onCloudSave?.({ sealDex: dex, breadTutorialDone: true });
    } else if (selectedBread._isPremium) {
      setLocalPremiumFreeBread((prev) => Math.max(0, prev - 1));
      onUsedPremiumFreeBread?.();
      onCloudSave?.({ sealDex: dex });
    } else {
      setLocalFreeBread((prev) => Math.max(0, prev - 1));
      onUsedFreeBread?.();
      onCloudSave?.({ sealDex: dex });
    }

    // ── 업적 연동: 빵 카운터 증가 ──
    onBreadOpened?.();

    setResult(result);
    setPhase("result");
  }, [
    selectedBread,
    onSpendCoins,
    onCloudSave,
    isTutorial,
    onUsedFreeBread,
    onUsedPremiumFreeBread,
    onBreadOpened, // ← 의존성 배열에 추가
  ]);

  const handleResultClose = () => {
    if (isTutorial) {
      setDexPrev(true);
    } else {
      tearCalledRef.current = false;
      setPhase("select");
      setBread(null);
      setResult(null);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          background: "#111",
          borderBottom: "1px solid #222",
          gap: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flex: 1,
            minWidth: 0,
          }}
        >
          <span style={{ fontSize: 20, flexShrink: 0 }}>🍞</span>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 900,
                fontSize: 15,
                color: "#fff",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              포켓몬빵 뽑기
            </div>
            <div style={{ fontSize: 11, color: "#888" }}>띠부띠부씰 수집</div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            flexShrink: 0,
          }}
        >
          {localFreeBread > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                background: "#1a2a0a",
                border: "1px solid #4ade80",
                borderRadius: 99,
                padding: "4px 9px",
              }}
            >
              <span style={{ fontSize: 13 }}>🍞</span>
              <span style={{ fontWeight: 900, color: "#4ade80", fontSize: 13 }}>
                ×{localFreeBread}
              </span>
            </div>
          )}
          {localPremiumFreeBread > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                background: "#1a0a2a",
                border: "1px solid #a78bfa",
                borderRadius: 99,
                padding: "4px 9px",
                animation: "premiumPulse 1.5s ease-in-out infinite",
              }}
            >
              <span style={{ fontSize: 13 }}>✨</span>
              <span style={{ fontWeight: 900, color: "#a78bfa", fontSize: 13 }}>
                피카×{localPremiumFreeBread}
              </span>
            </div>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "#222",
              borderRadius: 99,
              padding: "5px 10px",
            }}
          >
            <span style={{ fontSize: 14 }}>🪙</span>
            <span style={{ fontWeight: 900, color: "#ffd700", fontSize: 14 }}>
              {coins.toLocaleString()}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#333",
              border: "none",
              borderRadius: 99,
              color: "#fff",
              fontSize: 16,
              width: 32,
              height: 32,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        {phase === "select" && (
          <>
            {(localFreeBread > 0 || localPremiumFreeBread > 0) &&
              !isTutorial && (
                <div
                  style={{
                    marginBottom: 20,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {localFreeBread > 0 && (
                    <div
                      style={{
                        background: "linear-gradient(135deg,#14532d,#166534)",
                        border: "2px solid #4ade80",
                        borderRadius: 12,
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span style={{ fontSize: 22 }}>🍞</span>
                      <div>
                        <div
                          style={{
                            fontWeight: 900,
                            color: "#4ade80",
                            fontSize: 13,
                          }}
                        >
                          기본 빵 {localFreeBread}개 보유 중!
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "rgba(255,255,255,0.6)",
                            marginTop: 1,
                          }}
                        >
                          이상해씨의 초코파운드를 무료로 뽑을 수 있어요
                        </div>
                      </div>
                    </div>
                  )}
                  {localPremiumFreeBread > 0 && (
                    <div
                      style={{
                        background: "linear-gradient(135deg,#2e1065,#4c1d95)",
                        border: "2px solid #a78bfa",
                        borderRadius: 12,
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span style={{ fontSize: 22 }}>✨</span>
                      <div>
                        <div
                          style={{
                            fontWeight: 900,
                            color: "#c4b5fd",
                            fontSize: 13,
                          }}
                        >
                          피카피카 촉촉치즈케잌 {localPremiumFreeBread}개 보유!
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "rgba(255,255,255,0.6)",
                            marginTop: 1,
                          }}
                        >
                          일일 미션 전체 완료 보너스 🎁
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            {isTutorial && (
              <div
                style={{
                  textAlign: "center",
                  marginBottom: 24,
                  color: "#aaa",
                  fontSize: 14,
                }}
              >
                🎁 첫 번째 빵은 무료예요! 기본 빵을 뽑아봐요!
              </div>
            )}
            {!isTutorial &&
              localFreeBread === 0 &&
              localPremiumFreeBread === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: 24,
                    color: "#aaa",
                    fontSize: 14,
                  }}
                >
                  빵을 선택하고 포장지를 찢어 띠부띠부씰을 꺼내세요!
                </div>
              )}
            <div
              style={{
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {Object.values(BREAD_TYPES).map((bread) => (
                <BreadCard
                  key={bread.id}
                  bread={bread}
                  coins={coins}
                  hasLeagueWin={hasLeagueWin}
                  isFree={isFreeAvailable && bread.id === "basic"}
                  isPremiumFree={
                    isPremiumFreeAvail && bread.id === PREMIUM_BREAD_ID
                  }
                  onSelect={handleSelectBread}
                />
              ))}
            </div>
          </>
        )}
        {phase === "tearing" && selectedBread && (
          <BreadTearing
            bread={selectedBread}
            onTearComplete={handleTearComplete}
          />
        )}
      </div>

      {phase === "result" && sealResult && (
        <SealReveal result={sealResult} onClose={handleResultClose} />
      )}
      {showDexPreview && sealResult && (
        <SealDexPreview seal={sealResult.seal} onClose={onClose} />
      )}
      {tutGuide && (
        <TutorialGuide step={tutGuide} onNext={() => setTutGuide(null)} />
      )}

      <style>{`
        @keyframes arrowLeft    {0%,100%{transform:translateY(-50%) translateX(4px);opacity:0.4}50%{transform:translateY(-50%) translateX(-4px);opacity:1}}
        @keyframes arrowRight   {0%,100%{transform:translateY(-50%) translateX(-4px);opacity:0.4}50%{transform:translateY(-50%) translateX(4px);opacity:1}}
        @keyframes fadeIn       {from{opacity:0}to{opacity:1}}
        @keyframes sealPop      {from{transform:scale(0.7);opacity:0}to{transform:scale(1);opacity:1}}
        @keyframes pulse        {from{opacity:0.8}to{opacity:1}}
        @keyframes premiumPulse {0%,100%{box-shadow:0 0 0 0 rgba(167,139,250,0.4)}50%{box-shadow:0 0 0 6px rgba(167,139,250,0)}}
        @keyframes ddFloat      {0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes ddSpin       {to{transform:rotate(360deg)}}
        @keyframes silhouettePulse{0%,100%{opacity:0.85}50%{opacity:1}}
        @keyframes hintPulse    {0%{transform:scale(0.8);opacity:0.8}100%{transform:scale(2.4);opacity:0}}
        @keyframes srFlashFade  {0%{opacity:1}100%{opacity:0}}
        @keyframes srFlashReveal{0%{opacity:1;filter:brightness(3)}100%{opacity:1;filter:brightness(1)}}
        @keyframes srShimmer    {0%{transform:translateX(-120%)}100%{transform:translateX(220%)}}
        @keyframes srSpin       {to{transform:rotate(360deg)}}
        @keyframes srBadgePulse {0%,100%{opacity:0.85;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}}
        @keyframes srTitleFadeIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes srDescend    {from{opacity:0;transform:translateY(-80px) scale(0.8)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes srBlackout   {0%{opacity:0}30%{opacity:1}100%{opacity:1}}
        @keyframes srDotPulse   {0%,100%{transform:scale(1);opacity:1}50%{transform:scale(2);opacity:0.5}}
        @keyframes srStarFall   {0%{transform:translateY(-10px);opacity:1}100%{transform:translateY(110vh);opacity:0}}
        @keyframes srZoomIn     {from{transform:scale(0.5) translateY(40px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}
        @keyframes srSealPop    {from{transform:scale(0.7);opacity:0}to{transform:scale(1);opacity:1}}
        @keyframes sealSpinAir  {
          0%  {transform:rotateY(0deg)    scale(1)    translateY(0px);}
          25% {transform:rotateY(360deg)  scale(1.14) translateY(-22px);}
          50% {transform:rotateY(720deg)  scale(1.18) translateY(-28px);}
          75% {transform:rotateY(1080deg) scale(1.10) translateY(-14px);}
          85% {transform:rotateY(1390deg) scale(0.88) translateY(14px);}
          93% {transform:rotateY(1430deg) scale(1.18) translateY(-18px);}
          97% {transform:rotateY(1438deg) scale(0.96) translateY(4px);}
          100%{transform:rotateY(1440deg) scale(1)    translateY(0px);}
        }
        @keyframes holoFireRise {0%{transform:translateY(0) scaleX(1);opacity:0.9}60%{transform:translateY(-35px) scaleX(0.5);opacity:0.6}100%{transform:translateY(-65px) scaleX(0.1);opacity:0}}
        @keyframes holoSpark    {0%,100%{opacity:0;transform:scale(0.3)}40%,60%{opacity:1;transform:scale(1)}}
        @keyframes holoSparkle  {0%,100%{transform:scale(0) rotate(0deg);opacity:0}50%{transform:scale(1) rotate(180deg);opacity:1}}
      `}</style>
    </div>
  );
}
