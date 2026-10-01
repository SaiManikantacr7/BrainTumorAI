from fastapi import APIRouter, Depends, Query

from app.core.security import get_current_token_payload

router = APIRouter(prefix="/analytics", tags=["Geographic analytics"])


def _empty_result():
    # The current schema has no authorized geographic metadata. Returning an
    # explicit empty result is safer than deriving locations from user profiles,
    # image names, or anatomical predictions.
    return {
        "locations": [],
        "summary": {
            "total_records": 0,
            "location_count": 0,
            "tumor_types": [],
            "grades": [],
            "datasets": [],
            "model_versions": [],
        },
        "metadata": {
            "data_source": "AUTHORIZED_PATIENT_METADATA",
            "available": False,
            "message": "Geographic metadata is not configured for this dataset.",
        },
    }


@router.get("/geographic")
def get_geographic_analytics(
    grade: list[str] | None = Query(default=None, max_length=4),
    tumor_type: list[str] | None = Query(default=None, max_length=10),
    country: str | None = Query(default=None, max_length=100),
    state: str | None = Query(default=None, max_length=100),
    district: str | None = Query(default=None, max_length=100),
    city: str | None = Query(default=None, max_length=100),
    dataset: str | None = Query(default=None, max_length=100),
    model_version: str | None = Query(default=None, max_length=100),
    start_date: str | None = Query(default=None, max_length=10),
    end_date: str | None = Query(default=None, max_length=10),
    _: dict = Depends(get_current_token_payload),
):
    """Privacy-safe aggregate contract; populated only after authorized geo metadata exists."""
    return _empty_result()
