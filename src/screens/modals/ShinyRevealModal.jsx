// src/screens/modals/ShinyRevealModal.jsx
import { useState, useEffect, useRef } from "react";

const GRADE_FX = {
  COMMON: {
    label: "이로치 씰",
    color: "#9ca3af",
    bg: "#1a1a2e",
    glow: "#9ca3af",
  },
  RARE: {
    label: "레어 이로치",
    color: "#4fc3f7",
    bg: "#0a1628",
    glow: "#4fc3f7",
  },
  SR: {
    label: "슈퍼레어 이로치",
    color: "#ce93d8",
    bg: "#1a0a2e",
    glow: "#ce93d8",
  },
  LEGENDARY: {
    label: "전설의 이로치",
    color: "#ffd700",
    bg: "#0a0808",
    glow: "#ffd700",
  },
};

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
const _tcCache = {};
async function fetchTypeColor(pokeId) {
  if (_tcCache[pokeId]) return _tcCache[pokeId];
  try {
    const d = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeId}`).then(
      (r) => r.json()
    );
    _tcCache[pokeId] = TYPE_COLORS[d.types[0].type.name] || "#A8A878";
  } catch {
    _tcCache[pokeId] = "#A8A878";
  }
  return _tcCache[pokeId];
}

const CARD_W = 180,
  CARD_H = 207,
  IMG_SZ = 156;

function SealCard({ seal, typeColor, glowColor }) {
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
        boxShadow: `0 0 30px ${glowColor}88, 0 0 60px ${glowColor}44`,
      }}
    >
      <div
        style={{
          padding: "0px 4px",
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
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <img
          src={seal.artwork}
          alt={seal.name}
          style={{
            width: IMG_SZ,
            height: IMG_SZ,
            objectFit: "contain",
            position: "relative",
            zIndex: 1,
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

// ── 파티클 (SR, LEGENDARY) ─────────────────────────────
function StarParticles({ count = 12, color = "#ffd700", size = 8 }) {
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

// ── COMMON 연출 ───────────────────────────────────────────
function CommonReveal({ seal, typeColor, onConfirm, confirmLabel }) {
  const [stage, setStage] = useState(0);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
      }}
    >
      <div
        style={{
          perspective: 600,
          cursor: stage === 0 ? "pointer" : "default",
        }}
        onClick={() => {
          if (stage === 0) {
            setStage(1);
            setTimeout(() => setStage(2), 700);
          }
        }}
      >
        {stage === 0 && (
          <div
            style={{
              width: CARD_W,
              height: CARD_H,
              background: "#111",
              border: "1px solid #333",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              animation: "srSilhouettePulse 2s ease-in-out infinite",
            }}
          >
            <img
              src={seal.artwork}
              alt="?"
              style={{
                width: IMG_SZ,
                height: IMG_SZ,
                objectFit: "contain",
                filter: "brightness(0) invert(1) opacity(0.15)",
              }}
            />
            <div
              style={{
                marginTop: 12,
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                fontWeight: 700,
              }}
            >
              탭하여 공개
            </div>
            <div
              style={{
                position: "absolute",
                width: 64,
                height: 64,
                borderRadius: "50%",
                border: "2px solid #9ca3af88",
                animation: "srHintPulse 1.5s ease-out infinite",
              }}
            />
          </div>
        )}
        {stage === 1 && (
          <div
            style={{
              width: CARD_W,
              height: CARD_H,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation:
                "srSealSpinAir 0.7s cubic-bezier(0.25,0.46,0.45,0.94) forwards",
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
        {stage === 2 && (
          <div
            style={{ animation: "srSealPop 0.4s cubic-bezier(.34,1.56,.64,1)" }}
          >
            <SealCard seal={seal} typeColor={typeColor} glowColor="#9ca3af" />
          </div>
        )}
      </div>
      {stage === 0 && (
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
          ✨ 이로치 씰
        </div>
      )}
      {stage === 2 && (
        <>
          <div style={{ color: "#9ca3af", fontWeight: 900, fontSize: 16 }}>
            ✨ 이로치 씰 획득!
          </div>
          <button
            onClick={onConfirm}
            style={{
              background: "#374151",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "10px 36px",
              fontWeight: 900,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            {confirmLabel}
          </button>
        </>
      )}
    </div>
  );
}

// ── RARE 연출 ─────────────────────────────────────────────
function RareReveal({ seal, typeColor, onConfirm, confirmLabel }) {
  const [stage, setStage] = useState(0);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
      }}
    >
      <div
        style={{
          perspective: 600,
          cursor: stage === 0 ? "pointer" : "default",
        }}
        onClick={() => {
          if (stage === 0) {
            setStage(1);
            setTimeout(() => setStage(2), 900);
          }
        }}
      >
        {stage === 0 && (
          <div
            style={{
              width: CARD_W,
              height: CARD_H,
              background: "#050d1a",
              border: "1.5px solid #4fc3f744",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              animation: "srSilhouettePulse 2s ease-in-out infinite",
              boxShadow: "0 0 20px #4fc3f722",
            }}
          >
            <img
              src={seal.artwork}
              alt="?"
              style={{
                width: IMG_SZ,
                height: IMG_SZ,
                objectFit: "contain",
                filter:
                  "brightness(0) sepia(1) hue-rotate(180deg) opacity(0.2)",
              }}
            />
            <div
              style={{
                marginTop: 12,
                fontSize: 13,
                color: "#4fc3f7aa",
                fontWeight: 700,
              }}
            >
              탭하여 공개
            </div>
            <div
              style={{
                position: "absolute",
                width: 64,
                height: 64,
                borderRadius: "50%",
                border: "2px solid #4fc3f766",
                animation: "srHintPulse 1.5s ease-out infinite",
              }}
            />
          </div>
        )}
        {stage === 1 && (
          <div
            style={{
              width: CARD_W,
              height: CARD_H,
              background: "#4fc3f7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "srFlashReveal 0.9s ease forwards",
            }}
          >
            <img
              src={seal.artwork}
              alt="?"
              style={{
                width: IMG_SZ,
                height: IMG_SZ,
                objectFit: "contain",
                filter: "brightness(0)",
              }}
            />
          </div>
        )}
        {stage === 2 && (
          <div
            style={{
              animation: "srSealPop 0.5s cubic-bezier(.34,1.56,.64,1)",
              position: "relative",
            }}
          >
            <SealCard seal={seal} typeColor={typeColor} glowColor="#4fc3f7" />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.6) 50%,transparent 70%)",
                animation: "srShimmer 2s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />
          </div>
        )}
      </div>
      {stage === 0 && (
        <div style={{ color: "#4fc3f7aa", fontSize: 13 }}>
          💧 레어 이로치 씰
        </div>
      )}
      {stage === 2 && (
        <>
          <div
            style={{
              background: "linear-gradient(135deg,#4fc3f7,#0288d1)",
              color: "#fff",
              fontWeight: 900,
              fontSize: 16,
              padding: "6px 20px",
              borderRadius: 99,
              boxShadow: "0 0 20px #4fc3f766",
            }}
          >
            💧 레어 이로치 획득!
          </div>
          <button
            onClick={onConfirm}
            style={{
              background: "#0288d1",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "10px 36px",
              fontWeight: 900,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            {confirmLabel}
          </button>
        </>
      )}
    </div>
  );
}

// ── SR 연출 ───────────────────────────────────────────────
function SRReveal({ seal, typeColor, onConfirm, confirmLabel }) {
  const [stage, setStage] = useState(0);
  const [flash, setFlash] = useState(false);

  const handleTap = () => {
    if (stage !== 0) return;
    if (grade === "LEGENDARY") {
      setFlash(true);
      setTimeout(() => {
        setFlash(false);
        setStage(1);
      }, 300);
      setTimeout(() => setStage(2), 1200);
      setTimeout(() => setStage(3), 3000);
    } else {
      // COMMON / RARE / SR 동일
      setStage(1);
      setTimeout(() => setStage(2), 700);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        position: "relative",
      }}
    >
      {/* 전체 플래시 */}
      {flash && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#ce93d8",
            zIndex: 9999,
            animation: "srFlashFade 0.2s ease forwards",
            pointerEvents: "none",
          }}
        />
      )}

      {stage === 2 && <StarParticles count={16} color="#ce93d8" size={7} />}

      <div
        style={{
          perspective: 600,
          cursor: stage === 0 ? "pointer" : "default",
        }}
        onClick={handleTap}
      >
        {stage === 0 && (
          <div
            style={{
              width: CARD_W,
              height: CARD_H,
              background: "#0d0015",
              border: "1.5px solid #ce93d844",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              animation: "srSilhouettePulse 2s ease-in-out infinite",
              boxShadow: "0 0 30px #ce93d822",
            }}
          >
            <img
              src={seal.artwork}
              alt="?"
              style={{
                width: IMG_SZ,
                height: IMG_SZ,
                objectFit: "contain",
                filter:
                  "brightness(0) sepia(1) hue-rotate(240deg) opacity(0.25)",
              }}
            />
            <div
              style={{
                marginTop: 12,
                fontSize: 13,
                color: "#ce93d8aa",
                fontWeight: 700,
              }}
            >
              탭하여 공개
            </div>
            <div
              style={{
                position: "absolute",
                width: 64,
                height: 64,
                borderRadius: "50%",
                border: "2px solid #ce93d866",
                animation: "srHintPulse 1.5s ease-out infinite",
              }}
            />
          </div>
        )}
        {stage === 1 && (
          <div
            style={{
              width: CARD_W,
              height: CARD_H,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation:
                "srSealSpinAir 1s cubic-bezier(0.25,0.46,0.45,0.94) forwards",
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
        {stage === 2 && (
          <div
            style={{
              animation: "srZoomIn 0.6s cubic-bezier(.34,1.56,.64,1)",
              position: "relative",
            }}
          >
            {/* 홀로그램 링 */}
            <div
              style={{
                position: "absolute",
                inset: -12,
                borderRadius: 8,
                background:
                  "conic-gradient(from 0deg,#ff80ab,#f472b6,#e040fb,#c084fc,#ff80ab)",
                animation: "srSpin 2s linear infinite",
                zIndex: -1,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: -10,
                borderRadius: 6,
                background: "#0d0015",
                zIndex: -1,
              }}
            />
            <SealCard seal={seal} typeColor={typeColor} glowColor="#ce93d8" />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(105deg,transparent 20%,rgba(255,255,255,0.7) 50%,transparent 80%)",
                animation: "srShimmer 1.8s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />
          </div>
        )}
      </div>
      {stage === 0 && (
        <div style={{ color: "#ce93d8aa", fontSize: 13 }}>
          💜 슈퍼레어 이로치 씰
        </div>
      )}
      {stage === 2 && (
        <>
          <div
            style={{
              background: "linear-gradient(135deg,#ce93d8,#7b1fa2)",
              color: "#fff",
              fontWeight: 900,
              fontSize: 17,
              padding: "7px 24px",
              borderRadius: 99,
              boxShadow: "0 0 30px #ce93d877",
              animation: "srBadgePulse 1.5s ease-in-out infinite",
            }}
          >
            💜 슈퍼레어 이로치 획득!
          </div>
          <button
            onClick={onConfirm}
            style={{
              background: "linear-gradient(135deg,#8e24aa,#6a1b9a)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "10px 36px",
              fontWeight: 900,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: "0 4px 15px #7b1fa244",
            }}
          >
            {confirmLabel}
          </button>
        </>
      )}
    </div>
  );
}

// ── LEGENDARY 연출 ────────────────────────────────────────
function LegendaryReveal({ seal, typeColor, onConfirm, confirmLabel }) {
  const [stage, setStage] = useState(0); // 0=대기 1=암전 2=강림 3=공개
  const [flash, setFlash] = useState(false);

  const handleTap = () => {
    if (stage !== 0) return;
    setFlash(true);
    setTimeout(() => {
      setFlash(false);
      setStage(1);
    }, 300);
    setTimeout(() => setStage(2), 1200);
    setTimeout(() => setStage(3), 3000);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        position: "relative",
      }}
    >
      {/* 전체 플래시 */}
      {flash && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#fff",
            zIndex: 9999,
            animation: "srFlashFade 0.3s ease forwards",
            pointerEvents: "none",
          }}
        />
      )}

      {/* 강림 단계: 별 쏟아짐 */}
      {(stage === 2 || stage === 3) && (
        <StarParticles count={30} color="#ffd700" size={9} />
      )}
      {stage === 3 && <StarParticles count={15} color="#ffffff" size={5} />}

      {/* 타이틀 (강림 시) */}
      {stage === 2 && (
        <div
          style={{
            textAlign: "center",
            animation: "srTitleFadeIn 1s ease forwards",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#ffd700aa",
              letterSpacing: 4,
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            — 전설의 이로치 —
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: "#ffd700",
              textShadow: "0 0 20px #ffd70088",
              letterSpacing: 2,
            }}
          >
            ✦ {seal.name} ✦
          </div>
        </div>
      )}

      <div
        style={{
          perspective: 800,
          cursor: stage === 0 ? "pointer" : "default",
        }}
        onClick={handleTap}
      >
        {/* 대기 */}
        {stage === 0 && (
          <div
            style={{
              width: CARD_W,
              height: CARD_H,
              background: "#050303",
              border: "1.5px solid #ffd70044",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              animation: "srSilhouettePulse 2s ease-in-out infinite",
              boxShadow: "0 0 40px #ffd70022",
            }}
          >
            <img
              src={seal.artwork}
              alt="?"
              style={{
                width: IMG_SZ,
                height: IMG_SZ,
                objectFit: "contain",
                filter: "brightness(0) sepia(1) hue-rotate(30deg) opacity(0.2)",
              }}
            />
            <div
              style={{
                marginTop: 12,
                fontSize: 13,
                color: "#ffd700aa",
                fontWeight: 700,
              }}
            >
              탭하여 공개
            </div>
            <div
              style={{
                position: "absolute",
                width: 80,
                height: 80,
                borderRadius: "50%",
                border: "2px solid #ffd70066",
                animation: "srHintPulse 1.5s ease-out infinite",
              }}
            />
          </div>
        )}

        {/* 암전 */}
        {stage === 1 && (
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
                background: "#ffd700",
                boxShadow: "0 0 20px #ffd700",
                animation: "srDotPulse 0.5s ease-in-out infinite",
              }}
            />
          </div>
        )}

        {/* 강림 (씰이 위에서 천천히 내려옴) */}
        {stage === 2 && (
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
                background:
                  "conic-gradient(from 0deg,#ffd700,#ff8c00,#ffd700,#fff176,#ffd700)",
                animation: "srSpin 1.2s linear infinite",
                zIndex: -1,
                filter: "blur(2px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: -13,
                borderRadius: 8,
                background: "#050303",
                zIndex: -1,
              }}
            />
            <SealCard seal={seal} typeColor={typeColor} glowColor="#ffd700" />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(105deg,transparent 10%,rgba(255,255,255,0.9) 50%,transparent 90%)",
                animation: "srShimmer 1.4s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />
          </div>
        )}

        {/* 공개 완료 */}
        {stage === 3 && (
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
                background:
                  "conic-gradient(from 0deg,#ffd700,#ff8c00,#ffd700,#fff176,#ffd700)",
                animation: "srSpin 1.2s linear infinite",
                zIndex: -1,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: -13,
                borderRadius: 8,
                background: "#050303",
                zIndex: -1,
              }}
            />
            <SealCard seal={seal} typeColor={typeColor} glowColor="#ffd700" />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(105deg,transparent 10%,rgba(255,255,255,0.9) 50%,transparent 90%)",
                animation: "srShimmer 1.4s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />
          </div>
        )}
      </div>

      {stage === 0 && (
        <div style={{ color: "#ffd700aa", fontSize: 13 }}>
          🌟 전설의 이로치 씰
        </div>
      )}

      {stage === 3 && (
        <>
          <div
            style={{
              textAlign: "center",
              animation: "srTitleFadeIn 0.5s ease forwards",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#ffd700aa",
                letterSpacing: 3,
                marginBottom: 4,
              }}
            >
              — 전설의 이로치 획득 —
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: "#ffd700",
                textShadow: "0 0 30px #ffd700",
                animation: "srBadgePulse 1.5s ease-in-out infinite",
              }}
            >
              🌟 {seal.name} 🌟
            </div>
          </div>
          <button
            onClick={onConfirm}
            style={{
              background: "linear-gradient(135deg,#ffd700,#ff8c00)",
              color: "#000",
              border: "none",
              borderRadius: 12,
              padding: "12px 40px",
              fontWeight: 900,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 0 30px #ffd70066",
              animation: "srBadgePulse 2s ease-in-out infinite",
            }}
          >
            {confirmLabel}
          </button>
        </>
      )}
    </div>
  );
}

// ── 메인 모달 ─────────────────────────────────────────────
export default function ShinyRevealModal({ seals, onDone }) {
  const [idx, setIdx] = useState(0);
  const [typeColor, setTypeColor] = useState("#A8A878");

  const seal = seals?.[idx];

  useEffect(() => {
    if (seal) fetchTypeColor(seal.pokeId).then(setTypeColor);
  }, [seal?.pokeId]);

  if (!seals || seals.length === 0) return null;

  const remaining = seals.length - idx - 1;
  const confirmLabel =
    remaining > 0 ? `다음 씰 열기 → (${remaining}개 남음)` : "확인";
  const fx = GRADE_FX[seal.grade] || GRADE_FX.COMMON;

  const handleConfirm = () => {
    if (remaining > 0) setIdx((i) => i + 1);
    else onDone();
  };

  const RevealComp =
    seal.grade === "LEGENDARY" ? LegendaryReveal : CommonReveal;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: fx.bg,
        animation: "srFadeIn 0.4s ease",
        gap: 0,
        overflow: "hidden",
      }}
    >
      {/* 별빛 배경 (SR 이상) */}
      {(seal.grade === "SR" || seal.grade === "LEGENDARY") && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 50% 40%, ${fx.color}22 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* 카운터 */}
      {seals.length > 1 && (
        <div
          style={{
            position: "absolute",
            top: 24,
            color: "rgba(255,255,255,0.45)",
            fontSize: 13,
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          {idx + 1} / {seals.length}
          <div
            style={{
              display: "flex",
              gap: 4,
              marginTop: 6,
              justifyContent: "center",
            }}
          >
            {seals.map((_, i) => (
              <div
                key={i}
                style={{
                  width: 20,
                  height: 4,
                  borderRadius: 99,
                  background:
                    i < idx
                      ? "#a0f4ff"
                      : i === idx
                      ? fx.color
                      : "rgba(255,255,255,0.2)",
                  transition: "all 0.3s",
                }}
              />
            ))}
          </div>
        </div>
      )}

      <RevealComp
        key={`${idx}-${seal.id}`}
        seal={seal}
        typeColor={typeColor}
        onConfirm={handleConfirm}
        confirmLabel={confirmLabel}
      />

      <style>{`
        @keyframes srFadeIn          { from{opacity:0} to{opacity:1} }
        @keyframes srSilhouettePulse { 0%,100%{opacity:0.85} 50%{opacity:1} }
        @keyframes srHintPulse       { 0%{transform:scale(0.8);opacity:0.8} 100%{transform:scale(2.4);opacity:0} }
        @keyframes srSealPop         { from{transform:scale(0.7);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes srZoomIn          { from{transform:scale(0.5) translateY(40px);opacity:0} to{transform:scale(1) translateY(0);opacity:1} }
        @keyframes srFlashFade       { 0%{opacity:1} 100%{opacity:0} }
        @keyframes srFlashReveal     { 0%{opacity:1;filter:brightness(3)} 100%{opacity:1;filter:brightness(1)} }
        @keyframes srShimmer         { 0%{transform:translateX(-120%)} 100%{transform:translateX(220%)} }
        @keyframes srSpin            { to{transform:rotate(360deg)} }
        @keyframes srBadgePulse      { 0%,100%{opacity:0.85;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }
        @keyframes srTitleFadeIn     { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes srDescend         { from{opacity:0;transform:translateY(-80px) scale(0.8)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes srBlackout        { 0%{opacity:0} 30%{opacity:1} 100%{opacity:1} }
        @keyframes srDotPulse        { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(2);opacity:0.5} }
        @keyframes srStarFall        { 0%{transform:translateY(-10px);opacity:1} 100%{transform:translateY(110vh);opacity:0} }
        @keyframes srSealSpinAir {
          0%  { transform:rotateY(0deg)    scale(1)    translateY(0px);   }
          25% { transform:rotateY(360deg)  scale(1.14) translateY(-22px); }
          50% { transform:rotateY(720deg)  scale(1.18) translateY(-28px); }
          75% { transform:rotateY(1080deg) scale(1.10) translateY(-14px); }
          85% { transform:rotateY(1390deg) scale(0.88) translateY(14px);  }
          93% { transform:rotateY(1430deg) scale(1.18) translateY(-18px); }
          97% { transform:rotateY(1438deg) scale(0.96) translateY(4px);   }
          100%{ transform:rotateY(1440deg) scale(1)    translateY(0px);   }
        }
      `}</style>
    </div>
  );
}
