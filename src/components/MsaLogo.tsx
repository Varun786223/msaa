interface MsaLogoProps {
  variant?: 'light' | 'dark';
  showSubtitle?: boolean;
  className?: string;
}

export function MsaLogo({ variant = 'dark', showSubtitle = false, className = '' }: MsaLogoProps) {
  const strokeColor = variant === 'light' ? '#E8EEF5' : '#1F2A38';
  const textColor = variant === 'light' ? 'text-[#FFFFFF]' : 'text-[#1F2A38]';
  const subColor = variant === 'light' ? 'text-[#E8EEF5]/75' : 'text-[#5A6C85]';

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0 max-w-full ${className}`}>
      <svg
        width="44"
        height="28"
        viewBox="0 0 88 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0 w-9 h-6 sm:w-11 sm:h-7"
      >
        {/* Continuous monoline waveform forming abstract M + crossing pulse wave */}
        <path
          d="M6 46C10.5 34 15.5 8 21.5 8C27.5 8 26.5 46 34.5 46C42.5 46 39 17 47.5 17C56 17 51.5 46 60 46C68.5 46 64 8 70.5 8C77 8 79 34 83.5 46"
          stroke={strokeColor}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 29.5C11 29.5 14 20.5 21 20.5C28 20.5 31 38 41 38C51 38 54 20 63 20C72 20 75 29.5 85 29.5"
          stroke={strokeColor}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeOpacity="0.88"
        />
      </svg>
      <div className="flex flex-col leading-none min-w-0">
        <span className={`font-sans text-base sm:text-lg font-semibold tracking-[0.14em] whitespace-nowrap ${textColor}`}>
          MSA
        </span>
        {showSubtitle && (
          <span className={`mt-1 font-sans text-[9px] sm:text-[10px] font-medium tracking-[0.14em] sm:tracking-[0.22em] leading-tight sm:whitespace-nowrap ${subColor}`}>
            MULTIMODAL STRESS ANALYSER · AUSTRALIA
          </span>
        )}
      </div>
    </div>
  );
}
