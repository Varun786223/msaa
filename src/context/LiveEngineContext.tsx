import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  computePss10Score,
  DEFAULT_BASELINE,
  DEFAULT_LIFESTYLE,
  getStressBand,
  HERO_PRESETS,
  INITIAL_LONGITUDINAL_RECORDS,
} from '../data/msaData';
import {
  BaselineProfile,
  ChannelAvailability,
  ChannelId,
  FusionMode,
  FusionOutput,
  HeroPresetId,
  LifestyleContext,
  ObservationWindow,
  SessionRecord,
  SignalFeatureSnapshot,
} from '../types/msa';
import {
  computeFusionOutput,
  computeRmssd,
  evaluateEphemeralText,
  extractAudioFeatures,
  parseBleHeartRateMeasurement,
} from '../utils/signalProcessing';

export type WorkspaceMode = 'closed' | 'open' | 'docked';
export type WorkspaceTab = 'sensors' | 'calibration' | 'pss10' | 'report';
export type CalibrationStage = 'idle' | 'settling' | 'capturing' | 'complete';

interface LiveEngineContextValue {
  // Workspace presentation
  workspaceMode: WorkspaceMode;
  workspaceTab: WorkspaceTab;
  focusChannel: ChannelId | null;
  openWorkspace: (opts?: { tab?: WorkspaceTab; channel?: ChannelId; presetId?: HeroPresetId }) => void;
  dockWorkspace: () => void;
  closeWorkspace: () => void;
  setWorkspaceTab: (tab: WorkspaceTab) => void;
  setFocusChannel: (channel: ChannelId | null) => void;

  // Fusion & Sensing controls
  fusionMode: FusionMode;
  setFusionMode: (mode: FusionMode) => void;
  windowMode: ObservationWindow;
  setWindowMode: (w: ObservationWindow) => void;
  availability: ChannelAvailability;
  toggleChannelAvailability: (ch: ChannelId) => void;
  setAvailability: React.Dispatch<React.SetStateAction<ChannelAvailability>>;
  privacyMask: boolean;
  setPrivacyMask: (v: boolean) => void;

  // Simulated stream & hardware status
  simScenario: HeroPresetId;
  setSimScenario: (id: HeroPresetId) => void;
  webcamActive: boolean;
  micActive: boolean;
  speechActive: boolean;
  bleActive: boolean;
  bleDeviceName: string | null;
  hardwareNotice: string | null;
  clearHardwareNotice: () => void;
  startWebcam: () => Promise<void>;
  stopWebcam: () => void;
  startMicrophone: () => Promise<void>;
  stopMicrophone: () => void;
  toggleSpeechRecognition: () => void;
  submitEphemeralText: (text: string) => { wordCount: number; matchedCount: number; ratio: number };
  lastEphemeralMeta: { wordCount: number; matchedCount: number; ratio: number } | null;
  connectBleHeartRate: () => Promise<void>;
  disconnectBleHeartRate: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;

  // Live signals & computed fusion
  features: SignalFeatureSnapshot;
  fusionOutput: FusionOutput;

  // Calibration & Baseline mu_0
  baseline: BaselineProfile;
  calibrationStage: CalibrationStage;
  calibrationSecondsLeft: number;
  startCalibration: () => void;
  cancelCalibration: () => void;

  // PSS-10 & Lifestyle context
  pss10Responses: number[];
  setPss10Response: (index: number, value: number) => void;
  pss10Result: { total: number; band: 'Low Perceived Stress' | 'Moderate Perceived Stress' | 'High Perceived Stress' };
  lifestyle: LifestyleContext;
  setLifestyle: React.Dispatch<React.SetStateAction<LifestyleContext>>;

  // Longitudinal records & Vault
  records: SessionRecord[];
  saveCurrentSnapshot: (activityTag: string) => void;
  restoreDemoRecords: () => void;
  eraseAllLocalData: () => Promise<void>;
  vaultWipedAt: string | null;
}

const STORAGE_KEYS = {
  baseline: 'msa_baseline_v1',
  records: 'msa_records_v1',
  pss10: 'msa_pss10_v1',
  lifestyle: 'msa_lifestyle_v1',
};

