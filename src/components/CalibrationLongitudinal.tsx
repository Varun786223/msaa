import { useMemo, useState } from 'react';
import { Download, Info, Plus, RotateCcw } from 'lucide-react';
import {
  PSS10_ITEMS,
  PSS10_SCALE_OPTIONS,
} from '../data/msaData';
import { useLiveEngine } from '../context/LiveEngineContext';
import { LifestyleContext, SessionRecord, StressBand } from '../types/msa';

type TimeframeTab = 'Session' | '24-Hour' | 'Week';

const BAND_FILTERS: Array<'All' | StressBand> = [
  'All',
  'Calm',
  'Mild',
  'Moderate',
  'High',
  'Very High',
];

export function CalibrationLongitudinal() {
  const {
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
  } = useLiveEngine();

  const [timeframe, setTimeframe] = useState<TimeframeTab>('Session');
  const [bandFilter, setBandFilter] = useState<'All' | StressBand>('All');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [activityInput, setActivityInput] = useState('Focused Review');
  const [showAllPss, setShowAllPss] = useState(false);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (r.timeframeTag !== timeframe) return false;
      if (bandFilter !== 'All' && r.band !== bandFilter) return false;
      return true;
    });
  }, [records, timeframe, bandFilter]);

  const sustainedHighCount = useMemo(
    () => filteredRecords.filter((r) => r.score >= 60).length,
    [filteredRecords]
  );

  const handleExportCsv = () => {
    const header = [
      'ID',
      'Timeframe',
      'Timestamp',
      'Score',
      'Band',
      'ConfidencePct',
      'BaselineDelta',
      'ActivityTag',
      'Window',
      'Contributors',
      'GatesTriggered',
    ];
    const rows = records.map((r) => [
      r.id,
      r.timeframeTag,
      r.timestamp,
      String(r.score),
      r.band,
      String(r.confidence),
      String(r.baselineDelta),
      `"${r.activityTag.replace(/"/g, '""')}"`,
      r.durationWindow,
      `"${r.contributors.join('; ').replace(/"/g, '""')}"`,
      `"${r.gatesTriggered.join('; ').replace(/"/g, '""')}"`,
    ]);
    const csv = [header.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `msa-longitudinal-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // SVG Chart Geometry
  const chartW = 760;
  const chartH = 220;
  const padL = 42;
  const padR = 24;
  const padT = 20;
  const padB = 34;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const getPointXY = (idx: number, total: number, score: number) => {
    const x = total <= 1 ? padL + innerW / 2 : padL + (idx / (total - 1)) * innerW;
    const y = padT + ((100 - score) / 100) * innerH;
    return { x, y };
  };

  const activeHoverRecord: SessionRecord | null =
    hoveredIdx !== null && filteredRecords[hoveredIdx] ? filteredRecords[hoveredIdx] : null;

  return (
    <section
      id="calibration"
      className="py-16 sm:py-24 px-4 sm:px-6 bg-[#E8EEF5] border-b border-[#1F2A38]/8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#5A6C85]">
            Personal Calibration & Longitudinal Care
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-[#1F2A38]">
            Calibrated to{' '}
            <em className="font-serif italic font-normal text-[#5A6C85]">
              your baseline
            </em>
            , not just population averages.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#5A6C85] leading-relaxed">
            Normal physiological ranges differ markedly between individuals. MSA establishes your
            resting baseline μ₀ after a calm settling period, pairs sensor trajectories with the
            validated PSS-10 scale, and tracks meaningful shifts over days.
          </p>
        </div>

        {/* Top 2-Column Split: Two-Stage Calibration Stepper + PSS-10 & Holistic Lifestyle */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Module 1: Two-Stage Guided Calibration Stepper (5 cols) */}
          <div className="lg:col-span-5 min-w-0 rounded-[24px] bg-[#FFFFFF]/95 border border-[#1F2A38]/8 p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-[#1F2A38]">
                Two-Stage Baseline Calibration
              </h3>
              <span className="font-mono text-xs text-[#5A6C85]">
                {baseline.established ? `μ₀ Active (${baseline.sessionCount} sessions)` : 'Uncalibrated'}
              </span>
            </div>

            <p className="mt-2 text-xs text-[#5A6C85] leading-relaxed">
              Mitigates monitoring-induced anxiety by guiding a resting breath cadence before
              locking your personal physiological baseline.
            </p>

            {/* Stepper Stages */}
            <div className="mt-5 space-y-3">
              <div
                className={`rounded-xl p-4 border transition-colors ${
                  calibrationStage === 'settling'
                    ? 'bg-[#1F2A38] text-[#FFFFFF] border-[#1F2A38]'
                    : 'bg-[#E8EEF5]/55 text-[#1F2A38] border-[#1F2A38]/8'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                  <span>Stage 1 · Settling Period (Comfort & Breathing)</span>
                  {calibrationStage === 'settling' && (
                    <span className="font-mono tabular-nums">{calibrationSecondsLeft}s</span>
                  )}
                </div>
                <p
                  className={`mt-1 text-xs leading-relaxed ${
                    calibrationStage === 'settling' ? 'text-[#E8EEF5]/80' : 'text-[#5A6C85]'
                  }`}
                >
                  Sit comfortably and breathe steadily (inhale 4s, exhale 4s) so observer anxiety
                  subsides before capture.
                </p>
              </div>

              <div
                className={`rounded-xl p-4 border transition-colors ${
                  calibrationStage === 'capturing'
                    ? 'bg-[#1F2A38] text-[#FFFFFF] border-[#1F2A38]'
                    : 'bg-[#E8EEF5]/55 text-[#1F2A38] border-[#1F2A38]/8'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                  <span>Stage 2 · Neutral Multi-Channel Capture (μ₀)</span>
                  {calibrationStage === 'capturing' && (
                    <span className="font-mono tabular-nums">{calibrationSecondsLeft}s</span>
                  )}
                </div>
                <p
                  className={`mt-1 text-xs leading-relaxed ${
                    calibrationStage === 'capturing' ? 'text-[#E8EEF5]/80' : 'text-[#5A6C85]'
                  }`}
                >
                  Samples resting HRV RMSSD, heart rate, vocal pitch F₀, facial AU4, and posture
                  stability into local browser storage.
                </p>
              </div>
            </div>

            {/* Locked Baseline Snapshot */}
            <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3 pt-4 border-t border-[#1F2A38]/8 text-xs">
              <div className="min-w-0">
                <div className="text-[#5A6C85] text-[10px] sm:text-[11px] truncate">Resting HRV</div>
                <div className="font-mono tabular-nums font-semibold text-[#1F2A38] mt-0.5 whitespace-nowrap">
                  {baseline.established ? `${baseline.hrvRmssdMs} ms` : '—'}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-[#5A6C85] text-[10px] sm:text-[11px] truncate">Resting HR</div>
                <div className="font-mono tabular-nums font-semibold text-[#1F2A38] mt-0.5 whitespace-nowrap">
                  {baseline.established ? `${baseline.restingBpm} BPM` : '—'}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-[#5A6C85] text-[10px] sm:text-[11px] truncate">Vocal F₀ μ₀</div>
                <div className="font-mono tabular-nums font-semibold text-[#1F2A38] mt-0.5 whitespace-nowrap">
                  {baseline.established ? `${baseline.pitchF0Hz} Hz` : '—'}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              {calibrationStage === 'settling' || calibrationStage === 'capturing' ? (
                <button
                  type="button"
                  onClick={cancelCalibration}
                  className="w-full rounded-full border border-[#1F2A38]/20 px-4 min-h-[44px] py-2.5 text-xs font-semibold text-[#1F2A38] hover:bg-[#E8EEF5] transition-colors cursor-pointer"
                >
                  Cancel Calibration
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startCalibration}
                  className="w-full rounded-full bg-[#1F2A38] px-4 min-h-[44px] py-2.5 text-xs font-semibold text-[#FFFFFF] hover:bg-[#2B3A4D] transition-colors cursor-pointer"
                >
                  {calibrationStage === 'complete'
                    ? 'Baseline μ₀ Updated · Recalibrate'
                    : baseline.established
                      ? 'Run 2-Stage Recalibration'
                      : 'Establish Personal Baseline μ₀'}
                </button>
              )}
            </div>
          </div>

          {/* Module 2: PSS-10 & Holistic Lifestyle Context (7 cols) */}
          <div className="lg:col-span-7 min-w-0 rounded-[24px] bg-[#FFFFFF]/95 border border-[#1F2A38]/8 p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[#1F2A38]">
                  PSS-10 & Holistic Lifestyle Context
                </h3>
                <p className="text-xs text-[#5A6C85] mt-0.5">
                  Clinically validated 10-item Perceived Stress Scale (reverse-scored items 4, 5, 7, 8)
                  paired with non-diagnostic lifestyle factors.
                </p>
              </div>
              <div className="text-right">
                <div className="font-mono tabular-nums text-xl font-semibold text-[#1F2A38]">
                  {pss10Result.total} <span className="text-xs font-normal text-[#5A6C85]">/ 40</span>
                </div>
                <div className="text-[11px] font-medium text-[#5A6C85]">{pss10Result.band}</div>
              </div>
            </div>

            {/* PSS-10 Interactive Questions */}
            <div className="mt-5 space-y-3">
              {(showAllPss ? PSS10_ITEMS : PSS10_ITEMS.slice(0, 4)).map((item, idx) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-[#1F2A38]/8 bg-[#E8EEF5]/35 p-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-medium text-[#1F2A38] leading-snug">
                      {item.id}. {item.prompt}
                    </p>
                    {item.reverseScored && (
                      <span className="shrink-0 font-mono text-[10px] text-[#5A6C85]">
                        Reverse-scored
                      </span>
                    )}
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {PSS10_SCALE_OPTIONS.map((opt) => {
                      const active = pss10Responses[idx] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setPss10Response(idx, opt.value)}
                          className={`rounded-lg px-3 min-h-[38px] sm:min-h-0 py-1.5 sm:py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#1F2A38] text-[#FFFFFF]'
                              : 'bg-[#FFFFFF] text-[#5A6C85] border border-[#1F2A38]/10 hover:text-[#1F2A38]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setShowAllPss(!showAllPss)}
                className="min-h-[40px] sm:min-h-0 inline-flex items-center text-xs font-semibold text-[#1F2A38] hover:text-[#5A6C85] transition-colors cursor-pointer"
              >
                {showAllPss ? 'Show fewer PSS-10 items ↑' : 'Expand all 10 PSS-10 items ↓'}
              </button>
            </div>

            {/* Voluntary Holistic Context Tags */}
            <div className="mt-6 pt-5 border-t border-[#1F2A38]/8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label className="block">
                <span className="text-[#5A6C85] font-medium">Sleep Quality</span>
                <select
                  value={lifestyle.sleepQuality}
                  onChange={(e) =>
                    setLifestyle((prev) => ({
                      ...prev,
                      sleepQuality: e.target.value as LifestyleContext['sleepQuality'],
                    }))
                  }
                  className="mt-1 w-full min-h-[42px] sm:min-h-0 rounded-lg border border-[#1F2A38]/15 bg-[#FFFFFF] px-2.5 py-2 sm:py-1.5 text-xs text-[#1F2A38]"
                >
                  <option value="Poor">Poor</option>
                  <option value="Fair">Fair</option>
                  <option value="Good">Good</option>
                  <option value="Restorative">Restorative</option>
                </select>
              </label>

              <label className="block">
                <span className="text-[#5A6C85] font-medium">Physical Activity</span>
                <select
                  value={lifestyle.physicalActivity}
                  onChange={(e) =>
                    setLifestyle((prev) => ({
                      ...prev,
                      physicalActivity: e.target.value as LifestyleContext['physicalActivity'],
                    }))
                  }
                  className="mt-1 w-full min-h-[42px] sm:min-h-0 rounded-lg border border-[#1F2A38]/15 bg-[#FFFFFF] px-2.5 py-2 sm:py-1.5 text-xs text-[#1F2A38]"
                >
                  <option value="Sedentary">Sedentary</option>
                  <option value="Light">Light</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Vigorous">Vigorous</option>
                </select>
              </label>

              <label className="block">
                <span className="text-[#5A6C85] font-medium">Social Closeness</span>
                <select
                  value={lifestyle.socialCloseness}
                  onChange={(e) =>
                    setLifestyle((prev) => ({
                      ...prev,
                      socialCloseness: e.target.value as LifestyleContext['socialCloseness'],
                    }))
                  }
                  className="mt-1 w-full min-h-[42px] sm:min-h-0 rounded-lg border border-[#1F2A38]/15 bg-[#FFFFFF] px-2.5 py-2 sm:py-1.5 text-xs text-[#1F2A38]"
                >
                  <option value="Isolated">Isolated</option>
                  <option value="Low">Low</option>
                  <option value="Supported">Supported</option>
                  <option value="High">High</option>
                </select>
              </label>

              <label className="block">
                <span className="text-[#5A6C85] font-medium">Work / Study Load</span>
                <select
                  value={lifestyle.workStudyLoad}
                  onChange={(e) =>
                    setLifestyle((prev) => ({
                      ...prev,
                      workStudyLoad: e.target.value as LifestyleContext['workStudyLoad'],
                    }))
                  }
                  className="mt-1 w-full min-h-[42px] sm:min-h-0 rounded-lg border border-[#1F2A38]/15 bg-[#FFFFFF] px-2.5 py-2 sm:py-1.5 text-xs text-[#1F2A38]"
                >
                  <option value="Light">Light</option>
                  <option value="Balanced">Balanced</option>
                  <option value="Heavy">Heavy</option>
                  <option value="Overloaded">Overloaded</option>
                </select>
              </label>

              <label className="block">
                <span className="text-[#5A6C85] font-medium">Caffeine Intake</span>
                <select
                  value={lifestyle.caffeine}
                  onChange={(e) =>
                    setLifestyle((prev) => ({
                      ...prev,
                      caffeine: e.target.value as LifestyleContext['caffeine'],
                    }))
                  }
                  className="mt-1 w-full min-h-[42px] sm:min-h-0 rounded-lg border border-[#1F2A38]/15 bg-[#FFFFFF] px-2.5 py-2 sm:py-1.5 text-xs text-[#1F2A38]"
                >
                  <option value="None">None</option>
                  <option value="1-2 cups">1–2 cups</option>
                  <option value="3+ cups">3+ cups</option>
                </select>
              </label>

              <label className="block">
                <span className="text-[#5A6C85] font-medium">Medication / Health Note</span>
                <input
                  type="text"
                  value={lifestyle.medicationOrHealthNote}
                  onChange={(e) =>
                    setLifestyle((prev) => ({ ...prev, medicationOrHealthNote: e.target.value }))
                  }
                  placeholder="Optional (e.g. beta-blocker, iron)"
                  className="mt-1 w-full min-h-[42px] sm:min-h-0 rounded-lg border border-[#1F2A38]/15 bg-[#FFFFFF] px-2.5 py-2 sm:py-1.5 text-xs text-[#1F2A38] placeholder:text-[#5A6C85]/60"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Module 3: Full-Width Longitudinal Trajectory Dashboard */}
        <div className="mt-8 rounded-[24px] bg-[#FFFFFF]/95 backdrop-blur-md border border-[#1F2A38]/8 p-5 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#1F2A38]/8">
            <div>
              <h3 className="text-xl font-semibold text-[#1F2A38]">
                Longitudinal Trajectory Dashboard
              </h3>
              <p className="text-xs text-[#5A6C85] mt-1">
                Tracks repeated contextual measurements across time rather than treating a single
                observation as a permanent trait.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Timeframe Switcher */}
              <div className="inline-flex rounded-xl bg-[#E8EEF5]/70 p-1 border border-[#1F2A38]/8">
                {(['Session', '24-Hour', 'Week'] as TimeframeTab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setTimeframe(tab);
                      setHoveredIdx(null);
                    }}
                    className={`rounded-lg px-3 min-h-[38px] sm:min-h-0 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      timeframe === tab
                        ? 'bg-[#1F2A38] text-[#FFFFFF]'
                        : 'text-[#5A6C85] hover:text-[#1F2A38]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* CSV Export */}
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={records.length === 0}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#1F2A38]/20 bg-[#FFFFFF] px-4 min-h-[40px] sm:min-h-0 py-1.5 text-xs font-semibold text-[#1F2A38] hover:bg-[#E8EEF5]/60 disabled:opacity-40 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Stress-Band Filters + Quick Log Current Snapshot */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {BAND_FILTERS.map((band) => (
                <button
                  key={band}
                  type="button"
                  onClick={() => {
                    setBandFilter(band);
                    setHoveredIdx(null);
                  }}
                  className={`rounded-full px-3 min-h-[36px] sm:min-h-0 py-1.5 sm:py-1 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    bandFilter === band
                      ? 'bg-[#1F2A38] text-[#FFFFFF]'
                      : 'bg-[#E8EEF5]/60 text-[#5A6C85] hover:text-[#1F2A38]'
                  }`}
                >
                  {band}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={activityInput}
                onChange={(e) => setActivityInput(e.target.value)}
                aria-label="Activity tag for snapshot"
                placeholder="Activity context tag"
                className="min-w-0 min-h-[42px] sm:min-h-0 rounded-lg border border-[#1F2A38]/15 bg-[#FFFFFF] px-3 py-2 sm:py-1.5 text-xs text-[#1F2A38] flex-1 sm:w-44"
              />
              <button
                type="button"
                onClick={() => {
                  saveCurrentSnapshot(activityInput);
                  setTimeframe('Session');
                }}
                className="inline-flex items-center gap-1 min-h-[42px] sm:min-h-0 rounded-lg bg-[#1F2A38] px-3.5 py-2 sm:py-1.5 text-xs font-semibold text-[#FFFFFF] hover:bg-[#2B3A4D] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Log Snapshot</span>
              </button>
            </div>
          </div>

          {/* Sustained-High Awareness Notice */}
          {sustainedHighCount >= 2 && (
            <div className="mt-5 rounded-xl border border-[#1F2A38]/15 bg-[#F1EFEB] px-4 py-3 flex items-start gap-3">
              <Info className="w-4 h-4 text-[#1F2A38] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-xs text-[#1F2A38] leading-relaxed">
                <span className="font-semibold">Sustained High-Band Pattern Observed:</span>{' '}
                {sustainedHighCount} observations in this view sit above the 60-point threshold.
                This is an analytical pattern estimate—not a medical diagnosis. Consider taking a
                restorative break or consulting a qualified healthcare professional if prolonged
                strain persists.
              </div>
            </div>
          )}

          {/* Chart or Empty State */}
          {filteredRecords.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-[#5A6C85]/35 bg-[#E8EEF5]/35 py-12 px-6 text-center">
              <p className="text-sm font-medium text-[#1F2A38]">
                No local trajectory records match this view.
              </p>
              <p className="mt-1 text-xs text-[#5A6C85]">
                Log a live snapshot above or restore sample clinical observations.
              </p>
              {records.length === 0 && (
                <button
                  type="button"
                  onClick={restoreDemoRecords}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#1F2A38] px-4 py-2 text-xs font-semibold text-[#FFFFFF] hover:bg-[#2B3A4D] cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Load Sample Clinical History</span>
                </button>
              )}
            </div>
          ) : (
            <div className="mt-6 relative">
              {/* Interactive SVG Trajectory Chart */}
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full h-auto max-h-60 overflow-visible select-none"
                role="img"
                aria-label={`${timeframe} longitudinal stress trajectory chart`}
              >
                {/* Threshold Band Guides */}
                {[0, 20, 40, 60, 80, 100].map((val) => {
                  const y = padT + ((100 - val) / 100) * innerH;
                  return (
                    <g key={val}>
                      <line
                        x1={padL}
                        x2={chartW - padR}
                        y1={y}
                        y2={y}
                        stroke="#1F2A38"
                        strokeOpacity={val === 60 ? '0.18' : '0.07'}
                        strokeDasharray={val === 60 ? '4 4' : undefined}
                      />
                      <text
                        x={padL - 8}
                        y={y + 4}
                        textAnchor="end"
                        className="fill-[#5A6C85] font-mono tabular-nums text-[17px] md:text-[12px]"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* High Band Shading (60..100) */}
                <rect
                  x={padL}
                  y={padT}
                  width={innerW}
                  height={innerH * 0.4}
                  fill="#9B4D3A"
                  fillOpacity="0.04"
                />

                {/* Smooth Trajectory Polyline */}
                {filteredRecords.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#1F2A38"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={filteredRecords
                      .map((r, i) => {
                        const pt = getPointXY(i, filteredRecords.length, r.score);
                        return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
                      })
                      .join(' ')}
                  />
                )}

                {/* Hover Crosshair Hairline */}
                {hoveredIdx !== null && filteredRecords[hoveredIdx] && (
                  <line
                    x1={getPointXY(hoveredIdx, filteredRecords.length, filteredRecords[hoveredIdx].score).x}
                    x2={getPointXY(hoveredIdx, filteredRecords.length, filteredRecords[hoveredIdx].score).x}
                    y1={padT}
                    y2={chartH - padB}
                    stroke="#5A6C85"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Data Nodes */}
                {filteredRecords.map((r, i) => {
                  const { x, y } = getPointXY(i, filteredRecords.length, r.score);
                  const isHovered = hoveredIdx === i;
                  return (
                    <g
                      key={r.id}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      onClick={() => setHoveredIdx(isHovered ? null : i)}
                    >
                      <circle cx={x} cy={y} r="18" fill="transparent" />
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 6.5 : 4.5}
                        fill={r.score >= 60 ? '#9B4D3A' : '#1F2A38'}
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                      <text
                        x={x}
                        y={chartH - 8}
                        textAnchor="middle"
                        className="fill-[#5A6C85] font-mono text-[17px] md:text-[12px]"
                      >
                        {r.timestamp}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Hover Inspection Readout Strip */}
              <div className="mt-2 min-h-[48px] rounded-xl border border-[#1F2A38]/8 bg-[#E8EEF5]/45 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                {activeHoverRecord ? (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[#1F2A38]">
                        {activeHoverRecord.label}
                      </span>
                      <span className="text-[#5A6C85]">·</span>
                      <span className="font-mono tabular-nums font-semibold text-[#1F2A38]">
                        {activeHoverRecord.score} ({activeHoverRecord.band})
                      </span>
                      <span className="text-[#5A6C85]">·</span>
                      <span className="font-mono tabular-nums text-[#5A6C85]">
                        {activeHoverRecord.confidence}% confidence
                      </span>
                    </div>
                    <div className="text-[#5A6C85]">
                      {activeHoverRecord.contributors.join(' · ')}
                      {activeHoverRecord.gatesTriggered.length > 0 &&
                        ` · Gate: ${activeHoverRecord.gatesTriggered.join(', ')}`}
                    </div>
                  </>
                ) : (
                  <span className="text-[#5A6C85]">
                    Tap or hover any node on the trajectory to inspect contributing signals,
                    confidence bounds, and active confounder gates.
                  </span>
                )}
              </div>

              {/* Mobile Card View for Activity-Tagged Logs */}
              <div className="mt-5 space-y-2.5 md:hidden">
                {filteredRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-xl border border-[#1F2A38]/8 bg-[#E8EEF5]/30 p-3.5 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[#1F2A38]">{rec.activityTag}</span>
                      <span className="font-mono tabular-nums text-[#5A6C85]">{rec.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 font-mono tabular-nums">
                      <span className="font-semibold text-[#1F2A38]">
                        {rec.score} · {rec.band}
                      </span>
                      <span className="text-[#5A6C85]">{rec.confidence}% conf</span>
                    </div>
                    <div className="text-[#5A6C85] leading-relaxed">
                      {rec.contributors.join(', ')}
                      {rec.gatesTriggered.length > 0 && (
                        <span className="ml-1.5 font-mono text-[11px] text-[#1F2A38]">
                          [{rec.gatesTriggered.join(', ')}]
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View for Activity-Tagged Logs */}
              <div className="mt-5 hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1F2A38]/10 text-[#5A6C85]">
                      <th className="py-2.5 pr-4 font-medium">Time</th>
                      <th className="py-2.5 pr-4 font-medium">Activity Context</th>
                      <th className="py-2.5 pr-4 font-medium">Score / Band</th>
                      <th className="py-2.5 pr-4 font-medium">Confidence</th>
                      <th className="py-2.5 font-medium">Primary Signals & Gates</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F2A38]/6">
                    {filteredRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-[#E8EEF5]/35 transition-colors">
                        <td className="py-2.5 pr-4 font-mono tabular-nums text-[#1F2A38]">
                          {rec.timestamp}
                        </td>
                        <td className="py-2.5 pr-4 font-medium text-[#1F2A38]">
                          {rec.activityTag}
                        </td>
                        <td className="py-2.5 pr-4 font-mono tabular-nums text-[#1F2A38]">
                          {rec.score} · {rec.band}
                        </td>
                        <td className="py-2.5 pr-4 font-mono tabular-nums text-[#5A6C85]">
                          {rec.confidence}%
                        </td>
                        <td className="py-2.5 text-[#5A6C85]">
                          {rec.contributors.join(', ')}
                          {rec.gatesTriggered.length > 0 && (
                            <span className="ml-2 font-mono text-[11px] text-[#1F2A38]">
                              [{rec.gatesTriggered.join(', ')}]
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
