from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response
from pymongo.errors import PyMongoError

from app.core.security import get_current_token_payload
from app.db import database
from app.schemas.wellness import NotificationPreferences, WellnessProfile, WorkoutComplete, WorkoutStart
from app.services.wellness_engine import generate_plan, nutrition_queries
from app.services.wellness_exports import build_docx, build_pdf, plan_text
from app.services.wellness_providers import ProviderUnavailable, get_air_quality, get_exercises, get_food, search_foods

router = APIRouter(prefix="/wellness", tags=["Personalized Wellness"])


def _user_id(payload: dict) -> str:
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid authenticated user reference.")
    return str(user_id)


def _collection(name: str):
    if not database.is_mongodb_connected() or database.mongo_db is None:
        raise HTTPException(status_code=503, detail="Wellness storage is unavailable because MongoDB is not connected.")
    return database.mongo_db[name]


def _provider_error(exc: ProviderUnavailable):
    raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc


def _profile_dict(profile: WellnessProfile) -> dict:
    data = profile.model_dump(exclude_none=True)
    if not data.get("family_history_consent"):
        data.pop("family_history", None)
        data["family_relationships"] = []
    # Geo coordinates are lookup-only and are never accepted or stored in this schema.
    data["allergies"] = list(dict.fromkeys([*data.get("allergies", []), *[
        part.strip() for part in data.get("custom_allergies", "").split(",") if part.strip()
    ]]))
    return data


@router.get("/profile")
def get_profile(user: dict = Depends(get_current_token_payload)):
    record = _collection("wellness_profiles").find_one({"user_id": _user_id(user)}, {"_id": 0, "user_id": 0})
    return {"profile": record}


@router.put("/profile")
def put_profile(profile: WellnessProfile, user: dict = Depends(get_current_token_payload)):
    if not profile.consent_personalization:
        raise HTTPException(status_code=400, detail="Consent is required before saving wellness information.")
    data = _profile_dict(profile)
    data.update({"user_id": _user_id(user), "updated_at": datetime.now(timezone.utc)})
    try:
        _collection("wellness_profiles").update_one({"user_id": data["user_id"]}, {"$set": data}, upsert=True)
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Wellness profile could not be saved.") from exc
    data.pop("user_id", None)
    return {"profile": data}


@router.delete("/profile", status_code=status.HTTP_204_NO_CONTENT)
def delete_wellness_data(user: dict = Depends(get_current_token_payload)):
    uid = _user_id(user)
    for name in ("wellness_profiles", "wellness_assessments", "exercise_plans", "workout_sessions", "environment_snapshots", "notification_preferences"):
        _collection(name).delete_many({"user_id": uid})


@router.post("/assessment", status_code=status.HTTP_201_CREATED)
def save_assessment(profile: WellnessProfile, user: dict = Depends(get_current_token_payload)):
    if not profile.consent_personalization:
        raise HTTPException(status_code=400, detail="Consent is required before saving wellness information.")
    data = _profile_dict(profile)
    item = {"assessment_id": str(uuid4()), "user_id": _user_id(user), "data": data,
            "created_at": datetime.now(timezone.utc)}
    try:
        _collection("wellness_assessments").insert_one(item)
        _collection("wellness_profiles").update_one({"user_id": item["user_id"]},
                                                       {"$set": {**data, "user_id": item["user_id"], "updated_at": item["created_at"]}}, upsert=True)
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Wellness assessment could not be saved.") from exc
    return {"assessment_id": item["assessment_id"], "saved_at": item["created_at"].isoformat()}


