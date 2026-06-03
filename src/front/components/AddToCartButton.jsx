import { useRef, useState } from "react";

export default function AddToCartButton({
  item,
  qty,
  isAvailable,
  addToCart,
  removeItem,
}) {
  const pillRef = useRef(null);
  const knobRef = useRef(null);

  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const dragXRef = useRef(4);
  const ignoreClickRef = useRef(false);

  const [sliding, setSliding] = useState(false);
  const [returning, setReturning] = useState(false);

  const isStepperMode = qty > 0;

  const getCircleRight = () => {
    if (!pillRef.current) return 4;
    return pillRef.current.offsetWidth - 40;
  };

  const moveKnob = (x, animate = false) => {
    if (!knobRef.current) return;

    knobRef.current.style.transition = animate
      ? "left 0.45s cubic-bezier(0.22,1,0.36,1), background 0.3s, color 0.3s"
      : "none";

    knobRef.current.style.left = `${x}px`;
  };

  const resetKnob = () => {
    dragXRef.current = 4;
    moveKnob(4, true);
  };

  const finishAdd = () => {
    if (sliding || returning) return;

    const right = getCircleRight();

    setSliding(true);
    dragXRef.current = right;
    moveKnob(right, true);

    setTimeout(() => {
      addToCart(item);
      setSliding(false);
      resetKnob();
    }, 420);
  };

  const handleButtonClick = (e) => {
    if (ignoreClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
      ignoreClickRef.current = false;
      return;
    }

    if (isStepperMode) {
      addToCart(item);
      return;
    }

    if (sliding || returning || draggingRef.current) return;

    finishAdd();
  };

  const handleKnobClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (movedRef.current) return;

    if (isStepperMode) {
      addToCart(item);
      return;
    }

    finishAdd();
  };

  const handleMinus = (e) => {
    e.stopPropagation();

    if (sliding || returning || draggingRef.current) return;

    if (qty <= 1) {
      setReturning(true);

      setTimeout(() => {
        removeItem(item._id);
        setReturning(false);
      }, 350);
    } else {
      removeItem(item._id);
    }
  };

  const startDrag = (e) => {
    if (isStepperMode || sliding || returning) return;

    e.preventDefault();
    e.stopPropagation();

    draggingRef.current = true;
    movedRef.current = false;

    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onDrag = (e) => {
    if (!draggingRef.current || !pillRef.current) return;

    const rect = pillRef.current.getBoundingClientRect();
    const right = getCircleRight();

    let next = e.clientX - rect.left - 18;
    next = Math.max(4, Math.min(next, right));

    if (Math.abs(next - dragXRef.current) > 3) {
      movedRef.current = true;
    }

    dragXRef.current = next;
    moveKnob(next, false);
  };

  const endDrag = (e) => {
    if (!draggingRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    draggingRef.current = false;

    const right = getCircleRight();
    const progress = dragXRef.current / right;

    ignoreClickRef.current = true;

    setTimeout(() => {
      ignoreClickRef.current = false;
      movedRef.current = false;
    }, 250);

    if (progress >= 0.45) {
      finishAdd();
    } else {
      resetKnob();
    }
  };

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

  const green = "#16a34a";
  const darkGreen = "#15803d";
  const softGreen = "#ecfdf5";

  const knobLeft = isStepperMode && !returning ? getCircleRight() : 4;

  return (
    <div className="relative w-full" style={{ height: 44 }}>
      <button
        ref={pillRef}
        type="button"
        onClick={handleButtonClick}
        className="absolute inset-0 w-full h-full overflow-hidden shadow-sm active:scale-[0.98]"
        style={{
          borderRadius: 999,
          border: `1.5px solid ${green}`,
          background: isStepperMode && !returning ? softGreen : green,
          cursor: "pointer",
          padding: 0,
          transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
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
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#ffffff",
            opacity: isStepperMode || sliding || returning ? 0 : 1,
            transition: "opacity 0.2s",
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
            fontWeight: 900,
            color: darkGreen,
            opacity: isStepperMode && !returning ? 1 : 0,
            transition: "opacity 0.2s",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {qty}
        </span>

        {/* Plus knob */}
        <span
          ref={knobRef}
          onClick={handleKnobClick}
          onPointerDown={startDrag}
          onPointerMove={onDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          style={{
            position: "absolute",
            top: 4,
            left: knobLeft,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: isStepperMode || sliding ? green : "#ffffff",
            color: isStepperMode || sliding ? "#ffffff" : green,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: 800,
            lineHeight: "36px",
            paddingBottom: 2,
            zIndex: 5,
            cursor: isStepperMode ? "pointer" : "grab",
            userSelect: "none",
            touchAction: "none",
            boxShadow: "0 8px 18px rgba(22,163,74,0.25)",
            transition:
              "left 0.45s cubic-bezier(0.22,1,0.36,1), background 0.3s, color 0.3s",
          }}
        >
          +
        </span>
      </button>

      {/* Minus */}
      {(isStepperMode || returning) && (
        <button
          type="button"
          onClick={handleMinus}
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: green,
            color: "#ffffff",
            border: "none",
            cursor: "pointer",
            fontSize: 24,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: "36px",
            paddingBottom: 3,
            zIndex: 6,
            opacity: returning ? 0 : 1,
            boxShadow: "0 8px 18px rgba(22,163,74,0.25)",
            transition: "opacity 0.2s",
          }}
        >
          −
        </button>
      )}
    </div>
  );
}
