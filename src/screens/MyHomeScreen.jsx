// src/screens/MyHomeScreen.jsx  ── 포켓캠프 스타일 마이홈 (자유 배치)
import { useState, useEffect, useRef, useMemo } from "react";
import {
  ROOM_THEMES,
  FURNITURE_CATALOG,
  CATEGORIES,
  getFurnitureInfo,
  getFurnitureUrl,
  loadMyHome,
  saveMyHome,
  tapSlot,
  feedSlot,
  bathSlot,
  renameSlot,
  applyDailyVisit,
  getAffinityLevel,
  getPokemonGif,
  getDisplayName,
  SNACKS,
  TAP_DAILY,
  MAX_FURNITURE,
} from "../lib/myHomeLogic";
import FurnitureShop from "./FurnitureShop";

export default function MyHomeScreen({
  myProfile,
  myCoins,
  onClose,
  onSpendCoins,
  onEarnCoins,
  onAddSeal,
}) {
  const nickname = myProfile?.nickname ?? myProfile?.name ?? "플레이어";
  const coin = myCoins ?? 0;

  const [home, setHome] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [selectedFurnId, setSelectedFurnId] = useState(null);

  const [showShop, setShowShop] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showPokeModal, setShowPokeModal] = useState(null);

  const [placingItem, setPlacingItem] = useState(null);
  const [dragging, setDragging] = useState(null);

  const roomRef = useRef(null);

  useEffect(() => {
    (async () => {
      const h = await loadMyHome(nickname);
      const visited = applyDailyVisit(h.slots ?? []);

      // 구버전 마이그레이션: col/row → x/y (%)
      const migratedFurniture = (h.furniture ?? []).map((f) => {
        if (f.x !== undefined && f.y !== undefined) return f;
        if (f.col !== undefined && f.row !== undefined) {
          return {
            ...f,
            x: ((f.col + 1) / 10) * 100,
            y: ((f.row + 1) / 10) * 100,
          };
        }
        return { ...f, x: 50, y: 50 };
      });

      const next = {
        ...h,
        slots: visited,
        furniture: migratedFurniture,
      };
      setHome(next);
      await saveMyHome(nickname, next);
      setLoading(false);
    })();
  }, [nickname]);

  const theme = useMemo(
    () => ROOM_THEMES.find((t) => t.id === home?.themeId) ?? ROOM_THEMES[0],
    [home?.themeId]
  );

  async function patchHome(updater) {
    const next =
      typeof updater === "function" ? updater(home) : { ...home, ...updater };
    setHome(next);
    await saveMyHome(nickname, next);
  }

  async function handleBuyFurniture(itemId) {
    const info = getFurnitureInfo(itemId);
    if (!info) return;
    if (coin < info.cost) {
      alert("코인이 부족해요!");
      return;
    }
    onSpendCoins?.(info.cost);
    await patchHome((h) => ({
      ...h,
      purchasedFurniture: [...(h.purchasedFurniture ?? []), itemId],
    }));
    setPlacingItem(itemId);
    setShowShop(false);
    setEditMode(true);
  }

  async function handleBuyTheme(themeId) {
    const t = ROOM_THEMES.find((x) => x.id === themeId);
    if (!t) return;
    const owned = home.purchasedThemes?.includes(themeId);
    if (!owned) {
      if (coin < t.cost) {
        alert("코인이 부족해요!");
        return;
      }
      onSpendCoins?.(t.cost);
    }
    await patchHome((h) => ({
      ...h,
      themeId,
      purchasedThemes: owned
        ? h.purchasedThemes
        : [...(h.purchasedThemes ?? []), themeId],
    }));
    setShowThemeModal(false);
  }

  function getRoomPos(e) {
    const rect = roomRef.current?.getBoundingClientRect();
    if (!rect) return { x: 50, y: 50 };
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(15, Math.min(90, y)),
    };
  }

  function handleRoomClick(e) {
    if (!editMode) return;
    if (!placingItem) return;
    if (dragging) return;

    const pos = getRoomPos(e);
    const newId = `furn_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 7)}`;
    patchHome((h) => ({
      ...h,
      furniture: [
        ...(h.furniture ?? []),
        { id: newId, itemId: placingItem, x: pos.x, y: pos.y, dir: "SW" },
      ],
    }));
    setPlacingItem(null);
  }

  function handleFurnitureMouseDown(e, furn) {
    if (!editMode) return;
    e.stopPropagation();
    setSelectedFurnId(furn.id);
    setPlacingItem(null);
    const pos = getRoomPos(e);
    setDragging({
      id: furn.id,
      startX: pos.x,
      startY: pos.y,
      origX: furn.x,
      origY: furn.y,
      moved: false,
    });
  }

  useEffect(() => {
    if (!dragging) return;

    function handleMove(e) {
      if (e.cancelable) e.preventDefault();
      const pos = getRoomPos(e);
      const dx = pos.x - dragging.startX;
      const dy = pos.y - dragging.startY;
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        dragging.moved = true;
      }
      const newX = Math.max(5, Math.min(95, dragging.origX + dx));
      const newY = Math.max(10, Math.min(90, dragging.origY + dy));

      setHome((h) => ({
        ...h,
        furniture: h.furniture.map((f) =>
          f.id === dragging.id ? { ...f, x: newX, y: newY } : f
        ),
      }));
    }

    function handleUp() {
      setDragging(null);
      // 드래그 끝나면 저장
      if (home) saveMyHome(nickname, home);
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  function handleRotate() {
    if (!selectedFurnId) return;
    const dirs = ["SW", "SE", "NE", "NW"];
    patchHome((h) => ({
      ...h,
      furniture: h.furniture.map((f) => {
        if (f.id !== selectedFurnId) return f;
        const curIdx = dirs.indexOf(f.dir ?? "SW");
        return { ...f, dir: dirs[(curIdx + 1) % 4] };
      }),
    }));
  }

  function handleStore() {
    if (!selectedFurnId) return;
    if (!window.confirm("이 가구를 창고로 옮길까요?")) return;
    patchHome((h) => ({
      ...h,
      furniture: h.furniture.filter((f) => f.id !== selectedFurnId),
    }));
    setSelectedFurnId(null);
  }

  function handlePlaceFromInventory(itemId) {
    setPlacingItem(itemId);
    setSelectedFurnId(null);
  }

  if (loading || !home)
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#1a1a2e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 16,
          zIndex: 9999,
        }}
      >
        🏠 마이홈 불러오는 중...
      </div>
    );

  const selectedFurn = home.furniture?.find((f) => f.id === selectedFurnId);

  const placedIds = (home.furniture ?? []).map((f) => f.itemId);
  const inventoryCounts = {};
  (home.purchasedFurniture ?? []).forEach((id) => {
    inventoryCounts[id] = (inventoryCounts[id] ?? 0) + 1;
  });
  placedIds.forEach((id) => {
    if (inventoryCounts[id]) inventoryCounts[id]--;
  });
  const inventory = Object.entries(inventoryCounts)
    .filter(([, n]) => n > 0)
    .map(([id, n]) => ({ itemId: id, count: n, info: getFurnitureInfo(id) }))
    .filter((x) => x.info);

  const isDark = theme.id === "dark";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: theme.bg,
        display: "flex",
        flexDirection: "column",
        zIndex: 9999,
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: isDark ? "#fff" : "#222",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.5)",
          backdropFilter: "blur(8px)",
          borderBottom: isDark
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            width: 32,
            height: 32,
            borderRadius: 99,
            border: "none",
            background: "rgba(0,0,0,0.1)",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          ←
        </button>
        <div style={{ flex: 1, fontWeight: 800, fontSize: 15 }}>
          🏠 {nickname}의 마이홈
        </div>
        <div
          style={{
            padding: "4px 10px",
            background: "rgba(255,215,0,0.2)",
            border: "1px solid rgba(255,215,0,0.4)",
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 800,
            color: "#B8860B",
          }}
        >
          🪙 {coin?.toLocaleString() ?? 0}
        </div>
      </div>

      {/* 방 */}
      <div
        ref={roomRef}
        onClick={handleRoomClick}
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          background: `
            linear-gradient(180deg, ${theme.wall} 0%, ${theme.wall} 30%, ${theme.floor1} 30%, ${theme.floor2} 100%)
          `,
          cursor: placingItem ? "crosshair" : "default",
        }}
      >
        {/* 벽-바닥 경계선 */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: 0,
            right: 0,
            height: 2,
            background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
            pointerEvents: "none",
          }}
        />

        {/* 바닥 텍스처 (은은한 점 패턴) */}
        <svg
          style={{
            position: "absolute",
            top: "30%",
            left: 0,
            width: "100%",
            height: "70%",
            pointerEvents: "none",
            opacity: 0.25,
          }}
        >
          <defs>
            <pattern
              id="floorDots"
              x="0"
              y="0"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="16" cy="16" r="1" fill={theme.floor2} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#floorDots)" />
        </svg>

        {/* 가구 + 포켓몬 */}
        {(() => {
          const POKE_POSITIONS = [
            { x: 35, y: 50 },
            { x: 65, y: 50 },
            { x: 20, y: 70 },
            { x: 50, y: 70 },
            { x: 80, y: 70 },
            { x: 50, y: 85 },
          ];

          const entries = [
            ...(home.furniture ?? []).map((f) => {
              const info = getFurnitureInfo(f.itemId);
              const isRug = info?.category === "rug";
              return {
                type: "furn",
                data: f,
                sort: isRug ? -1000 : f.y,
              };
            }),
            ...(home.slots ?? []).map((s) => {
              const pos = POKE_POSITIONS[s.spotIdx ?? 0] ?? POKE_POSITIONS[0];
              return {
                type: "poke",
                data: s,
                pos,
                sort: pos.y + 0.5,
              };
            }),
          ];

          return entries
            .sort((a, b) => a.sort - b.sort)
            .map((entry) => {
              if (entry.type === "furn") {
                const f = entry.data;
                const info = getFurnitureInfo(f.itemId);
                if (!info) return null;
                const isRug = info.category === "rug";
                const baseSize = 110;
                const sizeMult = Math.max(info.w, info.h);
                const size = baseSize * (0.7 + sizeMult * 0.25);

                return (
                  <img
                    key={f.id}
                    src={getFurnitureUrl(f.itemId, f.dir ?? "SW")}
                    alt=""
                    draggable={false}
                    onMouseDown={(e) => handleFurnitureMouseDown(e, f)}
                    onTouchStart={(e) => handleFurnitureMouseDown(e, f)}
                    onClick={(e) => {
                      if (editMode) {
                        e.stopPropagation();
                        if (!dragging?.moved) {
                          setSelectedFurnId(
                            selectedFurnId === f.id ? null : f.id
                          );
                        }
                      }
                    }}
                    style={{
                      position: "absolute",
                      left: `${f.x}%`,
                      top: `${f.y}%`,
                      width: size,
                      height: size,
                      objectFit: "contain",
                      transform: "translate(-50%, -65%)",
                      pointerEvents: editMode ? "auto" : "none",
                      cursor: editMode ? "move" : "default",
                      userSelect: "none",
                      opacity: isRug ? 0.85 : 1,
                      filter:
                        selectedFurnId === f.id
                          ? "drop-shadow(0 0 10px #4a7bec) brightness(1.1)"
                          : "drop-shadow(0 6px 8px rgba(0,0,0,0.25))",
                      transition:
                        dragging?.id === f.id ? "none" : "filter 0.2s",
                      touchAction: "none",
                      zIndex: dragging?.id === f.id ? 999 : "auto",
                    }}
                  />
                );
              } else {
                const s = entry.data;
                const pos = entry.pos;
                return (
                  <div
                    key={s.pokeId}
                    onClick={(e) => {
                      if (editMode) return;
                      e.stopPropagation();
                      setShowPokeModal(s.pokeId);
                    }}
                    style={{
                      position: "absolute",
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      transform: "translate(-50%, -50%)",
                      pointerEvents: editMode ? "none" : "auto",
                      cursor: editMode ? "default" : "pointer",
                      opacity: editMode ? 0.3 : 1,
                      transition: "opacity 0.2s",
                      textAlign: "center",
                    }}
                  >
                    <img
                      src={getPokemonGif(s.pokeId)}
                      alt={getDisplayName(s)}
                      draggable={false}
                      style={{
                        width: 56,
                        height: 56,
                        objectFit: "contain",
                        imageRendering: "pixelated",
                        filter: "drop-shadow(0 4px 4px rgba(0,0,0,0.3))",
                        userSelect: "none",
                      }}
                    />
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        background: "rgba(0,0,0,0.65)",
                        color: "#fff",
                        padding: "2px 8px",
                        borderRadius: 99,
                        marginTop: 2,
                        whiteSpace: "nowrap",
                        display: "inline-block",
                      }}
                    >
                      {getDisplayName(s)}
                    </div>
                  </div>
                );
              }
            });
        })()}

        {/* 가이드 메시지 */}
        {editMode && placingItem && (
          <div
            style={{
              position: "absolute",
              top: 16,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(74,123,236,0.95)",
              color: "#fff",
              padding: "10px 18px",
              borderRadius: 99,
              fontSize: 13,
              fontWeight: 700,
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              pointerEvents: "none",
            }}
          >
            📍 원하는 곳을 탭해서 놓으세요
          </div>
        )}
        {editMode && selectedFurnId && !placingItem && (
          <div
            style={{
              position: "absolute",
              top: 16,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(40,40,50,0.95)",
              color: "#fff",
              padding: "8px 14px",
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              gap: 8,
              alignItems: "center",
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            }}
          >
            <span>{getFurnitureInfo(selectedFurn?.itemId)?.name ?? ""}</span>
            <button onClick={handleRotate} style={miniBtn("#4a7bec")}>
              🔄 회전
            </button>
            <button onClick={handleStore} style={miniBtn("#f87171")}>
              📦 창고
            </button>
          </div>
        )}

        {editMode && !placingItem && !selectedFurnId && (
          <div
            style={{
              position: "absolute",
              top: 16,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(16,185,129,0.95)",
              color: "#fff",
              padding: "8px 14px",
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 700,
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              pointerEvents: "none",
            }}
          >
            ✋ 가구를 드래그해서 옮기거나, 탭해서 선택하세요
          </div>
        )}
      </div>

      {/* 하단 바 */}
      <div
        style={{
          padding: "10px 14px",
          background: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.7)",
          backdropFilter: "blur(10px)",
          borderTop: isDark
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {editMode && inventory.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 6,
              overflowX: "auto",
              padding: "4px 0",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: isDark ? "#aaa" : "#666",
                flexShrink: 0,
                padding: "4px 2px",
              }}
            >
              창고:
            </div>
            {inventory.map(({ itemId, count, info }) => (
              <button
                key={itemId}
                onClick={() => handlePlaceFromInventory(itemId)}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 10px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.15)",
                  background:
                    placingItem === itemId
                      ? "#4a7bec"
                      : isDark
                      ? "rgba(255,255,255,0.1)"
                      : "#fff",
                  color: placingItem === itemId ? "#fff" : "inherit",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <img
                  src={getFurnitureUrl(itemId, "SW")}
                  alt=""
                  style={{ width: 24, height: 24, objectFit: "contain" }}
                />
                {info.name}
                {count > 1 && ` ×${count}`}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          {!editMode ? (
            <>
              <button
                onClick={() => setEditMode(true)}
                style={actionBtn("#4a7bec")}
              >
                ✏️ 편집
              </button>
              <button
                onClick={() => setShowShop(true)}
                style={actionBtn("#10b981")}
              >
                🛒 가구
              </button>
              <button
                onClick={() => setShowThemeModal(true)}
                style={actionBtn("#8b5cf6")}
              >
                🎨 테마
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setEditMode(false);
                setSelectedFurnId(null);
                setPlacingItem(null);
              }}
              style={actionBtn("#f59e0b")}
            >
              ✓ 편집 완료
            </button>
          )}
        </div>
      </div>

      {/* 모달 */}
      {showShop && (
        <FurnitureShop
          onClose={() => setShowShop(false)}
          coin={coin}
          purchasedFurniture={home.purchasedFurniture ?? []}
          onBuy={handleBuyFurniture}
        />
      )}

      {showThemeModal && (
        <ThemeModal
          currentThemeId={home.themeId}
          purchasedThemes={home.purchasedThemes ?? []}
          coin={coin}
          onPick={handleBuyTheme}
          onClose={() => setShowThemeModal(false)}
        />
      )}

      {showPokeModal !== null && (
        <PokemonModal
          slot={home.slots?.find((s) => s.pokeId === showPokeModal)}
          coin={coin}
          onClose={() => setShowPokeModal(null)}
          onAction={async (type, payload) => {
            if (!home) return;
            let slots = home.slots;
            if (type === "tap") slots = tapSlot(slots, showPokeModal);
            else if (type === "feed") {
              const snack = SNACKS.find((s) => s.id === payload);
              if (snack && coin >= snack.cost) {
                onSpendCoins?.(snack.cost);
                slots = feedSlot(slots, showPokeModal, payload);
              }
            } else if (type === "bath") slots = bathSlot(slots, showPokeModal);
            else if (type === "rename")
              slots = renameSlot(slots, showPokeModal, payload);
            await patchHome({ slots });
          }}
        />
      )}
    </div>
  );
}

