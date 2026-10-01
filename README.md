# NEUROSCAN AI
### Explainable Multimodal Brain MRI Analysis Platform

> [!IMPORTANT]
> **Clinical Safety Mandate**:  
> NEUROSCAN AI is an **investigational decision-support research prototype**, NOT a certified medical diagnostic device.  
> Never present AI predictions as a confirmed medical diagnosis. Every result page prominently displays:  
> **"Research Prototype — AI-generated results require qualified clinician review."**

---

## 1. Project Overview & Vision

**NeuroScan AI** is a modern, research-grade, full-stack medical AI platform designed to evaluate multimodal brain magnetic resonance imaging (MRI) sequences:
- **T1-Weighted (T1)**: Anatomical structure & baseline contrast
- **T2-Weighted (T2)**: Fluid hyperintensity & edema infiltration
- **T2-FLAIR (FLAIR)**: Cerebrospinal fluid suppression for peritumoral vasogenic edema
- **Contrast-Enhanced T1 (T1-CE)**: Blood-brain barrier breakdown & enhancing tumor margins

The system delivers end-to-end capabilities across:
1. Multimodal MRI Ingestion & Preprocessing (N4 bias field correction, skull-stripping, isotropic resampling)
2. Intracranial Tumor Detection & Classification (Glioma, Meningioma, Pituitary, No Tumor)
3. 3D Attention U-Net Boundary Segmentation
4. Automated Quantitative Volumetry ($cm^3$)
5. Temperature-Scaled Uncertainty Calibration (Low / Moderate / High)
6. Explainable AI (Grad-CAM, SHAP, and Cross-Attention Rollout)
7. Longitudinal Surveillance Timeline (Tracking volume over time with **"Model-observed change"**)
8. External Validation & Domain Shift Analysis (Evaluating scanner & protocol variations)
9. Interactive Research Lab (Experiment dispatcher and component-wise ablation studies)
10. Downloadable & Printable Clinical Research Reports

---

## 2. Monorepo Architecture

```
neuroscan-ai/
├── frontend/                          # Next.js 14 (App Router), TypeScript, Tailwind CSS
│   ├── app/
│   │   ├── (public)/                  # Landing (/), Login, Register, About, How It Works, Research, Contact
│   │   └── (dashboard)/               # Dashboard, New Analysis, Workspace, Results, Timeline, Models, Validation, Lab, Reports, Settings
│   ├── components/
│   │   ├── mri/                       # Interactive MRIViewer (Zoom, Pan, Opacity, Layers, Modality Sync)
│   │   ├── navigation/                # Responsive Sidebar & Navbar with role badges
│   │   └── common/                    # Clinical DisclaimerBanner & StatCards
│   ├── context/                       # AuthContext (Persistent session, 6-digit OTP, Demo roles)
│   └── lib/                           # Synthetic MRI visual assets (SVG), Demo data, API client
│
├── backend/                           # FastAPI REST API
│   ├── app/
│   │   ├── api/                       # Auth OTP, Scans, Analysis, Patients, Models, Validation, Experiments, Reports
│   │   ├── core/                      # Config (Pydantic Settings), Security (bcrypt, salted SHA-256 OTP, JWT)
│   │   ├── db/                        # SQLAlchemy Models & Engine (SQLite zero-config + PostgreSQL)
│   │   └── services/                  # SMTP Email Service (Gmail TLS) & Inference Coordinator
│   ├── main.py                        # FastAPI Application Entry Point
│   └── requirements.txt
│
├── ai/                                # Modular AI & Deep Learning Pipeline
│   ├── preprocessing/                 # Skull stripping, N4 bias correction, normalization
│   ├── classification/                # EfficientNet-B4, ConvNeXt-Tiny, ViT architectures
│   ├── segmentation/                  # Attention U-Net & 3D Volumetric Calculator
│   ├── multimodal/                    # Cross-attention fusion module
│   ├── explainability/                # Grad-CAM hooks, SHAP explainer, Attention rollout
│   └── evaluation/                    # Dice, IoU, ECE calibration error
│
├── models/
│   ├── checkpoints/                   # Directory where trained .pt / .pth weights are placed
│   └── classification/                # Model architecture definitions
│
├── docker/                            # Dockerfile.frontend, Dockerfile.backend, docker-compose.yml
├── tests/                             # Automated unit test suite (OTP, Pipeline, API endpoints)
└── README.md
```

