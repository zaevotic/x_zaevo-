import React, { useId } from "react";

interface ZaevoLogoProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function ZaevoLogo({
  size = 16,
  className = "",
  style,
}: ZaevoLogoProps) {
  const uid = useId();
  const gradId = `zaevo-gem-${uid}`;
  const isSmall = size < 48;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      style={{
        filter: isSmall
          ? "drop-shadow(0 0 8px var(--red-ember))"
          : "drop-shadow(0 0 12px rgba(182, 24, 43, 0.25))",
        ...style,
      }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff2a3d" />
          <stop offset="1" stopColor="#b3101f" />
        </linearGradient>
      </defs>

      {/* corner brackets */}
      <g
        fill="none"
        stroke="#5a141a"
        strokeWidth={isSmall ? "1.5" : "6"}
        strokeLinecap="square"
      >
        <path
          d="M40 92V40h52"
          vectorEffect={isSmall ? "non-scaling-stroke" : undefined}
        />
        <path
          d="M420 40h52v52"
          vectorEffect={isSmall ? "non-scaling-stroke" : undefined}
        />
        <path
          d="M472 420v52h-52"
          vectorEffect={isSmall ? "non-scaling-stroke" : undefined}
        />
        <path
          d="M92 472H40v-52"
          vectorEffect={isSmall ? "non-scaling-stroke" : undefined}
        />
      </g>

      {/* diamond */}
      <polygon points="256,56 456,256 256,456 56,256" fill={`url(#${gradId})`} />
      <polygon
        points="256,80 432,256 256,432 80,256"
        fill="none"
        stroke="#080404"
        strokeOpacity="0.35"
        strokeWidth={isSmall ? "1" : "3"}
        vectorEffect={isSmall ? "non-scaling-stroke" : undefined}
      />

      {/* Z cut-out */}
      <polygon
        fill="#080404"
        points="186,196 326,196 326,230 240,282 326,282 326,316 186,316 186,282 272,230 186,230"
      />
    </svg>
  );
}

