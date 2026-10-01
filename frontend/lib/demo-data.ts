// BrainTumorVision AI - High Fidelity Synthetic MRI Visualizations & Demo Dataset

export const MRI_SVGS = {
  // T1: Dark CSF, clear grey/white matter anatomy
  T1: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <rect width="400" height="400" fill="%23050811"/>
    <!-- Cranium / Skull Bone -->
    <ellipse cx="200" cy="200" rx="160" ry="175" fill="%231a2333" stroke="%233b4d66" stroke-width="6"/>
    <!-- Brain Parenchyma -->
    <ellipse cx="200" cy="200" rx="150" ry="165" fill="%23243147"/>
    <!-- Sulci & Gyri Brain Foldings -->
    <path d="M 130 90 Q 150 140 120 180 T 140 250 T 110 310" stroke="%23182232" stroke-width="4" fill="none" opacity="0.7"/>
    <path d="M 270 90 Q 250 140 280 180 T 260 250 T 290 310" stroke="%23182232" stroke-width="4" fill="none" opacity="0.7"/>
    <path d="M 200 45 L 200 355" stroke="%23141c28" stroke-width="3" opacity="0.8"/> <!-- Interhemispheric Fissure -->
    <!-- Ventricles (Hypointense / Dark in T1) -->
    <path d="M 185 150 C 185 130, 165 140, 175 190 C 180 215, 190 220, 192 180 Z" fill="%230b101a"/>
    <path d="M 215 150 C 215 130, 235 140, 225 190 C 220 215, 210 220, 208 180 Z" fill="%230b101a"/>
    <!-- Right Frontal-Temporal Lesion Core (Hypointense in T1) -->
    <circle cx="265" cy="165" r="32" fill="%23182230" stroke="%2328374d" stroke-width="3"/>
    <circle cx="268" cy="164" r="16" fill="%230d141e"/>
    <text x="20" y="30" fill="%230ea5e9" font-family="monospace" font-size="12" font-weight="bold">MODALITY: T1-WEIGHTED AXIAL</text>
    <text x="20" y="46" fill="%2364748b" font-family="monospace" font-size="10">TR: 550ms | TE: 12ms | SLICE: 14/24</text>
  </svg>`,

  // T2: Hyperintense / Bright CSF & Fluids
  T2: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <rect width="400" height="400" fill="%23050811"/>
    <!-- Cranium / Skull Bone -->
    <ellipse cx="200" cy="200" rx="160" ry="175" fill="%23141c28" stroke="%232b3b50" stroke-width="6"/>
    <!-- Brain Parenchyma -->
    <ellipse cx="200" cy="200" rx="150" ry="165" fill="%231e293b"/>
    <!-- Interhemispheric fissure -->
    <path d="M 200 45 L 200 355" stroke="%2338bdf8" stroke-width="2" opacity="0.5"/>
    <!-- Ventricles (Hyperintense / Bright White in T2) -->
    <path d="M 185 150 C 185 130, 165 140, 175 190 C 180 215, 190 220, 192 180 Z" fill="%23e2e8f0" filter="drop-shadow(0px 0px 4px %2338bdf8)"/>
    <path d="M 215 150 C 215 130, 235 140, 225 190 C 220 215, 210 220, 208 180 Z" fill="%23e2e8f0" filter="drop-shadow(0px 0px 4px %2338bdf8)"/>
    <!-- Right Frontal-Temporal Lesion & Edema (Bright Hyperintensity) -->
    <circle cx="265" cy="165" r="44" fill="%2394a3b8" opacity="0.6"/>
    <circle cx="265" cy="165" r="32" fill="%23cbd5e1" stroke="%23ffffff" stroke-width="2"/>
    <circle cx="268" cy="164" r="16" fill="%2364748b"/>
    <text x="20" y="30" fill="%2306b6d4" font-family="monospace" font-size="12" font-weight="bold">MODALITY: T2-WEIGHTED AXIAL</text>
    <text x="20" y="46" fill="%2364748b" font-family="monospace" font-size="10">TR: 4200ms | TE: 98ms | SLICE: 14/24</text>
  </svg>`,

  // FLAIR: Dark CSF, Bright Vasogenic Peritumoral Edema
  FLAIR: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <rect width="400" height="400" fill="%23050811"/>
    <!-- Cranium / Skull Bone -->
    <ellipse cx="200" cy="200" rx="160" ry="175" fill="%23121824" stroke="%23273549" stroke-width="6"/>
    <!-- Brain Parenchyma -->
    <ellipse cx="200" cy="200" rx="150" ry="165" fill="%231e2838"/>
    <!-- Ventricles (Suppressed Dark in FLAIR) -->
    <path d="M 185 150 C 185 130, 165 140, 175 190 C 180 215, 190 220, 192 180 Z" fill="%230a0e17"/>
    <path d="M 215 150 C 215 130, 235 140, 225 190 C 220 215, 210 220, 208 180 Z" fill="%230a0e17"/>
    <!-- Prominent Hyperintense Vasogenic Edema Glow -->
    <path d="M 230 130 Q 315 125 320 185 Q 315 225 255 215 Q 225 185 230 130 Z" fill="%23f1f5f9" opacity="0.85" filter="drop-shadow(0 0 10px %2338bdf8)"/>
    <!-- Infiltrative tumor core -->
    <circle cx="265" cy="165" r="26" fill="%2394a3b8" stroke="%23e2e8f0" stroke-width="2"/>
    <text x="20" y="30" fill="%23a855f7" font-family="monospace" font-size="12" font-weight="bold">MODALITY: T2-FLAIR AXIAL</text>
    <text x="20" y="46" fill="%2364748b" font-family="monospace" font-size="10">TR: 9000ms | TE: 120ms | TI: 2500ms</text>
  </svg>`,

  // T1-CE: Contrast-Enhanced T1 showing clear Ring Enhancement of Glioblastoma
  T1CE: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <rect width="400" height="400" fill="%23050811"/>
    <!-- Cranium / Skull Bone -->
    <ellipse cx="200" cy="200" rx="160" ry="175" fill="%231a2333" stroke="%233b4d66" stroke-width="6"/>
    <!-- Brain Parenchyma -->
    <ellipse cx="200" cy="200" rx="150" ry="165" fill="%23243147"/>
    <!-- Ventricles -->
    <path d="M 185 150 C 185 130, 165 140, 175 190 C 180 215, 190 220, 192 180 Z" fill="%230b101a"/>
    <path d="M 215 150 C 215 130, 235 140, 225 190 C 220 215, 210 220, 208 180 Z" fill="%230b101a"/>
    <!-- Blood vessels contrast enhancement -->
    <path d="M 150 170 Q 155 185 148 200" stroke="%23f8fafc" stroke-width="2" fill="none" opacity="0.75"/>
    <path d="M 200 80 Q 205 100 200 120" stroke="%23f8fafc" stroke-width="2" fill="none" opacity="0.8"/>
    <!-- Ring Enhancing Lesion (Classic Glioblastoma Multi-Center Pattern) -->
    <circle cx="265" cy="165" r="34" fill="%230f172a" stroke="%23ffffff" stroke-width="7" filter="drop-shadow(0 0 8px %2338bdf8)"/>
    <circle cx="265" cy="165" r="26" fill="%23090e17"/> <!-- Necrotic Non-Enhancing Core -->
    <text x="20" y="30" fill="%2338bdf8" font-family="monospace" font-size="12" font-weight="bold">MODALITY: T1-CE (CONTRAST ENHANCED)</text>
    <text x="20" y="46" fill="%2364748b" font-family="monospace" font-size="10">AGENT: Gadobutrol 0.1 mmol/kg | SLICE: 14/24</text>
  </svg>`,

  // Segmentation Mask: Highlighting enhancing core + edema regions
  SEGMENTATION: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <!-- Transparent Background -->
    <!-- Vasogenic Edema (Green / Cyan boundary) -->
    <path d="M 225 125 Q 320 120 325 190 Q 320 230 250 220 Q 220 185 225 125 Z" fill="%2306b6d4" fill-opacity="0.35" stroke="%2306b6d4" stroke-width="3" stroke-dasharray="4,4"/>
    <!-- Enhancing Tumor Margin (High Alert Red/Magenta boundary) -->
    <circle cx="265" cy="165" r="35" fill="%23ef4444" fill-opacity="0.45" stroke="%23ef4444" stroke-width="3"/>
    <!-- Necrotic Core (Yellow / Amber) -->
    <circle cx="265" cy="165" r="23" fill="%23f59e0b" fill-opacity="0.55" stroke="%23f59e0b" stroke-width="2"/>
    <text x="220" y="115" fill="%2306b6d4" font-family="sans-serif" font-size="10" font-weight="bold">Peritumoral Edema</text>
    <text x="285" y="165" fill="%23ef4444" font-family="sans-serif" font-size="10" font-weight="bold">Enhancing Rim</text>
    <text x="240" y="170" fill="%23f59e0b" font-family="sans-serif" font-size="9" font-weight="bold">Necrotic Core</text>
  </svg>`,

  // Grad-CAM: Class Activation Heatmap
  GRADCAM: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <defs>
      <radialGradient id="gradcamGrad" cx="66%" cy="41%" r="22%" fx="66%" fy="41%">
        <stop offset="0%" stop-color="%23ef4444" stop-opacity="0.85"/>
        <stop offset="45%" stop-color="%23f59e0b" stop-opacity="0.65"/>
        <stop offset="75%" stop-color="%2306b6d4" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="%230284c7" stop-opacity="0.0"/>
      </radialGradient>
    </defs>
    <rect width="400" height="400" fill="url(%23gradcamGrad)"/>
    <text x="210" y="225" fill="%23ffffff" font-family="sans-serif" font-size="11" font-weight="bold" filter="drop-shadow(0 1px 2px %23000000)">Grad-CAM Salience Peak (0.98)</text>
  </svg>`,

  // SHAP: Feature contribution attribution
  SHAP: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <defs>
      <radialGradient id="shapGrad" cx="66%" cy="41%" r="20%">
        <stop offset="0%" stop-color="%238b5cf6" stop-opacity="0.8"/>
        <stop offset="50%" stop-color="%230ea5e9" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="%230f172a" stop-opacity="0.0"/>
      </radialGradient>
    </defs>
    <circle cx="265" cy="165" r="70" fill="url(%23shapGrad)"/>
    <!-- Contour lines of Shapley value impact -->
    <circle cx="265" cy="165" r="35" fill="none" stroke="%23a855f7" stroke-width="2" stroke-dasharray="3,3"/>
    <circle cx="265" cy="165" r="55" fill="none" stroke="%2338bdf8" stroke-width="1.5" stroke-dasharray="2,2"/>
    <text x="220" y="110" fill="%23c084fc" font-family="sans-serif" font-size="11" font-weight="bold">+0.44 SHAP Attribution</text>
  </svg>`,

  // Cross-Attention map overlay
  ATTENTION: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <!-- Grid of attention token weights -->
    <rect x="235" y="135" width="60" height="60" fill="%2338bdf8" fill-opacity="0.3" stroke="%230ea5e9" stroke-width="2"/>
    <circle cx="265" cy="165" r="28" fill="%2322d3ee" fill-opacity="0.4"/>
    <line x1="265" y1="165" x2="200" y2="200" stroke="%2338bdf8" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.8"/>
    <line x1="265" y1="165" x2="215" y2="150" stroke="%2338bdf8" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.8"/>
    <text x="210" y="245" fill="%2338bdf8" font-family="sans-serif" font-size="10" font-weight="bold">Cross-Attention Weight: 0.89</text>
  </svg>`,
};

