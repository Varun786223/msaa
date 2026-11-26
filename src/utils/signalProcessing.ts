import { getStressBand } from '../data/msaData';
import {
  BaselineProfile,
  ChannelAvailability,
  ChannelId,
  ConfounderGateResult,
  ContributingSignal,
  FusionMode,
  FusionOutput,
  ObservationWindow,
  SignalFeatureSnapshot,
} from '../types/msa';

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Computes multimodal stress score, confidence, active confounder gates,
 * and contributing signals using personal baseline (mu_0) normalization.
 */
export function computeFusionOutput(params: {
  features: SignalFeatureSnapshot;
  baseline: BaselineProfile;
  availability: ChannelAvailability;
  fusionMode: FusionMode;
  windowMode: ObservationWindow;
}): FusionOutput {
  const { features, baseline, availability, fusionMode, windowMode } = params;

  // Individual modality sub-scores (0..100) normalized against personal baseline mu_0
  const facialDelta =
    (features.au4BrowLowerer - baseline.au4Baseline) * 95 +
    features.au7LidTightener * 24 +
    clamp((features.blinkRatePerMin - 16) * 1.4, -10, 22);
  const facialScore = clamp(18 + facialDelta, 0, 100);

  const hrDelta = features.rppgBpm - baseline.restingBpm;
  const rppgScore = clamp(18 + hrDelta * 1.35, 0, 100);

  const pitchDelta = features.pitchF0Hz - baseline.pitchF0Hz;
  const voiceScore = clamp(
    14 +
      pitchDelta * 0.55 +
      (features.jitterPct - 0.5) * 28 +
      (features.shimmerPct - 2.0) * 11 +
      clamp((features.speakingRateWpm - 135) * 0.45, -8, 18),
    0,
    100
  );

  const languageScore = clamp(12 + features.negLexiconRatio * 210, 0, 100);

  const postureScore = clamp(
    14 +
      features.postureClosure * 48 +
      features.gestureJerkiness * 44 +
      features.selfTouchCount * 5.5,
    0,
    100
  );

  const hrvRatio = baseline.hrvRmssdMs > 0 ? (baseline.hrvRmssdMs - features.hrvRmssdMs) / baseline.hrvRmssdMs : 0;
  const wearableScore = clamp(
    16 +
      hrvRatio * 88 +
      (features.bleBpm - baseline.restingBpm) * 0.8 +
      (features.edaMicroSiemens - baseline.edaMicroSiemens) * 7.2,
    0,
    100
  );

  const channelScores: Record<ChannelId, number> = {
    facial: facialScore,
    rppg: rppgScore,
    voice: voiceScore,
    language: languageScore,
    posture: postureScore,
    wearable: wearableScore,
  };

  // Base modality reliability priors
  const baseWeights: Record<ChannelId, number> = {
    wearable: 0.28,
    voice: 0.21,
    facial: 0.19,
    rppg: 0.14,
    posture: 0.11,
    language: 0.07,
  };

  // Check quality & confounder gates
  const lowLuminance = features.ambientLuminance < 30 || (!availability.facial && !availability.rppg);
  const physicalExertion =
    features.accelMagnitudeG >= 1.32 ||
    (features.movementEnergy >= 0.72 && (features.bleBpm >= 110 || features.rppgBpm >= 110));
  const curiosityExcitement =
    !physicalExertion &&
    (features.au4BrowLowerer >= 0.42 || features.gazeShiftRate >= 0.45) &&
    features.hrvRmssdMs >= baseline.hrvRmssdMs * 0.82 &&
    features.edaMicroSiemens <= baseline.edaMicroSiemens + 1.1 &&
    features.negLexiconRatio < 0.08;
  const baselineUncertain = !baseline.established || windowMode === 'quick';

  const activeWeights: Record<ChannelId, number> = { ...baseWeights };

  // Zero out unavailable channels
  (Object.keys(availability) as ChannelId[]).forEach((ch) => {
    if (!availability[ch]) {
      activeWeights[ch] = 0;
    }
  });

  // Low-light quality gate discounts optical channels
  if (lowLuminance) {
    activeWeights.rppg *= 0.18;
    activeWeights.facial *= 0.35;
    activeWeights.posture *= 0.5;
  }

  // Attention fusion boosts weights for channels showing high cross-channel agreement
  if (fusionMode === 'attention') {
    const enabledChannels = (Object.keys(activeWeights) as ChannelId[]).filter((c) => activeWeights[c] > 0);
    if (enabledChannels.length > 1) {
      const mean =
        enabledChannels.reduce((acc, c) => acc + channelScores[c], 0) / enabledChannels.length;
      enabledChannels.forEach((c) => {
        const agreement = 1 - Math.min(1, Math.abs(channelScores[c] - mean) / 45);
        activeWeights[c] *= 0.65 + 0.75 * agreement;
      });
    }
  }

  const totalWeight = (Object.values(activeWeights) as number[]).reduce((a, b) => a + b, 0);

  const normalizedWeights: Record<ChannelId, number> = {
    facial: 0,
    rppg: 0,
    voice: 0,
    language: 0,
    posture: 0,
    wearable: 0,
  };

  let rawScore = 22;
  if (totalWeight > 0) {
    rawScore = 0;
    (Object.keys(activeWeights) as ChannelId[]).forEach((c) => {
      normalizedWeights[c] = activeWeights[c] / totalWeight;
      rawScore += normalizedWeights[c] * channelScores[c];
    });
  }

  let adjustedScore = rawScore;

  const gates: ConfounderGateResult[] = [
    {
      id: 'physical-exertion',
      name: 'Physical Exertion Gate',
      triggered: physicalExertion,
      severity: physicalExertion ? 'active' : 'info',
      explanation: physicalExertion
        ? `Motion energy (${(features.movementEnergy * 100).toFixed(0)}%) & ${features.accelMagnitudeG.toFixed(2)}g detected; exercise-driven HR spike discounted.`
        : 'Accelerometer & kinesic energy within sedentary-to-light bounds.',
      scoreAdjustment: physicalExertion ? -26 : 0,
    },
    {
      id: 'curiosity-excitement',
      name: 'Curiosity / Excitement Gate',
      triggered: curiosityExcitement,
      severity: curiosityExcitement ? 'active' : 'info',
      explanation: curiosityExcitement
        ? 'Animated facial brow/gaze cues paired with steady HRV & EDA; engagement separated from distress.'
        : 'Facial expressivity aligned with autonomic tone.',
      scoreAdjustment: curiosityExcitement ? -16 : 0,
    },
    {
      id: 'low-luminance',
      name: 'Low Camera Luminance Gate',
      triggered: lowLuminance,
      severity: lowLuminance ? 'warning' : 'info',
      explanation: lowLuminance
        ? `Ambient luma (${Math.round(features.ambientLuminance)}%) below threshold; optical rPPG & AU weights down-scaled.`
        : `Camera luminance adequate (${Math.round(features.ambientLuminance)}%) for facial & rPPG ROI.`,
      scoreAdjustment: 0,
    },
    {
      id: 'baseline-uncertainty',
      name: 'Baseline Uncertainty Gate',
      triggered: baselineUncertain,
      severity: !baseline.established ? 'warning' : 'info',
      explanation: !baseline.established
        ? 'No personal μ₀ locked yet; relying on population prior with wider uncertainty.'
        : windowMode === 'quick'
          ? 'Quick 30–60s window prioritizes acute reactivity; 5–10m session stabilizes slow HRV drift.'
          : `Normalized against personal resting μ₀ (${baseline.hrvRmssdMs} ms RMSSD).`,
      scoreAdjustment: 0,
    },
  ];

  gates.forEach((g) => {
    if (g.triggered) {
      adjustedScore += g.scoreAdjustment;
    }
  });

  const finalScore = Math.round(clamp(adjustedScore, 4, 96));

  // Confidence calculation based on active channel coverage, fusion agreement, window & luminance
  const activeCount = (Object.keys(availability) as ChannelId[]).filter((c) => availability[c]).length;
  let confidence = 42 + activeCount * 8.2;
  if (fusionMode === 'attention') confidence += 4;
  if (windowMode === 'session') confidence += 5;
  if (!baseline.established) confidence -= 14;
  if (lowLuminance) confidence -= 11;
  if (physicalExertion) confidence -= 5;
  confidence = Math.round(clamp(confidence, 32, 97));

  const baselineScorePrior = 18;
  const baselineShiftDelta = finalScore - baselineScorePrior;

  // Build top contributing signals
  const contributors: ContributingSignal[] = [];

  if (availability.wearable) {
    const hrvPct = Math.round(((features.hrvRmssdMs - baseline.hrvRmssdMs) / baseline.hrvRmssdMs) * 100);
    contributors.push({
      label: 'HRV RMSSD',
      direction: hrvPct < -12 ? 'down' : hrvPct > 10 ? 'up' : 'nominal',
      deltaText: `${features.hrvRmssdMs} ms (${hrvPct >= 0 ? '+' : ''}${hrvPct}% vs μ₀)`,
      weight: normalizedWeights.wearable,
      channel: 'wearable',
    });
  }

  if (availability.facial && !lowLuminance) {
    const au4Diff = Math.round((features.au4BrowLowerer - baseline.au4Baseline) * 100);
    contributors.push({
      label: 'AU4 Brow Lowerer',
      direction: au4Diff > 15 ? 'up' : 'nominal',
      deltaText: `${Math.round(features.au4BrowLowerer * 100)}% (${au4Diff >= 0 ? '+' : ''}${au4Diff}% Δ)`,
      weight: normalizedWeights.facial,
      channel: 'facial',
    });
  }

  if (availability.voice) {
    const f0Diff = Math.round(features.pitchF0Hz - baseline.pitchF0Hz);
    contributors.push({
      label: 'Vocal F0 & Jitter',
      direction: features.jitterPct > 0.9 || f0Diff > 16 ? 'up' : 'nominal',
      deltaText: `${Math.round(features.pitchF0Hz)} Hz · ${features.jitterPct.toFixed(2)}% jitter`,
      weight: normalizedWeights.voice,
      channel: 'voice',
    });
  }

  if (availability.rppg && !lowLuminance) {
    contributors.push({
      label: 'Camera rPPG Pulse',
      direction: features.rppgBpm - baseline.restingBpm > 14 ? 'up' : 'nominal',
      deltaText: `${Math.round(features.rppgBpm)} BPM`,
      weight: normalizedWeights.rppg,
      channel: 'rppg',
    });
  }

  if (availability.posture) {
    contributors.push({
      label: 'Posture & Adaptors',
      direction: features.postureClosure > 0.45 || features.selfTouchCount >= 3 ? 'up' : 'nominal',
      deltaText: `${Math.round(features.postureClosure * 100)}% closure · ${features.selfTouchCount} touches`,
      weight: normalizedWeights.posture,
      channel: 'posture',
    });
  }

  if (availability.language) {
    contributors.push({
      label: 'Lexicon Context',
      direction: features.negLexiconRatio > 0.14 ? 'up' : 'nominal',
      deltaText: `${Math.round(features.negLexiconRatio * 100)}% strain phrasing`,
      weight: normalizedWeights.language,
      channel: 'language',
    });
  }

  contributors.sort((a, b) => b.weight - a.weight);

  const uncertaintyReason =
    activeCount <= 2
      ? 'Reduced modality coverage widens the confidence interval. Re-enable sensors for full cross-channel agreement.'
      : lowLuminance
        ? 'Low ambient lighting triggered optical attenuation; estimate relies primarily on vocal and physiological inputs.'
        : !baseline.established
          ? 'Personal resting baseline μ₀ is not yet calibrated; comparison uses population priors.'
          : physicalExertion
            ? 'Elevated physical motion detected; heart rate elevation is discounted as non-stress exertion.'
            : curiosityExcitement
              ? 'High facial animation paired with calm autonomic markers indicates engaged curiosity rather than distress.'
              : 'High cross-modal agreement relative to your personal resting baseline μ₀.';

  return {
    score: finalScore,
    rawScore: Math.round(rawScore),
    band: getStressBand(finalScore),
    confidence,
    baselineShiftDelta,
    uncertaintyReason,
    activeGates: gates,
    topContributors: contributors.slice(0, 4),
    channelWeights: normalizedWeights,
  };
}

