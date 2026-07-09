import { useState } from "react";
import { loginUser, registerUser } from "../lib/db";

function PokedexHeader({ title = "⚡ PokéSet" }) {
  return (
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          flexShrink: 0,
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ display: "flex", gap: 2.5 }}>
            {[0, 1, 2, 3].map((j) => (
              <div
                key={j}
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.4)",
                  boxShadow: "0 1px 0 rgba(255,255,255,0.12)",
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LoginScreen({ lobbyBg, onLogin }) {
  const [tab, setTab] = useState("login");
  const [nickname, setNick] = useState("");
  const [password, setPass] = useState("");
  const [passConf, setConf] = useState("");
  const [loading, setLoad] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async () => {
    setErr("");
    const nick = nickname.trim(),
      pass = password.trim();
    if (!nick || !pass) return setErr("아이디와 비밀번호를 입력해주세요.");
    if (nick.length < 2) return setErr("아이디는 2글자 이상이어야 해요.");
    if (!/^\d{4}$/.test(pass))
      return setErr("비밀번호는 숫자 4자리만 입력해주세요.");
    if (tab === "register" && pass !== passConf)
      return setErr("비밀번호가 일치하지 않아요.");
    setLoad(true);
    try {
      const user =
        tab === "login"
          ? await loginUser(nick, pass)
          : await registerUser(nick, pass);
      onLogin(user);
    } catch (e) {
      setErr(e.message || "오류가 발생했어요. 다시 시도해주세요.");
    } finally {
      setLoad(false);
    }
  };

  // ── 포커스 테두리 없음 ──
  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 9,
    border: "1.5px solid #E5E7EB",
    fontSize: 14,
    boxSizing: "border-box",
    outline: "none",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: lobbyBg
          ? `url(${lobbyBg}) center/cover no-repeat`
          : "linear-gradient(135deg,#1a0505,#2d0808)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui,sans-serif",
        padding: "16px 0",
      }}
    >
      <div
        style={{
          width: Math.min(360, window.innerWidth - 24),
          background: "linear-gradient(160deg,#E8190A,#C01208)",
          borderRadius: 28,
          padding: 12,
          boxShadow:
            "0 16px 48px rgba(0,0,0,0.65),inset 0 2px 0 rgba(255,130,110,0.5),inset 0 -3px 0 rgba(0,0,0,0.35)",
          border: "3px solid #8B0000",
        }}
      >
        <PokedexHeader />

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
          <div style={{ padding: "14px 16px", textAlign: "center" }}>
            <div
              style={{
                color: "rgba(74,222,128,0.65)",
                fontSize: 9,
                fontFamily: "monospace",
                letterSpacing: 1,
                marginBottom: 6,
              }}
            >
              TRAINER AUTH
            </div>
            <div style={{ fontSize: 28, marginBottom: 4 }}>⚡</div>
            <div
              style={{
                color: "#fff",
                fontWeight: 900,
                fontSize: 16,
                letterSpacing: 1,
              }}
            >
              PokéSet
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: 10,
                marginTop: 2,
                fontStyle: "italic",
              }}
            >
              포켓몬 카드 세트 게임
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
            padding: 14,
            boxShadow: "inset 0 2px 0 #fff,inset 0 -2px 0 rgba(180,0,0,0.12)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {/* 탭 */}
          <div
            style={{
              display: "flex",
              background: "#F3F4F6",
              borderRadius: 12,
              padding: 3,
              gap: 3,
            }}
          >
            {[
              ["login", "🔑 로그인"],
              ["register", "✨ 회원가입"],
            ].map(([t, l]) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setErr("");
                }}
                style={{
                  flex: 1,
                  padding: "9px 0",
                  borderRadius: 9,
                  border:
                    tab === t
                      ? "1.5px solid #374151"
                      : "1.5px solid transparent",
                  background: tab === t ? "#fff" : "transparent",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                  color: tab === t ? "#111827" : "#9CA3AF",
                  boxShadow: tab === t ? "0 2px 0 #e2e8f0" : "none",
                  transition: "all 0.2s",
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {/* 아이디 */}
          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#374151",
                display: "block",
                marginBottom: 4,
              }}
            >
              아이디
            </label>
            <input
              value={nickname}
              onChange={(e) => setNick(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="아이디를 입력해주세요"
              maxLength={12}
              style={inputStyle}
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#374151",
                display: "block",
                marginBottom: 4,
              }}
            >
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                if (/^\d{0,4}$/.test(e.target.value)) setPass(e.target.value);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="숫자 4자리"
              maxLength={4}
              inputMode="numeric"
              style={inputStyle}
            />
          </div>

          {/* 비밀번호 확인 */}
          {tab === "register" && (
            <div>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#374151",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                비밀번호 확인
              </label>
              <input
                type="password"
                value={passConf}
                onChange={(e) => setConf(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="비밀번호 재입력"
                maxLength={4}
                style={inputStyle}
              />
            </div>
          )}

          {err && (
            <div
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: 10,
                padding: "9px 12px",
                fontSize: 12,
                color: "#DC2626",
                fontWeight: 600,
              }}
            >
              ⚠️ {err}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: "13px 0",
              borderRadius: 28,
              border: loading ? "none" : "2px solid #15803d",
              background: loading
                ? "#9CA3AF"
                : "linear-gradient(160deg,#4ade80,#22c55e 40%,#16a34a)",
              color: "#fff",
              fontWeight: 900,
              fontSize: 16,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading
                ? "none"
                : "0 4px 0 #166534,0 8px 24px rgba(22,163,74,0.3)",
            }}
          >
            {loading
              ? "⏳ 처리 중..."
              : tab === "login"
              ? "🔑 로그인"
              : "✨ 회원가입"}
          </button>

          <div
            style={{
              background: "#FFF7ED",
              border: "1.5px solid #FED7AA",
              borderRadius: 12,
              padding: "10px 12px",
              boxShadow: "0 3px 0 #FED7AA",
              fontSize: 11,
              lineHeight: 1.7,
              color: "#92400E",
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 2 }}>
              ⚠️ 이 서비스는 개인정보를 수집하지 않습니다
            </div>
            <div style={{ color: "#374151" }}>
              기기가 바뀌어도 코인·씰 도감이 유지됩니다 😅
            </div>
            <div style={{ color: "#DC2626", fontWeight: 700, marginTop: 2 }}>
              실제 비밀번호를 입력하지 마세요
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes scanLine { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }`}</style>
    </div>
  );
}
