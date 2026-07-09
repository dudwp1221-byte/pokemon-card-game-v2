import { GMAP } from "../lib/constants";

export function CardBack({ w = 56, h = 76 }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 8,
        border: "2px solid #ddd",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={w * 0.62} height={h * 0.62} viewBox="0 0 40 48">
        <circle
          cx="20"
          cy="24"
          r="17"
          fill="none"
          stroke="#E53E3E"
          strokeWidth="2.5"
        />
        <line
          x1="3"
          y1="24"
          x2="37"
          y2="24"
          stroke="#E53E3E"
          strokeWidth="2.5"
        />
        <circle
          cx="20"
          cy="24"
          r="5"
          fill="white"
          stroke="#E53E3E"
          strokeWidth="2"
        />
        <path d="M3,24 A17,17 0 0,1 37,24" fill="#E53E3E" opacity="0.2" />
      </svg>
    </div>
  );
}

export function CardFace({
  card,
  selected,
  discarding,
  inSet,
  images,
  w = 56,
  h = 76,
}) {
  const grp = card.isJoker ? null : GMAP[card.group];
  const key = card.isJoker
    ? "joker_" + card.type
    : card.group + "_" + card.type;
  const img = images?.[key];

  // ✅ inSet이 false/undefined면 세트 강조 효과 완전히 꺼짐
  const shadow = selected
    ? "0 0 0 3px #3B82F6,0 6px 16px rgba(59,130,246,0.55)"
    : inSet
    ? "0 0 0 2px #FBBF24,0 0 14px rgba(251,191,36,0.6)"
    : card.isJoker
    ? "0 0 10px rgba(168,85,247,0.5)"
    : "0 2px 6px rgba(0,0,0,0.18)";

  const xform = discarding
    ? "translateY(-18px) rotate(-12deg) scale(0.82)"
    : selected
    ? "translateY(-10px) scale(1.06)"
    : inSet
    ? "translateY(-4px) scale(1.03)"
    : "translateY(0) scale(1)";

  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 9,
        border: card.isJoker
          ? "3px solid transparent"
          : inSet
          ? "3px solid #FBBF24"
          : "3px solid " + (grp?.color || "#ccc"),
        background: card.isJoker
          ? "linear-gradient(#FDF4FF,#FDF4FF) padding-box, linear-gradient(135deg,#FF0000,#FF7700,#FFFF00,#00FF00,#0088FF,#8800FF,#FF0088) border-box"
          : grp?.bg || "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: shadow,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transform: xform,
        opacity: discarding ? 0 : 1,
        transition:
          "transform 0.22s cubic-bezier(.34,1.56,.64,1),box-shadow 0.15s,opacity 0.22s ease",
        // ✅ inSet이 false면 애니메이션 없음
        animation:
          inSet && !selected ? "setGlow 1.2s ease-in-out infinite" : undefined,
      }}
    >
      {img ? (
        <img
          src={img}
          alt=""
          style={{ width: "86%", height: "72%", objectFit: "contain" }}
        />
      ) : (
        <span style={{ fontSize: Math.round(h * 0.3) }}>
          {card.isJoker ? "🌀" : grp?.emoji}
        </span>
      )}
      {!card.isJoker && (
        <span
          style={{
            position: "absolute",
            top: 2,
            left: 3,
            fontSize: Math.max(7, Math.round(h * 0.11)),
            fontWeight: 800,
            color: "#fff",
            // ✅ inSet여도 그룹 색상 유지
            background: grp?.color,
            borderRadius: 3,
            padding: "0 3px",
            lineHeight: "15px",
            zIndex: 1,
          }}
        >
          {grp?.label}
        </span>
      )}
      {!card.isJoker && (
        <span
          style={{
            position: "absolute",
            bottom: 2,
            right: 3,
            fontSize: Math.max(8, Math.round(h * 0.13)),
            fontWeight: 900,
            color: "#fff",
            // ✅ inSet여도 그룹 색상 유지
            background: grp?.color,
            borderRadius: 3,
            padding: "0 3px",
            lineHeight: "16px",
            zIndex: 1,
          }}
        >
          {card.type}
        </span>
      )}
      {/* ✅ inSet이 false면 황금 점 아예 안 그림 */}
      {inSet && !card.isJoker && (
        <div
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#FBBF24",
            boxShadow: "0 0 6px #FBBF24",
          }}
        />
      )}
    </div>
  );
}