/**
 * Autocorrelation fundamental frequency (F0) & cycle jitter/shimmer estimator
 * operating purely in-browser on Float32Array time-domain audio frames.
 */
export function extractAudioFeatures(
  timeDomain: Float32Array,
  sampleRate: number
): {
  pitchF0Hz: number;
  rms: number;
  jitterPct: number;
  shimmerPct: number;
  isVoiced: boolean;
} {
  let rmsSum = 0;
  for (let i = 0; i < timeDomain.length; i++) {
    rmsSum += timeDomain[i] * timeDomain[i];
  }
  const rms = Math.sqrt(rmsSum / timeDomain.length);
  if (rms < 0.015) {
    return { pitchF0Hz: 0, rms, jitterPct: 0.45, shimmerPct: 1.9, isVoiced: false };
  }

  const minLag = Math.floor(sampleRate / 320); // max 320 Hz
  const maxLag = Math.floor(sampleRate / 75); // min 75 Hz
  let bestLag = -1;
  let bestCorr = 0;

  for (let lag = minLag; lag <= Math.min(maxLag, timeDomain.length / 2); lag++) {
    let corr = 0;
    for (let i = 0; i < timeDomain.length - lag; i++) {
      corr += timeDomain[i] * timeDomain[i + lag];
    }
    if (corr > bestCorr) {
      bestCorr = corr;
      bestLag = lag;
    }
  }

  const pitchF0Hz = bestLag > 0 ? clamp(sampleRate / bestLag, 75, 320) : 135;

  // Estimate cycle-to-cycle micro-perturbation from zero-crossing intervals
  const zeroCrossings: number[] = [];
  for (let i = 1; i < timeDomain.length; i++) {
    if (timeDomain[i - 1] < 0 && timeDomain[i] >= 0) {
      zeroCrossings.push(i);
    }
  }

  let jitterSum = 0;
  let validPeriods = 0;
  for (let i = 2; i < zeroCrossings.length; i++) {
    const p1 = zeroCrossings[i - 1] - zeroCrossings[i - 2];
    const p2 = zeroCrossings[i] - zeroCrossings[i - 1];
    if (p1 > 4 && p2 > 4) {
      jitterSum += Math.abs(p2 - p1) / ((p1 + p2) / 2);
      validPeriods++;
    }
  }
  const jitterPct = validPeriods > 0 ? clamp((jitterSum / validPeriods) * 100 * 0.14, 0.25, 2.8) : 0.55;

  // Amplitude shimmer estimate across short blocks
  const blockSize = 128;
  const blockPeaks: number[] = [];
  for (let i = 0; i + blockSize < timeDomain.length; i += blockSize) {
    let peak = 0;
    for (let j = 0; j < blockSize; j++) {
      const a = Math.abs(timeDomain[i + j]);
      if (a > peak) peak = a;
    }
    if (peak > 0.01) blockPeaks.push(peak);
  }
  let shimmerSum = 0;
  for (let i = 1; i < blockPeaks.length; i++) {
    shimmerSum += Math.abs(blockPeaks[i] - blockPeaks[i - 1]) / Math.max(0.01, blockPeaks[i - 1]);
  }
  const shimmerPct =
    blockPeaks.length > 1
      ? clamp((shimmerSum / (blockPeaks.length - 1)) * 100 * 0.22, 1.2, 6.8)
      : 2.0;

  return { pitchF0Hz, rms, jitterPct, shimmerPct, isVoiced: true };
}

