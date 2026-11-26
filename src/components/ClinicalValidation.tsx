import { useEffect, useState } from 'react';
import { ArrowUpRight, Pause, Play, RotateCcw } from 'lucide-react';
import { BENCHMARK_MATRIX, DATASET_PROTOCOLS } from '../data/msaData';
import { useLiveEngine } from '../context/LiveEngineContext';
import { BenchmarkCapability } from '../types/msa';

type ValidationTab = 'replay' | 'matrix';
type CategoryFilter =
  | 'All'
  | 'Sensing'
  | 'Fusion & Gates'
  | 'Calibration & Context'
  | 'Validation & Privacy';

export function ClinicalValidation() {
  const { openWorkspace } = useLiveEngine();
  const [activeTab, setActiveTab] = useState<ValidationTab>('replay');

  // Tab 1: Dataset Replay Engine
  const [datasetId, setDatasetId] = useState<'wesad' | 'stressid' | 'ubfc-phys'>('wesad');
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 4>(1);

  const activeDataset =
    DATASET_PROTOCOLS.find((d) => d.id === datasetId) ?? DATASET_PROTOCOLS[0];
  const maxIdx = activeDataset.frames.length - 1;
  const currentFrame = activeDataset.frames[Math.min(frameIndex, maxIdx)];

  useEffect(() => {
    setFrameIndex(0);
    setIsPlaying(false);
  }, [datasetId]);

  useEffect(() => {
    if (!isPlaying) return;
    const ms = speed === 4 ? 420 : 1400;
    const timer = window.setInterval(() => {
      setFrameIndex((prev) => {
        if (prev >= maxIdx) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, ms);
    return () => window.clearInterval(timer);
  }, [isPlaying, speed, maxIdx]);

  // Tab 2: 11-Benchmark Matrix
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const filteredBenchmarks = BENCHMARK_MATRIX.filter(
    (b) => categoryFilter === 'All' || b.category === categoryFilter
  );

  // Replay SVG geometry
  const svgW = 700;
  const svgH = 210;
  const padL = 38;
  const padR = 20;
  const padT = 18;
  const padB = 30;
  const w = svgW - padL - padR;
  const h = svgH - padT - padB;

  const xy = (idx: number, val: number) => ({
    x: padL + (idx / Math.max(1, maxIdx)) * w,
    y: padT + ((100 - val) / 100) * h,
  });

  return (
    <section
      id="validation"
      className="py-16 sm:py-24 px-4 sm:px-6 bg-[#FFFFFF] border-b border-[#5A6C85]/20"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#5A6C85]">
              Clinical Validation & Research Sandbox
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-[#1F2A38]">
              Benchmarked against{' '}
              <em className="font-serif italic font-normal text-[#5A6C85]">
                peer-reviewed stress protocols.
              </em>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#5A6C85] leading-relaxed">
              Replay multimodal stress trials from WESAD, StressID, and UBFC-Phys or inspect all 11
              system capabilities with leave-one-subject-out (LOSO) validation metrics.
            </p>
          </div>

          {/* Two-Tab Switcher */}
          <div className="flex w-full sm:w-auto sm:inline-flex rounded-xl bg-[#E8EEF5]/65 p-1 border border-[#5A6C85]/20 self-start">
            <button
              type="button"
              onClick={() => setActiveTab('replay')}
              className={`flex-1 sm:flex-none rounded-lg px-3 sm:px-4 min-h-[40px] sm:min-h-0 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'replay'
                  ? 'bg-[#1F2A38] text-[#FFFFFF]'
                  : 'text-[#5A6C85] hover:text-[#1F2A38]'
              }`}
            >
              Dataset Replay
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`flex-1 sm:flex-none rounded-lg px-3 sm:px-4 min-h-[40px] sm:min-h-0 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'matrix'
                  ? 'bg-[#1F2A38] text-[#FFFFFF]'
                  : 'text-[#5A6C85] hover:text-[#1F2A38]'
              }`}
            >
              11-Benchmark Matrix
            </button>
          </div>
        </div>

        {/* Tab 1: Dataset Replay Engine */}
        {activeTab === 'replay' && (
          <div className="mt-8 sm:mt-10 rounded-[24px] border border-[#5A6C85]/25 bg-[#FFFFFF] p-5 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#5A6C85]/15">
              {/* Dataset Selector */}
              <div className="flex flex-wrap items-center gap-2">
                {DATASET_PROTOCOLS.map((ds) => (
                  <button
                    key={ds.id}
                    type="button"
                    onClick={() => setDatasetId(ds.id)}
                    className={`rounded-full px-4 min-h-[38px] sm:min-h-0 py-1.5 text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                      ds.id === datasetId
                        ? 'bg-[#1F2A38] text-[#FFFFFF] border-[#1F2A38]'
                        : 'bg-[#FFFFFF] text-[#5A6C85] border-[#5A6C85]/25 hover:text-[#1F2A38]'
                    }`}
                  >
                    {ds.name}
                  </button>
                ))}
              </div>

              {/* Replay Transport Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (frameIndex >= maxIdx) setFrameIndex(0);
                    setIsPlaying(!isPlaying);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#1F2A38] px-4 min-h-[40px] sm:min-h-0 py-1.5 text-xs font-semibold text-[#FFFFFF] hover:bg-[#2B3A4D] transition-colors cursor-pointer whitespace-nowrap"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Play Protocol</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSpeed(speed === 1 ? 4 : 1)}
                  className="rounded-full border border-[#5A6C85]/30 px-3 min-h-[40px] sm:min-h-0 py-1.5 font-mono text-xs font-semibold text-[#1F2A38] hover:bg-[#E8EEF5]/60 transition-colors cursor-pointer"
                >
                  {speed}×
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setFrameIndex(0);
                  }}
                  aria-label="Reset replay"
                  className="rounded-full border border-[#5A6C85]/30 min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 inline-flex items-center justify-center p-1.5 text-[#5A6C85] hover:text-[#1F2A38] hover:bg-[#E8EEF5]/60 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Protocol Metadata Summary */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="md:col-span-2">
                <div className="font-semibold text-[#1F2A38]">{activeDataset.fullName}</div>
                <div className="text-[#5A6C85] mt-0.5">{activeDataset.cohort}</div>
              </div>
              <div>
                <div className="text-[#5A6C85]">LOSO Macro-F1</div>
                <div className="font-mono tabular-nums text-base font-semibold text-[#1F2A38]">
                  {activeDataset.macroF1}
                </div>
              </div>
              <div>
                <div className="text-[#5A6C85]">Mean Absolute Error</div>
                <div className="font-mono tabular-nums text-base font-semibold text-[#1F2A38]">
                  {activeDataset.maeScore}
                </div>
              </div>
            </div>

            {/* Dual-Curve SVG Chart */}
            <div className="mt-6">
              <div className="flex flex-wrap items-center justify-start sm:justify-end gap-x-5 gap-y-1.5 text-xs mb-2">
                <span className="inline-flex items-center gap-2 text-[#5A6C85]">
                  <span className="w-5 border-t-2 border-dashed border-[#5A6C85]" />
                  Ground Truth Phase
                </span>
                <span className="inline-flex items-center gap-2 text-[#1F2A38] font-medium">
                  <span className="w-5 border-t-2 border-[#1F2A38]" />
                  MSA Prediction
                </span>
              </div>

              <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto max-h-60 overflow-visible">
                {[0, 25, 50, 75, 100].map((v) => {
                  const y = padT + ((100 - v) / 100) * h;
                  return (
                    <g key={v}>
                      <line
                        x1={padL}
                        x2={svgW - padR}
                        y1={y}
                        y2={y}
                        stroke="#5A6C85"
                        strokeOpacity="0.15"
                      />
                      <text
                        x={padL - 8}
                        y={y + 4}
                        textAnchor="end"
                        className="fill-[#5A6C85] font-mono tabular-nums text-[17px] md:text-[12px]"
                      >
                        {v}
                      </text>
                    </g>
                  );
                })}

                {/* Ground Truth Dashed Curve */}
                <polyline
                  fill="none"
                  stroke="#5A6C85"
                  strokeWidth="1.8"
                  strokeDasharray="5 4"
                  points={activeDataset.frames
                    .map((f, i) => {
                      const p = xy(i, f.groundTruth);
                      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
                    })
                    .join(' ')}
                />

                {/* MSA Prediction Curve up to scrubber index */}
                <polyline
                  fill="none"
                  stroke="#1F2A38"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={activeDataset.frames
                    .slice(0, frameIndex + 1)
                    .map((f, i) => {
                      const p = xy(i, f.msaPrediction);
                      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
                    })
                    .join(' ')}
                />

                {/* Playhead line */}
                <line
                  x1={xy(frameIndex, currentFrame.msaPrediction).x}
                  x2={xy(frameIndex, currentFrame.msaPrediction).x}
                  y1={padT}
                  y2={svgH - padB}
                  stroke="#1F2A38"
                  strokeOpacity="0.35"
                />

                {activeDataset.frames.map((f, i) => {
                  const pPred = xy(i, f.msaPrediction);
                  return (
                    <g
                      key={f.minute}
                      className="cursor-pointer"
                      onClick={() => setFrameIndex(i)}
                    >
                      <circle cx={pPred.x} cy={pPred.y} r="18" fill="transparent" />
                      <circle
                        cx={pPred.x}
                        cy={pPred.y}
                        r={i === frameIndex ? 6 : 4}
                        fill={i <= frameIndex ? '#1F2A38' : '#E8EEF5'}
                        stroke="#1F2A38"
                        strokeWidth="1.5"
                      />
                      <text
                        x={pPred.x}
                        y={svgH - 6}
                        textAnchor="middle"
                        className="fill-[#5A6C85] font-mono text-[17px] md:text-[12px]"
                      >
                        {f.minute}m
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Timeline Scrubber */}
              <div className="mt-3 flex flex-col min-[420px]:flex-row items-stretch min-[420px]:items-center gap-2 min-[420px]:gap-4">
                <span className="font-mono text-xs text-[#5A6C85] whitespace-nowrap">
                  Protocol Scrubber
                </span>
                <input
                  type="range"
                  min={0}
                  max={maxIdx}
                  step={1}
                  value={frameIndex}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setFrameIndex(Number(e.target.value));
                  }}
                  aria-label="Replay timeline scrubber"
                  className="w-full h-8 sm:h-auto accent-[#1F2A38] cursor-pointer"
                />
              </div>
            </div>

            {/* Frame Telemetry Readout */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-4 rounded-2xl bg-[#E8EEF5]/45 border border-[#5A6C85]/15 p-4 text-xs">
              <div>
                <div className="text-[#5A6C85]">Current Phase</div>
                <div className="font-semibold text-[#1F2A38] mt-0.5">{currentFrame.phase}</div>
              </div>
              <div>
                <div className="text-[#5A6C85]">Ground Truth vs MSA</div>
                <div className="font-mono tabular-nums font-semibold text-[#1F2A38] mt-0.5">
                  {currentFrame.groundTruth} vs {currentFrame.msaPrediction}
                </div>
              </div>
              <div>
                <div className="text-[#5A6C85]">Heart Rate / HRV</div>
                <div className="font-mono tabular-nums font-semibold text-[#1F2A38] mt-0.5">
                  {currentFrame.hrBpm} BPM · {currentFrame.hrvRmssd} ms
                </div>
              </div>
              <div>
                <div className="text-[#5A6C85]">Facial AU4</div>
                <div className="font-mono tabular-nums font-semibold text-[#1F2A38] mt-0.5">
                  {(currentFrame.au4 * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-[#5A6C85]">Confidence</div>
                <div className="font-mono tabular-nums font-semibold text-[#1F2A38] mt-0.5">
                  {currentFrame.confidence}%
                </div>
              </div>
              {currentFrame.gateNote && (
                <div className="col-span-2 sm:col-span-5 pt-2 border-t border-[#5A6C85]/15 text-[#1F2A38]">
                  <span className="font-semibold">Gate Activity: </span>
                  {currentFrame.gateNote}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: 11-Benchmark Research Matrix */}
        {activeTab === 'matrix' && (
          <div className="mt-8 sm:mt-10 rounded-[24px] border border-[#5A6C85]/25 bg-[#FFFFFF] p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#5A6C85]/15">
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    'All',
                    'Sensing',
                    'Fusion & Gates',
                    'Calibration & Context',
                    'Validation & Privacy',
                  ] as CategoryFilter[]
                ).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`rounded-full px-3.5 min-h-[38px] sm:min-h-0 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      categoryFilter === cat
                        ? 'bg-[#1F2A38] text-[#FFFFFF]'
                        : 'bg-[#E8EEF5]/60 text-[#5A6C85] hover:text-[#1F2A38]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <span className="font-mono tabular-nums text-xs text-[#5A6C85]">
                {filteredBenchmarks.length} of 11 Capabilities
              </span>
            </div>

            {/* Mobile Card Layout for 11-Benchmark Matrix */}
            <div className="mt-4 space-y-3 md:hidden">
              {filteredBenchmarks.map((row: BenchmarkCapability) => (
                <div
                  key={row.id}
                  className="rounded-2xl border border-[#5A6C85]/20 bg-[#E8EEF5]/25 p-4 text-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-mono text-[#5A6C85] mr-1.5">
                        {String(row.index).padStart(2, '0')}
                      </span>
                      <span className="font-semibold text-[#1F2A38]">{row.capability}</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#5A6C85] shrink-0">
                      {row.status}
                    </span>
                  </div>
                  <div className="text-[#5A6C85] space-y-1">
                    <div>
                      <span className="font-medium text-[#1F2A38]">Web:</span> {row.webImplementation}
                    </div>
                    <div>
                      <span className="font-medium text-[#1F2A38]">Mobile:</span> {row.mobileBenchmark}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#5A6C85]/15">
                    <div className="font-mono tabular-nums text-[#1F2A38]">
                      {row.losoMetric} · <span className="text-[#5A6C85]">FA {row.falseAlarmRate}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        openWorkspace({
                          tab: row.testScenario.workspaceTab,
                          channel: row.testScenario.focusChannel,
                          presetId: row.testScenario.presetId,
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-full bg-[#1F2A38] px-3.5 min-h-[38px] py-1.5 text-xs font-semibold text-[#FFFFFF] cursor-pointer"
                    >
                      <span>Test</span>
                      <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="mt-4 hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#5A6C85]/20 text-[#5A6C85]">
                    <th className="py-3 pr-3 font-medium">#</th>
                    <th className="py-3 pr-4 font-medium">Capability</th>
                    <th className="py-3 pr-4 font-medium">Web Edge Execution</th>
                    <th className="py-3 pr-4 font-medium">Mobile Benchmark</th>
                    <th className="py-3 pr-4 font-medium">LOSO Ablation</th>
                    <th className="py-3 pr-4 font-medium">False Alarm</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 text-right font-medium">Sandbox</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#5A6C85]/12">
                  {filteredBenchmarks.map((row: BenchmarkCapability) => (
                    <tr key={row.id} className="hover:bg-[#E8EEF5]/25 transition-colors">
                      <td className="py-3.5 pr-3 font-mono tabular-nums text-[#5A6C85]">
                        {String(row.index).padStart(2, '0')}
                      </td>
                      <td className="py-3.5 pr-4 font-semibold text-[#1F2A38]">
                        <div>{row.capability}</div>
                        <div className="text-[11px] font-normal text-[#5A6C85] mt-0.5">
                          {row.category}
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 text-[#5A6C85]">{row.webImplementation}</td>
                      <td className="py-3.5 pr-4 text-[#5A6C85]">{row.mobileBenchmark}</td>
                      <td className="py-3.5 pr-4 font-mono tabular-nums font-semibold text-[#1F2A38] whitespace-nowrap">
                        {row.losoMetric}
                      </td>
                      <td className="py-3.5 pr-4 font-mono tabular-nums text-[#5A6C85] whitespace-nowrap">
                        {row.falseAlarmRate}
                      </td>
                      <td className="py-3.5 pr-4 font-mono text-[11px] text-[#1F2A38] whitespace-nowrap">
                        {row.status}
                      </td>
                      <td className="py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() =>
                            openWorkspace({
                              tab: row.testScenario.workspaceTab,
                              channel: row.testScenario.focusChannel,
                              presetId: row.testScenario.presetId,
                            })
                          }
                          className="inline-flex items-center gap-1 rounded-full border border-[#1F2A38]/20 px-3 py-1 text-xs font-semibold text-[#1F2A38] hover:bg-[#1F2A38] hover:text-[#FFFFFF] transition-colors cursor-pointer"
                        >
                          <span>Test</span>
                          <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
