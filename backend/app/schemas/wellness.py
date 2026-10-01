from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class WellnessProfile(BaseModel):
    model_config = ConfigDict(extra="forbid")

    consent_personalization: bool
    age: int = Field(ge=18, le=120)
    gender: str | None = Field(default=None, max_length=40)
    preferred_language: str = Field(default="English", max_length=40)
    diet_preference: Literal["Vegetarian", "Non-Vegetarian", "Vegan", "Eggetarian", "Other"]
    food_preference: Literal["South Indian", "Andhra", "Telangana", "North Indian", "Other"]
    allergies: list[str] = Field(default_factory=list, max_length=30)
    custom_allergies: str = Field(default="", max_length=500)
    height_cm: float = Field(gt=80, le=250)
    weight_kg: float = Field(gt=25, le=350)
    sleep_hours: float | None = Field(default=None, ge=0, le=24)
    sleep_schedule: str | None = Field(default=None, max_length=40)
    sitting_hours: float | None = Field(default=None, ge=0, le=24)
    screen_time_hours: float | None = Field(default=None, ge=0, le=24)
    water_intake_liters: float | None = Field(default=None, ge=0, le=30)
    smoking: str | None = Field(default=None, max_length=40)
    alcohol_frequency: str | None = Field(default=None, max_length=40)
    caffeine_frequency: str | None = Field(default=None, max_length=40)
    meals_per_day: int | None = Field(default=None, ge=1, le=6)
    fruit_vegetable_frequency: str | None = Field(default=None, max_length=40)
    processed_food_frequency: str | None = Field(default=None, max_length=40)
    sugary_drink_frequency: str | None = Field(default=None, max_length=40)
    activity_types: list[str] = Field(default_factory=list, max_length=20)
    exercise_sessions_per_week: int | None = Field(default=None, ge=0, le=30)
    average_session_minutes: int | None = Field(default=None, ge=0, le=300)
    family_history_consent: bool = False
    family_history: Literal["No", "Yes", "Not sure", "Prefer not to say"] | None = None
    family_relationships: list[str] = Field(default_factory=list, max_length=10)
    profession: str = Field(default="Other", max_length=80)
    sitting_hours_work: float | None = Field(default=None, ge=0, le=24)
    standing_hours: float | None = Field(default=None, ge=0, le=24)
    walking_hours: float | None = Field(default=None, ge=0, le=24)
    physical_workload: Literal["Low", "Moderate", "High"] = "Low"
    mental_workload: Literal["Low", "Moderate", "High"] = "Moderate"
    country: str = Field(default="", max_length=100)
    state: str = Field(default="", max_length=100)
    district: str = Field(default="", max_length=100)
    city: str = Field(default="", max_length=100)
    goal: Literal["Build consistency", "General strength", "Cardio endurance", "Mobility", "Maintain routine"] = "Build consistency"
    experience: Literal["Beginner", "Intermediate", "Experienced"] = "Beginner"
    equipment: list[str] = Field(default_factory=list, max_length=20)
    session_minutes: int = Field(default=30, ge=10, le=120)
    workout_days: list[str] = Field(default_factory=list, max_length=7)
    pain_or_injury: bool = False
    physical_limitations: bool = False
    water_reminder: bool = True
    movement_reminder: bool = True


class WorkoutStart(BaseModel):
    plan_id: str = Field(min_length=1, max_length=80)
    day: str = Field(min_length=1, max_length=20)


class WorkoutComplete(BaseModel):
    session_id: str = Field(min_length=1, max_length=80)
    elapsed_seconds: int = Field(ge=0, le=86400)
    completed: bool = True


class NotificationPreferences(BaseModel):
    workout: bool = False
    hydration: bool = False
    movement_break: bool = False

