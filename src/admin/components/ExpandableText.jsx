import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

function ExpandableText({ text }) {
  const [expanded, setExpanded] = useState(false);
  const [height, setHeight] = useState("22px");

  const contentRef = useRef(null);

  useEffect(() => {
    if (!contentRef.current) return;

    if (expanded) {
      setHeight(contentRef.current.scrollHeight + "px");
    } else {
      setHeight("22px"); // collapsed one-line height
    }
  }, [expanded, text]);

  return (
    <div className="flex items-start gap-2">
      {/* TEXT CONTAINER */}
      <div
        style={{ maxHeight: height }}
        className="flex-1 overflow-hidden transition-[max-height] duration-700 ease-in-out"
      >
        <p
          ref={contentRef}
          className="text-sm leading-[22px] text-gray-500 dark:text-gray-400"
        >
          {text || "No description"}
        </p>
      </div>

      {/* ARROW BUTTON */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex-shrink-0 mt-[2px]"
      >
        <ChevronDown
          size={16}
          className={`transition-transform duration-500 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>
    </div>
  );
}

export default ExpandableText;
