"""Deterministic lifestyle personalization; this is not clinical decision support."""
from __future__ import annotations

from datetime import datetime, timezone


WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
SAFETY_NOTE = (
    "Consider professional medical/fitness guidance before starting or modifying exercise "
    "when pain, injury or medical conditions are present."
)


def activity_profile(data: dict) -> str:
    sitting = data.get("sitting_hours_work") if data.get("sitting_hours_work") is not None else data.get("sitting_hours")
    walking = data.get("walking_hours")
    workload = data.get("physical_workload")
    if workload == "High" or (walking is not None and walking >= 2.0):
        return "Physically Active Occupation"
    if (sitting is not None and sitting >= 7.0) and (walking is None or walking < 1.0) and workload != "High":
        return "Predominantly Sedentary"
    return "Mixed Activity"


def indicators(data: dict, air: dict | None = None) -> list[dict]:
    workouts = data.get("workout_days", [])
    sleep = data.get("sleep_hours")
    fruit_veg = data.get("fruit_vegetable_frequency")
    sitting = data.get("sitting_hours")
    return [
        {"name": "Activity Consistency", "status": "Not Enough Data" if workouts is None else "Good" if len(workouts) >= 3 else "Needs Attention", "rule": "Good when 3 or more self-selected activity days are set per week."},
        {"name": "Sleep Routine", "status": "Not Enough Data" if sleep is None else "Good" if sleep >= 7 else "Needs Attention", "rule": "Good when self-reported sleep duration is at least 7 hours; this is a general wellness indicator, not an individual clinical target."},
        {"name": "Diet Diversity", "status": "Not Enough Data" if fruit_veg is None else "Good" if fruit_veg in ("daily", "multiple_daily") else "Needs Attention", "rule": "Good when fruit/vegetable frequency is reported as daily or multiple times daily."},
        {"name": "Movement Level", "status": "Not Enough Data" if sitting is None else "Needs Attention" if sitting >= 8 else "Good", "rule": "Needs Attention when self-reported sitting time is 8 or more hours per day."},
        {"name": "Environmental Awareness", "status": "Good" if (air or {}).get("available") else "Not Enough Data", "rule": "Good when current location-specific air measurements are available."},
    ]


def nutrition_queries(data: dict) -> list[dict]:
    preference = data.get("diet_preference", "Other")
    cuisine = data.get("food_preference", "Other")
    vegetarian = preference in {"Vegetarian", "Vegan", "Eggetarian"}
    vegan = preference == "Vegan"
    regional = "idli" if cuisine in {"South Indian", "Andhra", "Telangana"} else "oats"
    lunch = "lentils cooked" if vegetarian else "chicken cooked"
    evening = "apple raw" if vegan else "yogurt plain"
    dinner = "beans cooked" if vegetarian else "fish cooked"
    catalog = {
        "Breakfast": regional if not vegan else "oats",
        "Mid-morning": "banana raw",
        "Lunch": lunch,
        "Afternoon snack": "apple raw",
        "Dinner": dinner,
        "Evening snack": evening,
    }
    count = max(1, min(int(data.get("meals_per_day") or 3), 6))
    slots = {
        1: ["Breakfast"],
        2: ["Breakfast", "Dinner"],
        3: ["Breakfast", "Lunch", "Dinner"],
        4: ["Breakfast", "Lunch", "Afternoon snack", "Dinner"],
        5: ["Breakfast", "Mid-morning", "Lunch", "Evening snack", "Dinner"],
        6: list(catalog),
    }[count]
    return [{"meal": meal, "query": catalog[meal]} for meal in slots]


def _allergy_matches(description: str, allergies: list[str]) -> bool:
    text = description.casefold()
    aliases = {
        "peanuts": ("peanut", "groundnut"), "tree nuts": ("almond", "cashew", "walnut", "pecan", "pistachio", "hazelnut"),
        "milk": ("milk", "whey", "casein", "yogurt", "cheese"), "dairy": ("milk", "whey", "casein", "yogurt", "cheese"),
        "egg": ("egg",), "eggs": ("egg",), "soy": ("soy", "soya", "tofu"),
        "wheat": ("wheat", "seitan"), "gluten": ("wheat", "barley", "rye", "gluten"),
        "fish": ("fish", "salmon", "tuna", "cod"), "shellfish": ("shrimp", "prawn", "crab", "lobster", "shellfish"),
        "sesame": ("sesame",),
    }
    for allergy in allergies:
        key = allergy.strip().casefold()
        if key and any(term in text for term in aliases.get(key, (key,))):
            return True
    return False


