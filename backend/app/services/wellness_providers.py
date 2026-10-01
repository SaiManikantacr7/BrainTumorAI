"""Backend-only adapters for real wellness reference data providers."""
from __future__ import annotations

import time
from datetime import datetime, timezone
from typing import Any

import httpx

from app.core.config import settings

OPENAQ_ROOT = "https://api.openaq.org/v3"
FDC_ROOT = "https://api.nal.usda.gov/fdc/v1"
_cache: dict[str, tuple[float, Any]] = {}


def _get_cached(key: str):
    item = _cache.get(key)
    if not item:
        return None
    expires_at, value = item
    if expires_at <= time.monotonic():
        _cache.pop(key, None)
        return None
    return value


def _set_cached(key: str, value: Any, ttl_seconds: int):
    if len(_cache) > 256:
        now = time.monotonic()
        for old_key in list(_cache):
            if _cache[old_key][0] <= now:
                _cache.pop(old_key, None)
    _cache[key] = (time.monotonic() + ttl_seconds, value)


def _now():
    return datetime.now(timezone.utc).isoformat()


class ProviderUnavailable(Exception):
    def __init__(self, message: str, status_code: int = 503):
        self.status_code = status_code
        super().__init__(message)


def _food_nutrients(food: dict) -> dict:
    normalized = {}
    nutrients = food.get("foodNutrients") or []
    for item in nutrients:
        name = item.get("nutrientName") or (item.get("nutrient") or {}).get("name") or ""
        value = item.get("value", item.get("amount"))
        unit = item.get("unitName") or (item.get("nutrient") or {}).get("unitName")
        key = name.strip().lower()
        aliases = {
            "energy": "calories", "energy (atwater general factors)": "calories",
            "protein": "protein_g", "protein": "protein_g",
            "carbohydrate, by difference": "carbohydrates_g", "total lipid (fat)": "fat_g",
            "fiber, total dietary": "fiber_g", "sugars, total including nlea": "sugars_g",
            "sodium, na": "sodium_mg",
        }
        target = aliases.get(key)
        if target and value is not None:
            normalized[target] = {"value": value, "unit": unit}
    return normalized


async def search_foods(query: str, page_size: int = 10) -> list[dict]:
    api_key = settings.USDA_API_KEY.strip()
    if not api_key:
        raise ProviderUnavailable("Nutrition database temporarily unavailable.")
    cache_key = f"usda:search:{query.casefold()}:{page_size}"
    cached = _get_cached(cache_key)
    if cached is not None:
        return cached
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(
                f"{FDC_ROOT}/foods/search",
                params={"api_key": api_key, "query": query, "pageSize": page_size,
                        "dataType": ["Foundation", "SR Legacy", "Survey (FNDDS)"]},
            )
        if response.status_code == 429:
            raise ProviderUnavailable("Nutrition database rate limit reached. Please try again later.", 429)
        response.raise_for_status()
        data = response.json()
        foods = [{
            "fdc_id": food.get("fdcId"),
            "description": food.get("description"),
            "data_type": food.get("dataType"),
            "serving_size": food.get("servingSize"),
            "serving_size_unit": food.get("servingSizeUnit"),
            "nutrients": _food_nutrients(food),
        } for food in data.get("foods", []) if food.get("fdcId") and food.get("description")]
        _set_cached(cache_key, foods, 1800)
        return foods
    except ProviderUnavailable:
        raise
    except Exception as exc:
        raise ProviderUnavailable("Nutrition database temporarily unavailable.") from exc


async def get_food(fdc_id: int) -> dict:
    api_key = settings.USDA_API_KEY.strip()
    if not api_key:
        raise ProviderUnavailable("Nutrition database temporarily unavailable.")
    cache_key = f"usda:food:{fdc_id}"
    cached = _get_cached(cache_key)
    if cached is not None:
        return cached
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(f"{FDC_ROOT}/food/{fdc_id}", params={"api_key": api_key})
        if response.status_code == 429:
            raise ProviderUnavailable("Nutrition database rate limit reached. Please try again later.", 429)
        if response.status_code == 404:
            raise ProviderUnavailable("Food item was not found in USDA FoodData Central.", 404)
        response.raise_for_status()
        raw = response.json()
        item = {
            "fdc_id": raw.get("fdcId"), "description": raw.get("description"),
            "data_type": raw.get("dataType"), "nutrients": _food_nutrients(raw),
            "source": "USDA FoodData Central", "retrieved_at": _now(),
        }
        _set_cached(cache_key, item, 3600)
        return item
    except ProviderUnavailable:
        raise
    except Exception as exc:
        raise ProviderUnavailable("Nutrition database temporarily unavailable.") from exc


async def _openaq_get(path: str, params: dict | None = None) -> dict:
    key = settings.OPENAQ_API_KEY.strip()
    if not key:
        raise ProviderUnavailable("Current air-quality data unavailable.")
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(f"{OPENAQ_ROOT}{path}", params=params,
                                        headers={"X-API-Key": key})
        if response.status_code == 429:
            raise ProviderUnavailable("Air-quality data rate limit reached. Please try again later.", 429)
        response.raise_for_status()
        return response.json()
    except ProviderUnavailable:
        raise
    except Exception as exc:
        raise ProviderUnavailable("Current air-quality data unavailable.") from exc


