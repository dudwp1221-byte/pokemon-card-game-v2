// src/components/SoundToggle.jsx
// BGM / SFX 분리 음소거 버튼 — 호버 시 확장 메뉴

import { useState } from "react";
import { useSoundSettings } from "../lib/sound"; // ← 본인의 sound.js 경로에 맞춰 조정

export default function SoundToggle({ style = {} }) {
  const { bgmMuted, sfxMuted, muted, toggleAll, toggleBGM, toggleSFX } =
    useSoundSettings();
  const [open, setOpen] = useState(false);

  const mainIcon = muted ? "🔇" : bgmMuted ? "🎵" : sfxMuted ? "🔈" : "🔊";

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{ position: "relative", display: "inline-flex", ...style }}
    >
      <button
        onClick={toggleAll}
        aria-label={muted ? "사운드 켜기" : "사운드 끄기"}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "none",
          background: "rgba(0,0,0,0.35)",
          color: "#fff",
          fontSize: 16,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(6px)",
          transition: "all 0.15s",
        }}
      >
        {mainIcon}
      </button>

      {/* 호버 시 세부 메뉴 */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 6,
            padding: 8,
            background: "rgba(0,0,0,0.85)",
            borderRadius: 12,
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.1)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            minWidth: 130,
          }}
        >
          <MenuRow label="🎵 BGM" on={!bgmMuted} onClick={toggleBGM} />
          <MenuRow label="🔊 효과음" on={!sfxMuted} onClick={toggleSFX} />
        </div>
      )}
    </div>
  );
}

function MenuRow({ label, on, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "6px 10px",
        background: "transparent",
        border: "none",
        borderRadius: 8,
        color: "#fff",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span>{label}</span>
      <span
        style={{
          width: 26,
          height: 14,
          borderRadius: 99,
          background: on ? "#4ade80" : "rgba(255,255,255,0.2)",
          position: "relative",
          transition: "background 0.15s",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 1,
            left: on ? 13 : 1,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.15s",
          }}
        />
      </span>
    </button>
  );
}
