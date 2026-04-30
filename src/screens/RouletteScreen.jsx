import { useState, useEffect, useRef, useCallback } from "react";
import TrainerPortrait from "../components/TrainerPortrait";
import { SE } from "../lib/sounds";
import { getTeamOf, getTeamColor, getTeamEmoji } from "../lib/gameLogic";
import { TitleBadge, BadgeIcon } from "./modals/ProfileEditor";
import ProfileBorder from "../components/ProfileBorder";

// 팀 배지 — GameScreen 스타일과 통일
function TeamBadge({ teamId }) {
  if (!teamId) return null;
  return (
    <div
      style={{
        background: getTeamColor(teamId) + "33",
        border: "1px solid " + getTeamColor(teamId) + "88",
        borderRadius: 6,
        padding: "1px 6px",
        fontSize: 8,
        fontWeight: 900,
        color: getTeamColor(teamId),
        marginTop: 2,
      }}
    >
      {getTeamEmoji(teamId)}
      {teamId}팀
    </div>
  );
}

// 플레이어 카드 (렌즈 주변 4방위)
function PlayerCard({ player, tImgs, winIdx, done, myIdx, teams, teamMode }) {
  if (!player) return null;
  const idx = player.id ?? myIdx;
  const nm = (player.name || "").replace(" (AI)", "");
  const pName = player.portraitName || nm;
  const prof = player.profile || null;
  const isWin = done && winIdx === idx;
  const teamId = teamMode && teams ? getTeamOf(idx, teams) : null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      {/* 트레이너 아바타 */}
      <div
        style={{
          padding: 2,
          borderRadius: 10,
          background: isWin ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.06)",
          border: isWin
            ? "2px solid #4ADE80"
            : "2px solid rgba(255,255,255,0.12)",
          boxShadow: isWin ? "0 0 16px rgba(74,222,128,0.5)" : "none",
          transition: "all 0.3s",
          animation: isWin ? "winGlow 1s ease-in-out infinite" : undefined,
        }}
      >
        <div style={{ position: "relative" }}>
          <ProfileBorder borderStyle={prof?.borderStyle || "none"} size={50}>
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
              }}
            >
              <TrainerPortrait name={pName} size={48} tImgs={tImgs} />
            </div>
          </ProfileBorder>
          {prof?.badge && (
            <div
              style={{ position: "absolute", bottom: -5, right: -5, zIndex: 5 }}
            >
              <BadgeIcon badge={prof.badge} size={18} />
            </div>
          )}
        </div>
      </div>

      {teamMode && <TeamBadge teamId={teamId} />}
      {prof?.title && <TitleBadge titleKey={prof.title} fontSize={8} />}

      <span
        style={{
          color: isWin ? "#4ADE80" : "rgba(255,255,255,0.55)",
          fontSize: 9,
          fontWeight: 700,
          transition: "color 0.3s",
        }}
      >
        {nm}
      </span>

      {isWin && (
        <div
          style={{
            background: "linear-gradient(135deg,#4ADE80,#22c55e)",
            borderRadius: 8,
            padding: "2px 8px",
            fontSize: 8,
            fontWeight: 900,
            color: "#fff",
            boxShadow: "0 2px 8px rgba(74,222,128,0.5)",
            animation: "winTagPop 0.3s ease",
          }}
        >
          🎯 선!
        </div>
      )}
    </div>
  );
}