const DB_NAME = 'msa_privacy_vault';
const DB_STORE = 'sessions';

async function writeToIndexedDb(records: SessionRecord[]): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  try {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction(DB_STORE, 'readwrite');
      const store = tx.objectStore(DB_STORE);
      store.clear();
      records.forEach((r) => store.put(r));
      tx.oncomplete = () => db.close();
    };
  } catch {
    // Fallback handled by localStorage
  }
}

async function clearIndexedDb(): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  await new Promise<void>((resolve) => {
    try {
      const del = indexedDB.deleteDatabase(DB_NAME);
      del.onsuccess = () => resolve();
      del.onerror = () => resolve();
      del.onblocked = () => resolve();
    } catch {
      resolve();
    }
  });
}

const LiveEngineContext = createContext<LiveEngineContextValue | null>(null);

function safeReadStorage<T>(key: string, fallback: T, validator?: (v: unknown) => boolean): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || parsed === undefined) return fallback;
    if (validator && !validator(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function LiveEngineProvider({ children }: { children: React.ReactNode }) {
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('closed');
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('sensors');
  const [focusChannel, setFocusChannel] = useState<ChannelId | null>(null);

  const [fusionMode, setFusionMode] = useState<FusionMode>('attention');
  const [windowMode, setWindowMode] = useState<ObservationWindow>('session');
  const [privacyMask, setPrivacyMask] = useState<boolean>(true);
  const [simScenario, setSimScenarioState] = useState<HeroPresetId>('calm-rest');

  const [availability, setAvailability] = useState<ChannelAvailability>({
    facial: true,
    rppg: true,
    voice: true,
    language: true,
    posture: true,
    wearable: true,
  });

  const skipPersistRef = useRef(false);

  // Persistent personal state with safe parsing
  const [baseline, setBaseline] = useState<BaselineProfile>(() =>
    safeReadStorage(
      STORAGE_KEYS.baseline,
      DEFAULT_BASELINE,
      (v) => typeof v === 'object' && v !== null && 'hrvRmssdMs' in v
    )
  );

  const [pss10Responses, setPss10Responses] = useState<number[]>(() =>
    safeReadStorage(
      STORAGE_KEYS.pss10,
      [1, 1, 2, 3, 3, 1, 3, 3, 1, 1],
      (v) => Array.isArray(v) && v.length === 10
    )
  );

  const [lifestyle, setLifestyle] = useState<LifestyleContext>(() =>
    safeReadStorage(
      STORAGE_KEYS.lifestyle,
      DEFAULT_LIFESTYLE,
      (v) => typeof v === 'object' && v !== null && 'sleepQuality' in v
    )
  );

  const [records, setRecords] = useState<SessionRecord[]>(() =>
    safeReadStorage(
      STORAGE_KEYS.records,
      INITIAL_LONGITUDINAL_RECORDS,
      (v) => Array.isArray(v)
    )
  );

  const [vaultWipedAt, setVaultWipedAt] = useState<string | null>(null);

  // Sync persistence (skipped immediately after vault wipe until user creates new data)
  useEffect(() => {
    if (skipPersistRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEYS.baseline, JSON.stringify(baseline));
    } catch {
      // ignore quota errors
    }
  }, [baseline]);

  useEffect(() => {
    if (skipPersistRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEYS.pss10, JSON.stringify(pss10Responses));
    } catch {
      // ignore
    }
  }, [pss10Responses]);

  useEffect(() => {
    if (skipPersistRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEYS.lifestyle, JSON.stringify(lifestyle));
    } catch {
      // ignore
    }
  }, [lifestyle]);

  useEffect(() => {
    if (skipPersistRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(records));
      void writeToIndexedDb(records);
    } catch {
      // ignore
    }
  }, [records]);

  // Live hardware streams
  const [webcamActive, setWebcamActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [speechActive, setSpeechActive] = useState(false);
  const [bleActive, setBleActive] = useState(false);
  const [bleDeviceName, setBleDeviceName] = useState<string | null>(null);
  const [hardwareNotice, setHardwareNotice] = useState<string | null>(null);
  const [lastEphemeralMeta, setLastEphemeralMeta] = useState<{
    wordCount: number;
    matchedCount: number;
    ratio: number;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const processorVideoRef = useRef<HTMLVideoElement | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const speechRecRef = useRef<any>(null);
  const bleDeviceRef = useRef<any>(null);
  const rrHistoryRef = useRef<number[]>([]);
  const greenBufferRef = useRef<number[]>([]);
  const prevGrayRef = useRef<Float32Array | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live feature snapshot initialized from selected preset
  const [features, setFeatures] = useState<SignalFeatureSnapshot>(() => HERO_PRESETS[0].features);

  const setSimScenario = useCallback((id: HeroPresetId) => {
    setSimScenarioState(id);
    const preset = HERO_PRESETS.find((p) => p.id === id) ?? HERO_PRESETS[0];
    setFeatures(preset.features);
    if (preset.dropouts) {
      setAvailability({
        facial: !preset.dropouts.facial,
        rppg: !preset.dropouts.rppg,
        voice: true,
        language: true,
        posture: true,
        wearable: true,
      });
    } else {
      setAvailability({
        facial: true,
        rppg: true,
        voice: true,
        language: true,
        posture: true,
        wearable: true,
      });
    }
  }, []);

  // Simulated gentle physiological oscillation when hardware isn't overriding a channel
  useEffect(() => {
    const interval = window.setInterval(() => {
      const t = Date.now() / 1000;
      const preset = HERO_PRESETS.find((p) => p.id === simScenario) ?? HERO_PRESETS[0];
      const base = preset.features;

      setFeatures((prev) => {
        const nextRppgWave = base.rppgWaveform.map((v, i) =>
          Math.max(0.05, Math.min(0.98, v + Math.sin(t * 3.2 + i * 0.6) * 0.05))
        );
        const nextAudioWave = base.audioWaveform.map((v, i) =>
          Math.max(-0.85, Math.min(0.85, v + Math.cos(t * 5.4 + i * 0.7) * 0.04))
        );

        return {
          ...prev,
          au4BrowLowerer: webcamActive
            ? prev.au4BrowLowerer
            : Math.max(0.04, Math.min(0.95, base.au4BrowLowerer + Math.sin(t * 0.9) * 0.025)),
          au7LidTightener: webcamActive
            ? prev.au7LidTightener
            : Math.max(0.04, Math.min(0.95, base.au7LidTightener + Math.cos(t * 0.8) * 0.02)),
          rppgBpm: webcamActive ? prev.rppgBpm : Math.round(base.rppgBpm + Math.sin(t * 0.7) * 1.4),
          ambientLuminance: webcamActive ? prev.ambientLuminance : base.ambientLuminance,
          rppgWaveform: webcamActive ? prev.rppgWaveform : nextRppgWave,
          pitchF0Hz: micActive ? prev.pitchF0Hz : Math.round(base.pitchF0Hz + Math.sin(t * 1.3) * 3),
          jitterPct: micActive ? prev.jitterPct : Number((base.jitterPct + Math.sin(t * 1.1) * 0.04).toFixed(2)),
          shimmerPct: micActive ? prev.shimmerPct : Number((base.shimmerPct + Math.cos(t * 1.1) * 0.08).toFixed(2)),
          audioWaveform: micActive ? prev.audioWaveform : nextAudioWave,
          bleBpm: bleActive ? prev.bleBpm : Math.round(base.bleBpm + Math.sin(t * 0.65) * 1.5),
          hrvRmssdMs: bleActive ? prev.hrvRmssdMs : Math.round(base.hrvRmssdMs + Math.cos(t * 0.5) * 1.5),
          movementEnergy: webcamActive
            ? prev.movementEnergy
            : Number((base.movementEnergy + Math.sin(t * 0.7) * 0.02).toFixed(2)),
        };
      });
    }, 650);

    return () => window.clearInterval(interval);
  }, [simScenario, webcamActive, micActive, bleActive]);

  // Real Webcam rPPG, Luminance & Motion Loop
  useEffect(() => {
    if (!webcamActive) return;
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
      offscreenCanvasRef.current.width = 64;
      offscreenCanvasRef.current.height = 48;
    }

    let rafId = 0;
    let lastProcess = 0;

    const processFrame = (now: number) => {
      rafId = window.requestAnimationFrame(processFrame);
      if (now - lastProcess < 100) return; // 10 Hz CV sampling
      lastProcess = now;

      const video = processorVideoRef.current || videoRef.current;
      const canvas = offscreenCanvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, 64, 48);
      const frame = ctx.getImageData(0, 0, 64, 48).data;

      let lumaSum = 0;
      let greenRoiSum = 0;
      let greenRoiCount = 0;
      let motionDiffSum = 0;
      const currentGray = new Float32Array(64 * 48);

      for (let y = 0; y < 48; y++) {
        for (let x = 0; x < 64; x++) {
          const idx = (y * 64 + x) * 4;
          const r = frame[idx];
          const g = frame[idx + 1];
          const b = frame[idx + 2];
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          lumaSum += luma;
          currentGray[y * 64 + x] = luma;

          // Central facial skin ROI (forehead/cheeks region)
          if (x >= 22 && x <= 42 && y >= 12 && y <= 32) {
            greenRoiSum += g;
            greenRoiCount++;
          }

          if (prevGrayRef.current) {
            motionDiffSum += Math.abs(luma - prevGrayRef.current[y * 64 + x]);
          }
        }
      }

      prevGrayRef.current = currentGray;
      const avgLumaPct = Math.round((lumaSum / (64 * 48) / 255) * 100);
      const meanGreen = greenRoiCount > 0 ? greenRoiSum / greenRoiCount : 128;
      const avgMotion = Math.min(1, motionDiffSum / (64 * 48 * 24));

      // Keep rolling 32-sample green-channel buffer for detrended rPPG wave & BPM
      greenBufferRef.current.push(meanGreen);
      if (greenBufferRef.current.length > 32) {
        greenBufferRef.current.shift();
      }

      const buf = greenBufferRef.current;
      const bufMean = buf.reduce((a, b) => a + b, 0) / Math.max(1, buf.length);
      const minVal = Math.min(...buf);
      const maxVal = Math.max(...buf);
      const span = Math.max(0.4, maxVal - minVal);
      const normalizedWave = buf.slice(-12).map((v) => Math.max(0.08, Math.min(0.95, (v - minVal) / span)));

      // Count zero-crossings of detrended green signal over ~3.2s window -> BPM estimate
      let crossings = 0;
      for (let i = 1; i < buf.length; i++) {
        if ((buf[i - 1] - bufMean) * (buf[i] - bufMean) < 0) crossings++;
      }
      const estimatedBpm =
        buf.length >= 20
          ? Math.round(Math.max(54, Math.min(126, (crossings / 2) * (60 / (buf.length * 0.1)))))
          : 68;

      setFeatures((prev) => ({
        ...prev,
        ambientLuminance: avgLumaPct,
        rppgWaveform: normalizedWave.length >= 8 ? normalizedWave : prev.rppgWaveform,
        rppgBpm: avgLumaPct < 24 ? prev.rppgBpm : estimatedBpm,
        movementEnergy: Number(Math.max(0.06, Math.min(0.95, avgMotion * 1.4)).toFixed(2)),
        gestureJerkiness: Number(Math.max(0.08, Math.min(0.9, avgMotion * 1.15)).toFixed(2)),
        au4BrowLowerer: Number(
          Math.max(0.1, Math.min(0.75, 0.16 + avgMotion * 0.45)).toFixed(2)
        ),
      }));
    };

    rafId = window.requestAnimationFrame(processFrame);
    return () => window.cancelAnimationFrame(rafId);
  }, [webcamActive]);

  // Real Microphone Web Audio DSP Loop
  useEffect(() => {
    if (!micActive || !analyserRef.current || !audioCtxRef.current) return;
    const analyser = analyserRef.current;
    const sampleRate = audioCtxRef.current.sampleRate;
    const buffer = new Float32Array(analyser.fftSize);
    let voicedFrames = 0;
    let totalFrames = 0;

    const timer = window.setInterval(() => {
      analyser.getFloatTimeDomainData(buffer);
      const res = extractAudioFeatures(buffer, sampleRate);
      totalFrames++;
      if (res.isVoiced) voicedFrames++;

      // Downsample 12 waveform bars
      const waveBars: number[] = [];
      const step = Math.floor(buffer.length / 12);
      for (let i = 0; i < 12; i++) {
        waveBars.push(Math.max(-0.9, Math.min(0.9, buffer[i * step] * 3.5)));
      }

      const pauseRatio = totalFrames > 4 ? Number((1 - voicedFrames / totalFrames).toFixed(2)) : 0.25;
      if (totalFrames > 60) {
        totalFrames = 0;
        voicedFrames = 0;
      }

      setFeatures((prev) => ({
        ...prev,
        audioWaveform: waveBars,
        pitchF0Hz: res.isVoiced ? Math.round(res.pitchF0Hz) : prev.pitchF0Hz,
        jitterPct: res.isVoiced ? Number(res.jitterPct.toFixed(2)) : prev.jitterPct,
        shimmerPct: res.isVoiced ? Number(res.shimmerPct.toFixed(2)) : prev.shimmerPct,
        pauseRatio,
      }));
    }, 180);

    return () => window.clearInterval(timer);
  }, [micActive]);

  const startWebcam = useCallback(async () => {
    setHardwareNotice(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setHardwareNotice('Camera API is unavailable in this browser context; using simulated optical stream.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      webcamStreamRef.current = stream;
      if (processorVideoRef.current) {
        processorVideoRef.current.srcObject = stream;
        await processorVideoRef.current.play().catch(() => {});
      }
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setWebcamActive(true);
      setAvailability((prev) => ({ ...prev, facial: true, rppg: true, posture: true }));
    } catch {
      setHardwareNotice('Camera permission declined or device busy. Simulated optical stream remains active.');
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((t) => t.stop());
      webcamStreamRef.current = null;
    }
    if (processorVideoRef.current) {
      processorVideoRef.current.srcObject = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    prevGrayRef.current = null;
    greenBufferRef.current = [];
    setWebcamActive(false);
  }, []);

  // Attach stream if video element mounts after webcam started
  useEffect(() => {
    if (webcamActive && webcamStreamRef.current && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = webcamStreamRef.current;
      void videoRef.current.play().catch(() => {});
    }
  }, [webcamActive, workspaceMode, workspaceTab]);

  const startMicrophone = useCallback(async () => {
    setHardwareNotice(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setHardwareNotice('Microphone API unavailable; simulated acoustic stream active.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = stream;
      const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextCtor();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      setMicActive(true);
      setAvailability((prev) => ({ ...prev, voice: true }));
    } catch {
      setHardwareNotice('Microphone permission declined or unavailable. Simulated acoustic stream active.');
    }
  }, []);

  const stopMicrophone = useCallback(() => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    setMicActive(false);
  }, []);

  const submitEphemeralText = useCallback((text: string) => {
    const result = evaluateEphemeralText(text);
    setLastEphemeralMeta(result);
    setFeatures((prev) => ({
      ...prev,
      negLexiconRatio: result.ratio,
      utteranceCount: prev.utteranceCount + 1,
    }));
    return result;
  }, []);

  const toggleSpeechRecognition = useCallback(() => {
    setHardwareNotice(null);
    if (speechActive) {
      try {
        speechRecRef.current?.stop();
      } catch {
        // ignore
      }
      setSpeechActive(false);
      return;
    }
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;
    if (!SpeechRec) {
      setHardwareNotice('Browser SpeechRecognition is not supported here. Use the ephemeral local phrase evaluator below.');
      return;
    }
    try {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-AU';
      rec.onresult = (event: any) => {
        const lastIdx = event.results.length - 1;
        const transcript = event.results[lastIdx]?.[0]?.transcript ?? '';
        // Immediately score locally and discard raw string
        submitEphemeralText(transcript);
      };
      rec.onerror = () => {
        setSpeechActive(false);
        setHardwareNotice('Speech recognition stopped; ephemeral text box remains available.');
      };
      rec.onend = () => {
        setSpeechActive(false);
      };
      rec.start();
      speechRecRef.current = rec;
      setSpeechActive(true);
    } catch {
      setHardwareNotice('Could not start SpeechRecognition in this environment.');
    }
  }, [speechActive, submitEphemeralText]);

  const disconnectBleHeartRate = useCallback(() => {
    try {
      if (bleDeviceRef.current?.gatt?.connected) {
        bleDeviceRef.current.gatt.disconnect();
      }
    } catch {
      // ignore
    }
    bleDeviceRef.current = null;
    rrHistoryRef.current = [];
    setBleActive(false);
    setBleDeviceName(null);
  }, []);

  const connectBleHeartRate = useCallback(async () => {
    setHardwareNotice(null);
    const nav = navigator as unknown as { bluetooth?: any };
    if (!nav.bluetooth) {
      setHardwareNotice('Web Bluetooth is unavailable in this browser/iframe. Live BLE Physiological Simulator remains active.');
      return;
    }
    try {
      const device = await nav.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
      });
      bleDeviceRef.current = device;
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('heart_rate');
      const char = await service.getCharacteristic('heart_rate_measurement');
      await char.startNotifications();
      char.addEventListener('characteristicvaluechanged', (e: any) => {
        const value: DataView = e.target.value;
        const parsed = parseBleHeartRateMeasurement(value);
        if (parsed.rrIntervalsMs.length > 0) {
          rrHistoryRef.current.push(...parsed.rrIntervalsMs);
          if (rrHistoryRef.current.length > 24) {
            rrHistoryRef.current = rrHistoryRef.current.slice(-24);
          }
        }
        const rmssd = computeRmssd(rrHistoryRef.current);
        setFeatures((prev) => ({
          ...prev,
          bleBpm: parsed.bpm,
          hrvRmssdMs: rmssd,
        }));
      });
      device.addEventListener('gattserverdisconnected', () => {
        setBleActive(false);
        setBleDeviceName(null);
      });
      setBleDeviceName(device.name || 'BLE Heart Rate Strap');
      setBleActive(true);
      setAvailability((prev) => ({ ...prev, wearable: true }));
    } catch {
      setHardwareNotice('BLE pairing cancelled or blocked by permissions policy. Simulated wearable telemetry remains active.');
    }
  }, []);

  // Cleanup hardware streams on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
      stopMicrophone();
      disconnectBleHeartRate();
    };
  }, [stopWebcam, stopMicrophone, disconnectBleHeartRate]);

  // Guided Two-Stage Calibration Stepper
  const [calibrationStage, setCalibrationStage] = useState<CalibrationStage>('idle');
  const [calibrationSecondsLeft, setCalibrationSecondsLeft] = useState(0);

  useEffect(() => {
    if (calibrationStage !== 'settling' && calibrationStage !== 'capturing') return;
    const timer = window.setInterval(() => {
      setCalibrationSecondsLeft((prev) => {
        if (prev <= 1) {
          if (calibrationStage === 'settling') {
            setCalibrationStage('capturing');
            return 10; // Stage 2: 10s neutral capture
          } else {
            // Lock personal resting baseline mu_0 from live signals
            setBaseline((b) => ({
              established: true,
              calibratedAt: new Date().toISOString(),
              hrvRmssdMs: Math.round(features.hrvRmssdMs),
              restingBpm: Math.round((features.bleBpm + features.rppgBpm) / 2),
              pitchF0Hz: Math.round(features.pitchF0Hz),
              au4Baseline: Number(features.au4BrowLowerer.toFixed(2)),
              movementEnergy: Number(features.movementEnergy.toFixed(2)),
              edaMicroSiemens: Number(features.edaMicroSiemens.toFixed(1)),
              sessionCount: b.sessionCount + 1,
            }));
            setCalibrationStage('complete');
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [calibrationStage, features]);

  const startCalibration = useCallback(() => {
    skipPersistRef.current = false;
    setCalibrationStage('settling');
    setCalibrationSecondsLeft(8); // Stage 1: 8s calm settling period
  }, []);

  const cancelCalibration = useCallback(() => {
    setCalibrationStage('idle');
    setCalibrationSecondsLeft(0);
  }, []);

  // Computed Multimodal Fusion Output
  const fusionOutput = useMemo(
    () =>
      computeFusionOutput({
        features,
        baseline,
        availability,
        fusionMode,
        windowMode,
      }),
    [features, baseline, availability, fusionMode, windowMode]
  );

  const toggleChannelAvailability = useCallback((ch: ChannelId) => {
    setAvailability((prev) => ({ ...prev, [ch]: !prev[ch] }));
  }, []);

  const setPss10Response = useCallback((index: number, value: number) => {
    skipPersistRef.current = false;
    setPss10Responses((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const pss10Result = useMemo(() => computePss10Score(pss10Responses), [pss10Responses]);

  const saveCurrentSnapshot = useCallback(
    (activityTag: string) => {
      skipPersistRef.current = false;
      const now = new Date();
      const hhmm = now.toTimeString().slice(0, 5);
      const newRecord: SessionRecord = {
        id: `rec-${Date.now()}`,
        timestamp: hhmm,
        timeframeTag: 'Session',
        label: `${hhmm} · ${activityTag || 'Assessment'}`,
        score: fusionOutput.score,
        band: getStressBand(fusionOutput.score),
        confidence: fusionOutput.confidence,
        baselineDelta: fusionOutput.baselineShiftDelta,
        activityTag: activityTag || 'Live Check-In',
        durationWindow: windowMode,
        contributors: fusionOutput.topContributors.slice(0, 2).map((c) => `${c.label} (${c.deltaText})`),
        gatesTriggered: fusionOutput.activeGates.filter((g) => g.triggered).map((g) => g.name),
        pss10Score: pss10Result.total,
      };
      setRecords((prev) => [...prev, newRecord]);
    },
    [fusionOutput, windowMode, pss10Result.total]
  );

  const restoreDemoRecords = useCallback(() => {
    skipPersistRef.current = false;
    setRecords(INITIAL_LONGITUDINAL_RECORDS);
    setBaseline(DEFAULT_BASELINE);
    setVaultWipedAt(null);
  }, []);

  const eraseAllLocalData = useCallback(async () => {
    skipPersistRef.current = true;
    stopWebcam();
    stopMicrophone();
    disconnectBleHeartRate();
    try {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }
    await clearIndexedDb();
    setRecords([]);
    setBaseline({
      ...DEFAULT_BASELINE,
      established: false,
      calibratedAt: null,
      sessionCount: 0,
    });
    setPss10Responses([2, 2, 2, 2, 2, 2, 2, 2, 2, 2]);
    setLifestyle(DEFAULT_LIFESTYLE);
    setLastEphemeralMeta(null);
    setVaultWipedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, [stopWebcam, stopMicrophone, disconnectBleHeartRate]);

  const openWorkspace = useCallback(
    (opts?: { tab?: WorkspaceTab; channel?: ChannelId; presetId?: HeroPresetId }) => {
      if (opts?.presetId) {
        setSimScenario(opts.presetId);
      }
      if (opts?.tab) {
        setWorkspaceTab(opts.tab);
      }
      if (opts?.channel) {
        setFocusChannel(opts.channel);
      }
      setWorkspaceMode('open');
    },
    [setSimScenario]
  );

  const dockWorkspace = useCallback(() => setWorkspaceMode('docked'), []);
  const closeWorkspace = useCallback(() => setWorkspaceMode('closed'), []);
  const clearHardwareNotice = useCallback(() => setHardwareNotice(null), []);

  const value: LiveEngineContextValue = {
    workspaceMode,
    workspaceTab,
    focusChannel,
    openWorkspace,
    dockWorkspace,
    closeWorkspace,
    setWorkspaceTab,
    setFocusChannel,
    fusionMode,
    setFusionMode,
    windowMode,
    setWindowMode,
    availability,
    toggleChannelAvailability,
    setAvailability,
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
    records,
    saveCurrentSnapshot,
    restoreDemoRecords,
    eraseAllLocalData,
    vaultWipedAt,
  };

  return (
    <LiveEngineContext.Provider value={value}>
      <video ref={processorVideoRef} muted playsInline className="hidden" aria-hidden="true" />
      {children}
    </LiveEngineContext.Provider>
  );
}

export function useLiveEngine(): LiveEngineContextValue {
  const ctx = useContext(LiveEngineContext);
  if (!ctx) throw new Error('useLiveEngine must be used within LiveEngineProvider');
  return ctx;
}
