export type StressBand = 'Calm' | 'Mild' | 'Moderate' | 'High' | 'Very High';

export type ChannelId =
  | 'facial'
  | 'rppg'
  | 'voice'
  | 'language'
  | 'posture'
  | 'wearable';

export type FusionMode = 'late' | 'attention';
export type ObservationWindow = 'quick' | 'session';
export type HeroPresetId =
  | 'calm-rest'
  | 'cognitive-strain'
  | 'physical-exertion'
  | 'curiosity-excitement'
  | 'low-light-dropout';

export type GateId =
  | 'physical-exertion'
  | 'curiosity-excitement'
  | 'low-luminance'
  | 'baseline-uncertainty';

export interface SignalFeatureSnapshot {
  // Facial FACS & Gaze
  au4BrowLowerer: number; // 0..1
  au7LidTightener: number; // 0..1
  blinkRatePerMin: number;
  gazeShiftRate: number;
  // rPPG & Camera Quality
  rppgBpm: number;
  ambientLuminance: number; // 0..100
  rppgWaveform: number[];
  // Voice & Acoustics
  pitchF0Hz: number;
  jitterPct: number;
  shimmerPct: number;
  speakingRateWpm: number;
  pauseRatio: number; // 0..1
  audioWaveform: number[];
  // Language Context (ephemeral local evaluation only)
  negLexiconRatio: number; // 0..1
  utteranceCount: number;
  // Body Posture & Kinesics
  postureClosure: number; // 0..1
  movementEnergy: number; // 0..1
  gestureJerkiness: number; // 0..1
  selfTouchCount: number;
  // Wearable / Physiological
  bleBpm: number;
  hrvRmssdMs: number;
  edaMicroSiemens: number;
  skinTempC: number;
  accelMagnitudeG: number;
}

export interface ChannelAvailability {
  facial: boolean;
  rppg: boolean;
  voice: boolean;
  language: boolean;
  posture: boolean;
  wearable: boolean;
}

export interface ContributingSignal {
  label: string;
  direction: 'up' | 'down' | 'nominal';
  deltaText: string;
  weight: number;
  channel: ChannelId;
}

export interface ConfounderGateResult {
  id: GateId;
  name: string;
  triggered: boolean;
  severity: 'info' | 'warning' | 'active';
  explanation: string;
  scoreAdjustment: number;
}

export interface FusionOutput {
  score: number; // 0..100
  rawScore: number;
  band: StressBand;
  confidence: number; // 0..100
  baselineShiftDelta: number; // relative to mu_0
  uncertaintyReason: string;
  activeGates: ConfounderGateResult[];
  topContributors: ContributingSignal[];
  channelWeights: Record<ChannelId, number>;
}

export interface BaselineProfile {
  established: boolean;
  calibratedAt: string | null;
  hrvRmssdMs: number;
  restingBpm: number;
  pitchF0Hz: number;
  au4Baseline: number;
  movementEnergy: number;
  edaMicroSiemens: number;
  sessionCount: number;
}

export interface LifestyleContext {
  sleepQuality: 'Poor' | 'Fair' | 'Good' | 'Restorative';
  sleepDurationHrs: number;
  physicalActivity: 'Sedentary' | 'Light' | 'Moderate' | 'Vigorous';
  socialCloseness: 'Isolated' | 'Low' | 'Supported' | 'High';
  workStudyLoad: 'Light' | 'Balanced' | 'Heavy' | 'Overloaded';
  caffeine: 'None' | '1-2 cups' | '3+ cups';
  medicationOrHealthNote: string;
}

export interface SessionRecord {
  id: string;
  timestamp: string;
  timeframeTag: 'Session' | '24-Hour' | 'Week';
  label: string;
  score: number;
  band: StressBand;
  confidence: number;
  baselineDelta: number;
  activityTag: string;
  durationWindow: ObservationWindow;
  contributors: string[];
  gatesTriggered: string[];
  pss10Score?: number;
}

export interface DatasetReplayFrame {
  minute: number;
  phase: 'Baseline' | 'Preparation' | 'TSST Stress' | 'Arithmetic' | 'Recovery';
  groundTruth: number;
  msaPrediction: number;
  confidence: number;
  hrBpm: number;
  hrvRmssd: number;
  au4: number;
  gateNote?: string;
}

export interface DatasetProtocol {
  id: 'wesad' | 'stressid' | 'ubfc-phys';
  name: string;
  fullName: string;
  cohort: string;
  modalities: string;
  macroF1: string;
  maeScore: string;
  frames: DatasetReplayFrame[];
}

export interface BenchmarkCapability {
  id: string;
  index: number;
  capability: string;
  category: 'Sensing' | 'Fusion & Gates' | 'Calibration & Context' | 'Validation & Privacy';
  webImplementation: string;
  mobileBenchmark: string;
  losoMetric: string;
  falseAlarmRate: string;
  status: 'Verified' | 'Hardware + Sim' | 'Opt-In Edge';
  testScenario: {
    workspaceTab: 'sensors' | 'calibration' | 'pss10' | 'report';
    focusChannel?: ChannelId;
    presetId?: HeroPresetId;
  };
}
