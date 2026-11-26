import { useState } from 'react';
import { ArrowRight, Check, ShieldCheck, Trash2, X } from 'lucide-react';
import { useLiveEngine } from '../context/LiveEngineContext';
import { MsaLogo } from './MsaLogo';

type FooterSheetKey = 'documentation' | 'methodology' | 'privacy-arch' | 'contact' | null;

const FOOTER_SHEETS: Record<
  Exclude<FooterSheetKey, null>,
  { title: string; subtitle: string; points: string[] }
> = {
  documentation: {
    title: 'MSA System Documentation',
    subtitle: 'Browser-Native Multimodal Architecture',
    points: [
      'Signal Acquisition: Supports standard getUserMedia camera/microphone pipelines, Web SpeechRecognition, and Web Bluetooth GATT 0x180D heart rate straps with deterministic simulation fallback.',
      'Feature Extraction: Computes green-channel rPPG BPM, ambient luminance, facial AU4/AU7 tension, vocal autocorrelation F0/jitter/shimmer, and upper-body kinesics strictly in volatile memory.',
      'Non-Diagnostic Output: Every score (0–100) is paired with a 5-band classification, baseline delta (Δ μ₀), active confounder gates, and a calibrated uncertainty bound.',
    ],
  },
  methodology: {
    title: 'Research Methodology & Validation',
    subtitle: 'Peer-Reviewed Benchmarks & Confounder Filtering',
    points: [
      'Leave-One-Subject-Out (LOSO) Evaluation: Validated across WESAD, StressID, and UBFC-Phys stress induction protocols (Baseline → TSST → Arithmetic → Recovery).',
      'Four Automated Gates: Physical Exertion, Curiosity/Excitement, Low Camera Luminance, and Baseline Uncertainty gates prevent false-positive distress alerts.',
      'Individual Baseline Strategy (μ₀): Two-stage guided calibration mitigates monitoring-induced anxiety before establishing personal resting norms.',
    ],
  },
  'privacy-arch': {
    title: 'Australian Privacy Principles Architecture',
    subtitle: 'Zero Cloud Retention · APP-Aligned Design',
    points: [
      'APP 1 & 3 (Open Management & Collection): Biometric video frames, raw audio buffers, and linguistic text never leave your local browser execution context.',
      'APP 11 (Security of Personal Information): Longitudinal trends and PSS-10 logs persist exclusively in your device IndexedDB/LocalStorage and can be permanently erased in one tap.',
      'Ephemeral Language Processing: Opt-in speech or text phrasing is evaluated locally for lexicon ratios and immediately purged from memory.',
    ],
  },
  contact: {
    title: 'MSA Australia · Clinical & Research Enquiries',
    subtitle: 'Melbourne & Sydney Digital Wellbeing Engineering',
    points: [
      'Academic & Clinical Partnerships: Collaborating with Australian universities and occupational health teams for non-diagnostic stress awareness research.',
      'Open Standards: Built on standard WebRTC, Web Audio DSP, Web Bluetooth, and clinically validated PSS-10 scoring.',
      'Clinical Notice: MSA is an analytical awareness tool and is not a medical device, diagnostic instrument, or substitute for professional medical care.',
    ],
  },
};