---

## 3. Quickstart & Installation

### Prerequisites
- **Node.js**: v18+ (tested on Node v22)
- **Python**: 3.10+ (tested on Python 3.12)
- **Package Managers**: `npm` and `pip` (or `py -m pip`)

---

### Step 1: Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the backend server:
   ```bash
   python main.py
   # Or using uvicorn directly:
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```
   *The backend starts at `http://localhost:8000`. Interactive Swagger API docs are at `http://localhost:8000/docs`.*

---

### Step 2: Frontend Setup (Next.js)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The web application starts at `http://localhost:3000`.*

---

## 4. Environment Variables Configuration

Copy `.env.example` to `.env` in the root or `backend/`:
```bash
cp .env.example backend/.env
```

### Key Environment Variables:
```env
# Application
ENVIRONMENT=development
DEBUG=True
APP_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Security
SECRET_KEY=your_super_secret_jwt_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database (Default: Zero-config SQLite)
DATABASE_URL=sqlite:///./neuroscan.db
# For PostgreSQL in production:
# DATABASE_URL=postgresql://neuroscan_user:password@localhost:5432/neuroscan_db

# Email OTP Authentication (Gmail SMTP with App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-gmail-app-password
SMTP_FROM_EMAIL=noreply@neuroscan.ai
SMTP_FROM_NAME="NeuroScan AI Research"
SMTP_TLS=True

# OTP Security Parameters
OTP_EXPIRE_MINUTES=5
OTP_COOLDOWN_SECONDS=60
OTP_MAX_ATTEMPTS=5

# AI Model Inference Settings
MODEL_DEVICE=cpu
DEFAULT_MODEL_VERSION=v1.3.0
```

> [!NOTE]
> **Zero-Config Development Mode**: If SMTP credentials are not configured in `.env`, the system automatically prints generated 6-digit OTP codes directly to the terminal console and returns a `demo_otp` in the JSON response, ensuring immediate local testing without requiring an email server.

---

## 5. Email OTP Verification System

1. **User requests OTP**: Clinician or researcher enters their email at `/login` or `/register`.
2. **6-Digit Secure Code**: Generated via cryptographically secure randomness (`secrets.choice`).
3. **Salted SHA-256 Hashing**: Stored in the database with a unique salt; raw OTPs are never stored in plaintext.
4. **5-Minute Expiration**: Enforced by server-side timestamp validation.
5. **60-Second Cooldown**: Protects against rapid email spamming (HTTP 429 Too Many Requests).
6. **Brute-Force Protection**: Locks the code after 5 invalid verification attempts.
7. **Constant-Time Verification**: Uses `hmac.compare_digest` to prevent timing attacks.

---

## 6. Demo Credentials & Quick Roles

For instant evaluation without filling forms:
- Click **"Researcher"** on the login page: Logs in as `dr.chen@neuroscan.ai` (Standard research analysis role)
- Click **"Reviewer"** on the login page: Logs in as `reviewer@neuroscan.ai` (Clinical validation & audit role)
- Click **"Admin"** on the login page: Logs in as `admin@neuroscan.ai` (System & model configuration role)

---

## 7. Where to Place Trained Model Weights

Place your PyTorch / MONAI model checkpoints in:
```
models/checkpoints/
├── neuroscan_effnet_attention_v1.3.0.pt
├── neuroscan_convnext_fusion_v1.2.1.pt
├── neuroscan_attention_unet_v2.0.0.pt
└── neuroscan_vit_base_v1.1.0.pt
```

---

## 8. How to Connect Real PyTorch / MONAI Inference

The system is decoupled using clean API contracts. In `backend/app/api/analysis.py`, replace the simulated inference block with your PyTorch model call:

```python
import torch
from ai.classification.model_zoo import NeuroScanClassifier
from ai.segmentation.unet import calculate_tumor_volume_cm3

# 1. Load Model
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = NeuroScanClassifier(num_classes=4)
model.load_state_dict(torch.load("models/checkpoints/neuroscan_effnet_attention_v1.3.0.pt", map_location=device))
model.eval()

# 2. Preprocess & Forward Pass
# input_tensor shape: [1, 4, 224, 224] (T1, T2, FLAIR, T1-CE)
with torch.no_grad():
    outputs = model(input_tensor.to(device))
    predicted_type = ["Glioma", "Meningioma", "Pituitary", "No Tumor"][outputs["type_probs"].argmax()]
    confidence = float(outputs["type_probs"].max())
    uncertainty = float(outputs["uncertainty_entropy"])
```