@router.post("/generate-plan", status_code=status.HTTP_201_CREATED)
async def create_plan(
    profile: WellnessProfile,
    latitude: float | None = Query(default=None, ge=-90, le=90),
    longitude: float | None = Query(default=None, ge=-180, le=180),
    user: dict = Depends(get_current_token_payload),
):
    if not profile.consent_personalization:
        raise HTTPException(status_code=400, detail="Consent is required before generating a personalized plan.")
    uid = _user_id(user)
    data = _profile_dict(profile)
    query_specs = nutrition_queries(data)
    try:
        exercise_result = await get_exercises()
    except ProviderUnavailable:
        exercise_result = []
    food_results: dict[str, list[dict]] = {}
    for spec in query_specs:
        try:
            food_results[spec["query"]] = await search_foods(spec["query"], page_size=5)
        except ProviderUnavailable:
            food_results[spec["query"]] = []

    air = None
    if (latitude is None) != (longitude is None):
        raise HTTPException(status_code=422, detail="Latitude and longitude must be provided together.")
    if (data.get("city") and data.get("country")) or latitude is not None:
        try:
            air = await get_air_quality(data.get("city", ""), data.get("state", ""), data.get("country", ""), latitude, longitude)
        except ProviderUnavailable:
            air = None
    plan = generate_plan(data, exercise_result, food_results, air)
    plan_id = str(uuid4())
    record = {"plan_id": plan_id, "user_id": uid, "plan": plan,
              "created_at": datetime.now(timezone.utc), "consent": True}
    try:
        _collection("exercise_plans").insert_one(record)
        _collection("wellness_assessments").insert_one({"assessment_id": str(uuid4()), "user_id": uid,
            "data": data, "created_at": record["created_at"]})
        _collection("wellness_profiles").update_one({"user_id": uid},
            {"$set": {**data, "user_id": uid, "updated_at": record["created_at"]}}, upsert=True)
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Your plan could not be saved. Please try again.") from exc
    return {"plan_id": plan_id, **plan}


@router.get("/plan")
def latest_plan(user: dict = Depends(get_current_token_payload)):
    record = _collection("exercise_plans").find_one({"user_id": _user_id(user)}, {"_id": 0}, sort=[("created_at", -1)])
    if not record:
        return {"plan": None}
    return {"plan_id": record.get("plan_id"), **record.get("plan", {})}


@router.get("/plan/{plan_id}/export/{file_format}")
def export_plan(plan_id: str, file_format: str, user: dict = Depends(get_current_token_payload)):
    if file_format not in {"pdf", "docx", "txt"}:
        raise HTTPException(status_code=422, detail="Choose pdf, docx, or txt export format.")
    record = _collection("exercise_plans").find_one(
        {"plan_id": plan_id, "user_id": _user_id(user)}, {"_id": 0, "plan": 1}
    )
    if not record or not isinstance(record.get("plan"), dict):
        raise HTTPException(status_code=404, detail="Wellness plan not found.")
    plan = record["plan"]
    try:
        if file_format == "pdf":
            content, media_type = build_pdf(plan), "application/pdf"
        elif file_format == "docx":
            content, media_type = build_docx(plan), "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        else:
            content, media_type = plan_text(plan).encode("utf-8"), "text/plain; charset=utf-8"
    except ImportError as exc:
        raise HTTPException(status_code=503, detail="Document export dependencies are not installed.") from exc
    filename = f"BrainTumorVision-Wellness-Plan-{plan_id[:8]}.{file_format}"
    return Response(content=content, media_type=media_type,
                    headers={"Content-Disposition": f'attachment; filename="{filename}"'})


@router.get("/exercises")
async def exercises(_: dict = Depends(get_current_token_payload)):
    try:
        results = await get_exercises()
        return {"available": True, "source": "ExerciseDB V1", "exercises": results}
    except ProviderUnavailable as exc:
        _provider_error(exc)


@router.get("/foods/search")
async def foods_search(q: str = Query(min_length=2, max_length=80), _: dict = Depends(get_current_token_payload)):
    try:
        results = await search_foods(q.strip(), page_size=10)
        return {"source": "USDA FoodData Central", "retrieved_at": datetime.now(timezone.utc).isoformat(), "foods": results}
    except ProviderUnavailable as exc:
        _provider_error(exc)


@router.get("/foods/{fdc_id}")
async def food_detail(fdc_id: int, _: dict = Depends(get_current_token_payload)):
    if fdc_id < 1:
        raise HTTPException(status_code=422, detail="Invalid USDA food identifier.")
    try:
        return await get_food(fdc_id)
    except ProviderUnavailable as exc:
        _provider_error(exc)


