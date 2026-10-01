from datetime import datetime
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, EmailStr, Field

# ----------------- AUTH SCHEMAS -----------------
class OTPRequest(BaseModel):
    email: EmailStr
    purpose: str = Field("LOGIN", description="LOGIN, REGISTER, or RESET")

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit numerical OTP")
    purpose: str = "LOGIN"
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    password: Optional[str] = Field(None, min_length=6)
    role: Optional[Literal["User", "Admin"]] = None
    location: Optional[str] = Field(None, min_length=2, max_length=255)
    phone_number: Optional[str] = Field(None, min_length=5, max_length=50)
    organization: Optional[str] = Field(None, min_length=2, max_length=255)

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2, max_length=255)
    role: Literal["User", "Admin"] = "User"
    location: str = Field(..., min_length=2, max_length=255)
    phone_number: str = Field(..., min_length=5, max_length=50)
    organization: str = Field(..., min_length=2, max_length=255)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    location: Optional[str] = None
    phone_number: Optional[str] = None
    organization: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class OTPResponse(BaseModel):
    message: str
    email: str
    expires_in_seconds: int = 300
    cooldown_seconds: int = 60
    demo_otp: Optional[str] = None  # Returned in development mode when SMTP credentials are not configured

# ----------------- SCAN & MODALITY SCHEMAS -----------------
class ModalityInfo(BaseModel):
    modality: str  # T1, T2, FLAIR, T1-CE
    file_path: str
    file_size: int = 0
    slice_count: int = 1
    preview_url: Optional[str] = None

class ScanCreate(BaseModel):
    patient_id: str
    study_description: str = "Multimodal Brain MRI"
    notes: Optional[str] = None
    modalities: List[ModalityInfo] = []

class ScanResponse(BaseModel):
    id: str
    patient_id: str
    scan_date: datetime
    study_description: str
    modalities: List[Dict[str, Any]] = []
    class Config:
        from_attributes = True

# ----------------- ANALYSIS SCHEMAS -----------------
class AnalysisCreate(BaseModel):
    scan_id: str
    patient_id: str
    detect_tumor: bool = True
    classify_type: bool = True
    segment_region: bool = True
    estimate_grade: bool = True
    generate_xai: bool = True
    calculate_volume: bool = True
    compare_previous: bool = True

class PredictionResponse(BaseModel):
    tumor_detected: bool
    tumor_type: str
    confidence: float
    uncertainty_level: str
    uncertainty_score: float
    tumor_grade: str
    tumor_location: str
    probabilities: Optional[Dict[str, float]] = None
    clinical_disclaimer: str = "Research Prototype — AI-generated results require qualified clinician review."

class SegmentationResponse(BaseModel):
    tumor_volume_cm3: float
    dice_score: float
    iou_score: float
    sensitivity: float
    specificity: float
    surface_area_mm2: float
    mask_url: Optional[str] = None

class ExplanationResponse(BaseModel):
    gradcam_url: Optional[str] = None
    shap_url: Optional[str] = None
    attention_url: Optional[str] = None
    top_contributing_regions: Optional[List[str]] = None
    xai_disclaimer: str = "Highlighted regions represent areas that contributed to the model's prediction. These visualizations are model explanations and should not be interpreted as definitive clinical evidence."

class AnalysisResponse(BaseModel):
    id: str
    scan_id: str
    patient_id: str
    status: str
    progress_percent: int
    current_step: str
    model_version: str
    inference_time_ms: float
    prediction: Optional[PredictionResponse] = None
    segmentation: Optional[SegmentationResponse] = None
    explanation: Optional[ExplanationResponse] = None
    created_at: datetime
    clinical_disclaimer: str = "Research Prototype — AI-generated results require qualified clinician review."

# ----------------- PATIENT SCHEMAS -----------------
class PatientResponse(BaseModel):
    id: str
    patient_id: str
    age: Optional[int] = None
    sex: Optional[str] = None
    primary_condition: str
    scan_count: int
    created_at: datetime
    class Config:
        from_attributes = True

class TimelinePoint(BaseModel):
    date: str
    scan_id: str
    tumor_volume_cm3: float
    tumor_type: str
    model_prediction: str
    confidence: float
    model_observed_change: str
    thumbnail_url: str

# ----------------- EXPERIMENT SCHEMAS -----------------
class ExperimentCreate(BaseModel):
    name: str
    model_architecture: str = "EfficientNet-B4"
    dataset: str = "BraTS 2023"
    task: str = "Multi-task (Classification + Segmentation)"
    epochs: int = 50
    batch_size: int = 16
    learning_rate: float = 0.0001
    multimodal_fusion: bool = True
    attention_module: bool = True

class ExperimentResponse(BaseModel):
    id: str
    name: str
    model_architecture: str
    dataset: str
    task: str
    epochs: int
    batch_size: int
    learning_rate: float
    multimodal_fusion: bool
    attention_module: bool
    status: str
    accuracy: float
    dice: float
    f1: float
    inference_time_ms: float
    created_at: datetime
    class Config:
        from_attributes = True
