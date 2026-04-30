import { useState } from "react";
import { SD_DEFAULT, LEAGUES } from "../../lib/constants";
import { CardFace } from "../../components/CardFace";

function makeCard(id, gId, type) {
  return { id, group: gId, type, isJoker: false };
}
function makeJoker(id) {
  return { id, group: "joker", type: "1", isJoker: true };
}
const CW = 38,
  CH = 52;

function SetBox({ cards, images, label, valid = true }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 3,
          padding: "6px 8px",
          borderRadius: 10,
          background: valid ? "rgba(22,163,74,0.06)" : "rgba(239,68,68,0.06)",
          border: `1.5px solid ${valid ? "#bbf7d0" : "#FECACA"}`,
        }}
      >
        {cards.map((c) => (
          <CardFace key={c.id} card={c} images={images} w={CW} h={CH} />
        ))}
      </div>
      {label && (
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: valid ? "#16a34a" : "#EF4444",
          }}
        >
          {valid ? "✅" : "❌"} {label}
        </div>
      )}
    </div>
  );
}

// 포켓덱스 모달 래퍼
function Shell({ onClose, title, screenLabel, screenTitle, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        zIndex: 1020,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui,sans-serif",
        padding: 12,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: Math.min(360, window.innerWidth - 24),
          background: "linear-gradient(160deg,#E8190A,#C01208)",
          borderRadius: 28,
          padding: 12,
          boxShadow:
            "0 16px 48px rgba(0,0,0,0.7),inset 0 2px 0 rgba(255,130,110,0.5),inset 0 -3px 0 rgba(0,0,0,0.35)",
          border: "3px solid #8B0000",
          animation: "rlPop 0.25s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "4px 4px 10px",
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              flexShrink: 0,
              position: "relative",
              background:
                "radial-gradient(circle at 32% 28%,#bfdbfe,#2563EB 55%,#1e3a8a)",
              boxShadow:
                "0 0 0 4px rgba(255,255,255,0.3),0 0 20px rgba(59,130,246,0.6),0 4px 8px rgba(0,0,0,0.5)",
              border: "2px solid rgba(255,255,255,0.45)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "18%",
                left: "18%",
                width: "38%",
                height: "38%",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.7)",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
            {[
              { c: "#f87171", g: "#ef4444" },
              { c: "#fbbf24", g: "#f59e0b" },
              { c: "#4ade80", g: "#22c55e" },
            ].map(({ c, g }, i) => (
              <div
                key={i}
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: "50%",
                  background: c,
                  boxShadow: `0 0 7px ${g}`,
                  border: "1.5px solid rgba(255,255,255,0.35)",
                }}
              />
            ))}
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <span
              style={{
                color: "#fff",
                fontWeight: 900,
                fontSize: 17,
                letterSpacing: 1,
                textShadow: "0 1px 4px rgba(0,0,0,0.5)",
              }}
            >
              {title}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.3)",
              background: "rgba(0,0,0,0.3)",
              color: "rgba(255,255,255,0.8)",
              fontSize: 14,
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>
        <div
          style={{
            background: "#0a0f1a",
            borderRadius: 14,
            border: "5px solid #fff",
            boxShadow: "0 0 0 2px #bbb,inset 0 2px 12px rgba(0,0,0,0.9)",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              height: 2,
              background:
                "linear-gradient(90deg,transparent,rgba(74,222,128,0.2),transparent)",
              animation: "scanLine 2.5s ease-in-out infinite",
            }}
          />
          <div style={{ padding: "8px 14px" }}>
            <div
              style={{
                color: "rgba(74,222,128,0.65)",
                fontSize: 9,
                fontFamily: "monospace",
                letterSpacing: 1,
                marginBottom: 1,
              }}
            >
              {screenLabel}
            </div>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: 14 }}>
              {screenTitle}
            </div>
          </div>
          <div style={{ display: "flex", height: 3 }}>
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  background:
                    i % 3 === 0 ? "rgba(74,222,128,0.45)" : "transparent",
                }}
              />
            ))}
          </div>
        </div>
        <div
          style={{
            background: "#FEFEFE",
            borderRadius: 20,
            padding: 12,
            boxShadow: "inset 0 2px 0 #fff,inset 0 -2px 0 rgba(180,0,0,0.12)",
          }}
        >
          {children}
        </div>
      </div>
      <style>{`
        @keyframes scanLine { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes rlPop    { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
}

export default function RulesModal({
  onClose,
  sdAmt = SD_DEFAULT,
  images = {},
}) {
  const [page, setPage] = useState(0);
  const img =
    Object.keys(images).length > 0 ? images : window.__hotpotImages || {};
  const groups = (LEAGUES.find((l) => l.id === "kanto") || LEAGUES[0]).groups;
  const [g0, g1, g2] = groups.map((g) => g.id);

  const pages = [
    {
      title: "🏆 게임 목표",
      bc: "#C7D2FE",
      body: (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              textAlign: "center",
              fontSize: 14,
              fontWeight: 800,
              color: "#1e1b4b",
            }}
          >
            세트 3개를 먼저 완성하면 승리!
          </div>
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <SetBox
              images={img}
              cards={[
                makeCard(0, g0, "A"),
                makeCard(1, g0, "B"),
                makeCard(2, g0, "C"),
              ]}
            />
            <SetBox
              images={img}
              cards={[
                makeCard(3, g1, "A"),
                makeCard(4, g1, "B"),
                makeCard(5, g1, "C"),
              ]}
            />
            <SetBox
              images={img}
              cards={[
                makeCard(6, g2, "A"),
                makeCard(7, g2, "B"),
                makeCard(8, g2, "C"),
              ]}
            />
          </div>
          <div style={{ fontSize: 11, color: "#6B7280", textAlign: "center" }}>
            세트 묶음 3개를 완성하세요
          </div>
        </div>
      ),
    },
    {
      title: "✅ 세트 만드는 법",
      bc: "#bbf7d0",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            {
              lbl: "① 같은 속성 A·B·C 3장",
              cards: [
                makeCard(0, g0, "A"),
                makeCard(1, g0, "B"),
                makeCard(2, g0, "C"),
              ],
            },
            {
              lbl: "② 같은 속성 같은 타입 3장",
              cards: [
                makeCard(3, g1, "B"),
                makeCard(4, g1, "B"),
                makeCard(5, g1, "B"),
              ],
            },
          ].map((r, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                borderRadius: 10,
                padding: "10px 12px",
                border: "1.5px solid #bbf7d0",
                boxShadow: "0 3px 0 #bbf7d0",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#15803d",
                  marginBottom: 8,
                }}
              >
                {r.lbl}
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <SetBox images={img} cards={r.cards} label="유효한 세트" />
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "❌ 세트가 아닌 경우",
      bc: "#FECACA",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            {
              lbl: "같은 속성 A+A+B ← ❌",
              cards: [
                makeCard(0, g0, "A"),
                makeCard(1, g0, "A"),
                makeCard(2, g0, "B"),
              ],
              msg: "세트 아님 (A 중복)",
            },
            {
              lbl: "다른 속성 A+B+C ← ❌",
              cards: [
                makeCard(3, g0, "A"),
                makeCard(4, g1, "B"),
                makeCard(5, g2, "C"),
              ],
              msg: "세트 아님 (속성 달라야 안됨)",
            },
          ].map((r, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                borderRadius: 10,
                padding: "10px 12px",
                border: "1.5px solid #FECACA",
                boxShadow: "0 3px 0 #FECACA",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#b91c1c",
                  marginBottom: 8,
                }}
              >
                {r.lbl}
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <SetBox
                  images={img}
                  cards={r.cards}
                  label={r.msg}
                  valid={false}
                />
              </div>
            </div>
          ))}
          <div
            style={{
              background: "#FFFBEB",
              borderRadius: 10,
              padding: "8px 12px",
              border: "1.5px solid #FCD34D",
              boxShadow: "0 3px 0 #fde68a",
              fontSize: 11,
              color: "#78350F",
              fontWeight: 600,
            }}
          >
            💡 속성(카드 테두리 색)이 같아야 세트!
          </div>
        </div>
      ),
    },
    {
      title: "🌀 조커 카드",
      bc: "#ddd6fe",
      body: (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              textAlign: "center",
              fontSize: 13,
              fontWeight: 800,
              color: "#4C1D95",
            }}
          >
            어떤 속성·타입으로도 대체 가능!
          </div>
          <SetBox
            images={img}
            cards={[makeCard(0, g0, "A"), makeJoker(99), makeCard(2, g0, "C")]}
            label="조커가 B 역할 → 유효한 세트"
          />
          <div
            style={{
              background: "#EDE9FE",
              borderRadius: 10,
              padding: "8px 12px",
              border: "1.5px solid #ddd6fe",
              boxShadow: "0 3px 0 #ddd6fe",
              fontSize: 11,
              color: "#5B21B6",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            세트 하나에 조커 1장까지 사용 가능
            <br />
            <span style={{ fontWeight: 400 }}>조커 2장으로 세트도 성립!</span>
          </div>
        </div>
      ),
    },
    {
      title: "🃏 턴 진행",
      bc: "#E5E7EB",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {[
            {
              step: "①",
              icon: "📦",
              title: "덱에서 뽑기",
              desc: "덱 맨 위 카드 1장 가져오기",
            },
            {
              step: "or",
              icon: "♻️",
              title: "버린 카드 가져오기",
              desc: "상대가 버린 카드 맨 위 1장 가져오기",
            },
            {
              step: "②",
              icon: "🗑️",
              title: "1장 버리기",
              desc: "손패 중 필요 없는 카드 1장 버리기\n뽑은 카드를 바로 버려도 됩니다",
            },
          ].map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                background: "#fff",
                borderRadius: 10,
                padding: "10px 12px",
                border: "1.5px solid #E5E7EB",
                boxShadow: "0 3px 0 #e2e8f0",
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: r.step === "or" ? "#E5E7EB" : "#E8190A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    color: r.step === "or" ? "#9CA3AF" : "#fff",
                    fontSize: 9,
                    fontWeight: 900,
                  }}
                >
                  {r.step}
                </span>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 12 }}>
                  {r.icon} {r.title}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#6B7280",
                    marginTop: 2,
                    whiteSpace: "pre-line",
                  }}
                >
                  {r.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "⚡ 더블배팅",
      bc: "#FECACA",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ textAlign: "center", fontSize: 12, color: "#374151" }}>
            이길 자신이 있을 때 눌러서
            <br />
            <b>판돈을 1.5배로!</b>
          </div>
          {[
            {
              icon: "💸",
              label: "선언 비용",
              val: `-${sdAmt}코인 → 판돈에 추가`,
              color: "#FEF2F2",
              bc: "#FECACA",
              vc: "#EF4444",
            },
            {
              icon: "🏆",
              label: "성공하면",
              val: "판돈 × 1.5배 획득!",
              color: "#F0FDF4",
              bc: "#bbf7d0",
              vc: "#16a34a",
            },
            {
              icon: "😮",
              label: "실패해도",
              val: "선언 비용만 손해\n추가 패널티 없음",
              color: "#F9FAFB",
              bc: "#E5E7EB",
              vc: "#6B7280",
            },
          ].map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: r.color,
                borderRadius: 10,
                padding: "10px 12px",
                border: `1.5px solid ${r.bc}`,
                boxShadow: `0 3px 0 ${r.bc}`,
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>{r.icon}</span>
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontWeight: 700, fontSize: 11, color: "#374151" }}
                >
                  {r.label}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: r.vc,
                    marginTop: 1,
                    whiteSpace: "pre-line",
                  }}
                >
                  {r.val}
                </div>
              </div>
            </div>
          ))}
          <div style={{ fontSize: 10, color: "#9CA3AF", textAlign: "center" }}>
            버리기 차례에만 선언 가능
          </div>
        </div>
      ),
    },
  ];

  const cur = pages[page];
  return (
    <Shell
      onClose={onClose}
      title="📋 게임 규칙"
      screenLabel="RULE BOOK"
      screenTitle={`${page + 1}/${pages.length} ${cur.title}`}
    >
      <div
        style={{
          background: "#EEF2FF",
          borderRadius: 12,
          padding: "8px 14px",
          marginBottom: 12,
          border: `1.5px solid ${cur.bc}`,
          boxShadow: `0 3px 0 ${cur.bc}`,
          textAlign: "center",
          fontWeight: 900,
          fontSize: 13,
          color: "#111",
        }}
      >
        {cur.title}
      </div>
      <div
        style={{
          minHeight: 200,
          maxHeight: "42vh",
          overflowY: "auto",
          marginBottom: 12,
        }}
      >
        {cur.body}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 5,
          marginBottom: 10,
        }}
      >
        {pages.map((_, i) => (
          <div
            key={i}
            onClick={() => setPage(i)}
            style={{
              width: i === page ? 18 : 7,
              height: 7,
              borderRadius: 99,
              background: i === page ? "#E8190A" : "#E5E7EB",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          style={{
            flex: 1,
            padding: "11px 0",
            borderRadius: 28,
            border: "1.5px solid #E5E7EB",
            background: page === 0 ? "#F9FAFB" : "#fff",
            fontWeight: 700,
            fontSize: 13,
            cursor: page === 0 ? "default" : "pointer",
            color: page === 0 ? "#D1D5DB" : "#374151",
            boxShadow: page === 0 ? "none" : "0 3px 0 #e2e8f0",
          }}
        >
          ← 이전
        </button>
        {page < pages.length - 1 ? (
          <button
            onClick={() => setPage((p) => p + 1)}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 28,
              border: "2px solid #15803d",
              background: "linear-gradient(160deg,#4ade80,#22c55e 40%,#16a34a)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              boxShadow: "0 4px 0 #166534",
            }}
          >
            다음 →
          </button>
        ) : (
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 28,
              border: "2px solid #15803d",
              background: "linear-gradient(160deg,#4ade80,#22c55e 40%,#16a34a)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              boxShadow: "0 4px 0 #166534",
            }}
          >
            ✅ 확인
          </button>
        )}
      </div>
    </Shell>
  );
}
