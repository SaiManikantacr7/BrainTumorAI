import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    Text,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship
from app.db.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="User")  # User or Admin
    location = Column(String(255), nullable=True)
    phone_number = Column(String(50), nullable=True)
    organization = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_login = Column(DateTime, nullable=True)

    analyses = relationship("Analysis", back_populates="user", cascade="all, delete-orphan")
    experiments = relationship("Experiment", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")

class OTPToken(Base):
    __tablename__ = "otp_tokens"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), index=True, nullable=False)
    hashed_otp = Column(String(255), nullable=False)
    salt = Column(String(64), nullable=False)
    purpose = Column(String(50), default="LOGIN")  # REGISTER, LOGIN, PASSWORD_RESET
    attempts = Column(Integer, default=0)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=False)

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(50), unique=True, index=True, nullable=False)  # P-1001, P-1002...
    age = Column(Integer, nullable=True)
    sex = Column(String(20), nullable=True)  # Female, Male, Other
    primary_condition = Column(String(100), default="Under Investigation")
    scan_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    scans = relationship("Scan", back_populates="patient", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="patient")

class Scan(Base):
    __tablename__ = "scans"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    scan_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    scanner_model = Column(String(100), default="Siemens Magnetom 3T")
    study_description = Column(String(255), default="Brain MRI Multimodal Protocol")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    patient = relationship("Patient", back_populates="scans")
    modalities = relationship("ScanModality", back_populates="scan", cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="scan", cascade="all, delete-orphan")

class ScanModality(Base):
    __tablename__ = "scan_modalities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scan_id = Column(String(36), ForeignKey("scans.id"), nullable=False)
    modality = Column(String(20), nullable=False)  # T1, T2, FLAIR, T1-CE
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, default=0)
    slice_count = Column(Integer, default=1)
    preview_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    scan = relationship("Scan", back_populates="modalities")

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scan_id = Column(String(36), ForeignKey("scans.id"), nullable=False)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    status = Column(String(50), default="COMPLETED")  # PENDING, PROCESSING, COMPLETED, FAILED
    progress_percent = Column(Integer, default=100)
    current_step = Column(String(100), default="Ready")
    model_version = Column(String(50), default="v1.3.0")
    inference_time_ms = Column(Float, default=420.5)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    scan = relationship("Scan", back_populates="analyses")
    user = relationship("User", back_populates="analyses")
    prediction = relationship("Prediction", back_populates="analysis", uselist=False, cascade="all, delete-orphan")
    segmentation = relationship("Segmentation", back_populates="analysis", uselist=False, cascade="all, delete-orphan")
    explanation = relationship("Explanation", back_populates="analysis", uselist=False, cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="analysis")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    analysis_id = Column(String(36), ForeignKey("analyses.id"), nullable=False)
    tumor_detected = Column(Boolean, default=True)
    tumor_type = Column(String(50), nullable=False)  # Glioma, Meningioma, Pituitary, No Tumor
    confidence = Column(Float, nullable=False)  # e.g. 0.96 (96%)
    uncertainty_level = Column(String(20), default="Low")  # Low, Moderate, High
    uncertainty_score = Column(Float, default=0.08)  # Calibration entropy / variance
    tumor_grade = Column(String(50), default="High-Grade (WHO III-IV)")
    tumor_location = Column(String(100), default="Right Frontal-Temporal Lobe")
    probabilities = Column(JSON, nullable=True)  # {"Glioma": 0.94, "Meningioma": 0.03, ...}
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    analysis = relationship("Analysis", back_populates="prediction")

class Segmentation(Base):
    __tablename__ = "segmentations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    analysis_id = Column(String(36), ForeignKey("analyses.id"), nullable=False)
    mask_path = Column(String(500), nullable=True)
    tumor_volume_cm3 = Column(Float, default=14.2)
    dice_score = Column(Float, default=0.91)
    iou_score = Column(Float, default=0.84)
    sensitivity = Column(Float, default=0.92)
    specificity = Column(Float, default=0.98)
    surface_area_mm2 = Column(Float, default=2450.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    analysis = relationship("Analysis", back_populates="segmentation")

class Explanation(Base):
    __tablename__ = "explanations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    analysis_id = Column(String(36), ForeignKey("analyses.id"), nullable=False)
    gradcam_path = Column(String(500), nullable=True)
    shap_path = Column(String(500), nullable=True)
    attention_path = Column(String(500), nullable=True)
    feature_contributions = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    analysis = relationship("Analysis", back_populates="explanation")

class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    version = Column(String(50), nullable=False)
    architecture = Column(String(100), nullable=False)  # EfficientNet-B4, ConvNeXt-T, ViT-Base, ResNet-50
    dataset_trained_on = Column(String(100), default="BraTS 2023 + NeuroScan MultiCenter")
    accuracy = Column(Float, default=0.952)
    dice = Column(Float, default=0.912)
    f1 = Column(Float, default=0.948)
    inference_time_ms = Column(Float, default=380.0)
    parameter_count_m = Column(Float, default=19.3)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    scanner_type = Column(String(100), default="GE / Siemens / Philips")
    sample_count = Column(Integer, default=1250)
    external_validation_accuracy = Column(Float, default=0.938)
    external_dice = Column(Float, default=0.884)
    domain_shift_impact = Column(String(50), default="Low-Moderate")
    notes = Column(Text, nullable=True)

class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    name = Column(String(100), nullable=False)
    model_architecture = Column(String(100), default="EfficientNet-B4")
    dataset = Column(String(100), default="BraTS 2023")
    task = Column(String(50), default="Multi-task (Classification + Segmentation)")
    epochs = Column(Integer, default=50)
    batch_size = Column(Integer, default=16)
    learning_rate = Column(Float, default=0.0001)
    multimodal_fusion = Column(Boolean, default=True)
    attention_module = Column(Boolean, default=True)
    status = Column(String(50), default="COMPLETED")
    accuracy = Column(Float, default=0.954)
    dice = Column(Float, default=0.918)
    f1 = Column(Float, default=0.949)
    inference_time_ms = Column(Float, default=395.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="experiments")

class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    analysis_id = Column(String(36), ForeignKey("analyses.id"), nullable=False)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    title = Column(String(200), default="Brain MRI AI Research Findings Report")
    summary = Column(Text, nullable=True)
    findings = Column(JSON, nullable=True)
    clinician_notes = Column(Text, nullable=True)
    status = Column(String(50), default="FINAL")
    pdf_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    patient = relationship("Patient", back_populates="reports")
    analysis = relationship("Analysis", back_populates="reports")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="audit_logs")

class AdminAccessRequest(Base):
    __tablename__ = "admin_access_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    location = Column(String(255), nullable=True)
    phone_number = Column(String(50), nullable=True)
    organization = Column(String(255), nullable=True)
    status = Column(String(30), default="PENDING", nullable=False)  # PENDING, APPROVED, REJECTED
    reviewed_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    review_note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    reviewed_at = Column(DateTime, nullable=True)
