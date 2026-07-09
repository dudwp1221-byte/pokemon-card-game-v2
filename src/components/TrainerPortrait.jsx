import { T, TOP_CROP } from "../lib/constants";

export default function TrainerPortrait({ name, size = 50, tImgs }) {
  const img = tImgs?.[name];
  const h = Math.round((size * 54) / 50);

  if (img)
    return (
      <img
        src={img}
        style={{
          width: size,
          height: TOP_CROP.has(name) ? size : h,
          borderRadius: 8,
          display: "block",
          objectFit: "cover",
          objectPosition: TOP_CROP.has(name) ? "top center" : "center",
        }}
      />
    );

  const d = T[name];
  if (!d)
    return (
      <div
        style={{ width: size, height: h, borderRadius: 8, overflow: "hidden" }}
      >
        <svg
          viewBox="0 0 50 54"
          width={size * 2}
          height={h * 2}
          style={{
            display: "block",
            transform: "scale(0.5)",
            transformOrigin: "top left",
          }}
        >
          <rect width="50" height="54" fill="#5A6070" rx="8" />
          <circle cx="25" cy="24" r="13" fill="#FAD0A8" />
          <circle cx="19" cy="23" r="2.5" fill="#555" />
          <circle cx="31" cy="23" r="2.5" fill="#555" />
        </svg>
      </div>
    );

  const [bg, sh, sk, hc, ht, et, ec, ac] = d;

  const Hair = () => {
    if (ht === "bald")
      return <ellipse cx="25" cy="14" rx="12" ry="6" fill={hc} />;
    if (ht === "tall")
      return (
        <g>
          <rect x="10" y="2" width="30" height="16" rx="4" fill={hc} />
          <ellipse cx="25" cy="15" rx="13" ry="12" fill={hc} />
        </g>
      );
    if (ht === "ponytailR")
      return (
        <g>
          <ellipse cx="25" cy="14" rx="13" ry="13" fill={hc} />
          <ellipse cx="39" cy="13" rx="6" ry="8" fill={hc} />
        </g>
      );
    if (ht === "twintails")
      return (
        <g>
          <ellipse cx="25" cy="14" rx="13" ry="13" fill={hc} />
          <ellipse cx="8" cy="29" rx="5" ry="9" fill={hc} />
          <ellipse cx="42" cy="29" rx="5" ry="9" fill={hc} />
        </g>
      );
    if (ht === "long")
      return (
        <g>
          <ellipse cx="25" cy="14" rx="13" ry="13" fill={hc} />
          <ellipse cx="9" cy="28" rx="5" ry="12" fill={hc} />
          <ellipse cx="41" cy="28" rx="5" ry="12" fill={hc} />
        </g>
      );
    if (ht === "cap")
      return (
        <g>
          <ellipse cx="25" cy="14" rx="13" ry="13" fill={hc} />
          <rect x="9" y="8" width="32" height="10" rx="5" fill="#CC1010" />
          <rect x="7" y="13" width="36" height="5" rx="2" fill="#DD2020" />
        </g>
      );
    if (ht === "curly")
      return (
        <g>
          <ellipse cx="25" cy="14" rx="13" ry="13" fill={hc} />
          <ellipse cx="13" cy="10" rx="5" ry="5" fill={hc} />
          <ellipse cx="37" cy="10" rx="5" ry="5" fill={hc} />
        </g>
      );
    return <ellipse cx="25" cy="14" rx="13" ry="13" fill={hc} />;
  };

  const Eyes = () => {
    if (et === "shut")
      return (
        <g>
          <path
            d="M14,23 Q18,21 22,23"
            stroke={ec}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M28,23 Q32,21 36,23"
            stroke={ec}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    if (et === "gentle")
      return (
        <g>
          <path
            d="M15,23 Q19,25 23,23"
            stroke={ec}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M27,23 Q31,25 35,23"
            stroke={ec}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    if (et === "narrow")
      return (
        <g>
          <line
            x1="15"
            y1="23"
            x2="23"
            y2="23"
            stroke={ec}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="27"
            y1="23"
            x2="35"
            y2="23"
            stroke={ec}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      );
    if (et === "glasses")
      return (
        <g>
          <circle
            cx="19"
            cy="23"
            r="4"
            fill="none"
            stroke="#555"
            strokeWidth="1.3"
          />
          <circle
            cx="31"
            cy="23"
            r="4"
            fill="none"
            stroke="#555"
            strokeWidth="1.3"
          />
          <line
            x1="23"
            y1="23"
            x2="27"
            y2="23"
            stroke="#555"
            strokeWidth="1.3"
          />
          <circle cx="19" cy="23" r="1.8" fill={ec} />
          <circle cx="31" cy="23" r="1.8" fill={ec} />
        </g>
      );
    if (et === "intense")
      return (
        <g>
          <line x1="14" y1="22" x2="22" y2="21" stroke={ec} strokeWidth="2.5" />
          <line x1="28" y1="21" x2="36" y2="22" stroke={ec} strokeWidth="2.5" />
          <circle cx="19" cy="23.5" r="2" fill={ec} />
          <circle cx="31" cy="23.5" r="2" fill={ec} />
        </g>
      );
    if (et === "sharp")
      return (
        <g>
          <line x1="14" y1="22" x2="22" y2="20" stroke={ec} strokeWidth="2" />
          <line x1="28" y1="20" x2="36" y2="22" stroke={ec} strokeWidth="2" />
          <circle cx="19" cy="23" r="2.2" fill={ec} />
          <circle cx="31" cy="23" r="2.2" fill={ec} />
        </g>
      );
    if (et === "kind")
      return (
        <g>
          <line x1="16" y1="23" x2="22" y2="24" stroke={ec} strokeWidth="1.5" />
          <line x1="28" y1="24" x2="34" y2="23" stroke={ec} strokeWidth="1.5" />
          <circle cx="19" cy="24" r="1.8" fill={ec} />
          <circle cx="31" cy="24" r="1.8" fill={ec} />
        </g>
      );
    if (et === "old")
      return (
        <g>
          <line x1="15" y1="23" x2="23" y2="24" stroke={ec} strokeWidth="1.5" />
          <line x1="27" y1="24" x2="35" y2="23" stroke={ec} strokeWidth="1.5" />
          <circle cx="19" cy="24.5" r="1.5" fill={ec} />
          <circle cx="31" cy="24.5" r="1.5" fill={ec} />
        </g>
      );
    if (et === "smug")
      return (
        <g>
          <line x1="15" y1="23" x2="22" y2="22" stroke={ec} strokeWidth="2" />
          <circle cx="19" cy="23.5" r="2" fill={ec} />
          <circle cx="31" cy="23" r="2" fill={ec} />
        </g>
      );
    if (et === "det")
      return (
        <g>
          <line x1="15" y1="22" x2="22" y2="23" stroke={ec} strokeWidth="2" />
          <line x1="28" y1="23" x2="35" y2="22" stroke={ec} strokeWidth="2" />
          <circle cx="19" cy="24" r="2.2" fill={ec} />
          <circle cx="31" cy="24" r="2.2" fill={ec} />
        </g>
      );
    return (
      <g>
        <circle cx="19" cy="23" r="2.5" fill={ec} />
        <circle cx="31" cy="23" r="2.5" fill={ec} />
      </g>
    );
  };

  const Acc = () => {
    if (ac === "mask")
      return (
        <rect
          x="12"
          y="27"
          width="26"
          height="9"
          fill="#2A1040"
          rx="3"
          opacity="0.8"
        />
      );
    if (ac === "moustache")
      return (
        <path
          d="M16,31 Q20,35 25,32 Q30,35 34,31"
          stroke="#D8D8D8"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      );
    if (ac === "hat")
      return (
        <g>
          <rect x="13" y="5" width="24" height="9" rx="4" fill="#FFF" />
          <rect x="9" y="11" width="32" height="5" rx="2" fill="#FFF" />
        </g>
      );
    if (ac === "cape")
      return (
        <path
          d="M3,40 C7,30 12,28 14,40 C17,30 23,28 25,40 C27,30 33,28 36,40 C38,30 43,28 47,40"
          fill="#6A1A88"
          opacity="0.85"
        />
      );
    return null;
  };

  return (
    <div
      style={{
        width: size,
        height: h,
        borderRadius: 8,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <svg
        viewBox="0 0 50 54"
        width={size * 2}
        height={h * 2}
        style={{
          display: "block",
          transform: "scale(0.5)",
          transformOrigin: "top left",
        }}
      >
        <rect width="50" height="54" fill={bg} rx="8" />
        <rect x="4" y="38" width="42" height="18" fill={sh} rx="6" />
        <Hair />
        <circle cx="25" cy="24" r="13" fill={sk} />
        <Eyes />
        <path
          d="M20,31 Q25,34 30,31"
          stroke="#B07850"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
        <Acc />
      </svg>
    </div>
  );
}