export function PrivacyVaultFooter() {
  const { openWorkspace, eraseAllLocalData, vaultWipedAt, records } = useLiveEngine();
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [activeSheet, setActiveSheet] = useState<FooterSheetKey>(null);

  const handleConfirmErase = async () => {
    await eraseAllLocalData();
    setConfirmWipe(false);
  };

  return (
    <section id="privacy" className="bg-[#1F2A38] text-[#FFFFFF]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-[0.22em] text-[#E8EEF5]/65">
            Privacy by Architecture
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#FFFFFF] leading-tight">
            Your biometrics{' '}
            <em className="font-serif italic font-normal text-[#E8EEF5]">
              never leave your device.
            </em>
          </h2>
          <p className="mt-4 text-base text-[#E8EEF5]/78 leading-relaxed">
            Engineered from the ground up so raw facial video, microphone audio, and personal
            context remain strictly inside your local browser sandbox.
          </p>
        </div>

        {/* 3 Architectural Pillars */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-[20px] border border-[#E8EEF5]/12 bg-[#FFFFFF]/5 p-6">
            <div className="font-mono text-xs text-[#E8EEF5]/60">01</div>
            <h3 className="mt-3 text-lg font-semibold text-[#FFFFFF]">100% Edge Execution</h3>
            <p className="mt-2 text-sm text-[#E8EEF5]/75 leading-relaxed">
              Computer vision, rPPG cardiac extraction, audio autocorrelation, and lexicon scoring
              run strictly inside your browser sandbox—zero video, audio, or raw text ever hits a server.
            </p>
          </div>

          <div className="rounded-[20px] border border-[#E8EEF5]/12 bg-[#FFFFFF]/5 p-6 flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs text-[#E8EEF5]/60">02</div>
              <h3 className="mt-3 text-lg font-semibold text-[#FFFFFF]">One-Tap Privacy Vault</h3>
              <p className="mt-2 text-sm text-[#E8EEF5]/75 leading-relaxed">
                Instant, permanent erasure of all local IndexedDB and LocalStorage records,
                personal baselines μ₀, PSS-10 scores, and session history.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-[#E8EEF5]/10">
              {confirmWipe ? (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleConfirmErase}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#E8EEF5] px-4 min-h-[40px] sm:min-h-0 py-1.5 text-xs font-semibold text-[#1F2A38] hover:bg-[#FFFFFF] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Confirm Permanent Wipe</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmWipe(false)}
                    className="rounded-full border border-[#E8EEF5]/25 px-3.5 min-h-[40px] sm:min-h-0 py-1.5 text-xs text-[#E8EEF5]/80 hover:text-[#FFFFFF] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmWipe(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#E8EEF5]/25 px-4 min-h-[40px] sm:min-h-0 py-1.5 text-xs font-semibold text-[#E8EEF5] hover:bg-[#FFFFFF]/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Erase Local Vault ({records.length} records)</span>
                </button>
              )}

              {vaultWipedAt && (
                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#E8EEF5]">
                  <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>All local IndexedDB & storage cleared at {vaultWipedAt}.</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[20px] border border-[#E8EEF5]/12 bg-[#FFFFFF]/5 p-6">
            <div className="font-mono text-xs text-[#E8EEF5]/60">03</div>
            <h3 className="mt-3 text-lg font-semibold text-[#FFFFFF]">Built in Australia</h3>
            <p className="mt-2 text-sm text-[#E8EEF5]/75 leading-relaxed">
              Engineered in alignment with the{' '}
              <strong className="font-semibold text-[#FFFFFF]">
                Australian Privacy Principles (APPs)
              </strong>{' '}
              for clinical research, workplace wellbeing, and personal awareness—never as a medical
              diagnosis tool.
            </p>
          </div>
        </div>

        {/* Final Luminous CTA */}
        <div className="mt-12 sm:mt-14 rounded-[24px] border border-[#E8EEF5]/15 bg-[#FFFFFF]/5 backdrop-blur-md p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 min-w-0">
            <ShieldCheck className="w-6 h-6 text-[#E8EEF5] shrink-0 mt-1" aria-hidden="true" />
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold text-[#FFFFFF]">
                Ready for a calibrated, context-aware check-in?
              </h3>
              <p className="mt-1 text-sm text-[#E8EEF5]/75">
                Start with live camera, microphone, Bluetooth wearables, or instant simulated telemetry.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openWorkspace({ tab: 'sensors' })}
            className="w-full md:w-auto justify-center inline-flex items-center gap-2 rounded-full bg-[#E8EEF5] px-6 min-h-[44px] py-3 text-sm font-semibold text-[#1F2A38] hover:bg-[#FFFFFF] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Launch MSA in Browser</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Minimalist Footer */}
      <footer className="border-t border-[#E8EEF5]/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <MsaLogo variant="light" showSubtitle />

          <nav
            aria-label="Footer documentation links"
            className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[#E8EEF5]/70"
          >
            <button
              type="button"
              onClick={() => setActiveSheet('documentation')}
              className="min-h-[40px] sm:min-h-0 inline-flex items-center hover:text-[#FFFFFF] transition-colors cursor-pointer"
            >
              Documentation
            </button>
            <button
              type="button"
              onClick={() => setActiveSheet('methodology')}
              className="min-h-[40px] sm:min-h-0 inline-flex items-center hover:text-[#FFFFFF] transition-colors cursor-pointer"
            >
              Research Methodology
            </button>
            <button
              type="button"
              onClick={() => setActiveSheet('privacy-arch')}
              className="min-h-[40px] sm:min-h-0 inline-flex items-center hover:text-[#FFFFFF] transition-colors cursor-pointer"
            >
              Privacy Architecture
            </button>
            <button
              type="button"
              onClick={() => setActiveSheet('contact')}
              className="min-h-[40px] sm:min-h-0 inline-flex items-center hover:text-[#FFFFFF] transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>
        </div>
      </footer>

      {/* Footer Reference Sheet Modal */}
      {activeSheet && (
        <div
          className="fixed inset-0 z-50 bg-[#1F2A38]/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="footer-sheet-title"
        >
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[24px] bg-[#FFFFFF] text-[#1F2A38] border border-[#1F2A38]/10 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-[#5A6C85]">
                  {FOOTER_SHEETS[activeSheet].subtitle}
                </div>
                <h3 id="footer-sheet-title" className="mt-1 text-xl font-semibold text-[#1F2A38]">
                  {FOOTER_SHEETS[activeSheet].title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveSheet(null)}
                aria-label="Close dialog"
                className="rounded-full p-1.5 text-[#5A6C85] hover:bg-[#E8EEF5] hover:text-[#1F2A38] cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <ul className="mt-5 space-y-3 text-sm text-[#5A6C85] leading-relaxed">
              {FOOTER_SHEETS[activeSheet].points.map((pt) => (
                <li key={pt} className="rounded-xl bg-[#E8EEF5]/45 p-3.5 text-[#1F2A38]/90">
                  {pt}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveSheet(null)}
                className="rounded-full bg-[#1F2A38] px-5 py-2 text-xs font-semibold text-[#FFFFFF] hover:bg-[#2B3A4D] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
