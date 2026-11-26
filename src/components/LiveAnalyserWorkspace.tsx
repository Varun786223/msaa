import { useState } from 'react';
import {
  Bluetooth,
  Camera,
  Check,
  Eye,
  EyeOff,
  Maximize2,
  Mic,
  Minimize2,
  PanelRightClose,
  Save,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import {
  HERO_PRESETS,
  PSS10_ITEMS,
  PSS10_SCALE_OPTIONS,
} from '../data/msaData';
import { useLiveEngine, WorkspaceTab } from '../context/LiveEngineContext';
import { ChannelId, HeroPresetId, LifestyleContext } from '../types/msa';
import { MsaLogo } from './MsaLogo';
import { RadialGauge } from './RadialGauge';

const TAB_ITEMS: Array<{ id: WorkspaceTab; label: string }> = [
  { id: 'sensors', label: 'Sensors & Hardware' },
  { id: 'calibration', label: 'Baseline Calibration' },
  { id: 'pss10', label: 'PSS-10 & Context' },
  { id: 'report', label: 'Contextual Report' },
];

export function LiveAnalyserWorkspace() {
  const {
    workspaceMode,
    workspaceTab,
    focusChannel,
    dockWorkspace,
    closeWorkspace,
    openWorkspace,
    setWorkspaceTab,
    fusionMode,
    setFusionMode,
    windowMode,
    setWindowMode,
    availability,
    toggleChannelAvailability,
    privacyMask,
    setPrivacyMask,
    simScenario,
    setSimScenario,
    webcamActive,
    micActive,
    speechActive,
    bleActive,
    bleDeviceName,
    hardwareNotice,
    clearHardwareNotice,
    startWebcam,
    stopWebcam,
    startMicrophone,
    stopMicrophone,
    toggleSpeechRecognition,
    submitEphemeralText,
    lastEphemeralMeta,
    connectBleHeartRate,
    disconnectBleHeartRate,
    videoRef,
    features,
    fusionOutput,
    baseline,
    calibrationStage,
    calibrationSecondsLeft,
    startCalibration,
    cancelCalibration,
    pss10Responses,
    setPss10Response,
    pss10Result,
    lifestyle,
    setLifestyle,
    saveCurrentSnapshot,
  } = useLiveEngine();

  const [ephemeralDraft, setEphemeralDraft] = useState('');
  const [snapshotTag, setSnapshotTag] = useState('Live Assessment');
  const [savedFeedback, setSavedFeedback] = useState(false);

  if (workspaceMode === 'closed') return null;

  const handleAnalyzeEphemeral = () => {
    if (!ephemeralDraft.trim()) return;
    submitEphemeralText(ephemeralDraft);
    // Immediately purge raw input from state
    setEphemeralDraft('');
  };

  const handleSaveReportSnapshot = () => {
    saveCurrentSnapshot(snapshotTag);
    setSavedFeedback(true);
    window.setTimeout(() => setSavedFeedback(false), 2600);
  };

  // Docked Persistent Live Telemetry Sidebar
  if (workspaceMode === 'docked') {
    return (
      <>
        {/* Desktop Persistent Telemetry Sidebar */}
        <aside
          aria-label="Persistent live telemetry sidebar"
          className="hidden lg:flex fixed right-4 top-20 bottom-4 w-80 z-40 rounded-[24px] bg-[#FFFFFF]/95 backdrop-blur-xl border border-[#1F2A38]/12 shadow-2xl shadow-[#1F2A38]/10 flex-col justify-between p-5 overflow-y-auto"
        >
          <div>
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#1F2A38]/8">
              <div className="text-xs font-mono uppercase tracking-wider text-[#5A6C85]">
                Live Telemetry Rail
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openWorkspace()}
                  aria-label="Expand full workspace"
                  className="rounded-lg p-1.5 text-[#5A6C85] hover:bg-[#E8EEF5] hover:text-[#1F2A38] cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={closeWorkspace}
                  aria-label="Close live telemetry"
                  className="rounded-lg p-1.5 text-[#5A6C85] hover:bg-[#E8EEF5] hover:text-[#1F2A38] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-col items-center">
              <RadialGauge
                score={fusionOutput.score}
                band={fusionOutput.band}
                confidence={fusionOutput.confidence}
                theme="light"
                size={168}
              />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2.5 text-xs border-t border-[#1F2A38]/8 pt-3">
              <div>
                <div className="text-[#5A6C85] text-[11px]">Confidence</div>
                <div className="font-mono tabular-nums font-semibold text-[#1F2A38]">
                  {fusionOutput.confidence}%
                </div>
              </div>
              <div>
                <div className="text-[#5A6C85] text-[11px]">Baseline Δ</div>
                <div className="font-mono tabular-nums font-semibold text-[#1F2A38]">
                  {fusionOutput.baselineShiftDelta >= 0 ? '+' : ''}
                  {fusionOutput.baselineShiftDelta} vs μ₀
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#1F2A38]/8">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#5A6C85] mb-2">
                Active Hardware / Sim
              </div>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                <span className="rounded-md bg-[#E8EEF5] px-2 py-0.5 text-[#1F2A38]">
                  Cam: {webcamActive ? 'LIVE' : 'SIM'}
                </span>
                <span className="rounded-md bg-[#E8EEF5] px-2 py-0.5 text-[#1F2A38]">
                  Mic: {micActive ? 'LIVE' : 'SIM'}
                </span>
                <span className="rounded-md bg-[#E8EEF5] px-2 py-0.5 text-[#1F2A38]">
                  BLE: {bleActive ? 'LIVE' : 'SIM'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#1F2A38]/8 space-y-1.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#5A6C85]">
                Top Signals
              </div>
              {fusionOutput.topContributors.slice(0, 3).map((c) => (
                <div key={c.label} className="flex items-center justify-between text-xs">
                  <span className="text-[#1F2A38] truncate pr-2">{c.label}</span>
                  <span className="font-mono tabular-nums text-[#5A6C85] shrink-0">
                    {c.deltaText.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => openWorkspace()}
            className="mt-4 w-full rounded-full bg-[#1F2A38] py-2.5 text-xs font-semibold text-[#FFFFFF] hover:bg-[#2B3A4D] transition-colors cursor-pointer"
          >
            Open Full Analyser
          </button>
        </aside>

        {/* Mobile Compact Telemetry Bar (keeps aggregate sticky <= 15% mobile viewport height) */}
        <div className="lg:hidden fixed bottom-2 left-3 right-3 z-40 rounded-2xl bg-[#1F2A38] text-[#FFFFFF] px-3.5 py-1.5 shadow-xl flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="font-mono tabular-nums text-base font-semibold">
              {fusionOutput.score}
            </span>
            <div className="text-xs truncate">
              <span className="font-semibold">{fusionOutput.band}</span>
              <span className="text-[#E8EEF5]/70 ml-1.5 font-mono">
                {fusionOutput.confidence}% conf
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => openWorkspace()}
              className="rounded-full bg-[#E8EEF5] px-3 min-h-[36px] text-xs font-semibold text-[#1F2A38] cursor-pointer"
            >
              Expand
            </button>
            <button
              type="button"
              onClick={closeWorkspace}
              aria-label="Close telemetry bar"
              className="min-w-[36px] min-h-[36px] inline-flex items-center justify-center text-[#E8EEF5]/75 hover:text-[#FFFFFF] cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </>
    );
  }

  // Full Dedicated Live Analyser Workspace (Split View with Persistent Telemetry Rail)
  return (
    <div
      className="fixed inset-0 z-50 bg-[#1F2A38]/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 lg:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="MSA Live Multimodal Stress Analyser Workspace"
    >
      <div className="w-full max-w-7xl h-full sm:max-h-[920px] rounded-none sm:rounded-[24px] bg-[#F1EFEB] border border-[#1F2A38]/15 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Workspace Header */}
        <header className="bg-[#FFFFFF] border-b border-[#1F2A38]/10 px-4 sm:px-5 py-3 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-5 min-w-0">
            <MsaLogo variant="dark" />
            <nav className="hidden md:flex items-center gap-1 bg-[#E8EEF5]/65 p-1 rounded-xl">
              {TAB_ITEMS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setWorkspaceTab(tab.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    workspaceTab === tab.id
                      ? 'bg-[#1F2A38] text-[#FFFFFF]'
                      : 'text-[#5A6C85] hover:text-[#1F2A38]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={dockWorkspace}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#1F2A38]/20 bg-[#FFFFFF] px-3 sm:px-3.5 min-h-[38px] sm:min-h-0 py-1.5 text-xs font-semibold text-[#1F2A38] hover:bg-[#E8EEF5]/60 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="sm:hidden">Dock</span>
              <span className="hidden sm:inline">Dock Telemetry Sidebar</span>
            </button>
            <button
              type="button"
              onClick={closeWorkspace}
              aria-label="Close workspace"
              className="inline-flex items-center gap-1 rounded-full bg-[#1F2A38] px-3 sm:px-3.5 min-h-[38px] sm:min-h-0 py-1.5 text-xs font-semibold text-[#FFFFFF] hover:bg-[#2B3A4D] transition-colors cursor-pointer"
            >
              <PanelRightClose className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Close</span>
            </button>
          </div>
        </header>

        {/* Mobile Tab Selector */}
        <div className="md:hidden bg-[#FFFFFF] border-b border-[#1F2A38]/8 px-3 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0">
          {TAB_ITEMS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setWorkspaceTab(tab.id)}
              className={`rounded-lg px-3 min-h-[38px] py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                workspaceTab === tab.id
                  ? 'bg-[#1F2A38] text-[#FFFFFF]'
                  : 'bg-[#E8EEF5]/60 text-[#5A6C85]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Asymmetric Split Console Body: unified vertical scroll on mobile, dual pane on lg+ */}
        <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-12 overflow-y-auto lg:overflow-hidden">
          {/* Left Main Stage (8 cols) */}
          <div className="lg:col-span-8 lg:overflow-y-auto p-4 sm:p-7 space-y-5 sm:space-y-6">
            {hardwareNotice && (
              <div className="rounded-xl border border-[#1F2A38]/15 bg-[#FFFFFF] px-4 py-3 flex items-center justify-between gap-3 text-xs text-[#1F2A38]">
                <span>{hardwareNotice}</span>
                <button
                  type="button"
                  onClick={clearHardwareNotice}
                  className="text-[#5A6C85] hover:text-[#1F2A38] font-semibold cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* TAB 1: SENSORS & HARDWARE */}
            {workspaceTab === 'sensors' && (
              <div className="space-y-6">
                {/* Simulated Stream Preset Bar + Hardware Action Buttons */}
                <div className="rounded-[20px] bg-[#FFFFFF] border border-[#1F2A38]/8 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1F2A38]/8">
                    <div>
                      <h2 className="text-base font-semibold text-[#1F2A38]">
                        Signal Acquisition & Biometric Simulator
                      </h2>
                      <p className="text-xs text-[#5A6C85]">
                        Connect real camera, microphone, or Bluetooth heart rate hardware—or switch
                        simulated scenarios anytime.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={webcamActive ? stopWebcam : startWebcam}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 min-h-[40px] sm:min-h-0 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                          webcamActive
                            ? 'bg-[#1F2A38] text-[#FFFFFF]'
                            : 'bg-[#E8EEF5] text-[#1F2A38] hover:bg-[#1F2A38] hover:text-[#FFFFFF]'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{webcamActive ? 'Stop Camera' : 'Enable Camera'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={micActive ? stopMicrophone : startMicrophone}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 min-h-[40px] sm:min-h-0 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                          micActive
                            ? 'bg-[#1F2A38] text-[#FFFFFF]'
                            : 'bg-[#E8EEF5] text-[#1F2A38] hover:bg-[#1F2A38] hover:text-[#FFFFFF]'
                        }`}
                      >
                        <Mic className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{micActive ? 'Stop Mic' : 'Enable Mic'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={bleActive ? disconnectBleHeartRate : connectBleHeartRate}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 min-h-[40px] sm:min-h-0 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                          bleActive
                            ? 'bg-[#1F2A38] text-[#FFFFFF]'
                            : 'bg-[#E8EEF5] text-[#1F2A38] hover:bg-[#1F2A38] hover:text-[#FFFFFF]'
                        }`}
                      >
                        <Bluetooth className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{bleActive ? `Paired: ${bleDeviceName}` : 'Pair BLE HR'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Simulator Scenario Pills */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-[#5A6C85] mr-1">
                      Simulated Stream:
                    </span>
                    {HERO_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSimScenario(p.id as HeroPresetId)}
                        className={`rounded-full px-3 min-h-[36px] sm:min-h-0 py-1.5 sm:py-1 text-xs font-medium transition-colors cursor-pointer ${
                          simScenario === p.id
                            ? 'bg-[#1F2A38] text-[#FFFFFF]'
                            : 'bg-[#F1EFEB] text-[#5A6C85] hover:text-[#1F2A38]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optical Camera + Facial + rPPG + Posture Stage */}
                <div
                  className={`rounded-[20px] bg-[#FFFFFF] border p-5 transition-colors ${
                    focusChannel === 'facial' || focusChannel === 'rppg' || focusChannel === 'posture'
                      ? 'border-[#1F2A38]'
                      : 'border-[#1F2A38]/8'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-[#1F2A38]">
                        Optical Channels · Facial FACS, rPPG Pulse & Upper-Body Kinesics
                      </h3>
                      <p className="text-xs text-[#5A6C85]">
                        Luminance {Math.round(features.ambientLuminance)}% ·{' '}
                        {features.ambientLuminance < 30
                          ? 'Low-Light Gate Active'
                          : 'Adequate ROI illumination'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPrivacyMask(!privacyMask)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border cursor-pointer ${
                        privacyMask
                          ? 'bg-[#1F2A38] text-[#FFFFFF] border-[#1F2A38]'
                          : 'bg-[#E8EEF5] text-[#1F2A38] border-[#1F2A38]/15'
                      }`}
                    >
                      {privacyMask ? (
                        <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                      <span>{privacyMask ? 'Privacy Mask Active' : 'Show Camera ROI'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    {/* Video / Privacy Mask Viewport */}
                    <div className="md:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#1F2A38] border border-[#1F2A38]/15 flex items-center justify-center">
                      <video
                        ref={videoRef}
                        muted
                        playsInline
                        className={`w-full h-full object-cover scale-x-[-1] ${
                          webcamActive && !privacyMask ? 'opacity-100' : 'opacity-0 absolute inset-0'
                        }`}
                      />
                      {(!webcamActive || privacyMask) && (
                        <div className="relative z-10 flex flex-col items-center justify-center text-center p-4">
                          <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
                            <ellipse
                              cx="48"
                              cy="42"
                              rx="22"
                              ry="27"
                              stroke="#E8EEF5"
                              strokeWidth="1.5"
                              strokeDasharray="3 3"
                            />
                            <path
                              d="M36 36L43 38M60 36L53 38"
                              stroke="#E8EEF5"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                            <path
                              d="M41 53C44 55 52 55 55 53"
                              stroke="#5A6C85"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                            <path
                              d="M20 86C22 72 34 66 48 66C62 66 74 72 76 86"
                              stroke="#E8EEF5"
                              strokeOpacity="0.65"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="mt-2 text-[11px] font-mono text-[#E8EEF5]/80">
                            {webcamActive
                              ? 'Privacy Mask · Raw Video Hidden'
                              : 'Simulated Optical Contour'}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Optical Metrics & rPPG Waveform */}
                    <div className="md:col-span-7 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
                        <div className="rounded-xl bg-[#E8EEF5]/55 p-3">
                          <div className="text-[#5A6C85]">AU4 / AU7</div>
                          <div className="font-mono tabular-nums font-semibold text-[#1F2A38] mt-1">
                            {Math.round(features.au4BrowLowerer * 100)}% /{' '}
                            {Math.round(features.au7LidTightener * 100)}%
                          </div>
                        </div>
                        <div className="rounded-xl bg-[#E8EEF5]/55 p-3">
                          <div className="text-[#5A6C85]">rPPG Pulse</div>
                          <div className="font-mono tabular-nums font-semibold text-[#1F2A38] mt-1">
                            {Math.round(features.rppgBpm)} BPM
                          </div>
                        </div>
                        <div className="rounded-xl bg-[#E8EEF5]/55 p-3">
                          <div className="text-[#5A6C85]">Posture Closure</div>
                          <div className="font-mono tabular-nums font-semibold text-[#1F2A38] mt-1">
                            {Math.round(features.postureClosure * 100)}%
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#1F2A38]/8 bg-[#E8EEF5]/35 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-1">
                          <span className="text-[#5A6C85]">Green-Channel rPPG Waveform</span>
                          <span className="font-mono tabular-nums text-[#1F2A38]">
                            Blink {features.blinkRatePerMin}/m · Adaptors {features.selfTouchCount}
                          </span>
                        </div>
                        <svg viewBox="0 0 320 40" className="w-full h-10 overflow-visible">
                          <polyline
                            fill="none"
                            stroke="#1F2A38"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={features.rppgWaveform
                              .map(
                                (v, i) =>
                                  `${(i / Math.max(1, features.rppgWaveform.length - 1)) * 320},${36 - v * 30}`
                              )
                              .join(' ')}
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Voice DSP & Opt-In Ephemeral Language Context */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Voice Card */}
                  <div
                    className={`rounded-[20px] bg-[#FFFFFF] border p-5 ${
                      focusChannel === 'voice' ? 'border-[#1F2A38]' : 'border-[#1F2A38]/8'
                    }`}
                  >
                    <h3 className="text-sm font-semibold text-[#1F2A38]">
                      Voice & Acoustic Autocorrelation
                    </h3>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl bg-[#E8EEF5]/55 p-3">
                        <div className="text-[#5A6C85]">Pitch F₀</div>
                        <div className="font-mono tabular-nums font-semibold text-[#1F2A38] mt-0.5">
                          {Math.round(features.pitchF0Hz)} Hz
                        </div>
                      </div>
                      <div className="rounded-xl bg-[#E8EEF5]/55 p-3">
                        <div className="text-[#5A6C85]">Jitter / Shimmer</div>
                        <div className="font-mono tabular-nums font-semibold text-[#1F2A38] mt-0.5">
                          {features.jitterPct.toFixed(2)}% / {features.shimmerPct.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    {/* Time-domain wave bars */}
                    <div className="mt-4 h-12 rounded-xl bg-[#E8EEF5]/35 px-3 flex items-center justify-between gap-1.5">
                      {features.audioWaveform.map((val, idx) => (
                        <div
                          key={idx}
                          className="flex-1 rounded-full bg-[#1F2A38] transition-all duration-150"
                          style={{ height: `${Math.max(12, Math.abs(val) * 100)}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Opt-In Language Context Card */}
                  <div
                    className={`rounded-[20px] bg-[#FFFFFF] border p-5 ${
                      focusChannel === 'language' ? 'border-[#1F2A38]' : 'border-[#1F2A38]/8'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-[#1F2A38]">
                        Opt-In Ephemeral Language Context
                      </h3>
                      <button
                        type="button"
                        onClick={toggleSpeechRecognition}
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold cursor-pointer ${
                          speechActive
                            ? 'bg-[#1F2A38] text-[#FFFFFF]'
                            : 'bg-[#E8EEF5] text-[#1F2A38]'
                        }`}
                      >
                        {speechActive ? 'Stop SpeechRec' : 'SpeechRec'}
                      </button>
                    </div>
                    <p className="mt-1.5 text-xs text-[#5A6C85]">
                      Scores strain lexicon locally and immediately purges raw text from memory.
                    </p>
                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={ephemeralDraft}
                        onChange={(e) => setEphemeralDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAnalyzeEphemeral();
                        }}
                        placeholder="Type brief note to score & auto-purge..."
                        className="flex-1 rounded-lg border border-[#1F2A38]/15 px-3 py-2 sm:py-1.5 text-xs text-[#1F2A38]"
                      />
                      <button
                        type="button"
                        onClick={handleAnalyzeEphemeral}
                        className="rounded-lg bg-[#1F2A38] px-4 py-2 sm:py-1.5 text-xs font-semibold text-[#FFFFFF] cursor-pointer"
                      >
                        Score
                      </button>
                    </div>
                    <div className="mt-2.5 text-[11px] font-mono text-[#5A6C85]">
                      {lastEphemeralMeta
                        ? `Raw text purged · ${lastEphemeralMeta.wordCount} words evaluated · ${(lastEphemeralMeta.ratio * 100).toFixed(0)}% ratio`
                        : `Current lexicon ratio: ${(features.negLexiconRatio * 100).toFixed(0)}%`}
                    </div>
                  </div>
                </div>

                {/* Wearable BLE & Simulated Physiology Readout */}
                <div
                  className={`rounded-[20px] bg-[#FFFFFF] border p-5 ${
                    focusChannel === 'wearable' ? 'border-[#1F2A38]' : 'border-[#1F2A38]/8'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-[#1F2A38]">
                        Wearable BLE GATT & Physiological Simulator
                      </h3>
                      <p className="text-xs text-[#5A6C85]">
                        {bleActive
                          ? `Streaming live RR intervals from ${bleDeviceName}`
                          : 'Simulating HRV RMSSD, EDA, skin temperature & accelerometer magnitude'}
                      </p>
                    </div>
                    <span className="font-mono text-[11px] text-[#5A6C85]">
                      {bleActive ? 'BLE 0x180D Live' : 'Simulated Stream'}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="rounded-xl bg-[#E8EEF5]/55 p-3">
                      <div className="text-[#5A6C85]">Heart Rate</div>
                      <div className="font-mono tabular-nums font-semibold text-[#1F2A38] mt-0.5">
                        {Math.round(features.bleBpm)} BPM
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#E8EEF5]/55 p-3">
                      <div className="text-[#5A6C85]">HRV RMSSD</div>
                      <div className="font-mono tabular-nums font-semibold text-[#1F2A38] mt-0.5">
                        {Math.round(features.hrvRmssdMs)} ms
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#E8EEF5]/55 p-3">
                      <div className="text-[#5A6C85]">EDA / Temp</div>
                      <div className="font-mono tabular-nums font-semibold text-[#1F2A38] mt-0.5">
                        {features.edaMicroSiemens.toFixed(1)} μS · {features.skinTempC.toFixed(1)}°C
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#E8EEF5]/55 p-3">
                      <div className="text-[#5A6C85]">Accel Mag</div>
                      <div className="font-mono tabular-nums font-semibold text-[#1F2A38] mt-0.5">
                        {features.accelMagnitudeG.toFixed(2)} g
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CALIBRATION */}
            {workspaceTab === 'calibration' && (
              <div className="rounded-[20px] bg-[#FFFFFF] border border-[#1F2A38]/8 p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#1F2A38]">
                    Guided Two-Stage Personal Calibration (μ₀)
                  </h2>
                  <p className="text-xs text-[#5A6C85] mt-1">
                    Stage 1 calms observer anxiety with guided breathing; Stage 2 captures your
                    resting physiological & facial baseline into local storage.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    className={`rounded-2xl p-5 border ${
                      calibrationStage === 'settling'
                        ? 'bg-[#1F2A38] text-[#FFFFFF] border-[#1F2A38]'
                        : 'bg-[#E8EEF5]/45 text-[#1F2A38] border-[#1F2A38]/8'
                    }`}
                  >
                    <div className="text-xs font-mono uppercase">Stage 1 · Settling Period</div>
                    <div className="mt-2 text-2xl font-mono tabular-nums font-semibold">
                      {calibrationStage === 'settling' ? `${calibrationSecondsLeft}s` : '8s Pace'}
                    </div>
                    <p
                      className={`mt-2 text-xs ${
                        calibrationStage === 'settling' ? 'text-[#E8EEF5]/80' : 'text-[#5A6C85]'
                      }`}
                    >
                      Inhale steadily for 4 seconds, exhale for 4 seconds to settle heart rate and
                      relax brow tension.
                    </p>
                  </div>

                  <div
                    className={`rounded-2xl p-5 border ${
                      calibrationStage === 'capturing'
                        ? 'bg-[#1F2A38] text-[#FFFFFF] border-[#1F2A38]'
                        : 'bg-[#E8EEF5]/45 text-[#1F2A38] border-[#1F2A38]/8'
                    }`}
                  >
                    <div className="text-xs font-mono uppercase">Stage 2 · Neutral Capture</div>
                    <div className="mt-2 text-2xl font-mono tabular-nums font-semibold">
                      {calibrationStage === 'capturing' ? `${calibrationSecondsLeft}s` : '10s Lock'}
                    </div>
                    <p
                      className={`mt-2 text-xs ${
                        calibrationStage === 'capturing' ? 'text-[#E8EEF5]/80' : 'text-[#5A6C85]'
                      }`}
                    >
                      Samples resting HRV RMSSD, HR, pitch F₀, and facial AU4 into your local μ₀
                      profile.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#1F2A38]/8 text-xs">
                  <div>
                    <div className="text-[#5A6C85]">HRV RMSSD μ₀</div>
                    <div className="font-mono tabular-nums text-base font-semibold text-[#1F2A38]">
                      {baseline.established ? `${baseline.hrvRmssdMs} ms` : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#5A6C85]">Resting BPM μ₀</div>
                    <div className="font-mono tabular-nums text-base font-semibold text-[#1F2A38]">
                      {baseline.established ? `${baseline.restingBpm} BPM` : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#5A6C85]">Vocal F₀ μ₀</div>
                    <div className="font-mono tabular-nums text-base font-semibold text-[#1F2A38]">
                      {baseline.established ? `${baseline.pitchF0Hz} Hz` : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#5A6C85]">Sessions Tracked</div>
                    <div className="font-mono tabular-nums text-base font-semibold text-[#1F2A38]">
                      {baseline.sessionCount}
                    </div>
                  </div>
                </div>

                <div>
                  {calibrationStage === 'settling' || calibrationStage === 'capturing' ? (
                    <button
                      type="button"
                      onClick={cancelCalibration}
                      className="rounded-full border border-[#1F2A38]/20 px-5 py-2.5 text-xs font-semibold text-[#1F2A38] cursor-pointer"
                    >
                      Cancel Calibration
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startCalibration}
                      className="rounded-full bg-[#1F2A38] px-6 py-2.5 text-xs font-semibold text-[#FFFFFF] hover:bg-[#2B3A4D] cursor-pointer"
                    >
                      {calibrationStage === 'complete'
                        ? 'Baseline μ₀ Locked · Run Again'
                        : 'Begin Two-Stage Calibration'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: PSS-10 & CONTEXT */}
            {workspaceTab === 'pss10' && (
              <div className="rounded-[20px] bg-[#FFFFFF] border border-[#1F2A38]/8 p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-[#1F2A38]">
                      PSS-10 Scale & Holistic Lifestyle Context
                    </h2>
                    <p className="text-xs text-[#5A6C85]">
                      Automatic reverse-scoring applied to items 4, 5, 7, and 8.
                    </p>
                  </div>
                  <div className="font-mono tabular-nums text-base font-semibold text-[#1F2A38]">
                    {pss10Result.total} / 40 · {pss10Result.band}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {PSS10_ITEMS.map((item, idx) => (
                    <div
                      key={item.id}
                      className="rounded-xl bg-[#E8EEF5]/35 border border-[#1F2A38]/8 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-medium text-[#1F2A38]">
                          {item.id}. {item.prompt}
                        </p>
                        {item.reverseScored && (
                          <span className="font-mono text-[10px] text-[#5A6C85] shrink-0">
                            Rev
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {PSS10_SCALE_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setPss10Response(idx, opt.value)}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium cursor-pointer ${
                              pss10Responses[idx] === opt.value
                                ? 'bg-[#1F2A38] text-[#FFFFFF]'
                                : 'bg-[#FFFFFF] text-[#5A6C85] border border-[#1F2A38]/10'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#1F2A38]/8 text-xs">
                  <label className="block">
                    <span className="text-[#5A6C85] font-medium">Sleep Quality</span>
                    <select
                      value={lifestyle.sleepQuality}
                      onChange={(e) =>
                        setLifestyle((p) => ({
                          ...p,
                          sleepQuality: e.target.value as LifestyleContext['sleepQuality'],
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-[#1F2A38]/15 px-3 py-1.5 text-xs"
                    >
                      <option value="Poor">Poor</option>
                      <option value="Fair">Fair</option>
                      <option value="Good">Good</option>
                      <option value="Restorative">Restorative</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[#5A6C85] font-medium">Medication / Health Context</span>
                    <input
                      type="text"
                      value={lifestyle.medicationOrHealthNote}
                      onChange={(e) =>
                        setLifestyle((p) => ({ ...p, medicationOrHealthNote: e.target.value }))
                      }
                      placeholder="Optional non-diagnostic context"
                      className="mt-1 w-full rounded-lg border border-[#1F2A38]/15 px-3 py-1.5 text-xs"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB 4: CONTEXTUAL REPORT */}
            {workspaceTab === 'report' && (
              <div className="rounded-[20px] bg-[#FFFFFF] border border-[#1F2A38]/8 p-6 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#1F2A38]/8">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider text-[#5A6C85]">
                      Contextual Assessment Summary
                    </div>
                    <h2 className="mt-1 text-2xl font-semibold text-[#1F2A38]">
                      {fusionOutput.band} Band ({fusionOutput.score}/100)
                    </h2>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#5A6C85]">Baseline Comparison</div>
                    <div className="font-mono tabular-nums text-base font-semibold text-[#1F2A38]">
                      {fusionOutput.baselineShiftDelta >= 0 ? '+' : ''}
                      {fusionOutput.baselineShiftDelta} pts vs μ₀
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl bg-[#E8EEF5]/45 p-4">
                    <div className="font-semibold text-[#1F2A38] mb-2">
                      Signals That Shifted Most
                    </div>
                    <ul className="space-y-1.5">
                      {fusionOutput.topContributors.map((c) => (
                        <li key={c.label} className="flex items-center justify-between">
                          <span className="text-[#1F2A38]">{c.label}</span>
                          <span className="font-mono tabular-nums text-[#5A6C85]">
                            {c.deltaText}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl bg-[#F1EFEB] p-4 space-y-2">
                    <div className="font-semibold text-[#1F2A38]">
                      Contextual Contributors & Uncertainty
                    </div>
                    <p className="text-[#5A6C85] leading-relaxed">
                      PSS-10: <strong className="text-[#1F2A38]">{pss10Result.total}/40</strong> (
                      {pss10Result.band}) · Sleep:{' '}
                      <strong className="text-[#1F2A38]">{lifestyle.sleepQuality}</strong> ·
                      Workload:{' '}
                      <strong className="text-[#1F2A38]">{lifestyle.workStudyLoad}</strong>
                    </p>
                    <p className="text-[#1F2A38]/85 leading-relaxed">
                      {fusionOutput.uncertaintyReason}
                    </p>
                  </div>
                </div>

                {/* Save Snapshot Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <input
                    type="text"
                    value={snapshotTag}
                    onChange={(e) => setSnapshotTag(e.target.value)}
                    aria-label="Session activity tag"
                    placeholder="Activity tag (e.g. Afternoon Check-In)"
                    className="flex-1 min-w-0 min-h-[42px] sm:min-h-0 rounded-xl border border-[#1F2A38]/15 px-3.5 py-2 text-xs text-[#1F2A38]"
                  />
                  <button
                    type="button"
                    onClick={handleSaveReportSnapshot}
                    className="w-full sm:w-auto justify-center inline-flex items-center gap-1.5 rounded-full bg-[#1F2A38] px-5 min-h-[42px] sm:min-h-0 py-2 text-xs font-semibold text-[#FFFFFF] hover:bg-[#2B3A4D] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {savedFeedback ? (
                      <>
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Saved Locally</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Save Snapshot to History</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Non-diagnostic guidance footer */}
                <div className="rounded-xl border border-[#1F2A38]/12 bg-[#E8EEF5]/35 p-4 flex items-start gap-3 text-xs text-[#5A6C85] leading-relaxed">
                  <Sparkles className="w-4 h-4 text-[#1F2A38] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong className="text-[#1F2A38]">Non-Diagnostic Notice:</strong> MSA outputs
                    analytical pattern estimates for personal awareness and research only. They do
                    not constitute a medical diagnosis or treatment plan. If you experience
                    persistent distress, please consult a qualified healthcare professional.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Persistent Live Telemetry Sidebar inside Split View (4 cols) */}
          <aside className="lg:col-span-4 bg-[#FFFFFF] border-t lg:border-t-0 lg:border-l border-[#1F2A38]/10 p-4 sm:p-6 lg:overflow-y-auto flex flex-col justify-between gap-5">
            <div>
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#1F2A38]/8">
                <span className="text-xs font-mono uppercase tracking-wider text-[#5A6C85]">
                  Live Telemetry HUD
                </span>
                <span className="font-mono text-[11px] text-[#1F2A38]">
                  {fusionMode === 'attention' ? 'Attention' : 'Late'} ·{' '}
                  {windowMode === 'quick' ? '30–60s' : '5–10m'}
                </span>
              </div>

              <div className="mt-4 flex flex-col items-center">
                <RadialGauge
                  score={fusionOutput.score}
                  band={fusionOutput.band}
                  confidence={fusionOutput.confidence}
                  theme="light"
                  size={190}
                />
              </div>

              <div className="mt-2 grid grid-cols-2 gap-3 pt-3 border-t border-[#1F2A38]/8 text-xs">
                <div>
                  <div className="text-[#5A6C85] text-[11px]">Confidence</div>
                  <div className="font-mono tabular-nums text-base font-semibold text-[#1F2A38]">
                    {fusionOutput.confidence}%
                  </div>
                </div>
                <div>
                  <div className="text-[#5A6C85] text-[11px]">Baseline Shift</div>
                  <div className="font-mono tabular-nums text-base font-semibold text-[#1F2A38]">
                    {fusionOutput.baselineShiftDelta >= 0 ? '+' : ''}
                    {fusionOutput.baselineShiftDelta} vs μ₀
                  </div>
                </div>
              </div>

              {/* Quick Fusion & Window Switchers */}
              <div className="mt-4 pt-3 border-t border-[#1F2A38]/8 grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setFusionMode(fusionMode === 'attention' ? 'late' : 'attention')}
                  className="rounded-lg border border-[#1F2A38]/15 px-2.5 py-1.5 font-medium text-[#1F2A38] hover:bg-[#E8EEF5]/60 cursor-pointer"
                >
                  Mode: {fusionMode === 'attention' ? 'Attention' : 'Late'}
                </button>
                <button
                  type="button"
                  onClick={() => setWindowMode(windowMode === 'session' ? 'quick' : 'session')}
                  className="rounded-lg border border-[#1F2A38]/15 px-2.5 py-1.5 font-medium text-[#1F2A38] hover:bg-[#E8EEF5]/60 cursor-pointer"
                >
                  Win: {windowMode === 'session' ? '5–10m' : '30–60s'}
                </button>
              </div>

              {/* Active Gates */}
              <div className="mt-4 pt-3 border-t border-[#1F2A38]/8 space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#5A6C85]">
                  Confounder & Quality Gates
                </div>
                {fusionOutput.activeGates.map((g) => (
                  <div
                    key={g.id}
                    className={`rounded-lg px-3 py-2 text-xs flex items-center justify-between gap-2 ${
                      g.triggered
                        ? 'bg-[#1F2A38] text-[#FFFFFF]'
                        : 'bg-[#E8EEF5]/45 text-[#5A6C85]'
                    }`}
                  >
                    <span className="truncate flex items-center gap-1.5">
                      {g.triggered && <ShieldAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                      {g.name}
                    </span>
                    <span className="font-mono text-[10px] shrink-0">
                      {g.triggered ? 'ACTIVE' : 'OK'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Channel Dropouts Quick Toggles */}
              <div className="mt-4 pt-3 border-t border-[#1F2A38]/8">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#5A6C85] mb-2">
                  Active Channels
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(availability) as ChannelId[]).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => toggleChannelAvailability(ch)}
                      className={`rounded-md px-2 py-1 text-[11px] font-mono cursor-pointer ${
                        availability[ch]
                          ? 'bg-[#1F2A38] text-[#FFFFFF]'
                          : 'bg-[#F1EFEB] text-[#5A6C85] line-through'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setWorkspaceTab('report')}
              className="w-full rounded-full bg-[#1F2A38] py-2.5 text-xs font-semibold text-[#FFFFFF] hover:bg-[#2B3A4D] transition-colors cursor-pointer"
            >
              View Full Contextual Report →
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
