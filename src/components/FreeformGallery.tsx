// FreeformGallery.tsx
// 자유 배치 드래그 이미지 갤러리 — 레퍼런스 스타일 재구현
import img1 from "@/assets/gallery-1.jpg";
import img2 from "@/assets/gallery-2.webp";
import img3 from "@/assets/gallery-3.jpg";
import img4 from "@/assets/gallery-4.jpg";
import img5 from "@/assets/gallery-5.jpg";

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  startTransition,
} from "react";

// ─── 타입 ───────────────────────────────────────────────────────────────────
interface ImageItem {
  src: string;
  alt?: string;
  width: number;   // 표시 너비 (px)
  height: number;  // 표시 높이 (px)
  x: number;       // 캔버스 상 절대 x 위치
  y: number;       // 캔버스 상 절대 y 위치
  rotation: number; // 회전 (deg)
}

interface FreeformGalleryProps {
  images?: ImageItem[];
  backgroundColor?: string;
  cornerFrameColor?: string;
  showLabels?: boolean;
}

// ─── 기본 이미지 10개 ────────────────────────────────────────────────────────
// 다양한 비율: 세로형 / 정사각형 / 가로형 혼합
// 실제 이미지는 Framer gradient 샘플 사용 (추후 교체)
// 이미지 좌표는 캔버스 원점 기준 (화면 중앙 = pan 초기값으로 오프셋됨)
// 화면 중앙을 (0,0)으로 볼 때의 상대 좌표 — 넓게 분산
const IMAGES: ImageItem[] = [
  // 좌상단 — 세로 tall (tube solo)
  {
    src: img1,
    alt: "Product 1",
    width: 220, height: 300,
    x: -720, y: -340,
    rotation: -2.5,
  },
  // 상단 중앙 왼쪽 — 정사각형 (floating product)
  {
    src: img2,
    alt: "Product 2",
    width: 260, height: 260,
    x: -240, y: -400,
    rotation: 1.8,
  },
  // 상단 중앙 — 가로 와이드 (bodywash softfocus)
  {
    src: img3,
    alt: "Product 3",
    width: 340, height: 240,
    x: 80, y: -360,
    rotation: -1.2,
  },
  // 우상단 — 세로 tall (glass perfume)
  {
    src: img4,
    alt: "Product 4",
    width: 200, height: 290,
    x: 500, y: -300,
    rotation: 2.0,
  },
  // 좌중단 — 가로 (necessaire)
  {
    src: img5,
    alt: "Product 5",
    width: 310, height: 220,
    x: -780, y: 60,
    rotation: -2.8,
  },
  // 좌중단 — 세로 (tube solo 2)
  {
    src: img1,
    alt: "Product 1b",
    width: 200, height: 290,
    x: -360, y: 80,
    rotation: 1.5,
  },
  // 중앙 — 정사각형 (floating product 2)
  {
    src: img2,
    alt: "Product 2b",
    width: 250, height: 250,
    x: 40, y: 110,
    rotation: -0.8,
  },
  // 우중단 — 가로 (bodywash 2)
  {
    src: img3,
    alt: "Product 3b",
    width: 300, height: 200,
    x: 440, y: 60,
    rotation: 2.5,
  },
  // 좌하단 — 세로 (glass perfume 2)
  {
    src: img4,
    alt: "Product 4b",
    width: 210, height: 300,
    x: -600, y: 390,
    rotation: -1.5,
  },
  // 하단 중앙 — 정사각형 (necessaire 2)
  {
    src: img5,
    alt: "Product 5b",
    width: 270, height: 190,
    x: 120, y: 420,
    rotation: 3.0,
  },
];

// ─── 코너 프레임 ─────────────────────────────────────────────────────────────
function CornerFrame({ color }: { color: string }) {
  const s = 6;
  const base: React.CSSProperties = {
    position: "absolute",
    width: s,
    height: s,
    backgroundColor: color,
    borderRadius: 0,
  };
  return (
    <>
      <div style={{ ...base, top: 0, left: 0 }} />
      <div style={{ ...base, top: 0, right: 0 }} />
      <div style={{ ...base, bottom: 0, left: 0 }} />
      <div style={{ ...base, bottom: 0, right: 0 }} />
    </>
  );
}