export const CLINICAL_SAFETY = {
  prototype_disclaimer: "Research Prototype — AI-generated results require qualified clinician review.",
  xai_disclaimer: "Highlighted regions represent areas that contributed to the model's prediction. These visualizations are model explanations and should not be interpreted as definitive clinical evidence.",
  not_a_device: "BrainTumorVision AI is an investigational decision-support research system and is not approved as an independent diagnostic medical device.",
};

export const SAMPLE_PATIENTS = [
  {
    id: "P-1001",
    patient_id: "P-1001",
    name: "Research Subject 1001",
    age: 54,
    sex: "Female",
    primary_condition: "Right Frontal Glioblastoma Surveillance",
    scan_count: 4,
    latest_scan_date: "Sep 10, 2026",
    status: "Active Monitoring",
    estimated_volume_cm3: 12.1,
  },
  {
    id: "P-1002",
    patient_id: "P-1002",
    name: "Research Subject 1002",
    age: 42,
    sex: "Male",
    primary_condition: "Parasagittal Meningioma Post-Resection",
    scan_count: 3,
    latest_scan_date: "Aug 24, 2026",
    status: "Stable Post-Op",
    estimated_volume_cm3: 3.4,
  },
  {
    id: "P-1003",
    patient_id: "P-1003",
    name: "Research Subject 1003",
    age: 36,
    sex: "Female",
    primary_condition: "Pituitary Macroadenoma Sellar Surveillance",
    scan_count: 2,
    latest_scan_date: "Jul 12, 2026",
    status: "Under Investigation",
    estimated_volume_cm3: 4.8,
  },
  {
    id: "P-1004",
    patient_id: "P-1004",
    name: "Research Subject 1004",
    age: 61,
    sex: "Male",
    primary_condition: "Secondary Cephalea Workup (No Lesion Identified)",
    scan_count: 1,
    latest_scan_date: "Jun 04, 2026",
    status: "Normal Scan Baseline",
    estimated_volume_cm3: 0.0,
  },
];

