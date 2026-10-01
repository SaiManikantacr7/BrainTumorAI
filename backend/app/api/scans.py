import os
import shutil
import uuid
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Scan, ScanModality, Patient
from app.schemas.schemas import ScanResponse
from app.core.config import settings

router = APIRouter(prefix="/scans", tags=["Scans"])

@router.post("/upload")
async def upload_scan_files(
    patient_id: str = Form(...),
    modality: str = Form("T1"),  # T1, T2, FLAIR, T1-CE
    study_description: str = Form("Brain MRI Multimodal Protocol"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload brain MRI file (PNG, JPG, DICOM-ready).
    Stores locally in uploads directory and links to patient study.
    """
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Validate file extension
    allowed_exts = [".png", ".jpg", ".jpeg", ".dcm", ".nii", ".gz"]
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"Unsupported file format: {ext}. Expected PNG, JPG, or DICOM.")

    # Find or create patient
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        patient = Patient(
            patient_id=patient_id,
            age=48,
            sex="Female",
            primary_condition="Evaluation for Cranial Lesion",
            scan_count=1,
        )
        db.add(patient)
        db.commit()
        db.refresh(patient)
    else:
        patient.scan_count += 1
        db.commit()

    # Find or create Scan for this patient
    scan = db.query(Scan).filter(Scan.patient_id == patient.id).order_by(Scan.created_at.desc()).first()
    if not scan:
        scan = Scan(
            patient_id=patient.id,
            study_description=study_description,
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)

    # Save file
    file_id = str(uuid.uuid4())
    filename = f"{file_id}_{modality}{ext}"
    dest_path = os.path.join(settings.UPLOAD_DIR, filename)

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(dest_path)

    # Create modality entry
    scan_mod = ScanModality(
        scan_id=scan.id,
        modality=modality.upper(),
        file_path=dest_path,
        file_size=file_size,
        slice_count=24,
        preview_url=f"/uploads/{filename}",
    )
    db.add(scan_mod)
    db.commit()

    return {
        "success": True,
        "scan_id": scan.id,
        "patient_id": patient.patient_id,
        "modality": modality,
        "filename": filename,
        "file_size": file_size,
        "message": f"Successfully uploaded {modality} scan for patient {patient_id}."
    }

@router.get("", response_model=List[ScanResponse])
def list_scans(db: Session = Depends(get_db)):
    """Retrieve all available brain MRI scans."""
    scans = db.query(Scan).order_by(Scan.created_at.desc()).all()
    results = []
    for s in scans:
        results.append(
            ScanResponse(
                id=s.id,
                patient_id=s.patient.patient_id if s.patient else "Unknown",
                scan_date=s.scan_date,
                study_description=s.study_description,
                modalities=[
                    {
                        "id": m.id,
                        "modality": m.modality,
                        "file_size": m.file_size,
                        "preview_url": m.preview_url,
                    }
                    for m in s.modalities
                ],
            )
        )
    return results

@router.get("/{scan_id}")
def get_scan(scan_id: str, db: Session = Depends(get_db)):
    """Get scan details and associated multimodal slices."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return {
        "id": scan.id,
        "patient_id": scan.patient.patient_id if scan.patient else "Unknown",
        "scan_date": scan.scan_date,
        "study_description": scan.study_description,
        "modalities": [
            {
                "id": m.id,
                "modality": m.modality,
                "file_size": m.file_size,
                "preview_url": m.preview_url,
            }
            for m in scan.modalities
        ],
    }

@router.delete("/{scan_id}")
def delete_scan(scan_id: str, db: Session = Depends(get_db)):
    """Delete scan and related modalities."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    db.delete(scan)
    db.commit()
    return {"message": "Scan deleted successfully"}

