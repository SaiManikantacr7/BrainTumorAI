"""In-memory branded export builders for saved wellness plans."""
from __future__ import annotations

from io import BytesIO
from xml.sax.saxutils import escape

from PIL import Image, ImageDraw


def _logo_png() -> BytesIO:
    image = Image.new("RGBA", (192, 192), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((4, 4, 188, 188), radius=38, fill="#0b1728", outline="#38bdf8", width=5)
    # A compact brain above a human skull silhouette, drawn as a scalable in-memory mark.
    draw.ellipse((43, 25, 149, 132), fill="#eaf8ff", outline="#ffffff", width=4)
    draw.ellipse((50, 31, 96, 78), fill="#38bdf8", outline="#0ea5e9", width=3)
    draw.ellipse((91, 31, 137, 78), fill="#60a5fa", outline="#38bdf8", width=3)
    draw.ellipse((67, 48, 122, 96), fill="#22d3ee", outline="#0ea5e9", width=3)
    draw.line((95, 33, 95, 91), fill="#eaf8ff", width=4)
    draw.arc((50, 69, 141, 149), start=0, end=180, fill="#eaf8ff", width=10)
    draw.ellipse((57, 88, 81, 108), fill="#0b1728")
    draw.ellipse((109, 88, 133, 108), fill="#0b1728")
    draw.line((95, 103, 88, 119, 101, 119), fill="#38bdf8", width=5)
    draw.rounded_rectangle((66, 126, 124, 143), radius=7, outline="#0b1728", width=4)
    for x in (78, 94, 110):
        draw.line((x, 127, x, 142), fill="#0b1728", width=2)
    out = BytesIO()
    image.save(out, format="PNG", optimize=True)
    out.seek(0)
    return out


def _clean(value) -> str:
    if value is None or value == "":
        return "Not available"
    if isinstance(value, (dict, list)):
        return ", ".join(_clean(item) for item in value) if isinstance(value, list) else "; ".join(f"{k}: {_clean(v)}" for k, v in value.items())
    return str(value)


def _meal_lines(plan: dict) -> list[str]:
    lines = []
    for meal in plan.get("diet_guidance", []):
        lines.append(f"{meal.get('meal', 'Meal')}: {meal.get('food') or meal.get('message') or 'Nutrition data unavailable'}")
        if meal.get("available"):
            lines.append(f"  Serving note: {meal.get('portion_guidance', '')}")
            for name, nutrient in (meal.get("nutrition") or {}).items():
                lines.append(f"  {name.replace('_', ' ').title()}: {nutrient.get('value')} {nutrient.get('unit') or ''}")
    return lines


def _exercise_lines(plan: dict) -> list[str]:
    lines = []
    for day in plan.get("weekly_schedule", []):
        lines.append(f"{day.get('day', 'Day')} — {day.get('warmup_minutes', 0)} min warm-up")
        for exercise in day.get("exercises", []):
            lines.append(f"  {exercise.get('name', 'Exercise')} · {exercise.get('sets', 0)} sets × {exercise.get('reps', 0)} reps · {exercise.get('equipment') or 'body weight'}")
        lines.append(f"  {day.get('cooldown_minutes', 0)} min cool-down")
    if not lines:
        lines.append(plan.get("exercise_plan", {}).get("message", "No exercise schedule available."))
    return lines


def plan_text(plan: dict) -> str:
    profile = plan.get("profile_summary") or {}
    lines = [
        "BrainTumorVision AI",
        "PERSONALIZED WELLNESS PLAN",
        f"Generated: {_clean(plan.get('generated_at'))}",
        "",
        "PROFILE SUMMARY",
        f"Age: {_clean(profile.get('age'))} | Diet: {_clean(profile.get('diet_preference'))} | BMI: {_clean(profile.get('bmi'))}",
        _clean(profile.get("bmi_note")),
        f"Meals per day: {_clean(profile.get('meals_per_day'))}",
        f"Activity profile: {_clean(plan.get('activity_profile'))}",
        "",
        "DIET GUIDANCE (USDA FoodData Central)",
        *_meal_lines(plan),
        "",
        "WEEKLY ACTIVITY PLAN",
        *_exercise_lines(plan),
        "",
        "ENVIRONMENTAL INFORMATION",
        _clean((plan.get("environment_guidance") or {}).get("message") or "Measurements unavailable."),
    ]
    for measurement in (plan.get("environment_guidance") or {}).get("measurements", []):
        lines.append(f"{measurement.get('parameter', 'Measurement')}: {measurement.get('value')} {measurement.get('unit') or ''} · {measurement.get('measurement_time') or ''}")
    lines.extend(["", "WELLNESS INDICATORS"])
    for item in plan.get("wellness_indicators", []):
        lines.append(f"{item.get('name')}: {item.get('status')} — {item.get('rule')}")
    lines.extend(["", "SAFETY NOTES"])
    lines.extend(f"• {note}" for note in plan.get("safety_notes", []))
    lines.extend([
        "",
        "GENERAL EDUCATIONAL GUIDANCE ONLY. This plan is not a medical diagnosis or treatment recommendation. Consult qualified health professionals for individual medical, nutrition, or fitness advice.",
        "Food photos shown in the web app are illustrative internet-hosted images and do not verify the USDA food record.",
    ])
    return "\n".join(lines)


def build_docx(plan: dict) -> bytes:
    from docx import Document
    from docx.shared import Inches, Pt, RGBColor

    document = Document()
    header = document.add_table(rows=1, cols=2)
    header.columns[0].width = Inches(0.8)
    header.columns[1].width = Inches(5.8)
    header.cell(0, 0).paragraphs[0].add_run().add_picture(_logo_png(), width=Inches(0.72))
    brand = header.cell(0, 1).paragraphs[0]
    run = brand.add_run("BrainTumorVision AI\n")
    run.bold = True
    run.font.size = Pt(19)
    run.font.color.rgb = RGBColor(14, 116, 183)
    subtitle = brand.add_run("PERSONALIZED WELLNESS PLAN")
    subtitle.bold = True
    subtitle.font.size = Pt(10)
    subtitle.font.color.rgb = RGBColor(71, 85, 105)

    profile = plan.get("profile_summary") or {}
    document.add_paragraph(f"Generated {_clean(plan.get('generated_at'))}")
    document.add_heading("Plan overview", level=1)
    document.add_paragraph(f"Activity profile: {_clean(plan.get('activity_profile'))}")
    document.add_paragraph(f"Age: {_clean(profile.get('age'))}  |  Diet: {_clean(profile.get('diet_preference'))}  |  BMI: {_clean(profile.get('bmi'))}")
    document.add_paragraph(_clean(profile.get("bmi_note")))
    document.add_paragraph(f"Meals per day: {_clean(profile.get('meals_per_day'))}")

    document.add_heading("Diet guidance · USDA FoodData Central", level=1)
    for meal in plan.get("diet_guidance", []):
        document.add_heading(f"{meal.get('meal', 'Meal')} · {meal.get('food') or 'Nutrition data unavailable'}", level=2)
        if meal.get("available"):
            document.add_paragraph(_clean(meal.get("portion_guidance")))
            for name, nutrient in (meal.get("nutrition") or {}).items():
                document.add_paragraph(f"{name.replace('_', ' ').title()}: {nutrient.get('value')} {nutrient.get('unit') or ''}", style="List Bullet")
        else:
            document.add_paragraph(_clean(meal.get("message")))

    document.add_heading("Weekly activity plan", level=1)
    for line in _exercise_lines(plan):
        document.add_paragraph(line.strip(), style="List Bullet" if line.startswith("  ") else "Normal")

    document.add_heading("Environmental information", level=1)
    environment = plan.get("environment_guidance") or {}
    document.add_paragraph(_clean(environment.get("activity_guidance") or environment.get("message")))
    for measurement in environment.get("measurements", []):
        document.add_paragraph(f"{measurement.get('parameter')}: {measurement.get('value')} {measurement.get('unit') or ''} · {measurement.get('measurement_time') or ''}", style="List Bullet")

    document.add_heading("Wellness indicators", level=1)
    for item in plan.get("wellness_indicators", []):
        document.add_paragraph(f"{item.get('name')}: {item.get('status')} — {item.get('rule')}", style="List Bullet")
    document.add_heading("Safety notes", level=1)
    for note in plan.get("safety_notes", []):
        document.add_paragraph(note, style="List Bullet")
    disclaimer = document.add_paragraph()
    disclaimer.paragraph_format.space_before = Pt(14)
    disclaimer_run = disclaimer.add_run("GENERAL EDUCATIONAL GUIDANCE ONLY. This plan is not a medical diagnosis or treatment recommendation. Consult qualified health professionals for individual medical, nutrition, or fitness advice.")
    disclaimer_run.bold = True
    disclaimer_run.font.color.rgb = RGBColor(71, 85, 105)
    output = BytesIO()
    document.save(output)
    return output.getvalue()


def build_pdf(plan: dict) -> bytes:
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_LEFT
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import inch
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.platypus import Image as PdfImage, Paragraph, SimpleDocTemplate, Spacer
    import reportlab
    from pathlib import Path

    font_path = Path(reportlab.__file__).parent / "fonts" / "Vera.ttf"
    if "WellnessSans" not in pdfmetrics.getRegisteredFontNames():
        pdfmetrics.registerFont(TTFont("WellnessSans", str(font_path)))

    output = BytesIO()
    doc = SimpleDocTemplate(output, pagesize=A4, rightMargin=0.62 * inch, leftMargin=0.62 * inch,
                            topMargin=0.55 * inch, bottomMargin=0.6 * inch, title="BrainTumorVision AI Wellness Plan")
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="Brand", parent=styles["Title"], fontName="WellnessSans", textColor=colors.HexColor("#0e7490"), alignment=TA_LEFT, fontSize=19, leading=23, spaceAfter=2))
    styles.add(ParagraphStyle(name="Section", parent=styles["Heading2"], fontName="WellnessSans", textColor=colors.HexColor("#0e7490"), fontSize=12, leading=15, spaceBefore=12, spaceAfter=5))
    styles.add(ParagraphStyle(name="SmallText", parent=styles["BodyText"], fontName="WellnessSans", fontSize=8.5, leading=12, textColor=colors.HexColor("#334155")))
    styles.add(ParagraphStyle(name="Meal", parent=styles["Heading3"], fontName="WellnessSans", textColor=colors.HexColor("#1e293b"), fontSize=10, leading=13, spaceBefore=6, spaceAfter=2))
    story = [PdfImage(_logo_png(), width=0.72 * inch, height=0.72 * inch),
             Paragraph("BrainTumorVision AI", styles["Brand"]),
             Paragraph("PERSONALIZED WELLNESS PLAN", styles["SmallText"]), Spacer(1, 10)]
    profile = plan.get("profile_summary") or {}
    story.extend([Paragraph(f"Generated: {escape(_clean(plan.get('generated_at')))}", styles["SmallText"]),
                  Paragraph("Plan overview", styles["Section"]),
                  Paragraph(f"Activity profile: {escape(_clean(plan.get('activity_profile')))}<br/>Age: {escape(_clean(profile.get('age')))} · Diet: {escape(_clean(profile.get('diet_preference')))} · BMI: {escape(_clean(profile.get('bmi')))}<br/>{escape(_clean(profile.get('bmi_note')))}<br/>Meals per day: {escape(_clean(profile.get('meals_per_day')))}", styles["SmallText"]),
                  Paragraph("Diet guidance · USDA FoodData Central", styles["Section"])])
    for meal in plan.get("diet_guidance", []):
        story.append(Paragraph(f"{escape(_clean(meal.get('meal')))} · {escape(_clean(meal.get('food') or 'Nutrition data unavailable'))}", styles["Meal"]))
        if meal.get("available"):
            story.append(Paragraph(escape(_clean(meal.get("portion_guidance"))), styles["SmallText"]))
            nutrients = " · ".join(f"{escape(name.replace('_', ' ').title())}: {escape(_clean(value.get('value')))} {escape(_clean(value.get('unit')))}" for name, value in (meal.get("nutrition") or {}).items())
            if nutrients:
                story.append(Paragraph(nutrients, styles["SmallText"]))
        else:
            story.append(Paragraph(escape(_clean(meal.get("message"))), styles["SmallText"]))
    story.append(Paragraph("Weekly activity plan", styles["Section"]))
    for line in _exercise_lines(plan):
        story.append(Paragraph(escape(line.strip()), styles["SmallText"]))
    environment = plan.get("environment_guidance") or {}
    story.extend([Paragraph("Environmental information", styles["Section"]),
                  Paragraph(escape(_clean(environment.get("activity_guidance") or environment.get("message"))), styles["SmallText"])])
    for measurement in environment.get("measurements", []):
        story.append(Paragraph(escape(f"{measurement.get('parameter')}: {measurement.get('value')} {measurement.get('unit') or ''} · {measurement.get('measurement_time') or ''}"), styles["SmallText"]))
    story.append(Paragraph("Wellness indicators", styles["Section"]))
    for item in plan.get("wellness_indicators", []):
        story.append(Paragraph(escape(f"{item.get('name')}: {item.get('status')} — {item.get('rule')}"), styles["SmallText"]))
    story.append(Paragraph("Safety notes", styles["Section"]))
    for note in plan.get("safety_notes", []):
        story.append(Paragraph("• " + escape(note), styles["SmallText"]))
    story.extend([Spacer(1, 12), Paragraph("GENERAL EDUCATIONAL GUIDANCE ONLY. This plan is not a medical diagnosis or treatment recommendation. Consult qualified health professionals for individual medical, nutrition, or fitness advice.", styles["SmallText"])])
    doc.build(story)
    return output.getvalue()