function ThemeModal({
  currentThemeId,
  purchasedThemes,
  coin,
  onPick,
  onClose,
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 20,
          maxWidth: 360,
          width: "100%",
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: 16,
            marginBottom: 14,
            textAlign: "center",
          }}
        >
          🎨 방 테마
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          {ROOM_THEMES.map((t) => {
            const owned = purchasedThemes.includes(t.id);
            const current = currentThemeId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onPick(t.id)}
                disabled={!owned && coin < t.cost}
                style={{
                  padding: 10,
                  borderRadius: 12,
                  border: current
                    ? "2px solid #4a7bec"
                    : "1px solid rgba(0,0,0,0.1)",
                  background: t.bg,
                  cursor: !owned && coin < t.cost ? "not-allowed" : "pointer",
                  opacity: !owned && coin < t.cost ? 0.5 : 1,
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 20,
                      height: 10,
                      background: t.floor1,
                      borderRadius: 2,
                    }}
                  />
                  <div
                    style={{
                      width: 20,
                      height: 10,
                      background: t.floor2,
                      borderRadius: 2,
                    }}
                  />
                </div>
                <div style={{ fontWeight: 800, fontSize: 13 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
                  {current ? "✓ 사용 중" : owned ? "보유" : `🪙 ${t.cost}`}
                </div>
              </button>
            );
          })}
        </div>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            marginTop: 14,
            padding: 10,
            borderRadius: 10,
            border: "none",
            background: "#f0f0f0",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}