def diet_plan(data: dict, foods: dict[str, list[dict]]) -> list[dict]:
    results = []
    for item in nutrition_queries(data):
        candidates = foods.get(item["query"], [])
        # Conservative description screening; packaged-food ingredients and cross-contact are not represented here.
        eligible = [f for f in candidates if not _allergy_matches(f.get("description", ""), data.get("allergies", []))]
        if not eligible:
            results.append({"meal": item["meal"], "available": False, "message": "No compatible USDA food record is available for this meal."})
            continue
        food = eligible[0]
        results.append({
            "meal": item["meal"], "available": True,
            "food": food["description"],
            "portion_guidance": "One database serving as listed by USDA; informational only, not a prescribed portion.",
            "nutrition": food.get("nutrients", {}),
            "reason": f"Selected from USDA FoodData Central to fit the stated {data.get('diet_preference', 'general')} preference.",
            "fdc_id": food.get("fdc_id"), "source": "USDA FoodData Central",
        })
    return results


def _equipment_matches(exercise: dict, available: set[str]) -> bool:
    equipment = str(exercise.get("equipment") or "").casefold().strip()
    if not available or "no equipment" in available or "bodyweight only" in available:
        return equipment in {"", "body weight", "bodyweight", "none"}
    return equipment in available or equipment in {"body weight", "bodyweight", "none", ""}


def _is_high_intensity_name(name: str) -> bool:
    terms = ("burpee", "muscle-up", "snatch", "clean and jerk", "sprint", "box jump", "depth jump")
    return any(term in name.casefold() for term in terms)


