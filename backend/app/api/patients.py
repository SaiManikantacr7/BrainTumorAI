from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Patient
from app.schemas.schemas import PatientResponse, TimelinePoint

router = APIRouter(prefix="/patients", tags=["Patients"])

# Rich demographic sample data for research
DEMO_PATIENTS = [
    {
        "patient_id": "P-1001",
        "age": 54,
        "sex": "Female",
        "primary_condition": "Right Frontal Glioblastoma Monitoring",
        "scan_count": 4,
    },
    {
        "patient_id": "P-1002",
        "age": 42,
        "sex": "Male",
        "primary_condition": "Parasagittal Meningioma Post-Resection",
        "scan_count": 3,
    },
    {
        "patient_id": "P-1003",
        "age": 36,
        "sex": "Female",
        "primary_condition": "Pituitary Macroadenoma Surveillance",
        "scan_count": 2,
    },
    {
        "patient_id": "P-1004",
        "age": 61,
        "sex": "Male",
        "primary_condition": "Secondary Headache Workup (No Tumor Detected)",
        "scan_count": 1,
    },
]

@router.get("", response_model=List[PatientResponse])
def list_patients(db: Session = Depends(get_db)):
    """List all registered patients with scan counts."""
    # Ensure sample patients exist
    for dp in DEMO_PATIENTS:
        existing = db.query(Patient).filter(Patient.patient_id == dp["patient_id"]).first()
        if not existing:
            p = Patient(
                patient_id=dp["patient_id"],
                age=dp["age"],
                sex=dp["sex"],
                primary_condition=dp["primary_condition"],
                scan_count=dp["scan_count"],
            )
            db.add(p)
    db.commit()

    patients = db.query(Patient).order_by(Patient.created_at.desc()).all()
    return patients

@router.get("/{patient_id}")
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    """Retrieve individual patient profile."""
    patient = db.query(Patient).filter(
        (Patient.id == patient_id) | (Patient.patient_id == patient_id)
    ).first()
    if not patient:
        # Check demo data
        demo = next((p for p in DEMO_PATIENTS if p["patient_id"] == patient_id), None)
        if demo:
            return demo
        raise HTTPException(status_code=404, detail="Patient record not found")
    return patient

@router.get("/{patient_id}/timeline", response_model=List[TimelinePoint])
def get_patient_timeline(patient_id: str):
    """
    Longitudinal MRI Timeline tracking volumetric progression over time.
    Uses 'Model-observed change' rather than definitive diagnostic claims.
    """
    # Longitudinal series for P-1001 (Jan, Apr, Jul, Sep)
    return [
        TimelinePoint(
            date="Jan 15, 2026",
            scan_id="SCAN-2026-01",
            tumor_volume_cm3=18.6,
            tumor_type="Glioma",
            model_prediction="Glioma (WHO IV)",
            confidence=0.965,
            model_observed_change="Baseline scan — Hyperintense lesion with substantial peritumoral edema",
            thumbnail_url="/demo/mri_t1ce.png",
        ),
        TimelinePoint(
            date="Apr 22, 2026",
            scan_id="SCAN-2026-02",
            tumor_volume_cm3=14.2,
            tumor_type="Glioma",
            model_prediction="Glioma (WHO IV)",
            confidence=0.958,
            model_observed_change="Volumetric reduction (-23.6%) observed following initial cycle",
            thumbnail_url="/demo/mri_flair.png",
        ),
        TimelinePoint(
            date="Jul 18, 2026",
            scan_id="SCAN-2026-03",
            tumor_volume_cm3=11.4,
            tumor_type="Glioma",
            model_prediction="Glioma (WHO IV)",
            confidence=0.942,
            model_observed_change="Continued volumetric stabilization (-19.7% from prior scan)",
            thumbnail_url="/demo/mri_t2.png",
        ),
        TimelinePoint(
            date="Sep 10, 2026",
            scan_id="SCAN-2026-04",
            tumor_volume_cm3=12.1,
            tumor_type="Glioma",
            model_prediction="Glioma (WHO IV)",
            confidence=0.954,
            model_observed_change="Slight volumetric enlargement (+6.1%) at anterior margin; clinician review recommended",
            thumbnail_url="/demo/mri_t1.png",
        ),
    ]