// ─── 이미지 카드 ─────────────────────────────────────────────────────────────
interface CardProps {
  item: ImageItem;
  index: number;
  isHovered: boolean;
  cornerFrameColor: string;
  onEnter: () => void;
  onLeave: () => void;
}

function ImageCard({ item, index, isHovered, cornerFrameColor, onEnter, onLeave }: CardProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        position: "absolute",
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        transform: isHovered
          ? `rotate(${item.rotation}deg) scale(1.03)`
          : `rotate(${item.rotation}deg) scale(1)`,
        transition: isHovered
          ? "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease"
          : "transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s ease",
        boxShadow: isHovered
          ? "0 24px 60px rgba(0,0,0,0.55)"
          : "0 8px 32px rgba(0,0,0,0.35)",
        zIndex: isHovered ? 20 : 1,
        cursor: "grab",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      {/* 로딩 스켈레톤 */}
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,255,255,0.05)",
            borderRadius: 4,
          }}
        />
      )}
      <img
        src={item.src}
        alt={item.alt || ""}
        draggable={false}
        onLoad={() => setLoaded(true)}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: 4,
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.4s ease",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
      <CornerFrame color={cornerFrameColor} />
    </div>
  );
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────────────────────
export default function FreeformGallery({
  images = IMAGES,
  backgroundColor = "#000000",
  cornerFrameColor = "rgba(255,255,255,0.3)",
  showLabels = false,
}: FreeformGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0 });
  const containerSizeRef = useRef({ width: 800, height: 600 });
  const isDragging = useRef(false);
  const didDrag = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });
  const lastTime = useRef(0);
  const velocity = useRef({ x: 0, y: 0 });
  const momentumRaf = useRef<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  // 이미지 군집 바운딩박스 계산 (패딩 포함)
  const CANVAS_PAD = 160; // 이미지 끝에서 얼마나 더 나갈 수 있는지 (px)
  const canvasBounds = useCallback((cW: number, cH: number) => {
    // images 배열 기준 최소/최대 좌표
    const xs = images.map((img) => img.x);
    const ys = images.map((img) => img.y);
    const ws = images.map((img) => img.width);
    const hs = images.map((img) => img.height);
    const minX = Math.min(...xs) - CANVAS_PAD;
    const maxX = Math.max(...xs.map((x, i) => x + ws[i])) + CANVAS_PAD;
    const minY = Math.min(...ys) - CANVAS_PAD;
    const maxY = Math.max(...ys.map((y, i) => y + hs[i])) + CANVAS_PAD;
    // pan 범위: 화면 오른쪽 끝이 캔버스 minX에 닿는 지점 ~ 화면 왼쪽 끝이 캔버스 maxX에 닿는 지점
    return {
      minPanX: cW - maxX,
      maxPanX: -minX,
      minPanY: cH - maxY,
      maxPanY: -minY,
    };
  }, [images]);

  const clampPan = useCallback((x: number, y: number) => {
    const { width: cW, height: cH } = containerSizeRef.current;
    const { minPanX, maxPanX, minPanY, maxPanY } = canvasBounds(cW, cH);
    return {
      x: Math.min(Math.max(x, minPanX), maxPanX),
      y: Math.min(Math.max(y, minPanY), maxPanY),
    };
  }, [canvasBounds]);

  // 컨테이너 크기 감지 — 초기 pan을 중앙으로
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      containerSizeRef.current = { width, height };
      setContainerSize({ width, height });
      // 이미지 군집 중심이 화면 중앙에 오도록 초기 오프셋
      const initX = width / 2 + 30;
      const initY = height / 2 - 60;
      const clamped = clampPan(initX, initY);
      panRef.current = clamped;
      setPan(clamped);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [clampPan]);

  // 모멘텀
  const applyMomentum = useCallback(() => {
    const FRICTION = 0.92;
    const tick = () => {
      velocity.current.x *= FRICTION;
      velocity.current.y *= FRICTION;
      if (Math.abs(velocity.current.x) < 0.15 && Math.abs(velocity.current.y) < 0.15) return;
      const next = clampPan(
        panRef.current.x + velocity.current.x,
        panRef.current.y + velocity.current.y,
      );
      // 경계에 닿으면 해당 축 속도를 죽여 튕기지 않게
      if (next.x === panRef.current.x) velocity.current.x = 0;
      if (next.y === panRef.current.y) velocity.current.y = 0;
      panRef.current = next;
      startTransition(() => setPan({ ...panRef.current }));
      if (Math.abs(velocity.current.x) > 0.15 || Math.abs(velocity.current.y) > 0.15) {
        momentumRaf.current = requestAnimationFrame(tick);
      }
    };
    momentumRaf.current = requestAnimationFrame(tick);
  }, [clampPan]);

  // 포인터 이벤트
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (momentumRaf.current) cancelAnimationFrame(momentumRaf.current);
    isDragging.current = true;
    didDrag.current = false;
    dragStart.current = { x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y };
    lastPos.current = { x: e.clientX, y: e.clientY };
    lastTime.current = Date.now();
    velocity.current = { x: 0, y: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) didDrag.current = true;
    const now = Date.now();
    const dt = now - lastTime.current;
    if (dt > 0) {
      velocity.current = { x: dx / dt * 16, y: dy / dt * 16 };
    }
    lastPos.current = { x: e.clientX, y: e.clientY };
    lastTime.current = now;
    const next = clampPan(
      e.clientX - dragStart.current.x,
      e.clientY - dragStart.current.y,
    );
    panRef.current = next;
    startTransition(() => setPan({ ...panRef.current }));
  }, [clampPan]);

  const onPointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    applyMomentum();
  }, [applyMomentum]);

  // 휠 스크롤
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (momentumRaf.current) cancelAnimationFrame(momentumRaf.current);
      const next = clampPan(panRef.current.x - e.deltaX, panRef.current.y - e.deltaY);
      panRef.current = next;
      startTransition(() => setPan({ ...panRef.current }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // 터치
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (momentumRaf.current) cancelAnimationFrame(momentumRaf.current);
    const t = e.touches[0];
    isDragging.current = true;
    didDrag.current = false;
    dragStart.current = { x: t.clientX - panRef.current.x, y: t.clientY - panRef.current.y };
    lastPos.current = { x: t.clientX, y: t.clientY };
    lastTime.current = Date.now();
    velocity.current = { x: 0, y: 0 };
    touchStart.current = { x: t.clientX, y: t.clientY };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const t = e.touches[0];
    const now = Date.now();
    const dt = now - lastTime.current;
    if (dt > 0) {
      velocity.current = {
        x: (t.clientX - lastPos.current.x) / dt * 16,
        y: (t.clientY - lastPos.current.y) / dt * 16,
      };
    }
    lastPos.current = { x: t.clientX, y: t.clientY };
    lastTime.current = now;
    const next = clampPan(
      t.clientX - dragStart.current.x,
      t.clientY - dragStart.current.y,
    );
    panRef.current = next;
    startTransition(() => setPan({ ...panRef.current }));
  }, [clampPan]);

  const onTouchEnd = useCallback(() => {
    isDragging.current = false;
    applyMomentum();
    touchStart.current = null;
  }, [applyMomentum]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor,
        overflow: "hidden",
        position: "relative",
        touchAction: "none",
        cursor: isDragging.current ? "grabbing" : "grab",
      }}
    >
      <div
        ref={containerRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* 캔버스 레이어 */}
        <div
          style={{
            position: "absolute",
            left: pan.x,
            top: pan.y,
            willChange: "transform",
          }}
        >
          {images.map((item, i) => (
            <ImageCard
              key={i}
              item={item}
              index={i}
              isHovered={hoveredIndex === i}
              cornerFrameColor={cornerFrameColor}
              onEnter={() => setHoveredIndex(i)}
              onLeave={() => setHoveredIndex(null)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