export const SAMPLE_TIMELINE = [
  {
    date: "Jan 15, 2026",
    label: "JAN SCAN",
    scan_id: "SCAN-2026-01",
    tumor_volume_cm3: 18.6,
    tumor_type: "Glioma",
    model_prediction: "Glioma (WHO IV)",
    confidence: 0.965,
    uncertainty: "Low",
    model_observed_change: "Baseline scan — Hyperintense lesion with substantial peritumoral edema",
    thumbnail: MRI_SVGS.T1CE,
  },
  {
    date: "Apr 22, 2026",
    label: "APR SCAN",
    scan_id: "SCAN-2026-02",
    tumor_volume_cm3: 14.2,
    tumor_type: "Glioma",
    model_prediction: "Glioma (WHO IV)",
    confidence: 0.958,
    uncertainty: "Low",
    model_observed_change: "Volumetric reduction (-23.6%) observed following initial cycle",
    thumbnail: MRI_SVGS.FLAIR,
  },
  {
    date: "Jul 18, 2026",
    label: "JUL SCAN",
    scan_id: "SCAN-2026-03",
    tumor_volume_cm3: 11.4,
    tumor_type: "Glioma",
    model_prediction: "Glioma (WHO IV)",
    confidence: 0.942,
    uncertainty: "Low",
    model_observed_change: "Continued volumetric stabilization (-19.7% from prior scan)",
    thumbnail: MRI_SVGS.T2,
  },
  {
    date: "Sep 10, 2026",
    label: "SEP SCAN",
    scan_id: "SCAN-2026-04",
    tumor_volume_cm3: 12.1,
    tumor_type: "Glioma",
    model_prediction: "Glioma (WHO IV)",
    confidence: 0.954,
    uncertainty: "Low",
    model_observed_change: "Slight volumetric enlargement (+6.1%) at anterior margin; clinician review recommended",
    thumbnail: MRI_SVGS.T1,
  },
];

