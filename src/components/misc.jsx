// ─────────────────────────────────────────
// StadiumBg
// ─────────────────────────────────────────
if (
  typeof document !== "undefined" &&
  !document.getElementById("__pksBorderStyles__")
) {
  const s = document.createElement("style");
  s.id = "__pksBorderStyles__";
  s.textContent = `
    @keyframes rainbowSpin  { to { transform: rotate(360deg); } }
    @keyframes championAura {
      0%,100% { filter: drop-shadow(0 0 4px #6366F1) drop-shadow(0 0 8px #8B5CF666); }
      50%      { filter: drop-shadow(0 0 10px #8B5CF6) drop-shadow(0 0 20px #6366F199); }
    }
    @keyframes masterAura {
      0%,100% { filter: drop-shadow(0 0 4px #e040fb) drop-shadow(0 0 8px #c084fc66); }
      50%      { filter: drop-shadow(0 0 10px #e040fb) drop-shadow(0 0 20px #ff80ab99); }
    }
    @keyframes rainbowAura {
      0%,100% { filter: drop-shadow(0 0 4px #ff0080) drop-shadow(0 0 8px #00aaff66); }
      50%      { filter: drop-shadow(0 0 10px #ff4500) drop-shadow(0 0 20px #8844ff99); }
    }
  `;
  document.head.appendChild(s);
}
export function StadiumBg() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
        background: "#06101e",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%,#0d2248 0%,#06101e 55%,#020508 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "45%",
          transform: "translate(-50%,-50%)",
          width: "72%",
          paddingBottom: "38%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 50% 35%,#2a5a9a 0%,#183a70 35%,#0e2250 70%,#080e28 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 90% 85% at 50% 50%,transparent 50%,rgba(0,0,0,0.65) 100%)",
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────
// EmoteMedia
// ─────────────────────────────────────────
import { isVid } from "../lib/assets";

export function EmoteMedia({ src, size = 44 }) {
  if (!src) return null;
  if (isVid(src))
    return (
      <video
        src={src}
        style={{ width: size, height: size, objectFit: "contain" }}
        autoPlay
        loop
        muted
        playsInline
      />
    );
  return (
    <img
      src={src}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        display: "block",
      }}
    />
  );
}

// ─────────────────────────────────────────
// DiscardSlot
// ─────────────────────────────────────────
import { CardFace } from "./CardFace";