const STRESS_LEXICON = [
  'overwhelmed',
  'anxious',
  'exhausted',
  'stressed',
  'hopeless',
  'cant',
  "can't",
  'unable',
  'panic',
  'deadline',
  'pressure',
  'burnout',
  'tired',
  'worried',
  'fail',
  'stuck',
  'heavy',
  'frustrated',
];

/**
 * Ephemeral on-device linguistic ratio calculator.
 * Processes tokens in memory and immediately discards raw text.
 */
export function evaluateEphemeralText(text: string): {
  ratio: number;
  matchedCount: number;
  wordCount: number;
} {
  const words = text
    .toLowerCase()
    .replace(/[^a-z'\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return { ratio: 0.03, matchedCount: 0, wordCount: 0 };
  const matchedCount = words.filter((w) => STRESS_LEXICON.includes(w)).length;
  const ratio = clamp(matchedCount / Math.max(4, words.length), 0, 0.65);
  return { ratio, matchedCount, wordCount: words.length };
}

/**
 * Parses standard Bluetooth Heart Rate Measurement Characteristic (0x2A37)
 */
export function parseBleHeartRateMeasurement(value: DataView): {
  bpm: number;
  rrIntervalsMs: number[];
} {
  const flags = value.getUint8(0);
  const is16Bit = (flags & 0x01) !== 0;
  const hasEnergyExpended = (flags & 0x08) !== 0;
  const hasRrInterval = (flags & 0x10) !== 0;

  let offset = 1;
  const bpm = is16Bit ? value.getUint16(offset, true) : value.getUint8(offset);
  offset += is16Bit ? 2 : 1;

  if (flags & 0x06) {
    // sensor contact status bits present in flags only
  }
  if (hasEnergyExpended) {
    offset += 2;
  }

  const rrIntervalsMs: number[] = [];
  if (hasRrInterval) {
    while (offset + 1 < value.byteLength) {
      const rr1024 = value.getUint16(offset, true);
      rrIntervalsMs.push((rr1024 / 1024) * 1000);
      offset += 2;
    }
  }

  return { bpm, rrIntervalsMs };
}

export function computeRmssd(rrIntervalsMs: number[]): number {
  if (rrIntervalsMs.length < 2) return 44;
  let sumSqDiff = 0;
  for (let i = 1; i < rrIntervalsMs.length; i++) {
    const diff = rrIntervalsMs[i] - rrIntervalsMs[i - 1];
    sumSqDiff += diff * diff;
  }
  return Math.round(clamp(Math.sqrt(sumSqDiff / (rrIntervalsMs.length - 1)), 10, 120));
}
