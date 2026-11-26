import { StressBand } from '../types/msa';

interface RadialGaugeProps {
  score: number;
  band: StressBand;
  confidence: number;
  theme?: 'dark' | 'light';
  size?: number;
}

const BAND_SEGMENTS: Array<{
  label: StressBand;
  start: number;
  end: number;
  darkStroke: string;
  lightStroke: string;
}> = [
  { label: 'Calm', start: 0, end: 19, darkStroke: '#8EA8C3', lightStroke: '#5A6C85' },
  { label: 'Mild', start: 20, end: 39, darkStroke: '#A7C0D8', lightStroke: '#4B6B88' },
  { label: 'Moderate', start: 40, end: 59, darkStroke: '#D6B98C', lightStroke: '#9A7848' },
  { label: 'High', start: 60, end: 79, darkStroke: '#D98E79', lightStroke: '#9B4D3A' },
  { label: 'Very High', start: 80, end: 100, darkStroke: '#CF6A6A', lightStroke: '#7D2E2E' },
];

export function RadialGauge({
  score,
  band,
  confidence,
  theme = 'dark',
  size = 216,
}: RadialGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const cx = 110;
  const cy = 110;
  const r = 84;
  // 240-degree sweep from 150deg to 390deg
  const startAngle = 150;
  const sweep = 240;

  const polarToCartesian = (angleDeg: number, radius: number) => {
    const rad = ((angleDeg - 0) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  };

  const describeArc = (fromPct: number, toPct: number, radius: number) => {
    const a1 = startAngle + (fromPct / 100) * sweep;
    const a2 = startAngle + (toPct / 100) * sweep;
    const start = polarToCartesian(a1, radius);
    const end = polarToCartesian(a2, radius);
    const largeArcFlag = a2 - a1 <= 180 ? '0' : '1';
    return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  };

  const activeSegment = BAND_SEGMENTS.find((s) => s.label === band) ?? BAND_SEGMENTS[0];
  const activeStroke = theme === 'dark' ? activeSegment.darkStroke : activeSegment.lightStroke;
  const trackStroke = theme === 'dark' ? 'rgba(232, 238, 245, 0.12)' : 'rgba(31, 42, 56, 0.09)';
  const indicatorAngle = startAngle + (clamped / 100) * sweep;
  const needlePos = polarToCartesian(indicatorAngle, r);

  // Confidence outer subtle halo arc
  const confHalfSpan = Math.max(2, ((100 - confidence) / 100) * 14);
  const confFrom = Math.max(0, clamped - confHalfSpan);
  const confTo = Math.min(100, clamped + confHalfSpan);

  return (
    <div className="relative inline-flex flex-col items-center justify-center max-w-full">
      <svg
        width={size}
        height={size * 0.9}
        viewBox="0 0 220 198"
        style={{ maxWidth: '100%', height: 'auto' }}
        className="overflow-visible"
        role="img"
        aria-label={`Stress index ${clamped} out of 100, ${band} band, ${confidence}% confidence`}
      >
        {/* Background 5 clinical band segments */}
        {BAND_SEGMENTS.map((seg) => (
          <path
            key={seg.label}
            d={describeArc(seg.start + 0.6, seg.end - 0.6, r)}
            fill="none"
            stroke={trackStroke}
            strokeWidth="10"
            strokeLinecap="round"
          />
        ))}

        {/* Uncertainty interval outer hairline */}
        <path
          d={describeArc(confFrom, confTo, r + 11)}
          fill="none"
          stroke={theme === 'dark' ? 'rgba(232, 238, 245, 0.35)' : 'rgba(90, 108, 133, 0.4)'}
          strokeWidth="2"
          strokeDasharray="3 3"
          strokeLinecap="round"
          className="transition-all duration-300"
        />

        {/* Active calibrated fill arc */}
        <path
          d={describeArc(0, Math.max(2, clamped), r)}
          fill="none"
          stroke={activeStroke}
          strokeWidth="10"
          strokeLinecap="round"
          className="transition-all duration-300"
        />

        {/* Calibrated needle marker */}
        <circle
          cx={needlePos.x}
          cy={needlePos.y}
          r="5.5"
          fill={theme === 'dark' ? '#FFFFFF' : '#1F2A38'}
          stroke={activeStroke}
          strokeWidth="2.5"
          className="transition-all duration-300"
        />

        {/* Central numeric readout */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          className={`font-mono tabular-nums text-[40px] font-semibold ${
            theme === 'dark' ? 'fill-[#FFFFFF]' : 'fill-[#1F2A38]'
          }`}
        >
          {clamped}
        </text>
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          className={`font-sans text-[13px] font-medium tracking-wide ${
            theme === 'dark' ? 'fill-[#E8EEF5]' : 'fill-[#1F2A38]'
          }`}
        >
          {band} Band
        </text>
        <text
          x={cx}
          y={cy + 36}
          textAnchor="middle"
          className={`font-mono tabular-nums text-[11px] ${
            theme === 'dark' ? 'fill-[#E8EEF5]/65' : 'fill-[#5A6C85]'
          }`}
        >
          ±{Math.round(confHalfSpan)} uncertainty
        </text>
      </svg>
    </div>
  );
}
