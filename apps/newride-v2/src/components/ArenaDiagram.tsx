import { useId } from "react";
export function ArenaDiagram({
  variant = "circle",
  compact = false,
}: {
  variant?: "circle" | "transition" | "line";
  compact?: boolean;
}) {
  const id = useId().replaceAll(":", "");
  return (
    <svg
      className={`arena-diagram ${compact ? "compact" : ""}`}
      viewBox="0 0 340 190"
      role="img"
      aria-label={
        variant === "circle"
          ? "Schéma : grande courbe dans une carrière"
          : variant === "line"
            ? "Schéma : ligne diagonale et grande courbe"
            : "Schéma : transitions sur une grande ligne"
      }
    >
      <defs>
        <pattern
          id={`grid-${id}`}
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r=".7" fill="#bbc8b6" />
        </pattern>
        <marker
          id={`arrow-${id}`}
          markerWidth="6"
          markerHeight="6"
          refX="4"
          refY="3"
          orient="auto"
        >
          <path
            d="M0 0L5 3L0 6"
            fill="none"
            stroke="#365c47"
            strokeWidth="1.3"
          />
        </marker>
      </defs>
      <rect
        x="35"
        y="20"
        width="270"
        height="150"
        rx="14"
        fill={`url(#grid-${id})`}
        stroke="#bdcbb7"
      />
      <rect
        x="45"
        y="30"
        width="250"
        height="130"
        rx="9"
        fill="none"
        stroke="#d0dbcb"
        strokeDasharray="4 5"
      />
      {variant === "circle" ? (
        <>
          <path
            d="M90 95C90 36 250 36 250 95S90 154 90 95"
            fill="none"
            stroke="#365c47"
            strokeWidth="2"
            strokeDasharray="6 5"
          />
          <path
            d="M247 77Q252 92 248 110"
            fill="none"
            stroke="#365c47"
            strokeWidth="2"
            markerEnd={`url(#arrow-${id})`}
          />
        </>
      ) : variant === "line" ? (
        <path
          d="M63 148L274 43Q294 40 285 70L65 146"
          fill="none"
          stroke="#365c47"
          strokeWidth="2"
          strokeDasharray="6 5"
          markerEnd={`url(#arrow-${id})`}
        />
      ) : (
        <>
          <path
            d="M64 95H276"
            stroke="#365c47"
            strokeWidth="2"
            strokeDasharray="6 5"
            markerEnd={`url(#arrow-${id})`}
          />
          <circle cx="125" cy="95" r="6" fill="#ff6746" />
          <circle cx="215" cy="95" r="6" fill="#ff6746" />
        </>
      )}
      <g fill="#6c7e66" fontSize="9" fontFamily="Inter,sans-serif">
        <text x="16" y="98">
          A
        </text>
        <text x="318" y="98">
          C
        </text>
        <text x="168" y="13">
          E
        </text>
        <text x="168" y="184">
          B
        </text>
      </g>
      <circle
        cx={variant === "circle" ? 90 : 64}
        cy="95"
        r="7"
        fill="#365c47"
        stroke="#fff"
        strokeWidth="3"
      />
    </svg>
  );
}
