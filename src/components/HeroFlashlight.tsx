import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, ShieldAlert } from 'lucide-react';
import { HERO_PRESETS } from '../data/msaData';
import { useLiveEngine } from '../context/LiveEngineContext';
import { HeroPresetId } from '../types/msa';
import { computeFusionOutput } from '../utils/signalProcessing';
import { RadialGauge } from './RadialGauge';

export function HeroFlashlight() {
  const heroRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const { openWorkspace, baseline, setSimScenario } = useLiveEngine();
  const [activePresetId, setActivePresetId] = useState<HeroPresetId>('calm-rest');

  // Smooth GPU-friendly requestAnimationFrame pointer & touch tracking
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    let targetX = el.clientWidth * 0.56;
    let targetY = el.clientHeight * 0.44;
    let currentX = targetX;
    let currentY = targetY;
    let userMoved = false;
    let lastInteractionTime = 0;
    let rafId = 0;

    const applySpotlightVars = (x: number, y: number) => {
      el.style.setProperty('--mouse-x', `${x.toFixed(1)}px`);
      el.style.setProperty('--mouse-y', `${y.toFixed(1)}px`);

      const cardEl = cardRef.current;
      if (cardEl) {
        const cardX = x - cardEl.offsetLeft;
        const cardY = y - cardEl.offsetTop;
        cardEl.style.setProperty('--card-mouse-x', `${cardX.toFixed(1)}px`);
        cardEl.style.setProperty('--card-mouse-y', `${cardY.toFixed(1)}px`);
      }
    };

    const updateTargetFromClient = (clientX: number, clientY: number, immediate = false) => {
      const rect = el.getBoundingClientRect();
      targetX = clientX - rect.left;
      targetY = clientY - rect.top;
      userMoved = true;
      lastInteractionTime = performance.now();

      if (immediate) {
        currentX = targetX;
        currentY = targetY;
        applySpotlightVars(currentX, currentY);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      updateTargetFromClient(e.clientX, e.clientY);
    };

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      updateTargetFromClient(touch.clientX, touch.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      updateTargetFromClient(touch.clientX, touch.clientY, true);
    };

    const tick = (now: number) => {
      // Resume gentle ambient drift after 6s idle on touch/initial view
      if (!userMoved || now - lastInteractionTime > 6000) {
        const t = now * 0.00055;
        targetX = el.clientWidth * (0.5 + Math.sin(t) * 0.24);
        targetY = el.clientHeight * (0.42 + Math.cos(t * 0.8) * 0.18);
      }

      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      applySpotlightVars(currentX, currentY);

      rafId = window.requestAnimationFrame(tick);
    };

    el.addEventListener('pointermove', onPointerMove, { passive: true });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    rafId = window.requestAnimationFrame(tick);

    return () => {
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  const selectedPreset = HERO_PRESETS.find((p) => p.id === activePresetId) ?? HERO_PRESETS[0];

  const sandboxOutput = computeFusionOutput({
    features: selectedPreset.features,
    baseline,
    availability: {
      facial: !selectedPreset.dropouts?.facial,
      rppg: !selectedPreset.dropouts?.rppg,
      voice: true,
      language: true,
      posture: true,
      wearable: true,
    },
    fusionMode: 'attention',
    windowMode: 'session',
  });

  const activeGate = sandboxOutput.activeGates.find((g) => g.triggered && g.id !== 'baseline-uncertainty');

  const handleSelectPreset = (id: HeroPresetId) => {
    setActivePresetId(id);
    setSimScenario(id);
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-[calc(100svh)] lg:min-h-[880px] pt-20 pb-12 sm:pt-24 sm:pb-16 lg:pt-28 lg:pb-24 bg-[#1F2A38] text-[#FFFFFF] overflow-hidden flex items-center"
    >
      {/* Layer 1: Base Unlit Architectural Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(232, 238, 245, 0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(232, 238, 245, 0.035) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      {/* Subtle ambient glow behind gauge at rest */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_72%,rgba(90,108,133,0.18),transparent_55%)] lg:bg-[radial-gradient(circle_at_72%_46%,rgba(90,108,133,0.18),transparent_55%)]"
      />

      {/* Layer 2: Flashlight-Revealed Illuminated Layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hero-flashlight-reveal"
      >
        <img
          src="/assets/aistudio/hero_section_background_a5e280f9.png"
          alt=""
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-35 mix-blend-luminosity scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1F2A38]/80 via-[#1F2A38]/45 to-[#1F2A38]/85" />

        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(232, 238, 245, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(232, 238, 245, 0.1) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />

        <svg
          className="absolute inset-0 w-full h-full opacity-75"
          viewBox="0 0 1440 860"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <path
            d="M-40 520 C 210 410, 420 620, 720 490 C 1020 360, 1210 540, 1480 430"
            stroke="#E8EEF5"
            strokeOpacity="0.34"
            strokeWidth="1.5"
          />
          <path
            d="M-40 565 C 240 460, 480 650, 760 525 C 1040 400, 1230 570, 1480 470"
            stroke="#5A6C85"
            strokeOpacity="0.6"
            strokeWidth="1.2"
          />
          <path
            d="M-40 330 C 180 280, 460 390, 760 300 C 1060 210, 1260 320, 1480 250"
            stroke="#E8EEF5"
            strokeOpacity="0.18"
            strokeWidth="1"
            strokeDasharray="5 7"
          />
          <path
            d="M 80 680 L 280 680 L 305 668 L 320 692 L 336 610 L 352 718 L 368 680 L 610 680 L 635 665 L 650 694 L 664 606 L 680 716 L 696 680 L 980 680 L 1005 668 L 1020 692 L 1036 614 L 1052 715 L 1068 680 L 1380 680"
            stroke="#E8EEF5"
            strokeOpacity="0.28"
            strokeWidth="1.4"
          />
        </svg>
      </div>

      {/* Main 2-Column Content Split: 55% Left / 45% Right */}
      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
        {/* Left Column */}
        <div className="lg:col-span-7 flex flex-col items-start min-w-0">
          <div className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.16em] sm:tracking-[0.22em] text-[#E8EEF5]/80 mb-4 sm:mb-6">
            <span>Indian Clinical Biometrics</span>
            <span aria-hidden="true" className="text-[#5A6C85]">·</span>
            <span>100% On-Device</span>
          </div>

          <h1
            className="font-sans font-semibold tracking-tight text-[#FFFFFF] leading-[1.08] max-w-2xl"
            style={{ fontSize: 'clamp(1.875rem, 4.1vw, 3.85rem)' }}
          >
            Clinical-grade{' '}
            <em className="font-serif italic font-normal text-[#E8EEF5]">
              stress intelligence
            </em>
            , decoded in real time.
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-lg leading-relaxed text-[#E8EEF5]/82 max-w-[62ch]">
            <strong className="font-semibold text-[#FFFFFF]">
              MSA is a multimodal stress analyser
            </strong>{' '}
            that fuses contactless facial, vocal, postural, and wearable physiological signals
            directly in your browser—delivering calibrated stress insights with zero cloud data
            retention.
          </p>

          <div className="mt-6 sm:mt-9 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => openWorkspace({ tab: 'sensors', presetId: activePresetId })}
              className="w-full sm:w-auto justify-center inline-flex items-center gap-2 rounded-full bg-[#E8EEF5] px-6 min-h-[44px] py-3 text-sm font-semibold text-[#1F2A38] transition-all duration-150 hover:bg-[#FFFFFF] cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8EEF5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1F2A38]"
            >
              <span>Start Assessment</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <a
              href="#validation"
              className="w-full sm:w-auto justify-center inline-flex items-center gap-2 rounded-full border border-[#E8EEF5]/25 bg-[#FFFFFF]/6 backdrop-blur-md px-6 min-h-[44px] py-3 text-sm font-medium text-[#E8EEF5] transition-all duration-150 hover:bg-[#FFFFFF]/12 hover:border-[#E8EEF5]/45 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8EEF5]"
            >
              <span>Explore Research Benchmarks</span>
            </a>
          </div>

          {/* Quiet baseline calibration summary strip */}
          <div className="mt-7 sm:mt-10 pt-5 sm:pt-6 border-t border-[#E8EEF5]/12 w-full max-w-xl grid grid-cols-3 gap-2 sm:gap-6">
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#E8EEF5]/60 truncate">
                Channels
              </div>
              <div className="mt-1 font-mono tabular-nums text-[13px] min-[390px]:text-sm sm:text-lg font-medium text-[#FFFFFF] whitespace-nowrap">
                6 Modalities
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#E8EEF5]/60 truncate">
                Confounders
              </div>
              <div className="mt-1 font-mono tabular-nums text-[13px] min-[390px]:text-sm sm:text-lg font-medium text-[#FFFFFF] whitespace-nowrap">
                4 Gates
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#E8EEF5]/60 truncate">
                Cloud Storage
              </div>
              <div className="mt-1 font-mono tabular-nums text-[13px] min-[390px]:text-sm sm:text-lg font-medium text-[#FFFFFF] whitespace-nowrap">
                0 Bytes
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Live Gauge Sandbox */}
        <div ref={cardRef} className="lg:col-span-5 min-w-0">
          <div className="p-[1px] rounded-[24px] hero-specular-border shadow-2xl shadow-black/30">
            <div className="rounded-[23px] bg-[#1F2A38]/84 backdrop-blur-xl p-4 min-[380px]:p-5 sm:p-7">
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#E8EEF5]/10">
                <div className="min-w-0">
                  <div className="text-xs font-medium text-[#E8EEF5]/65">
                    Interactive Calibration Sandbox
                  </div>
                  <div className="text-sm font-semibold text-[#FFFFFF] mt-0.5 truncate">
                    {selectedPreset.label}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openWorkspace({ tab: 'report', presetId: activePresetId })}
                  className="inline-flex items-center gap-1 min-h-[38px] sm:min-h-0 px-2 py-1 -mr-2 text-xs font-medium text-[#E8EEF5]/80 hover:text-[#FFFFFF] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>Inspect</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              {/* Preset Selector Pills */}
              <div
                className="mt-4 flex flex-wrap gap-1.5"
                role="tablist"
                aria-label="Live physiological preset states"
              >
                {HERO_PRESETS.map((preset) => {
                  const isActive = preset.id === activePresetId;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => handleSelectPreset(preset.id)}
                      className={`rounded-full px-3 min-h-[36px] sm:min-h-0 py-1.5 text-[11px] sm:text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-[#E8EEF5] text-[#1F2A38] font-semibold'
                          : 'bg-[#FFFFFF]/6 text-[#E8EEF5]/78 border border-[#E8EEF5]/12 hover:bg-[#FFFFFF]/12 hover:text-[#FFFFFF]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Calibrated Radial Gauge */}
              <div className="mt-5 flex flex-col items-center">
                <RadialGauge
                  score={sandboxOutput.score}
                  band={sandboxOutput.band}
                  confidence={sandboxOutput.confidence}
                  theme="dark"
                  size={196}
                />
                <p className="mt-1 text-center text-xs text-[#E8EEF5]/72 max-w-xs leading-relaxed">
                  {selectedPreset.shortNote}
                </p>
              </div>

              {activeGate && (
                <div className="mt-4 rounded-xl border border-[#E8EEF5]/20 bg-[#E8EEF5]/8 px-3.5 py-2.5 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-[#E8EEF5] shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="text-xs leading-snug text-[#E8EEF5]/90">
                    <span className="font-semibold text-[#FFFFFF]">{activeGate.name}:</span>{' '}
                    {activeGate.explanation}
                  </div>
                </div>
              )}

              {/* Telemetry Readout Grid */}
              <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-[#E8EEF5]/10">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#E8EEF5]/55">
                    Confidence
                  </div>
                  <div className="mt-0.5 font-mono tabular-nums text-base font-semibold text-[#FFFFFF]">
                    {sandboxOutput.confidence}%
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#E8EEF5]/55">
                    Baseline Shift (Δ)
                  </div>
                  <div className="mt-0.5 font-mono tabular-nums text-base font-semibold text-[#FFFFFF]">
                    {sandboxOutput.baselineShiftDelta >= 0 ? '+' : ''}
                    {sandboxOutput.baselineShiftDelta} pts vs μ₀
                  </div>
                </div>
              </div>

              {/* Top Contributing Signals */}
              <div className="mt-4 pt-3 border-t border-[#E8EEF5]/10">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#E8EEF5]/55 mb-2">
                  Top Contributing Signals
                </div>
                <div className="space-y-1.5">
                  {sandboxOutput.topContributors.slice(0, 3).map((sig) => (
                    <div
                      key={sig.label}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="text-[#E8EEF5]/85 flex items-center gap-1.5 truncate">
                        <span className="font-mono text-[#E8EEF5]/60">
                          {sig.direction === 'up' ? '↑' : sig.direction === 'down' ? '↓' : '·'}
                        </span>
                        {sig.label}
                      </span>
                      <span className="font-mono tabular-nums text-[#E8EEF5]/70 shrink-0">
                        {sig.deltaText}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
