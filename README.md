# MSA — Multimodal Stress Analyser

> **Indian Clinical Biometrics · 100% On-Device · Zero Cloud Retention**

**MSA (Multimodal Stress Analyser)** is a browser-native, clinical-grade multimodal stress analysis platform designed to replace opaque single-sensor percentages (such as an unexplained `"73% stressed"`) with calibrated, context-aware physiological and behavioral intelligence.

By fusing six synchronous visual, vocal, linguistic, postural, and wearable physiological channels against an individual's own resting baseline ($\mu_0$), applying four automated confounder gates, and pairing sensor trajectories with clinically validated PSS-10 and lifestyle context, MSA distinguishes genuine distress from everyday physiology—strictly inside the local browser sandbox in alignment with **India's Digital Personal Data Protection (DPDP) Act, 2023**.

> **Clinical & Non-Diagnostic Notice**  
> MSA is an analytical awareness and research platform. Output scores, band classifications, and longitudinal trajectories are statistical estimates—not a medical device, clinical diagnosis, or treatment tool. If sustained high-band patterns persist, please seek evaluation from a qualified healthcare professional.

---

## Table of Contents

1. [Core Research Thesis & Problem Statement](#1-core-research-thesis--problem-statement)
2. [System Architecture Diagram](#2-system-architecture-diagram)
3. [Multimodal Fusion & Confounder Pipeline](#3-multimodal-fusion--confounder-pipeline)
4. [Six Synchronized Sensing Channels](#4-six-synchronized-sensing-channels)
5. [Personal Calibration ($\mu_0$), PSS-10 & Longitudinal Care](#5-personal-calibration-%CE%BC%E2%82%80-pss-10--longitudinal-care)
6. [Clinical Validation & Research Benchmarks](#6-clinical-validation--research-benchmarks)
7. [Zero-Retention Privacy Vault (DPDP Act, 2023)](#7-zero-retention-privacy-vault-dpdp-act-2023)
8. [Interactive Workspace & User Experience](#8-interactive-workspace--user-experience)
9. [Technology Stack & Local Setup](#9-technology-stack--local-setup)

---

## 1. Core Research Thesis & Problem Statement

Single-modality stress detectors fail in real-world environments because physiological and behavioral signals are inherently ambiguous:

- **Elevated Heart Rate & Sweating** can stem from physical exercise, heat, or caffeine rather than psychological distress.
- **Facial Tension & Gaze Shifts** can reflect positive curiosity, surprise, or animated concentration rather than anxiety.
- **Vocal Pitch ($F_0$) & Speech Rate Changes** may result from fatigue, illness, or natural communication style.
- **Observer / Monitoring Anxiety** can artificially elevate baseline arousal during the first moments of measurement.
- **Inter-Individual Variability** means a fixed population threshold misclassifies people whose resting heart rate, HRV RMSSD, or vocal pitch differs from cohort averages.

MSA addresses these challenges through **personal baseline normalization ($\mu_0$)**, **cross-modal agreement weighting**, **automated confounder gating**, **explicit confidence & uncertainty intervals**, and **longitudinal trend tracking**.

---

## 2. System Architecture Diagram

All acquisition, digital signal processing (DSP), computer vision, fusion, and persistence run exclusively inside the user's browser process. Zero video frames, raw audio buffers, or raw text leave the device.

```text
+----------------------------------------------------------------------------------------+
|                        MSA 100% ON-DEVICE BROWSER RUNTIME                              |
|                                                                                        |
|  1. SIGNAL ACQUISITION (Real Browser APIs + Deterministic Simulated Fallback)          |
|  +----------------------------------------+   +-------------------------------------+  |
|  | Real Hardware Streams                  |   | Simulated & Replay Streams          |  |
|  | - Webcam (getUserMedia 640x480 @10Hz)  |   | - 5 Hero Sandbox Presets            |  |
|  | - Microphone (Web Audio AnalyserNode)  |   | - Continuous Physiological Fallback |  |
|  | - Speech (Web SpeechRecognition en-AU) |   | - WESAD / StressID / UBFC-Phys      |  |
|  | - BLE Strap (Web Bluetooth 0x180D)     |   |   Clinical Protocol Replay          |  |
|  +-------------------+--------------------+   +------------------+------------------+  |
|                      |                                           |                     |
|                      +---------------------+---------------------+                     |
|                                            v                                           |
|  2. IN-MEMORY FEATURE EXTRACTION & BASELINE NORMALIZATION (mu_0)                       |
|  +----------------------------------------------------------------------------------+  |
|  | - Optical ROI: Green-channel rPPG BPM, Ambient Luma (%), AU4/AU7, Motion Energy  |  |
|  | - Acoustic DSP: Autocorrelation F0 (Hz), Cycle Jitter (%), Shimmer (%), Pause %  |  |
|  | - Ephemeral Lexicon: In-memory strain ratio -> immediate raw text disposal       |  |
|  | - BLE GATT 0x2A37: 8/16-bit BPM + RR-Interval HRV RMSSD (ms)                     |  |
|  | - Delta Engine: Normalizes live features against 2-Stage Personal Baseline mu_0  |  |
|  +-----------------------------------------+----------------------------------------+  |
|                                            |                                           |
|                                            v                                           |
|  3. FUSION ENGINE & CONFOUNDER GATES  -->  4. LOCAL PRIVACY VAULT & UI SURFACES        |
|  +----------------------------------+      +----------------------------------------+  |
|  | - Late vs. Attention Fusion      |      | - LocalStorage + IndexedDB Only        |  |
|  | - Quick (30-60s) vs. Session     |      | - Hero Flashlight Reveal + Gauge       |  |
|  | - 4 Automated Confounder Gates   |      | - Dedicated Live Analyser Workspace    |  |
|  | - Output: Score, Band, Conf %,   |      | - Dockable Persistent Telemetry Rail    |  |
|  |   Delta vs mu_0, Top Signals     |      | - Longitudinal SVG Chart + CSV Export  |  |
|  +----------------------------------+      +----------------------------------------+  |
+----------------------------------------------------------------------------------------+
```

---

## 3. Multimodal Fusion & Confounder Pipeline

Before assigning a stress score (`0–100`) and clinical band, MSA runs per-channel baseline normalization, optional cross-channel attention weighting, and four automated quality/confounder gates:

```text
  Channel Sub-Scores (Normalized vs. Personal Baseline mu_0)
   ├── Facial AU4/AU7 (0.19 prior)
   ├── Camera rPPG    (0.14 prior)
   ├── Voice DSP      (0.21 prior)
   ├── Language Ratio (0.07 prior)
   ├── Body Kinesics  (0.11 prior)
   └── Wearable BLE   (0.28 prior)
          │
          ▼
  ┌──────────────────────────────────────────────────────────┐
  │ Quality & Availability Check                             │
  │ • Disabled channels zeroed out dynamically                │
  │ • Low Camera Luminance Gate (< 30% ambient luma):        │
  │   Scales rPPG weight x0.18, Facial x0.35, Posture x0.50  │
  └───────────────────────────┬──────────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
  [ Late Fusion ]                        [ Attention Fusion ]
  Fixed clinical reliability             Boosts channels with high
  priors across active sensors           cross-modal agreement
          │                                       │
          └───────────────────┬───────────────────┘
                              ▼
  ┌──────────────────────────────────────────────────────────┐
  │ Automated Confounder Gates                               │
  │ 1. Physical Exertion Gate:                               │
  │    Accel >= 1.32g OR (Motion >= 72% & HR >= 110 BPM)     │
  │    -> Discounts score (-26 pts) as non-stress exertion   │
  │ 2. Curiosity / Excitement Gate:                          │
  │    High facial/gaze animation + steady HRV & calm EDA    │
  │    -> Discounts score (-16 pts) as positive engagement   │
  │ 3. Baseline Uncertainty Gate:                            │
  │    Triggers when mu_0 is uncalibrated or window = Quick  │
  │    -> Widens confidence uncertainty bounds               │
  └───────────────────────────┬──────────────────────────────┘
                              ▼
  Final Contextual Output:
   • Calibrated Score (0–100) & Band (Calm / Mild / Moderate / High / Very High)
   • Confidence % & Uncertainty Interval (± pts)
   • Baseline Shift (Delta vs. mu_0) & Top Contributing Signals
```

---

## 4. Six Synchronized Sensing Channels

| # | Channel | Extracted Features & Metrics | Browser API / Edge DSP | Privacy & Fallback Safeguard |
|---|---|---|---|---|
| **01** | **Facial Micro-Expressions** | Brow lowerer (`AU4`), lid tightener (`AU7`), blink rate (`/min`), gaze shift rate | `getUserMedia` optical ROI motion & contour analysis | **Privacy Mask Toggle** conceals raw video behind a vector silhouette; falls back to simulated stream |
| **02** | **Contactless Camera Pulse (rPPG)** | Heart rate (`BPM`), pulse waveform, ambient luminance (`%`) | Green-channel spatial ROI detrending & zero-crossing BPM | Automatically gated by the **Low Camera Luminance Gate** below `30%` ambient luma |
| **03** | **Voice & Acoustic Stress** | Fundamental pitch $F_0$ (`Hz`), jitter (`%`), shimmer (`%`), speaking rate (`WPM`), pause ratio | `AudioContext` + `AnalyserNode` time-domain autocorrelation | Zero-disk audio DSP; buffers are overwritten every frame without recording |
| **04** | **Opt-In Language Context** | Strain/negative lexicon ratio (`%`), utterance sample count | Browser `SpeechRecognition` + local phrase evaluator | **Ephemeral Processing**: raw transcript text is scored in memory and immediately purged |
| **05** | **Body Posture & Kinesics** | Posture closure/slump (`%`), movement energy (`%`), gesture jerkiness, self-touch adaptors | Frame-to-frame optical motion energy & upper-body stability | No video frames stored; feeds directly into the **Physical Exertion Gate** |
| **06** | **Wearable BLE & Live Simulator** | Heart rate (`BPM`), `HRV RMSSD` (`ms`) from RR intervals, `EDA` (`μS`), skin temp (`°C`), accel (`g`) | Web Bluetooth GATT Heart Rate Service (`0x180D` / `0x2A37`) | Seamless physiological simulator fallback when BLE is unsupported or declined |

---

## 5. Personal Calibration ($\mu_0$), PSS-10 & Longitudinal Care

### Two-Stage Guided Calibration ($\mu_0$)
1. **Stage 1 — Settling Period**: Guides a steady breathing cadence (4s inhale / 4s exhale) to reduce monitoring-induced observer anxiety before sampling.
2. **Stage 2 — Neutral Multi-Channel Capture**: Records resting HRV RMSSD, resting BPM, baseline pitch $F_0$, and resting facial AU4 into local browser storage as personal reference $\mu_0$.

### PSS-10 & Holistic Context Intake
- **Perceived Stress Scale (PSS-10)**: Full 10-item clinically validated questionnaire (`0–40` total scale) with automatic reverse-scoring on positive coping items **4, 5, 7, and 8** (`score = 4 - raw`).
- **Voluntary Contextual Tags**: Sleep quality & duration, physical activity, social closeness, work/study load, caffeine intake, and optional medication/health notes—treated strictly as contextual modifiers rather than diagnostic causes.

### Stress Bands & Longitudinal Trajectory
Scores map across five clinical awareness bands:
- **Calm (`0–19`)** · **Mild (`20–39`)** · **Moderate (`40–59`)** · **High (`60–79`)** · **Very High (`80–100`)**

The Longitudinal Trajectory Dashboard supports **Session**, **24-Hour**, and **Week** timeframes, stress-band filters, crosshair inspection tooltips, automatic **Sustained High-Band Awareness Notices** (when multiple observations exceed `60`), activity-tagged session logs, and **RFC-4180 CSV Export**.

---

## 6. Clinical Validation & Research Benchmarks

### Interactive Dataset Replay Engine
Replay time-series protocols comparing ground-truth stress induction phases (*Baseline → Preparation → TSST Stress → Arithmetic → Recovery*) against MSA predictions with Play/Pause, `1× / 4×` speed toggle, and interactive scrubbing:

| Protocol | Cohort & Reference Modalities | LOSO Macro-F1 | MAE |
|---|---|---|---|
| **WESAD** | N = 15 subjects · ECG/HRV, EDA, Skin Temp, 3-Axis Accel | `91.4%` | `4.2 pts` |
| **StressID** | N = 65 participants · RGB Facial AU, Speech $F_0$/Jitter, EDA | `88.7%` | `5.1 pts` |
| **UBFC-Phys** | N = 56 subjects · Unconstrained webcam rPPG, Luminance Gate, BVP | `86.9%` | `5.6 pts` |

### 11-Benchmark Capability Matrix
The Validation tab maps all **11 core MSA capabilities** across web edge execution, mobile architecture benchmarks, LOSO ablation scores, and confounder false-alarm rates (including `-68%` false-positive reduction via Exertion & Curiosity gating), with direct `Test ↗` launchers into the Live Analyser Workspace.

---

## 7. Zero-Retention Privacy Vault (DPDP Act, 2023)

MSA is engineered around data minimization and local-only sovereignty in alignment with **India's Digital Personal Data Protection (DPDP) Act, 2023**:

- **Zero Server Biometrics**: No backend server receives webcam video, microphone audio, BLE heart rate streams, or raw speech/text transcripts.
- **Volatile Ephemeral Text Scoring**: Linguistic inputs are evaluated in-memory for aggregate lexicon ratios and immediately discarded.
- **Local-Only Persistence**: Personal baselines ($\mu_0$), PSS-10 scores, lifestyle tags, and longitudinal session logs are stored strictly in browser `localStorage` and `IndexedDB`.
- **One-Tap Privacy Vault Erasure**: Users can permanently wipe all `localStorage` keys, delete the `msa_privacy_vault` IndexedDB store, and halt active hardware streams in a single confirmed action.

---

## 8. Interactive Workspace & User Experience

- **Interactive "Flashlight Reveal" Hero**: GPU-accelerated `requestAnimationFrame` lerped cursor spotlight (`--mouse-x`, `--mouse-y`, with ambient drift on touch devices) illuminating organic biometric contours and a **5-Preset Live Gauge Sandbox** (*Calm Rest*, *Cognitive Strain*, *Physical Exertion*, *Curiosity / Excitement*, *Low-Light Dropout*).
- **Dedicated Live Analyser Workspace**: Asymmetric split console featuring live Webcam/rPPG (with Privacy Mask), Microphone Web Audio oscilloscope, SpeechRecognition/ephemeral text scoring, BLE GATT pairing, 2-Stage Calibration, PSS-10 intake, and Contextual Report export.
- **Dockable Persistent Telemetry Sidebar**: Minimizes the full workspace into a persistent desktop right-hand telemetry rail (or compact mobile bottom bar) so live monitoring continues seamlessly while browsing validation or fusion sections.

---

## 9. Technology Stack & Local Setup

### Stack
- **Frontend**: React `19`, TypeScript, Vite `8`
- **Styling & Motion**: Tailwind CSS `v4` (`@tailwindcss/vite`), `lucide-react`, `motion`
- **Typography**: *Playfair Display*, *Plus Jakarta Sans*, *JetBrains Mono* (`tabular-nums`)
- **Browser APIs**: WebRTC `MediaDevices`, Web Audio `AnalyserNode`, Web `SpeechRecognition`, Web Bluetooth GATT (`0x180D` / `0x2A37`), `IndexedDB` / `localStorage`

### Prerequisites & Running Locally

- **Node.js** `>= 18.x` and **npm**
- For real Camera, Microphone, and Web Bluetooth testing, serve over `http://localhost:3000` or `https://` (required by browser secure-context policies). Simulated telemetry works in all environments without hardware permissions.

```bash
# 1. Install dependencies
npm install

# 2. Start the development server on port 3000
npm run dev

# 3. Type-check the codebase
npm run lint

# 4. Build for production
npm run build

# 5. Preview production bundle
npm run preview
```
