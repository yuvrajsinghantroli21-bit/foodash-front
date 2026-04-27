import { useRef, useState } from "react";

export default function AddToCartButton({
  item,
  qty,
  isAvailable,
  addToCart,
  removeItem,
}) {
  const pillRef = useRef(null);

  const [sliding, setSliding] = useState(false);
  const [returning, setReturning] = useState(false);

  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(4);

  const isStepperMode = qty > 0;

  const getCircleRight = () => {
    if (!pillRef.current) return 999;
    return pillRef.current.offsetWidth - 40;
  };

  const circleRight = getCircleRight();

  /* ───────────────── Add ───────────────── */
  const finishAdd = () => {
    setSliding(true);
    setDragX(circleRight);

    setTimeout(() => {
      addToCart(item);
      setSliding(false);
      setDragging(false);
      setDragX(4);
    }, 600);
  };

  const handleAdd = () => {
    if (isStepperMode) {
      addToCart(item);
      return;
    }

    if (sliding || returning || dragging) return;

    finishAdd();
  };

  /* ───────────────── Minus ───────────────── */
  const handleMinus = (e) => {
    e.stopPropagation();

    if (sliding || returning || dragging) return;

    if (qty <= 1) {
      setReturning(true);

      setTimeout(() => {
        removeItem(item._id);
        setReturning(false);
      }, 600);
    } else {
      removeItem(item._id);
    }
  };

  /* ───────────────── Drag logic ───────────────── */
  const startDrag = (e) => {
    if (isStepperMode || sliding || returning) return;

    e.stopPropagation();
    setDragging(true);
  };

  const onDrag = (e) => {
    if (!dragging || !pillRef.current) return;

    const rect = pillRef.current.getBoundingClientRect();
    const pointerX = e.clientX ?? e.touches?.[0]?.clientX;

    let next = pointerX - rect.left - 18;
    next = Math.max(4, Math.min(next, circleRight));

    setDragX(next);
  };

  const endDrag = () => {
    if (!dragging) return;

    const progress = dragX / circleRight;

    if (progress >= 0.5) {
      finishAdd();
    } else {
      setDragging(false);
      setDragX(4);
    }
  };

  /* ───────────────── Unavailable ───────────────── */
  if (!isAvailable) {
    return (
      <button
        disabled
        className="w-full py-2.5 text-xs font-semibold text-gray-400 bg-gray-100 rounded-full cursor-not-allowed tracking-wide"
      >
        Currently Unavailable
      </button>
    );
  }

  /* ───────────────── Styles ───────────────── */
  const whiteMode = isStepperMode || sliding || dragging;

  const pillBg = whiteMode && !returning ? "#ffffff" : "#16a34a";
  const pillBorder = whiteMode && !returning ? "1.5px solid #111111" : "none";

  let circleLeft = 4;

  if (dragging) circleLeft = dragX;
  if (sliding) circleLeft = circleRight;
  if (isStepperMode && !returning) circleLeft = circleRight;
  if (returning) circleLeft = 4;

  const circleBg = whiteMode && !returning ? "#111111" : "#ffffff";
  const circleColor = whiteMode && !returning ? "#ffffff" : "#16a34a";

  const dragProgress = dragging ? dragX / circleRight : 0;
  const labelOpacity =
    sliding || isStepperMode || returning
      ? 0
      : dragging
        ? Math.max(0, 1 - dragProgress * 1.6)
        : 1;

  return (
    <div className="relative w-full" style={{ height: 44 }}>
      <button
        ref={pillRef}
        onClick={handleAdd}
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{
          borderRadius: 999,
          border: pillBorder,
          background: pillBg,
          cursor: "pointer",
          padding: 0,
          transition: dragging
            ? "none"
            : "background 0.55s cubic-bezier(0.22,1,0.36,1), border 0.55s",
        }}
      >
        {/* Add label */}
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingLeft: 40,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#ffffff",
            opacity: labelOpacity,
            transition: dragging ? "none" : "opacity 0.22s",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          Add to Cart
        </span>

        {/* Qty */}
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            fontWeight: 800,
            color: "#111111",
            opacity: isStepperMode && !returning ? 1 : 0,
            transition: "opacity 0.2s",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {qty}
        </span>

        {/* Draggable + knob */}
        <span
          onPointerDown={startDrag}
          onPointerMove={onDrag}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          style={{
            position: "absolute",
            top: 4,
            left: circleLeft,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: circleBg,
            color: circleColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            fontWeight: 700,
            lineHeight: 1,
            zIndex: 5,
            cursor: dragging ? "grabbing" : "grab",
            userSelect: "none",
            touchAction: "none",
            transition: dragging
              ? "none"
              : "left 0.58s cubic-bezier(0.22,1,0.36,1), background 0.55s, color 0.55s",
          }}
        >
          +
        </span>
      </button>

      {/* Minus */}
      {(isStepperMode || returning) && (
        <button
          onClick={handleMinus}
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#111111",
            color: "#ffffff",
            border: "none",
            cursor: "pointer",
            fontSize: 22,
            fontWeight: 700,

            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
            zIndex: 6,
            opacity: returning ? 0 : 1,
            transition: "opacity 0.2s",
          }}
        >
          −
        </button>
      )}
    </div>
  );
}