export default function RouletteScreen({
  players,
  tImgs,
  presetWinner,
  onComplete,
  teamMode = false,
  teams = null,
}) {
  const [deg, setDeg] = useState(0);
  const [done, setDone] = useState(false);
  const [winIdx, setWinIdx] = useState(null);
  const winRef = useRef(null);
  const firedRef = useRef(false);
  const ANGLES = [180, 0, 270, 90];

  const safeComplete = useCallback(
    (wi) => {
      if (firedRef.current) return;
      firedRef.current = true;
      onComplete(wi);
    },
    [onComplete]
  );

  useEffect(() => {
    const wi =
      presetWinner != null ? presetWinner : Math.floor(Math.random() * 4);
    winRef.current = wi;
    const final = 360 * 6 + ANGLES[wi % 4];
    const t1 = setTimeout(() => {
      setDeg(final);
      SE.roulette();
    }, 80);
    const t2 = setTimeout(() => {
      setDone(true);
      setWinIdx(wi);
    }, 3400);
    const t3 = setTimeout(() => safeComplete(wi), 5000);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  const nm = (i) => (players[i]?.name || "").replace(" (AI)", "");
  const pOf = (i) => ({ ...players[i], id: i });

  // 4방위 위치 스타일
  const pos = {
    top: {
      position: "absolute",
      top: 0,
      left: "50%",
      transform: "translateX(-50%)",
    },
    bottom: {
      position: "absolute",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
    },
    left: {
      position: "absolute",
      left: 0,
      top: "50%",
      transform: "translateY(-55%)",
    },
    right: {
      position: "absolute",
      right: 0,
      top: "50%",
      transform: "translateY(-55%)",
    },
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        background: "linear-gradient(160deg,#1a0505 0%,#0a0a1a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui,sans-serif",
      }}
    >
      {/* ── 헤더 타이틀 ── */}
      <div style={{ marginBottom: teamMode ? 10 : 24 }}>
        <div
          style={{
            background: "linear-gradient(160deg,#E8190A,#C01208)",
            borderRadius: 16,
            padding: "8px 24px",
            boxShadow:
              "0 4px 20px rgba(232,25,10,0.5),inset 0 1px 0 rgba(255,130,110,0.4)",
            border: "2px solid #8B0000",
          }}
        >
          <span
            style={{
              color: "#fff",
              fontWeight: 900,
              fontSize: 16,
              letterSpacing: 2,
              textShadow: "0 1px 4px rgba(0,0,0,0.5)",
            }}
          >
            {teamMode ? "👥 팀 배틀 · 선 결정 룰렛" : "⚡ 선 결정 룰렛"}
          </span>
        </div>
      </div>

      {/* ── 팀 편성 표시 ── */}
      {teamMode && teams && (
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          {["A", "B"].map((team) => (
            <div
              key={team}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 14px",
                borderRadius: 12,
                background: getTeamColor(team) + "18",
                border: "1.5px solid " + getTeamColor(team) + "66",
                boxShadow: "0 3px 12px " + getTeamColor(team) + "33",
              }}
            >
              <span
                style={{
                  color: getTeamColor(team),
                  fontWeight: 900,
                  fontSize: 13,
                }}
              >
                {getTeamEmoji(team)}
                {team}팀
              </span>
              {(teams[team] || []).map((i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <ProfileBorder
                      borderStyle={players[i]?.profile?.borderStyle || "none"}
                      size={30}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 6,
                        }}
                      >
                        <TrainerPortrait
                          name={
                            players[i]?.portraitName ||
                            (players[i]?.name || "").replace(" (AI)", "")
                          }
                          size={28}
                          tImgs={tImgs}
                        />
                      </div>
                    </ProfileBorder>
                    {players[i]?.profile?.badge && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: -3,
                          right: -3,
                          zIndex: 5,
                        }}
                      >
                        <BadgeIcon badge={players[i].profile.badge} size={11} />
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.65)",
                      fontSize: 8,
                      fontWeight: 600,
                    }}
                  >
                    {(players[i]?.name || "").replace(" (AI)", "")}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── 룰렛 영역 ── */}
      <div style={{ position: "relative", width: 300, height: 300 }}>
        {/* 플레이어 카드 4방위 */}
        <div style={pos.top}>
          <PlayerCard
            player={pOf(1)}
            tImgs={tImgs}
            winIdx={winIdx}
            done={done}
            myIdx={1}
            teams={teams}
            teamMode={teamMode}
          />
        </div>
        <div style={pos.bottom}>
          <PlayerCard
            player={pOf(0)}
            tImgs={tImgs}
            winIdx={winIdx}
            done={done}
            myIdx={0}
            teams={teams}
            teamMode={teamMode}
          />
        </div>
        <div style={pos.left}>
          <PlayerCard
            player={pOf(2)}
            tImgs={tImgs}
            winIdx={winIdx}
            done={done}
            myIdx={2}
            teams={teams}
            teamMode={teamMode}
          />
        </div>
        <div style={pos.right}>
          <PlayerCard
            player={pOf(3)}
            tImgs={tImgs}
            winIdx={winIdx}
            done={done}
            myIdx={3}
            teams={teams}
            teamMode={teamMode}
          />
        </div>

        {/* 중앙 룰렛 */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: "rgba(8,18,46,0.95)",
            border: "2px solid rgba(80,130,255,0.5)",
            overflow: "hidden",
            boxShadow:
              "0 0 0 3px rgba(232,25,10,0.3),0 0 20px rgba(59,130,246,0.3)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `rotate(${deg}deg)`,
              transition:
                deg > 0
                  ? "transform 3.5s cubic-bezier(0.05,0.85,0.15,1)"
                  : "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "calc(50% - 4px)",
                top: "10%",
                width: 8,
                height: "38%",
                background: "linear-gradient(to bottom,#ff3300,#ffaa00)",
                borderRadius: "4px 4px 0 0",
              }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#fff",
              zIndex: 2,
              boxShadow: "0 0 6px rgba(0,0,0,0.5)",
            }}
          />
        </div>
      </div>

      {/* ── 결과 표시 ── */}
      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 16,
        }}
      >
        {done && winIdx != null ? (
          <div
            style={{
              background: "linear-gradient(160deg,#E8190A,#C01208)",
              borderRadius: 16,
              padding: "10px 24px",
              boxShadow:
                "0 4px 20px rgba(232,25,10,0.5),inset 0 1px 0 rgba(255,130,110,0.4)",
              border: "2px solid #8B0000",
              animation: "winTagPop 0.35s ease",
            }}
          >
            <span
              style={{
                color: "#fff",
                fontWeight: 900,
                fontSize: 20,
                textShadow: "0 1px 4px rgba(0,0,0,0.4)",
              }}
            >
              🎯 {nm(winIdx)} 선!
            </span>
          </div>
        ) : (
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              borderRadius: 12,
              padding: "8px 20px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
              룰렛 돌리는 중...
            </span>
          </div>
        )}
      </div>

      {/* 스킵 */}
      <button
        onClick={() => {
          if (winRef.current != null) safeComplete(winRef.current);
        }}
        style={{
          marginTop: 12,
          padding: "8px 28px",
          borderRadius: 28,
          border: "1.5px solid rgba(255,255,255,0.2)",
          background: "rgba(255,255,255,0.07)",
          color: "rgba(255,255,255,0.45)",
          fontSize: 13,
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        ⏭ 스킵
      </button>

      <style>{`
        @keyframes rainbowSpin  { to{transform:rotate(360deg)} }
        @keyframes championAura { 0%,100%{filter:drop-shadow(0 0 4px #6366F1)} 50%{filter:drop-shadow(0 0 10px #8B5CF6)} }
        @keyframes masterAura   { 0%,100%{filter:drop-shadow(0 0 4px #e040fb)} 50%{filter:drop-shadow(0 0 10px #ff80ab)} }
        @keyframes rainbowAura  { 0%,100%{filter:drop-shadow(0 0 4px #ff0080)} 50%{filter:drop-shadow(0 0 10px #ff4500)} }
        @keyframes winGlow      { 0%,100%{box-shadow:0 0 12px rgba(74,222,128,0.4)} 50%{box-shadow:0 0 24px rgba(74,222,128,0.8)} }
        @keyframes winTagPop    { from{transform:scale(0.7);opacity:0} to{transform:scale(1);opacity:1} }
      `}</style>
    </div>
  );
}