def exercise_schedule(data: dict, exercises: list[dict]) -> dict:
    days = data.get("workout_days") or []
    days = [day for day in WEEKDAYS if day in days][:5]
    limitations = data.get("pain_or_injury") or data.get("physical_limitations")
    if limitations:
        return {"days": [], "safety_limited": True, "message": SAFETY_NOTE}
    if not exercises:
        return {"days": [], "available": False, "message": "Exercise library temporarily unavailable."}

    available_equipment = {str(x).casefold().strip() for x in data.get("equipment", [])}
    candidates = [item for item in exercises if _equipment_matches(item, available_equipment)]
    experience = data.get("experience", "Beginner")
    goal = data.get("goal", "Build consistency")
    if experience == "Beginner":
        candidates = [item for item in candidates if not _is_high_intensity_name(item.get("name", ""))]
    def goal_rank(item: dict) -> tuple:
        words = " ".join(str(item.get(key) or "") for key in ("name", "body_part", "target")).casefold()
        if goal == "Cardio endurance":
            return (0 if any(word in words for word in ("cardio", "walk", "cycle", "jog", "run", "stepper")) else 1,)
        if goal == "Mobility":
            return (0 if any(word in words for word in ("stretch", "mobility", "yoga", "flexibility")) else 1,)
        if goal == "General strength":
            return (0 if any(word in words for word in ("strength", "push", "squat", "row", "press", "pull")) else 1,)
        if goal in {"Build consistency", "Maintain routine"}:
            return (0 if not _is_high_intensity_name(words) else 1,)
        return (0,)
    candidates.sort(key=lambda item: (*goal_rank(item), str(item.get("body_part") or ""), item["name"].casefold(), item["id"]))
    if not candidates:
        return {"days": [], "available": False, "message": "No exercises from the connected library match the selected equipment and experience."}

    duration = max(15, min(int(data.get("session_minutes") or 30), 90))
    sets = 2 if experience == "Beginner" else 3
    target_reps = 8 if experience == "Beginner" else 10
    per_session = max(2, min(5, duration // 8))
    if experience == "Beginner" and activity_profile(data) == "Predominantly Sedentary":
        per_session = min(per_session, 3)
    days_out = []
    for day_index, day in enumerate(days):
        # Vary the deterministic rotation between selected days while avoiding random or invented exercise records.
        start = (day_index * per_session) % len(candidates)
        chosen = []
        used_targets = set()
        ordered = candidates[start:] + candidates[:start]
        for item in ordered:
            target = (item.get("body_part") or item.get("target") or "").casefold()
            if target in used_targets and len(used_targets) < min(3, per_session):
                continue
            chosen.append(item)
            used_targets.add(target)
            if len(chosen) >= per_session:
                break
        moves = [{
            "id": ex["id"], "name": ex["name"], "body_part": ex.get("body_part"),
            "target": ex.get("target"), "equipment": ex.get("equipment"),
            "instructions": ex.get("instructions", []), "gif_url": ex.get("gif_url"),
            "sets": sets, "reps": target_reps, "rest_seconds": 60,
            "source": ex.get("source", "ExerciseDB V1"),
        } for ex in chosen]
        days_out.append({"day": day, "warmup_minutes": 5, "exercises": moves, "cooldown_minutes": 5})
    return {"days": days_out, "available": bool(days_out), "experience_level": experience,
            "session_minutes": duration, "sets_per_exercise": sets,
            "note": "Exercise selection uses available ExerciseDB records and the equipment, experience, and days selected. Adjust or stop if uncomfortable."}


def generate_plan(data: dict, exercises: list[dict], foods: dict[str, list[dict]], air: dict | None = None) -> dict:
    height_m = float(data["height_cm"]) / 100 if data.get("height_cm") else None
    bmi = round(float(data["weight_kg"]) / (height_m * height_m), 1) if height_m and data.get("weight_kg") else None
    if bmi is None:
        bmi_category = None
    elif bmi < 18.5:
        bmi_category = "Below reference range"
    elif bmi < 25:
        bmi_category = "Within reference range"
    elif bmi < 30:
        bmi_category = "Above reference range"
    else:
        bmi_category = "Higher reference range"

    activity = activity_profile(data)
    safety = []
    if data.get("pain_or_injury") or data.get("physical_limitations"):
        safety.append(SAFETY_NOTE)
    if data.get("family_history_consent") and data.get("family_history") == "Yes":
        safety.append("Family history information may be relevant to discussions with a qualified healthcare professional.")
    allergy_list = data.get("allergies", [])
    if allergy_list:
        safety.append("Food suggestions are screened against food names and the declared allergens; USDA search data cannot verify product ingredients or cross-contact. Check packaging and consult a qualified professional if needed.")
    if data.get("workout_days"):
        safety.append("Build activity gradually and choose a pace that feels comfortable; this plan does not determine medical fitness.")

    environmental = {"available": False, "message": "Current air-quality data unavailable.", "source": "OpenAQ API v3"}
    if air and air.get("available"):
        environmental = {k: air.get(k) for k in ("available", "message", "location_name", "source", "measurement_time", "retrieved_at", "measurements")}
        environmental["activity_guidance"] = "Use these reported pollutant measurements as context alongside local public-health guidance. No AQI or automatic safety category is calculated."
    else:
        environmental["activity_guidance"] = "Environmental measurements are unavailable; no location-based activity adjustment is made."

    generated_exercises = exercise_schedule(data, exercises)
    meal_guidance = diet_plan(data, foods)
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "profile_summary": {"age": data.get("age"), "diet_preference": data.get("diet_preference"),
                            "food_preference": data.get("food_preference"), "bmi": bmi,
                            "meals_per_day": len(meal_guidance),
                            "bmi_category": bmi_category,
                            "bmi_note": "BMI is a screening/body-size measure and is not a diagnosis."},
        "activity_profile": activity,
        "wellness_indicators": indicators(data, air),
        "diet_guidance": meal_guidance,
        "exercise_plan": generated_exercises,
        "weekly_schedule": generated_exercises.get("days", []),
        "environment_guidance": environmental,
        "water_quality": {"available": False, "message": "Water-quality data unavailable for this location.", "source": None, "retrieved_at": None},
        "safety_notes": safety,
        "personalization_rules": [
            "Activity profile: high workload or at least 2 reported walking hours means physically active occupation; at least 7 sitting hours and under 1 walking hour means predominantly sedentary; otherwise mixed activity.",
            "Workout days, experience level, available equipment, and session duration control the schedule. Exercise names and instructions come only from the connected exercise library.",
            "Food suggestions come only from USDA FoodData Central results, filtered by the stated diet preference and allergen-name screening.",
            "Wellness indicator thresholds are self-report rules; they are not medical scores or risk estimates.",
        ],
    }
