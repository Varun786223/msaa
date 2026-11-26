import { ArrowUpRight, Eye, EyeOff } from 'lucide-react';
import { useLiveEngine } from '../context/LiveEngineContext';
import { ChannelId } from '../types/msa';

export function SensingSuite() {
  const {
    features,
    privacyMask,
    setPrivacyMask,
    openWorkspace,
    webcamActive,
    micActive,
    bleActive,
  } = useLiveEngine();

  const handleOpenChannel = (channel: ChannelId) => {
    openWorkspace({ tab: 'sensors', channel });
  };

  return (
    <section
      id="sensing"
      className="py-16 sm:py-24 px-4 sm:px-6 bg-[#E8EEF5]/40 border-b border-[#1F2A38]/8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#5A6C85]">
            Multimodal Sensing Suite
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-[#1F2A38]">
            Six synchronized channels.{' '}
            <em className="font-serif italic font-normal text-[#5A6C85]">
              Zero friction.
            </em>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#5A6C85] leading-relaxed">
            Capture nuanced physiological and behavioral markers using standard browser camera and
            microphone hardware or optional Bluetooth Low Energy wearables—with simulated telemetry
            always ready for instant exploration.
          </p>
        </div>

        {/* 2x3 Bento Grid */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* 1. Facial Micro-Expressions */}
          <article className="min-w-0 rounded-[20px] bg-[#FFFFFF]/90 backdrop-blur-md border border-[#1F2A38]/8 p-5 sm:p-6 flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                {/* Custom Fine-Line Monoline Icon */}
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 36 36"
                  fill="none"
                  aria-hidden="true"
                  className="text-[#1F2A38] shrink-0"
                >
                  <path
                    d="M8 13V9.5C8 8.67 8.67 8 9.5 8H13M23 8H26.5C27.33 8 28 8.67 28 9.5V13M28 23V26.5C28 27.33 27.33 28 26.5 28H23M13 28H9.5C8.67 28 8 27.33 8 26.5V23"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="14" cy="16" r="1.4" fill="currentColor" />
                  <circle cx="22" cy="16" r="1.4" fill="currentColor" />
                  <path
                    d="M14.5 21.5C15.5 22.3 16.7 22.7 18 22.7C19.3 22.7 20.5 22.3 21.5 21.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Interactive Privacy Mask Toggle Preview */}
                <button
                  type="button"
                  onClick={() => setPrivacyMask(!privacyMask)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 min-h-[38px] sm:min-h-0 py-1.5 sm:py-1 text-[11px] font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                    privacyMask
                      ? 'bg-[#1F2A38] text-[#FFFFFF] border-[#1F2A38]'
                      : 'bg-[#E8EEF5] text-[#1F2A38] border-[#1F2A38]/15'
                  }`}
                >
                  {privacyMask ? (
                    <EyeOff className="w-3 h-3" aria-hidden="true" />
                  ) : (
                    <Eye className="w-3 h-3" aria-hidden="true" />
                  )}
                  <span>{privacyMask ? 'Privacy Mask On' : 'Landmark Mesh'}</span>
                </button>
              </div>

              <h3 className="mt-4 sm:mt-5 text-lg font-semibold text-[#1F2A38]">
                Facial Micro-Expressions
              </h3>
              <p className="mt-2 text-sm text-[#5A6C85] leading-relaxed">
                On-device facial blendshape tracking computing FACS Action Units (brow lowerer AU4,
                lid tightener AU7, blink rate, and gaze shift) without storing video frames.
              </p>

              {/* Privacy Mask Live Contour Preview */}
              <div className="mt-4 rounded-xl border border-[#1F2A38]/8 bg-[#E8EEF5]/45 p-3 flex flex-wrap min-[360px]:flex-nowrap items-center justify-between gap-3">
                <svg
                  width="56"
                  height="40"
                  viewBox="0 0 56 40"
                  fill="none"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <rect
                    x="1"
                    y="1"
                    width="54"
                    height="38"
                    rx="7"
                    fill={privacyMask ? '#1F2A38' : '#FFFFFF'}
                    stroke="#5A6C85"
                    strokeOpacity="0.25"
                  />
                  <ellipse
                    cx="28"
                    cy="20"
                    rx="11"
                    ry="13.5"
                    stroke={privacyMask ? '#E8EEF5' : '#1F2A38'}
                    strokeWidth="1.2"
                    strokeDasharray={privacyMask ? 'none' : '2 2'}
                  />
                  <path
                    d="M22 15.5L25.5 16.5M34 15.5L30.5 16.5"
                    stroke={privacyMask ? '#E8EEF5' : '#1F2A38'}
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M24 25.5H32"
                    stroke={privacyMask ? '#E8EEF5' : '#5A6C85'}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-1 text-xs flex-1 min-w-0">
                  <div className="min-w-0">
                    <span className="text-[#5A6C85]">AU4</span>{' '}
                    <span className="font-mono tabular-nums font-medium text-[#1F2A38]">
                      {(features.au4BrowLowerer * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[#5A6C85]">AU7</span>{' '}
                    <span className="font-mono tabular-nums font-medium text-[#1F2A38]">
                      {(features.au7LidTightener * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="col-span-2 text-[11px] text-[#5A6C85] font-mono tabular-nums truncate">
                    {features.blinkRatePerMin} blinks/min · {webcamActive ? 'Live Camera' : 'Simulated'}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenChannel('facial')}
              className="mt-4 pt-3 sm:mt-5 sm:pt-4 min-h-[44px] sm:min-h-0 border-t border-[#1F2A38]/8 flex items-center justify-between text-xs font-semibold text-[#1F2A38] hover:text-[#5A6C85] transition-colors cursor-pointer"
            >
              <span>Inspect Facial Channel</span>
              <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>
          </article>

          {/* 2. Contactless Camera Pulse (rPPG) */}
          <article className="min-w-0 rounded-[20px] bg-[#FFFFFF]/90 backdrop-blur-md border border-[#1F2A38]/8 p-5 sm:p-6 flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 36 36"
                  fill="none"
                  aria-hidden="true"
                  className="text-[#1F2A38]"
                >
                  <path
                    d="M6 19H11.5L14.5 11L18.5 25L22 15L24.5 19H30"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="18" cy="18" r="13.5" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.2" />
                </svg>
                <span className="text-[11px] font-mono tabular-nums text-[#5A6C85]">
                  Luma {Math.round(features.ambientLuminance)}%
                </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold text-[#1F2A38]">
                Contactless Camera Pulse (rPPG)
              </h3>
              <p className="mt-2 text-sm text-[#5A6C85] leading-relaxed">
                Green-channel skin ROI photoplethysmography extracting live heart rate (BPM) and a
                real-time pulse waveform through your webcam, gated by ambient luminance checks.
              </p>

              {/* Live SVG Pulse Waveform */}
              <div className="mt-4 rounded-xl border border-[#1F2A38]/8 bg-[#E8EEF5]/45 p-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#5A6C85]">rPPG Cardiac Signal</span>
                  <span className="font-mono tabular-nums font-semibold text-[#1F2A38]">
                    {Math.round(features.rppgBpm)} BPM
                  </span>
                </div>
                <svg viewBox="0 0 220 34" className="w-full h-8 overflow-visible" aria-hidden="true">
                  <polyline
                    fill="none"
                    stroke="#1F2A38"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={features.rppgWaveform
                      .map((v, i) => `${(i / Math.max(1, features.rppgWaveform.length - 1)) * 220},${32 - v * 26}`)
                      .join(' ')}
                  />
                </svg>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenChannel('rppg')}
              className="mt-4 pt-3 sm:mt-5 sm:pt-4 min-h-[44px] sm:min-h-0 border-t border-[#1F2A38]/8 flex items-center justify-between text-xs font-semibold text-[#1F2A38] hover:text-[#5A6C85] transition-colors cursor-pointer"
            >
              <span>Inspect rPPG Pulse</span>
              <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>
          </article>

          {/* 3. Voice & Acoustic Stress */}
          <article className="min-w-0 rounded-[20px] bg-[#FFFFFF]/90 backdrop-blur-md border border-[#1F2A38]/8 p-5 sm:p-6 flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 36 36"
                  fill="none"
                  aria-hidden="true"
                  className="text-[#1F2A38] shrink-0"
                >
                  <path
                    d="M8 18V18M12 13V23M16 9V27M20 12V24M24 10V26M28 15V21"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-[11px] font-mono tabular-nums text-[#5A6C85]">
                  {micActive ? 'Live Mic DSP' : 'Zero-Disk DSP'}
                </span>
              </div>

              <h3 className="mt-4 sm:mt-5 text-lg font-semibold text-[#1F2A38]">
                Voice & Acoustic Stress
              </h3>
              <p className="mt-2 text-sm text-[#5A6C85] leading-relaxed">
                Real-time Web Audio AnalyserNode autocorrelation computing fundamental pitch (F₀),
                local jitter (%), amplitude shimmer (%), speaking rate, and pause ratios without saving audio.
              </p>

              <div className="mt-4 rounded-xl border border-[#1F2A38]/8 bg-[#E8EEF5]/45 p-3 grid grid-cols-3 gap-1.5 sm:gap-2 text-xs">
                <div className="min-w-0">
                  <div className="text-[#5A6C85] text-[10px] sm:text-[11px] truncate">Pitch F₀</div>
                  <div className="font-mono tabular-nums font-semibold text-[#1F2A38] mt-0.5 whitespace-nowrap">
                    {Math.round(features.pitchF0Hz)} Hz
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[#5A6C85] text-[10px] sm:text-[11px] truncate">Jitter</div>
                  <div className="font-mono tabular-nums font-semibold text-[#1F2A38] mt-0.5 whitespace-nowrap">
                    {features.jitterPct.toFixed(2)}%
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[#5A6C85] text-[10px] sm:text-[11px] truncate">Rate</div>
                  <div className="font-mono tabular-nums font-semibold text-[#1F2A38] mt-0.5 whitespace-nowrap">
                    {features.speakingRateWpm} WPM
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenChannel('voice')}
              className="mt-4 pt-3 sm:mt-5 sm:pt-4 min-h-[44px] sm:min-h-0 border-t border-[#1F2A38]/8 flex items-center justify-between text-xs font-semibold text-[#1F2A38] hover:text-[#5A6C85] transition-colors cursor-pointer"
            >
              <span>Inspect Acoustic DSP</span>
              <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>
          </article>

          {/* 4. Opt-In Language Context */}
          <article className="min-w-0 rounded-[20px] bg-[#FFFFFF]/90 backdrop-blur-md border border-[#1F2A38]/8 p-5 sm:p-6 flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 36 36"
                  fill="none"
                  aria-hidden="true"
                  className="text-[#1F2A38] shrink-0"
                >
                  <path
                    d="M8 11.5C8 10.12 9.12 9 10.5 9H25.5C26.88 9 28 10.12 28 11.5V21.5C28 22.88 26.88 24 25.5 24H15L10 28V24H10.5C9.12 24 8 22.88 8 21.5V11.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path d="M13 15H23M13 18.5H19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <span className="text-[11px] font-mono text-[#5A6C85]">
                  Raw Text Purged
                </span>
              </div>

              <h3 className="mt-4 sm:mt-5 text-lg font-semibold text-[#1F2A38]">
                Opt-In Language Context
              </h3>
              <p className="mt-2 text-sm text-[#5A6C85] leading-relaxed">
                Optional on-device browser SpeechRecognition and instant text evaluation analyzing
                strain lexicon ratios locally—distinguishing vocabulary from vocal acoustics with immediate disposal.
              </p>

              <div className="mt-4 rounded-xl border border-[#1F2A38]/8 bg-[#E8EEF5]/45 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-[#5A6C85]">Strain Lexicon Ratio</span>
                <span className="font-mono tabular-nums font-semibold text-[#1F2A38] whitespace-nowrap">
                  {(features.negLexiconRatio * 100).toFixed(0)}% · {features.utteranceCount} samples
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenChannel('language')}
              className="mt-4 pt-3 sm:mt-5 sm:pt-4 min-h-[44px] sm:min-h-0 border-t border-[#1F2A38]/8 flex items-center justify-between text-xs font-semibold text-[#1F2A38] hover:text-[#5A6C85] transition-colors cursor-pointer"
            >
              <span>Evaluate Language Context</span>
              <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>
          </article>

          {/* 5. Body Posture & Kinesics */}
          <article className="min-w-0 rounded-[20px] bg-[#FFFFFF]/90 backdrop-blur-md border border-[#1F2A38]/8 p-5 sm:p-6 flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 36 36"
                  fill="none"
                  aria-hidden="true"
                  className="text-[#1F2A38] shrink-0"
                >
                  <circle cx="18" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M11 24C11 19.5 14 16.5 18 16.5C22 16.5 25 19.5 25 24M18 16.5V27"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-[11px] font-mono tabular-nums text-[#5A6C85]">
                  {features.selfTouchCount} adaptors
                </span>
              </div>

              <h3 className="mt-4 sm:mt-5 text-lg font-semibold text-[#1F2A38]">
                Body Posture & Kinesics
              </h3>
              <p className="mt-2 text-sm text-[#5A6C85] leading-relaxed">
                Upper-body optical kinesics quantifying posture closure or slump, overall movement
                energy, gesture jerkiness, and hand-to-face self-touch adaptors.
              </p>

              <div className="mt-4 rounded-xl border border-[#1F2A38]/8 bg-[#E8EEF5]/45 p-3 grid grid-cols-2 gap-3 text-xs">
                <div className="min-w-0">
                  <div className="text-[#5A6C85] text-[10px] sm:text-[11px] truncate">Posture Closure</div>
                  <div className="font-mono tabular-nums font-semibold text-[#1F2A38] mt-0.5">
                    {Math.round(features.postureClosure * 100)}%
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[#5A6C85] text-[10px] sm:text-[11px] truncate">Movement Energy</div>
                  <div className="font-mono tabular-nums font-semibold text-[#1F2A38] mt-0.5">
                    {Math.round(features.movementEnergy * 100)}%
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenChannel('posture')}
              className="mt-4 pt-3 sm:mt-5 sm:pt-4 min-h-[44px] sm:min-h-0 border-t border-[#1F2A38]/8 flex items-center justify-between text-xs font-semibold text-[#1F2A38] hover:text-[#5A6C85] transition-colors cursor-pointer"
            >
              <span>Inspect Kinesics Stream</span>
              <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>
          </article>

          {/* 6. Wearable BLE & Live Simulator */}
          <article className="min-w-0 rounded-[20px] bg-[#FFFFFF]/90 backdrop-blur-md border border-[#1F2A38]/8 p-5 sm:p-6 flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 36 36"
                  fill="none"
                  aria-hidden="true"
                  className="text-[#1F2A38] shrink-0"
                >
                  <path
                    d="M14 13L22 23L18 27V9L22 13L14 23"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[11px] font-mono tabular-nums text-[#5A6C85]">
                  {bleActive ? 'BLE Paired' : 'GATT 0x180D + Sim'}
                </span>
              </div>

              <h3 className="mt-4 sm:mt-5 text-lg font-semibold text-[#1F2A38]">
                Wearable BLE & Live Simulator
              </h3>
              <p className="mt-2 text-sm text-[#5A6C85] leading-relaxed">
                Direct Web Bluetooth pairing with heart rate straps (BPM + HRV RMSSD from RR
                intervals), backed by a live physiological simulator for HRV, EDA, skin temp, and accel.
              </p>

              <div className="mt-4 rounded-xl border border-[#1F2A38]/8 bg-[#E8EEF5]/45 p-3 grid grid-cols-3 gap-1.5 sm:gap-2 text-xs">
                <div className="min-w-0">
                  <div className="text-[#5A6C85] text-[10px] sm:text-[11px] truncate">HRV RMSSD</div>
                  <div className="font-mono tabular-nums font-semibold text-[#1F2A38] mt-0.5 whitespace-nowrap">
                    {Math.round(features.hrvRmssdMs)} ms
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[#5A6C85] text-[10px] sm:text-[11px] truncate">EDA</div>
                  <div className="font-mono tabular-nums font-semibold text-[#1F2A38] mt-0.5 whitespace-nowrap">
                    {features.edaMicroSiemens.toFixed(1)} μS
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[#5A6C85] text-[10px] sm:text-[11px] truncate">Temp</div>
                  <div className="font-mono tabular-nums font-semibold text-[#1F2A38] mt-0.5 whitespace-nowrap">
                    {features.skinTempC.toFixed(1)}°C
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenChannel('wearable')}
              className="mt-4 pt-3 sm:mt-5 sm:pt-4 min-h-[44px] sm:min-h-0 border-t border-[#1F2A38]/8 flex items-center justify-between text-xs font-semibold text-[#1F2A38] hover:text-[#5A6C85] transition-colors cursor-pointer"
            >
              <span>Pair BLE / Configure Sim</span>
              <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>
          </article>
        </div>
      </div>
    </section>
  );
}