function PokemonModal({ slot, coin, onAction, onClose }) {
  const [tab, setTab] = useState("main");
  const [nickInput, setNickInput] = useState(slot?.nickname ?? "");

  if (!slot) return null;

  const lvl = getAffinityLevel(slot.affinity);
  const today = new Date().toDateString();
  const canTap = slot.lastTapDate !== today || (slot.tapCount ?? 0) < TAP_DAILY;
  const canBath = slot.lastBathDate !== today;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "16px 16px 0 0",
          padding: 16,
          width: "100%",
          maxWidth: 420,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <img
            src={getPokemonGif(slot.pokeId)}
            alt=""
            style={{ width: 60, height: 60, imageRendering: "pixelated" }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>
              {getDisplayName(slot)}
            </div>
            <div style={{ fontSize: 11, color: lvl.color, fontWeight: 700 }}>
              {lvl.icon} {lvl.name} · 친밀도 {slot.affinity}/100
            </div>
            <div
              style={{
                marginTop: 6,
                height: 6,
                background: "#f0f0f0",
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${slot.affinity}%`,
                  height: "100%",
                  background: lvl.color,
                }}
              />
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              border: "none",
              background: "#f0f0f0",
              borderRadius: 99,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {[
            ["main", "🎮 놀기"],
            ["feed", "🍓 간식"],
            ["rename", "✏️ 이름"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                flex: 1,
                padding: "6px 8px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.1)",
                background: tab === id ? "#4a7bec" : "#f5f5f5",
                color: tab === id ? "#fff" : "#333",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "main" && (
          <div style={{ display: "grid", gap: 8 }}>
            <button
              onClick={() => onAction("tap")}
              disabled={!canTap}
              style={{
                padding: "10px",
                borderRadius: 10,
                border: "none",
                background: canTap ? "#4a7bec" : "#ccc",
                color: "#fff",
                fontWeight: 700,
                cursor: canTap ? "pointer" : "not-allowed",
              }}
            >
              👋 쓰다듬기 (+3) {!canTap && "· 오늘 끝"}
              {canTap && ` · ${TAP_DAILY - (slot.tapCount ?? 0)}회 남음`}
            </button>
            <button
              onClick={() => onAction("bath")}
              disabled={!canBath}
              style={{
                padding: "10px",
                borderRadius: 10,
                border: "none",
                background: canBath ? "#10b981" : "#ccc",
                color: "#fff",
                fontWeight: 700,
                cursor: canBath ? "pointer" : "not-allowed",
              }}
            >
              🛁 씻기기 (+8) {!canBath && "· 오늘 완료"}
            </button>
          </div>
        )}

        {tab === "feed" && (
          <div style={{ display: "grid", gap: 8 }}>
            {SNACKS.map((s) => (
              <button
                key={s.id}
                onClick={() => onAction("feed", s.id)}
                disabled={coin < s.cost}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.1)",
                  background: coin >= s.cost ? "#fff" : "#f5f5f5",
                  cursor: coin >= s.cost ? "pointer" : "not-allowed",
                  opacity: coin >= s.cost ? 1 : 0.5,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                <span>
                  {s.emoji} {s.name} · +{s.aff} 친밀도
                </span>
                <span style={{ color: "#B8860B" }}>🪙 {s.cost}</span>
              </button>
            ))}
          </div>
        )}

        {tab === "rename" && (
          <div>
            <input
              value={nickInput}
              onChange={(e) => setNickInput(e.target.value)}
              placeholder="별명 (최대 10자)"
              maxLength={10}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: 13,
                boxSizing: "border-box",
                marginBottom: 8,
              }}
            />
            <button
              onClick={() => {
                onAction("rename", nickInput);
                onClose();
              }}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 10,
                border: "none",
                background: "#4a7bec",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              저장
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function actionBtn(color) {
  return {
    flex: 1,
    padding: "10px",
    borderRadius: 12,
    border: "none",
    background: color,
    color: "#fff",
    fontWeight: 800,
    fontSize: 13,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  };
}

function miniBtn(color = "#4a7bec") {
  return {
    padding: "4px 10px",
    background: color,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  };
}