async def get_air_quality(city: str = "", state: str = "", country: str = "",
                          latitude: float | None = None, longitude: float | None = None) -> dict:
    # Coordinates are deliberately rounded for station discovery and are never returned or persisted.
    geo_key = f"{latitude:.2f},{longitude:.2f}" if latitude is not None and longitude is not None else ""
    cache_key = f"openaq:{geo_key or '|'.join((city.casefold(), state.casefold(), country.casefold()))}"
    cached = _get_cached(cache_key)
    if cached is not None:
        return cached
    try:
        params = {"limit": 100, "page": 1}
        if geo_key:
            params.update({"coordinates": geo_key, "radius": 25000})
        elif country.strip():
            country_code = country.strip().upper() if len(country.strip()) == 2 else None
            if not country_code:
                country_cache = _get_cached("openaq:countries")
                if country_cache is None:
                    country_cache = (await _openaq_get("/countries", {"limit": 100, "page": 1})).get("results", [])
                    _set_cached("openaq:countries", country_cache, 86400)
                exact_country = next((item for item in country_cache if str(item.get("name", "")).casefold() == country.strip().casefold()), None)
                country_code = (exact_country or {}).get("code")
            if not country_code:
                result = {"available": False, "message": "Current air-quality data unavailable.",
                          "source": "OpenAQ API v3", "measurement_time": None, "retrieved_at": _now(), "measurements": []}
                _set_cached(cache_key, result, 900)
                return result
            params["iso"] = country_code
        locations = (await _openaq_get("/locations", params)).get("results", [])
        city_key = city.strip().casefold()
        if not geo_key:
            matches = [loc for loc in locations if city_key and city_key in " ".join(
                str(loc.get(field) or "") for field in ("name", "locality")).casefold()]
            if state:
                state_matches = [loc for loc in matches if state.casefold() in str(loc.get("locality") or "").casefold()]
                if state_matches:
                    matches = state_matches
        else:
            matches = locations
        if not matches:
            result = {"available": False, "message": "Current air-quality data unavailable.",
                      "source": "OpenAQ API v3", "measurement_time": None, "retrieved_at": _now(), "measurements": []}
            _set_cached(cache_key, result, 900)
            return result
        location = matches[0]
        latest = await _openaq_get(f"/locations/{int(location['id'])}/latest", {"limit": 100, "page": 1})
        station = await _openaq_get(f"/locations/{int(location['id'])}")
        station_result = (station.get("results") or [{}])[0]
        sensors = {s.get("id"): s.get("parameter", {}).get("displayName") or s.get("parameter", {}).get("name")
                   for s in station_result.get("sensors", [])}
        measurements = []
        for item in latest.get("results", []):
            # API v3 latest payloads expose sensor IDs; resolve parameter names from station sensors.
            sensor_id = item.get("sensorsId")
            name = item.get("name") or item.get("parameter") or sensors.get(sensor_id) or ""
            value = item.get("value")
            if value is None:
                continue
            measurements.append({"parameter": name, "value": value, "unit": item.get("unit"),
                                 "measurement_time": (item.get("datetime") or {}).get("utc")})
        result = {
            "available": bool(measurements),
            "message": None if measurements else "Current air-quality data unavailable.",
            "location_name": location.get("name") or location.get("locality") or city,
            "source": "OpenAQ API v3", "measurement_time": max((m["measurement_time"] or "" for m in measurements), default=None) or None,
            "retrieved_at": _now(), "measurements": measurements,
        }
        _set_cached(cache_key, result, 900)
        return result
    except ProviderUnavailable:
        raise
    except Exception as exc:
        raise ProviderUnavailable("Current air-quality data unavailable.") from exc


async def get_exercises() -> list[dict]:
    cache_key = "exercisedb:v1:exercises"
    cached = _get_cached(cache_key)
    if cached is not None:
        return cached
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{settings.EXERCISEDB_API_URL.rstrip('/')}/exercises",
                                        params={"limit": 100, "offset": 0})
        response.raise_for_status()
        payload = response.json()
        if isinstance(payload, dict):
            payload = payload.get("data") or payload.get("exercises") or []
        exercises = []
        for item in payload if isinstance(payload, list) else []:
            exercise_id = item.get("id") or item.get("exerciseId")
            name = item.get("name")
            if not name or not exercise_id:
                continue
            gif_url = item.get("gifUrl")
            if gif_url and not str(gif_url).startswith("https://"):
                gif_url = None
            exercises.append({
                "id": str(exercise_id), "name": name,
                "body_part": item.get("bodyPart") or item.get("bodyParts", [None])[0],
                "target": item.get("target") or (item.get("targetMuscles") or [None])[0],
                "equipment": item.get("equipment") or (item.get("equipments") or [None])[0],
                "instructions": item.get("instructions") or [], "gif_url": gif_url,
                "source": "ExerciseDB V1",
            })
        if not exercises:
            raise ValueError("No usable exercise records")
        _set_cached(cache_key, exercises, 21600)
        return exercises
    except Exception as exc:
        if isinstance(exc, ProviderUnavailable):
            raise
        raise ProviderUnavailable("Exercise library temporarily unavailable.") from exc
