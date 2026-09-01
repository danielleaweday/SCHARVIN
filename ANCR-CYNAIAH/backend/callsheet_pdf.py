"""Call-sheet PDF renderer.

Turns a Production Studio call sheet + related crew/scenes into a
one-page A4 PDF that mirrors what an assistant director hands out on set.
"""
from __future__ import annotations

from io import BytesIO
from typing import Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Spacer,
)


def _para(text: str, style) -> Paragraph:
    return Paragraph(text or "", style)


def render_call_sheet_pdf(
    project: dict,
    call_sheet: dict,
    crew: list,
    scenes: list,
    shots: list,
    locations: list,
) -> bytes:
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=14 * mm,
        rightMargin=14 * mm,
        topMargin=14 * mm,
        bottomMargin=14 * mm,
    )
    styles = getSampleStyleSheet()
    h1 = ParagraphStyle("h1", parent=styles["Heading1"], fontSize=16, spaceAfter=4, textColor=colors.HexColor("#111"))
    tag = ParagraphStyle("tag", parent=styles["Normal"], fontSize=8, textColor=colors.HexColor("#6D28D9"), leading=10)
    body = ParagraphStyle("body", parent=styles["Normal"], fontSize=9, leading=12, textColor=colors.HexColor("#222"))
    small = ParagraphStyle("small", parent=body, fontSize=8, textColor=colors.HexColor("#555"))
    section = ParagraphStyle("section", parent=styles["Heading3"], fontSize=10, textColor=colors.HexColor("#111"), spaceBefore=8, spaceAfter=4)

    story = []
    story.append(_para("CYNAIAH™ · Call Sheet", tag))
    story.append(_para(project.get("title", "Untitled"), h1))
    story.append(_para(
        f"{call_sheet.get('date','—')} · Call {call_sheet.get('call_time','—')} · {call_sheet.get('location','—')}",
        body,
    ))
    story.append(Spacer(1, 6))

    # Top summary grid
    top = [
        ["DATE", "CALL", "LOCATION", "WEATHER"],
        [
            call_sheet.get("date") or "—",
            call_sheet.get("call_time") or "—",
            call_sheet.get("location") or "—",
            call_sheet.get("weather") or "—",
        ],
        ["SUNRISE", "SUNSET", "PROJECT TYPE", "STATUS"],
        [
            call_sheet.get("sunrise") or "—",
            call_sheet.get("sunset") or "—",
            (project.get("type") or "").replace("_", " ").title() or "—",
            (project.get("status") or "").replace("_", " ").title() or "—",
        ],
    ]
    t = Table(top, colWidths=[41 * mm] * 4, hAlign="LEFT")
    t.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0A0A0C")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("BACKGROUND", (0, 2), (-1, 2), colors.HexColor("#0A0A0C")),
            ("TEXTCOLOR", (0, 2), (-1, 2), colors.white),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#DDDDDD")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ])
    )
    story.append(t)

    # Crew table
    story.append(_para("CAST &amp; CREW", section))
    if crew:
        rows = [["Name", "Role", "Dept", "Call", "Contact"]]
        for c in crew:
            rows.append([
                c.get("name", "—"),
                c.get("role", "—"),
                c.get("department", "—"),
                c.get("call_time", "—"),
                c.get("email") or c.get("phone") or "—",
            ])
        ct = Table(rows, colWidths=[38 * mm, 42 * mm, 30 * mm, 20 * mm, 42 * mm], hAlign="LEFT")
        ct.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F1F1F5")),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#E4E4EA")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
        ]))
        story.append(ct)
    else:
        story.append(_para("No crew logged.", small))

    # Scenes / shots
    if scenes:
        story.append(_para("SCENES &amp; SHOTS", section))
        sh_rows = [["Scene", "Title", "Location", "Shots"]]
        for s in scenes:
            n_shots = sum(1 for sh in shots if sh.get("scene_id") == s.get("id"))
            sh_rows.append([
                s.get("number", "—"),
                s.get("title", "—"),
                s.get("location", "—"),
                str(n_shots),
            ])
        st = Table(sh_rows, colWidths=[16 * mm, 70 * mm, 60 * mm, 16 * mm], hAlign="LEFT")
        st.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F1F1F5")),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#E4E4EA")),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
        ]))
        story.append(st)

    # Locations
    if locations:
        story.append(_para("LOCATIONS", section))
        for loc in locations:
            story.append(_para(
                f"<b>{loc.get('name','—')}</b> — {loc.get('address') or '—'} · Hours: {loc.get('hours') or '—'} · Release: {loc.get('release_status') or '—'}",
                body,
            ))

    # Notes / safety
    if call_sheet.get("notes"):
        story.append(_para("NOTES · SAFETY", section))
        story.append(_para(call_sheet["notes"], body))

    story.append(Spacer(1, 10))
    story.append(_para(
        "Generated by CYNAIAH™ Production Studio · Vision · Story · Impact.",
        small,
    ))

    doc.build(story)
    return buf.getvalue()
