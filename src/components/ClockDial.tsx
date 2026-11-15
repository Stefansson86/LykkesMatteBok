import { useRef } from 'react';

interface ClockDialProps {
  hour: number;
  minute: number;
  interactive?: boolean;
  minuteStep?: number;
  onSelectMinute?: (minute: number) => void;
}

const CLOCK_NUMBERS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const TICKS = Array.from({ length: 60 }, (_, i) => i);

export function ClockDial({
  hour,
  minute,
  interactive = false,
  minuteStep = 15,
  onSelectMinute,
}: ClockDialProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const draggingRef = useRef(false);

  const hourDegrees = (hour % 12) * 30 + minute * 0.5;
  const minuteDegrees = minute * 6;

  const updateFromPointer = (clientX: number, clientY: number) => {
    if (!interactive || !onSelectMinute || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 220 - 110;
    const y = ((clientY - rect.top) / rect.height) * 220 - 110;
    if (Math.hypot(x, y) < 16) return;

    let deg = (Math.atan2(x, -y) * 180) / Math.PI;
    if (deg < 0) deg += 360;

    const rawMin = Math.round(deg / 6) % 60;
    const snapped = (Math.round(rawMin / minuteStep) * minuteStep) % 60;
    onSelectMinute(snapped);
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 220 220"
      width="200"
      height="200"
      className={`clock-svg ${interactive ? 'is-interactive' : ''}`}
      aria-label={interactive ? 'Interaktiv klocka' : 'Analog klocka'}
      onPointerDown={(e) => {
        if (!interactive) return;
        draggingRef.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        updateFromPointer(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (!interactive || !draggingRef.current) return;
        updateFromPointer(e.clientX, e.clientY);
      }}
      onPointerUp={() => {
        draggingRef.current = false;
      }}
      onPointerCancel={() => {
        draggingRef.current = false;
      }}
    >
      <circle cx="110" cy="110" r="102" fill="#ffffff" stroke="#7c3aed" strokeWidth="7" />
      <circle cx="110" cy="110" r="92" fill="#faf5ff" />

      {TICKS.map((tick) => {
        const angle = (tick * 6 - 90) * (Math.PI / 180);
        const isHour = tick % 5 === 0;
        const isMajor = tick % 15 === 0;
        const outerR = 92;
        const innerR = isMajor ? 80 : isHour ? 83 : 87;
        return (
          <line
            key={tick}
            x1={110 + Math.cos(angle) * innerR}
            y1={110 + Math.sin(angle) * innerR}
            x2={110 + Math.cos(angle) * outerR}
            y2={110 + Math.sin(angle) * outerR}
            stroke={isMajor ? '#7c3aed' : isHour ? '#94a3b8' : '#cbd5e1'}
            strokeWidth={isMajor ? 3 : isHour ? 2 : 1.2}
            strokeLinecap="round"
          />
        );
      })}

      {CLOCK_NUMBERS.map((num, idx) => {
        const angle = (idx * 30 - 90) * (Math.PI / 180);
        const x = 110 + Math.cos(angle) * 68;
        const y = 110 + Math.sin(angle) * 68;
        return (
          <text
            key={num}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            className="clock-number"
          >
            {num}
          </text>
        );
      })}

      {/* Hour hand */}
      <line
        x1="110"
        y1="110"
        x2="110"
        y2="62"
        stroke="#1e293b"
        strokeWidth="7"
        strokeLinecap="round"
        transform={`rotate(${hourDegrees}, 110, 110)`}
      />

      {/* Minute hand */}
      <line
        x1="110"
        y1="110"
        x2="110"
        y2="40"
        stroke="#ec4899"
        strokeWidth="5"
        strokeLinecap="round"
        transform={`rotate(${minuteDegrees}, 110, 110)`}
      />

      <circle cx="110" cy="110" r="7" fill="#7c3aed" />
    </svg>
  );
}