export function DiscardSlot({
  player,
  images,
  canTake,
  onTake,
  cw = 56,
  ch = 76,
  dataTut,
}) {
  if (!player) return <div style={{ width: cw + 24, height: ch + 30 }} />;
  const top = (player.discardPile || [])[0];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      <span
        style={{
          color: "rgba(255,255,255,0.7)",
          fontSize: 9,
          fontWeight: 600,
          maxWidth: cw + 24,
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {player.name.replace(" (AI)", "")}
      </span>
      <div
        data-tut={dataTut}
        onClick={canTake && top ? onTake : undefined}
        style={{
          cursor: canTake && top ? "pointer" : "default",
          position: "relative",
          minWidth: cw,
          minHeight: ch,
        }}
      >
        {top ? (
          <div style={{ position: "relative" }}>
            <CardFace card={top} images={images} w={cw} h={ch} />
            {canTake && (
              <div
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#4ADE80",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                >
                  +
                </span>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              width: cw,
              height: ch,
              borderRadius: 8,
              border: "2px dashed rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.25)",
              fontSize: 10,
            }}
          >
            없음
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// PlayerAvatar
// ─────────────────────────────────────────
import TrainerPortrait from "./TrainerPortrait";
import { GMAP } from "../lib/constants";
import { getTeamColor, getTeamEmoji, findSets } from "../lib/gameLogic";
import { TitleBadge, BadgeIcon } from "../screens/modals/ProfileEditor";
import ProfileBorder from "./ProfileBorder";

export function PlayerAvatar({
  player,
  active,
  tImgs,
  coins,
  thinking,
  sdUsed,
  disconnected,
  emote,
  size = 46,
  timeLeft = null,
  teamId = null,
  isTeammate = false,
  teammateSets = null,
}) {
  const n = player.name.replace(" (AI)", "");
  const pn = player.portraitName || n;
  const prof = player.profile || null;
  const isUrl =
    emote && (emote.startsWith("http") || emote.startsWith("data:"));

  const borderColor = active
    ? "#4ADE80"
    : disconnected
    ? "#6b2121"
    : sdUsed
    ? "#ef4444"
    : teamId
    ? getTeamColor(teamId)
    : "rgba(255,255,255,0.06)";
  const bgColor = active
    ? "rgba(74,222,128,0.12)"
    : disconnected
    ? "rgba(100,0,0,0.4)"
    : "rgba(0,0,0,0.5)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        padding: teamId ? "14px 7px 6px" : "6px 7px",
        borderRadius: 10,
        background: bgColor,
        border: "2px solid " + borderColor,
        minWidth: size + 18,
        backdropFilter: "blur(8px)",
        position: "relative",
      }}
    >
      {teamId && (
        <div
          style={{
            position: "absolute",
            top: -9,
            left: "50%",
            transform: "translateX(-50%)",
            background: getTeamColor(teamId),
            borderRadius: 8,
            padding: "1px 7px",
            fontSize: 8,
            fontWeight: 900,
            color: "#fff",
            whiteSpace: "nowrap",
          }}
        >
          {getTeamEmoji(teamId)}
          {teamId}팀{isTeammate ? " 🤝" : ""}
        </div>
      )}
      {emote && (
        <div
          style={{
            position: "absolute",
            top: -130,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
            pointerEvents: "none",
            animation: "emoteFloat 3s ease forwards",
            background: "rgba(0,0,0,0.75)",
            borderRadius: 20,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 100,
            minHeight: 100,
          }}
        >
          {isUrl ? (
            <EmoteMedia src={emote} size={110} />
          ) : (
            <span style={{ fontSize: 84, lineHeight: 1 }}>{emote}</span>
          )}
        </div>
      )}
      {thinking && (
        <div
          style={{
            position: "absolute",
            top: -14,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            borderRadius: 10,
            padding: "2px 7px",
            fontSize: 11,
            whiteSpace: "nowrap",
            animation: "thinkFloat 0.9s ease-in-out infinite",
            zIndex: 10,
          }}
        >
          💭 ···
        </div>
      )}
      {disconnected && (
        <div
          style={{
            position: "absolute",
            top: -14,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#7f1d1d",
            borderRadius: 10,
            padding: "2px 7px",
            fontSize: 10,
            color: "#fca5a5",
            whiteSpace: "nowrap",
            fontWeight: 700,
            zIndex: 10,
          }}
        >
          📵 나감
        </div>
      )}
      <div style={{ position: "relative", opacity: disconnected ? 0.5 : 1 }}>
        {/* ✅ 수정: ProfileBorder 안에 흰 배경 래퍼 추가 — 꾸민 프로필도 초상화 보이도록 */}
        <ProfileBorder borderStyle={prof?.borderStyle || "none"} size={size}>
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "#fff",
              borderRadius: 6,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TrainerPortrait name={pn} size={size} tImgs={tImgs} />
          </div>
        </ProfileBorder>
        {sdUsed && (
          <div
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              background: "#dc2626",
              borderRadius: 10,
              padding: "1px 5px",
              fontSize: 9,
              fontWeight: 900,
              color: "#fff",
              animation: "sdBtnPulse 1.6s ease-in-out infinite",
              zIndex: 10,
            }}
          >
            ⚔️
          </div>
        )}
        {prof?.badge && !sdUsed && (
          <div
            style={{ position: "absolute", bottom: -5, right: -5, zIndex: 10 }}
          >
            <BadgeIcon badge={prof.badge} size={20} />
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        {prof?.title && <TitleBadge titleKey={prof.title} fontSize={8} />}
        <span
          style={{
            color: active
              ? "#a0ffb0"
              : disconnected
              ? "#ef4444"
              : "rgba(255,255,255,0.75)",
            fontSize: 9,
            fontWeight: 700,
            textAlign: "center",
            maxWidth: 64,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {n}
          {player.isAI && (
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 8 }}>
              {" "}
              AI
            </span>
          )}
        </span>
      </div>
      <span style={{ color: "#ffd060", fontSize: 10, fontWeight: 800 }}>
        {"💰" + (coins || 0)}
      </span>
      {isTeammate && teammateSets !== null && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "center",
            marginTop: 1,
          }}
        >
          {teammateSets.length === 0 ? (
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>
              세트 0/3
            </span>
          ) : (
            teammateSets.map((s, i) => {
              const grp = s.find((c) => !c.isJoker);
              const g = grp ? GMAP[grp.group] : null;
              return (
                <span
                  key={i}
                  style={{
                    fontSize: 8,
                    background: g ? g.color + "44" : "#ffffff22",
                    color: g ? g.color : "#fff",
                    border: "1px solid " + (g ? g.color + "88" : "#fff4"),
                    borderRadius: 3,
                    padding: "0 3px",
                    fontWeight: 700,
                  }}
                >
                  {g ? g.emoji + g.label : "🌀"}
                </span>
              );
            })
          )}
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>
            {teammateSets.length + "/3"}
          </span>
        </div>
      )}
      {sdUsed && (
        <div
          style={{
            background: "linear-gradient(135deg,#dc2626,#b91c1c)",
            borderRadius: 6,
            padding: "2px 6px",
            fontSize: 8,
            fontWeight: 800,
            color: "#fff",
          }}
        >
          ⚔️ 승부
        </div>
      )}
      {active && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#4ADE80",
            display: "block",
            boxShadow: "0 0 6px #4ADE80",
          }}
        />
      )}
      {active && timeLeft != null && (
        <div
          style={{
            width: "100%",
            height: 3,
            background: "rgba(0,0,0,0.35)",
            borderRadius: 2,
            overflow: "hidden",
            marginTop: 1,
          }}
        >
          <div
            style={{
              height: "100%",
              width: (timeLeft / 30) * 100 + "%",
              background:
                timeLeft <= 10
                  ? "#EF4444"
                  : timeLeft <= 20
                  ? "#F59E0B"
                  : "#4ADE80",
              borderRadius: 2,
              transition: "width 1s linear",
            }}
          />
        </div>
      )}
    </div>
  );
}