export const SAMPLE_DASHBOARD_DATA = {
  kpis: [
    { title: "Total Scans Analyzed", value: "1,428", change: "+12.4%", trend: "up", subtitle: "Multi-center cohort" },
    { title: "Tumors Identified", value: "982", change: "68.7%", trend: "neutral", subtitle: "Glioma / Meningioma / Pituitary" },
    { title: "Avg Model Confidence", value: "95.6%", change: "+1.2%", trend: "up", subtitle: "Calibrated probability" },
    { title: "Avg Inference Latency", value: "412 ms", change: "-28ms", trend: "up", subtitle: "EfficientNet-B4 + Attention" },
  ],
  tumorDistribution: [
    { name: "Glioma", count: 486, percentage: 49.5, color: "#0EA5E9" },
    { name: "Meningioma", count: 284, percentage: 28.9, color: "#8B5CF6" },
    { name: "Pituitary", count: 142, percentage: 14.5, color: "#06B6D4" },
    { name: "No Tumor", count: 70, percentage: 7.1, color: "#10B981" },
  ],
  monthlyActivity: [
    { month: "Apr", scans: 140, detected: 98, avgDice: 0.91 },
    { month: "May", scans: 185, detected: 126, avgDice: 0.92 },
    { month: "Jun", scans: 210, detected: 145, avgDice: 0.92 },
    { month: "Jul", scans: 260, detected: 178, avgDice: 0.93 },
    { month: "Aug", scans: 310, detected: 212, avgDice: 0.92 },
    { month: "Sep", scans: 323, detected: 223, avgDice: 0.94 },
  ],
};