The frontend will automatically render the live predictions, segmentation masks, Grad-CAM heatmaps, and volume metrics without any frontend code changes!

---

## 9. Docker Deployment

Launch the complete stack (Next.js, FastAPI, PostgreSQL, and MinIO) with one command:
```bash
cd docker
docker-compose up --build -d
```
- Web Application: `http://localhost:3000`
- REST API: `http://localhost:8000`
- MinIO Storage Console: `http://localhost:9001`

---

## 10. Running Automated Tests

Run the backend and AI unit test suite:
```bash
python -m unittest discover -s tests -p "test_*.py"
```

All 11 unit tests verify:
- 6-digit OTP generation, SHA-256 hashed storage, and constant-time verification
- Accurate quantitative volume calculation ($cm^3$) from 3D voxel masks
- Dice similarity coefficient and IoU Jaccard index
- SHAP attribution feature ranking
- FastAPI health check and REST endpoints

---

## 11. Clinical Safety & Legal Governance

- **Non-Diagnostic Notice**: NEUROSCAN AI is strictly an investigational and educational decision-support prototype. It has not been evaluated by the FDA or CE-notified bodies as an independent diagnostic medical device.
- **Terminology Standard**: Volumetric alterations across sequential studies are designated as **"Model-Observed Change"** to avoid pre-empting board-certified radiologic diagnosis.
- **Human-in-the-Loop**: All AI predictions, segmentation boundaries, and XAI heatmaps require review by a qualified neuroradiologist.

## 12. Personalized Wellness module

The authenticated `/wellness` page collects a consented wellness profile, saves it to MongoDB, and generates a deterministic general-wellness plan. It is not a diagnostic or treatment tool. Users can review, update, or delete their stored profile and related wellness records.

### Provider configuration

Set these values in `backend/.env` (keep the file private and never add API keys to frontend variables):

```dotenv
MONGODB_URI=your-mongodb-connection-string
USDA_API_KEY=your-usda-fooddata-central-key
OPENAQ_API_KEY=your-openaq-v3-key
EXERCISEDB_API_URL=https://exercisedb-api.vercel.app/api/v1
```

Restart the FastAPI service after changing environment values. USDA FoodData Central supplies food records; OpenAQ v3 supplies measured air data where a station is available; ExerciseDB V1 supplies exercise records. A provider outage or missing station is shown as unavailable. Water-quality data is currently unavailable. Environmental readings are contextual measurements and are not converted into a health-risk score or AQI estimate.

Meal cards follow the selected 1–6 meals-per-day preference. Their illustrative photos load directly from Unsplash at runtime; the images are not bundled or copied into project storage. Photo subjects do not verify the corresponding USDA food record.

### API and storage

All routes require the existing authenticated bearer token. The API is mounted at `/api/wellness`:

| Route | Purpose |
| --- | --- |
| `GET`, `PUT`, `DELETE /profile` | Read, save, or delete the user's profile and associated wellness data |
| `POST /assessment` | Save a consented profile assessment |
| `POST /generate-plan`, `GET /plan` | Generate and retrieve the latest plan |
| `GET /plan/{plan_id}/export/{format}` | Download a branded plan as PDF, Word DOCX, or plain text (`format` is `pdf`, `docx`, or `txt`) |
| `GET /exercises`, `GET /foods/search`, `GET /foods/{fdc_id}` | Read provider-backed exercise and USDA food records |
| `GET /environment/air`, `GET /environment/water` | Read air observations or report water data unavailable |
| `POST /workout/start`, `POST /workout/complete`, `GET /workout/history` | Track workout sessions |
| `GET`, `PUT /notifications/preferences` | Read and save reminder preferences |

MongoDB collections used: `wellness_profiles`, `wellness_assessments`, `exercise_plans`, `workout_sessions`, `environment_snapshots`, and `notification_preferences`. Location coordinates are used only for the air lookup and are not persisted. Family-history information is persisted only after its separate consent is checked.

