import { Activity, EyeOff, HelpCircle, Sparkles } from 'lucide-react';
import { useLiveEngine } from '../context/LiveEngineContext';
import { ChannelId, GateId, HeroPresetId } from '../types/msa';
import { RadialGauge } from './RadialGauge';

const CHANNEL_LABELS: Record<ChannelId, string> = {
  facial: 'Facial AU',
  rppg: 'Camera rPPG',
  voice: 'Voice DSP',
  language: 'Language',
  posture: 'Posture',
  wearable: 'BLE / Sim',
};

const GATE_TRIGGER_PRESETS: Record<GateId, { presetId?: HeroPresetId; hint: string }> = {
  'physical-exertion': {
    presetId: 'physical-exertion',
    hint: 'Test Exertion Gate',
  },
  'curiosity-excitement': {
    presetId: 'curiosity-excitement',
    hint: 'Test Curiosity Gate',
  },
  'low-luminance': {
    presetId: 'low-light-dropout',
    hint: 'Test Low-Light Gate',
  },
  'baseline-uncertainty': {
    hint: 'Toggle Quick Window',
  },
};

export function FusionConfounders() {
  const {
    fusionMode,
    setFusionMode,
    windowMode,
    setWindowMode,
    availability,
    toggleChannelAvailability,
    fusionOutput,
    setSimScenario,
  } = useLiveEngine();

  const handleTriggerGatePreview = (gateId: GateId) => {
    const cfg = GATE_TRIGGER_PRESETS[gateId];
    if (cfg.presetId) {
      setSimScenario(cfg.presetId);
    } else if (gateId === 'baseline-uncertainty') {
      setWindowMode(windowMode === 'session' ? 'quick' : 'session');
    }
  };

  return (
    <section
      id="fusion"
      className="py-16 sm:py-24 px-4 sm:px-6 bg-[#F1EFEB] border-b border-[#1F2A38]/8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#5A6C85]">
            Intelligent Fusion & Confounder Gates
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-[#1F2A38]">
            Built to tell true stress apart from{' '}
            <em className="font-serif italic font-normal text-[#5A6C85]">
              everyday life.
            </em>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#5A6C85] leading-relaxed">
            Raw biometric spikes don&apos;t always mean distress. MSA&apos;s fusion architecture
            filters out physical motion, positive excitement, and optical noise before scoring—and
            communicates uncertainty whenever channels drop out.
          </p>
        </div>

        {/* Main Asymmetric Interactive Fusion Lab */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left 7 Cols: Controls + Channel Weight Matrix */}
          <div className="lg:col-span-7 min-w-0 rounded-[24px] bg-[#FFFFFF]/90 border border-[#1F2A38]/8 p-5 sm:p-8 space-y-6 sm:space-y-7">
            {/* Switchers Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div className="min-w-0">
                <div className="text-xs font-medium text-[#5A6C85] mb-2.5">
                  Fusion Architecture
                </div>
                <div className="flex w-full sm:w-auto sm:inline-flex rounded-xl bg-[#F1EFEB] p-1 border border-[#1F2A38]/8">
                  <button
                    type="button"
                    onClick={() => setFusionMode('late')}
                    className={`flex-1 sm:flex-none rounded-lg px-2.5 sm:px-3.5 min-h-[40px] sm:min-h-0 py-2 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      fusionMode === 'late'
                        ? 'bg-[#1F2A38] text-[#FFFFFF]'
                        : 'text-[#5A6C85] hover:text-[#1F2A38]'
                    }`}
                  >
                    Late Fusion
                  </button>
                  <button
                    type="button"
                    onClick={() => setFusionMode('attention')}
                    className={`flex-1 sm:flex-none rounded-lg px-2.5 sm:px-3.5 min-h-[40px] sm:min-h-0 py-2 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      fusionMode === 'attention'
                        ? 'bg-[#1F2A38] text-[#FFFFFF]'
                        : 'text-[#5A6C85] hover:text-[#1F2A38]'
                    }`}
                  >
                    Attention Fusion
                  </button>
                </div>
                <p className="mt-2 text-xs text-[#5A6C85] leading-relaxed">
                  {fusionMode === 'attention'
                    ? 'Weights modalities dynamically by cross-channel agreement and signal quality.'
                    : 'Combines calibrated per-channel sub-scores using fixed clinical reliability priors.'}
                </p>
              </div>

              <div className="min-w-0">
                <div className="text-xs font-medium text-[#5A6C85] mb-2.5">
                  Observation Window
                </div>
                <div className="flex w-full sm:w-auto sm:inline-flex rounded-xl bg-[#F1EFEB] p-1 border border-[#1F2A38]/8">
                  <button
                    type="button"
                    onClick={() => setWindowMode('quick')}
                    className={`flex-1 sm:flex-none rounded-lg px-2.5 sm:px-3.5 min-h-[40px] sm:min-h-0 py-2 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      windowMode === 'quick'
                        ? 'bg-[#1F2A38] text-[#FFFFFF]'
                        : 'text-[#5A6C85] hover:text-[#1F2A38]'
                    }`}
                  >
                    Quick (30–60s)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWindowMode('session')}
                    className={`flex-1 sm:flex-none rounded-lg px-2.5 sm:px-3.5 min-h-[40px] sm:min-h-0 py-2 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      windowMode === 'session'
                        ? 'bg-[#1F2A38] text-[#FFFFFF]'
                        : 'text-[#5A6C85] hover:text-[#1F2A38]'
                    }`}
                  >
                    Session (5–10m)
                  </button>
                </div>
                <p className="mt-2 text-xs text-[#5A6C85] leading-relaxed">
                  {windowMode === 'quick'
                    ? 'Captures rapid acute shifts with slightly wider uncertainty bounds.'
                    : 'Stabilizes slow autonomic HRV & baseline drift for longitudinal accuracy.'}
                </p>
              </div>
            </div>

            {/* Channel Dropout Toggles & Real-Time Weight Distribution */}
            <div className="pt-6 border-t border-[#1F2A38]/8">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#1F2A38]">
                    Channel Dropout Resilience
                  </h3>
                  <p className="text-xs text-[#5A6C85]">
                    Toggle channels off to watch attention weights and confidence recalculate live.
                  </p>
                </div>
                <span className="font-mono tabular-nums text-xs text-[#5A6C85]">
                  {(Object.values(availability) as boolean[]).filter(Boolean).length}/6 Active
                </span>
              </div>

              <div className="space-y-3">
                {(Object.keys(CHANNEL_LABELS) as ChannelId[]).map((ch) => {
                  const enabled = availability[ch];
                  const weightPct = Math.round((fusionOutput.channelWeights[ch] || 0) * 100);
                  return (
                    <div key={ch} className="flex items-center gap-2.5 sm:gap-4">
                      <button
                        type="button"
                        onClick={() => toggleChannelAvailability(ch)}
                        aria-pressed={enabled}
                        className={`w-24 min-[380px]:w-28 sm:w-32 shrink-0 rounded-lg px-2.5 sm:px-3 min-h-[40px] sm:min-h-0 py-1.5 text-xs font-medium text-left flex items-center justify-between border transition-colors cursor-pointer ${
                          enabled
                            ? 'bg-[#E8EEF5]/65 border-[#1F2A38]/15 text-[#1F2A38]'
                            : 'bg-[#F1EFEB] border-[#1F2A38]/10 text-[#5A6C85] line-through'
                        }`}
                      >
                        <span className="truncate">{CHANNEL_LABELS[ch]}</span>
                        <span className="font-mono text-[10px] shrink-0">{enabled ? 'ON' : 'OFF'}</span>
                      </button>

                      <div className="flex-1 h-2 rounded-full bg-[#F1EFEB] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#1F2A38] transition-all duration-300"
                          style={{ width: `${weightPct}%` }}
                        />
                      </div>

                      <div className="w-10 sm:w-12 text-right font-mono tabular-nums text-xs font-medium text-[#1F2A38]">
                        {weightPct}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Live Recalculated Fusion Readout */}
          <div className="lg:col-span-5 min-w-0 rounded-[24px] bg-[#FFFFFF] border border-[#1F2A38]/10 p-5 sm:p-8 flex flex-col items-center text-center">
            <div className="text-xs font-mono uppercase tracking-[0.18em] text-[#5A6C85]">
              Live Fusion Output ({fusionMode === 'attention' ? 'Attention' : 'Late'})
            </div>

            <div className="mt-3">
              <RadialGauge
                score={fusionOutput.score}
                band={fusionOutput.band}
                confidence={fusionOutput.confidence}
                theme="light"
                size={200}
              />
            </div>

            <div className="w-full grid grid-cols-2 gap-4 pt-4 mt-2 border-t border-[#1F2A38]/8 text-left">
              <div>
                <div className="text-[11px] font-mono uppercase text-[#5A6C85]">
                  Model Confidence
                </div>
                <div className="mt-0.5 font-mono tabular-nums text-xl font-semibold text-[#1F2A38]">
                  {fusionOutput.confidence}%
                </div>
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase text-[#5A6C85]">
                  Raw Pre-Gate
                </div>
                <div className="mt-0.5 font-mono tabular-nums text-xl font-semibold text-[#1F2A38]">
                  {fusionOutput.rawScore} pts
                </div>
              </div>
            </div>

            <div className="mt-4 w-full rounded-xl bg-[#F1EFEB] p-3.5 text-left text-xs text-[#1F2A38]/85 leading-relaxed">
              <span className="font-semibold text-[#1F2A38]">Uncertainty & Context: </span>
              {fusionOutput.uncertaintyReason}
            </div>
          </div>
        </div>

        {/* 4 Automated Confounder & Quality Gates */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {fusionOutput.activeGates.map((gate) => {
            const Icon =
              gate.id === 'physical-exertion'
                ? Activity
                : gate.id === 'curiosity-excitement'
                  ? Sparkles
                  : gate.id === 'low-luminance'
                    ? EyeOff
                    : HelpCircle;
            const actionMeta = GATE_TRIGGER_PRESETS[gate.id];
            return (
              <div
                key={gate.id}
                className={`rounded-[20px] p-5 border transition-colors flex flex-col justify-between ${
                  gate.triggered
                    ? 'bg-[#1F2A38] text-[#FFFFFF] border-[#1F2A38]'
                    : 'bg-[#FFFFFF]/85 text-[#1F2A38] border-[#1F2A38]/8'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <Icon
                      className={`w-4 h-4 ${
                        gate.triggered ? 'text-[#E8EEF5]' : 'text-[#5A6C85]'
                      }`}
                      aria-hidden="true"
                    />
                    <span
                      className={`text-[11px] font-mono uppercase tracking-wider ${
                        gate.triggered ? 'text-[#E8EEF5]' : 'text-[#5A6C85]'
                      }`}
                    >
                      {gate.triggered ? 'Gate Active' : 'Standby'}
                    </span>
                  </div>

                  <h3 className="mt-3 text-sm font-semibold">{gate.name}</h3>
                  <p
                    className={`mt-2 text-xs leading-relaxed ${
                      gate.triggered ? 'text-[#E8EEF5]/80' : 'text-[#5A6C85]'
                    }`}
                  >
                    {gate.explanation}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleTriggerGatePreview(gate.id)}
                  className={`mt-4 pt-3 min-h-[40px] sm:min-h-0 border-t text-xs font-medium text-left flex items-center cursor-pointer transition-colors ${
                    gate.triggered
                      ? 'border-[#E8EEF5]/15 text-[#E8EEF5] hover:text-[#FFFFFF]'
                      : 'border-[#1F2A38]/8 text-[#1F2A38] hover:text-[#5A6C85]'
                  }`}
                >
                  {actionMeta.hint} →
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