@router.get("/environment/air")
async def air_quality(
    city: str = Query(default="", max_length=100), state: str = Query(default="", max_length=100),
    country: str = Query(default="", max_length=100), latitude: float | None = Query(default=None, ge=-90, le=90),
    longitude: float | None = Query(default=None, ge=-180, le=180),
    user: dict = Depends(get_current_token_payload),
):
    if (latitude is None) != (longitude is None):
        raise HTTPException(status_code=422, detail="Latitude and longitude must be provided together.")
    if not ((city.strip() and country.strip()) or latitude is not None):
        raise HTTPException(status_code=422, detail="Provide city and country, or temporary coordinates.")
    try:
        result = await get_air_quality(city, state, country, latitude, longitude)
    except ProviderUnavailable as exc:
        _provider_error(exc)
    # Persist only city-level context and the returned public measurements, never coordinates.
    try:
        safe_location = {key: value for key, value in {"city": city, "state": state, "country": country}.items() if value}
        if database.is_mongodb_connected() and database.mongo_db is not None:
            database.mongo_db["environment_snapshots"].insert_one({"user_id": _user_id(user), "location": safe_location,
                "result": result, "created_at": datetime.now(timezone.utc)})
    except PyMongoError:
        pass  # External reference data remains usable if optional snapshot persistence is unavailable.
    return result


@router.get("/environment/water")
def water_quality(_: dict = Depends(get_current_token_payload)):
    return {"available": False, "message": "Water-quality data unavailable for this location.", "source": None, "retrieved_at": None}


@router.post("/workout/start", status_code=status.HTTP_201_CREATED)
def start_workout(request: WorkoutStart, user: dict = Depends(get_current_token_payload)):
    uid = _user_id(user)
    plan_record = _collection("exercise_plans").find_one({"plan_id": request.plan_id, "user_id": uid}, {"_id": 0})
    if not plan_record:
        raise HTTPException(status_code=404, detail="Wellness plan not found.")
    day = next((item for item in plan_record.get("plan", {}).get("weekly_schedule", []) if item.get("day") == request.day), None)
    if not day:
        raise HTTPException(status_code=404, detail="No workout is scheduled for that day.")
    now = datetime.now(timezone.utc)
    session = {"session_id": str(uuid4()), "user_id": uid, "plan_id": request.plan_id,
               "day": request.day, "started_at": now, "status": "IN_PROGRESS"}
    _collection("workout_sessions").insert_one(session)
    return {"session_id": session["session_id"], "started_at": now.isoformat(), "day": request.day}


@router.post("/workout/complete")
def complete_workout(request: WorkoutComplete, user: dict = Depends(get_current_token_payload)):
    sessions = _collection("workout_sessions")
    session = sessions.find_one({"session_id": request.session_id, "user_id": _user_id(user)})
    if not session:
        raise HTTPException(status_code=404, detail="Workout session not found.")
    if session.get("status") != "IN_PROGRESS":
        raise HTTPException(status_code=409, detail="Workout session is already completed.")
    now = datetime.now(timezone.utc)
    sessions.update_one({"session_id": request.session_id, "user_id": _user_id(user)},
                        {"$set": {"status": "COMPLETED" if request.completed else "STOPPED",
                                   "elapsed_seconds": request.elapsed_seconds, "completed_at": now}})
    return {"session_id": request.session_id, "status": "COMPLETED" if request.completed else "STOPPED", "completed_at": now.isoformat()}


@router.get("/workout/history")
def workout_history(user: dict = Depends(get_current_token_payload)):
    return {"sessions": list(_collection("workout_sessions").find({"user_id": _user_id(user)}, {"_id": 0}).sort("started_at", -1).limit(30))}


@router.get("/notifications/preferences")
def get_notification_preferences(user: dict = Depends(get_current_token_payload)):
    row = _collection("notification_preferences").find_one({"user_id": _user_id(user)}, {"_id": 0, "user_id": 0})
    return {"preferences": row or {"workout": False, "hydration": False, "movement_break": False}}


@router.put("/notifications/preferences")
def put_notification_preferences(preferences: NotificationPreferences, user: dict = Depends(get_current_token_payload)):
    uid = _user_id(user)
    data = preferences.model_dump()
    _collection("notification_preferences").update_one({"user_id": uid}, {"$set": {**data, "user_id": uid}}, upsert=True)
    return {"preferences": data}
