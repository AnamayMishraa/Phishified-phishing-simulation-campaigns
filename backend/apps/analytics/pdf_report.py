"""Executive Security Awareness Report — PDF generation using ReportLab."""

import io
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import (
    PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)


def _build_styles():
    ss = getSampleStyleSheet()
    ss.add(ParagraphStyle("CoverTitle", parent=ss["Title"], fontSize=32, leading=38, spaceAfter=20, alignment=TA_CENTER, textColor=colors.HexColor("#1e293b")))
    ss.add(ParagraphStyle("CoverSubtitle", parent=ss["Normal"], fontSize=16, leading=22, alignment=TA_CENTER, textColor=colors.HexColor("#64748b"), spaceAfter=6))
    ss.add(ParagraphStyle("SectionHeading", parent=ss["Heading1"], fontSize=18, leading=24, spaceAfter=12, spaceBefore=20, textColor=colors.HexColor("#1e293b")))
    ss.add(ParagraphStyle("BodyText2", parent=ss["Normal"], fontSize=10, leading=14, spaceAfter=6))
    ss.add(ParagraphStyle("SmallText", parent=ss["Normal"], fontSize=8, leading=10, textColor=colors.HexColor("#64748b")))
    ss.add(ParagraphStyle("FindingText", parent=ss["Normal"], fontSize=10, leading=14, leftIndent=12, spaceAfter=4))
    ss.add(ParagraphStyle("RecText", parent=ss["Normal"], fontSize=10, leading=14, leftIndent=12, spaceAfter=4))
    return ss


def _kpi_table(data: dict, ss) -> Table:
    rows = [
        ["Metric", "Value"],
        ["Security Awareness Score", f"{data['kpis']['security_awareness_score']['value']}/100"],
        ["Open Rate", f"{data['kpis']['open_rate']['value']}%"],
        ["Click Rate", f"{data['kpis']['click_rate']['value']}%"],
        ["Submission Rate", f"{data['kpis']['submission_rate']['value']}%"],
        ["Report Rate", f"{data['kpis']['report_rate']['value']}%"],
        ["Avg Report Time", f"{data['kpis']['avg_report_time_minutes']['value']} min"],
        ["Training Completion", f"{data['kpis']['training_completion_pct']['value']}%"],
    ]
    t = Table(rows, colWidths=[3*inch, 1.5*inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 1), (-1, -1), 9),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f8fafc"), colors.white]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return t


def _dept_table(depts: list, ss) -> Table:
    rows = [["Department", "Avg Risk", "Employees", "High Risk"]]
    for d in depts:
        rows.append([d["department"], str(d["avg_risk"]), str(d["employee_count"]), str(d["high_risk_count"])])
    t = Table(rows, colWidths=[2*inch, 1*inch, 1*inch, 1*inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 1), (-1, -1), 8),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f8fafc"), colors.white]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
    ]))
    return t


def _vulnerable_table(emps: list, ss) -> Table:
    rows = [["Employee", "Department", "Risk Score", "Risk Level", "Phish Clicked"]]
    for e in emps:
        rows.append([e["name"], e["department"], str(e["risk_score"]), e["risk_level"], str(e["total_phish_clicked"])])
    t = Table(rows, colWidths=[1.5*inch, 1.2*inch, 0.8*inch, 0.8*inch, 1*inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 8),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 1), (-1, -1), 8),
        ("ALIGN", (2, 0), (-1, -1), "CENTER"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f8fafc"), colors.white]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
    ]))
    return t


def generate_executive_report(data: dict, org_name: str = "Organization") -> bytes:
    """Generate a professional PDF report from analytics data."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=letter,
        topMargin=0.75*inch, bottomMargin=0.75*inch,
        leftMargin=0.75*inch, rightMargin=0.75*inch,
    )
    ss = _build_styles()
    story = []
    now_str = datetime.now().strftime("%B %d, %Y")

    # -- Cover Page --
    story.append(Spacer(1, 2.5*inch))
    story.append(Paragraph("Executive Security Awareness Report", ss["CoverTitle"]))
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph(org_name, ss["CoverSubtitle"]))
    story.append(Paragraph(f"Prepared: {now_str}", ss["CoverSubtitle"]))
    story.append(Spacer(1, 1.5*inch))
    story.append(Paragraph("CONFIDENTIAL", ParagraphStyle("Confidential", parent=ss["Normal"], fontSize=10, alignment=TA_CENTER, textColor=colors.HexColor("#ef4444"))))
    story.append(PageBreak())

    # -- Executive Summary --
    story.append(Paragraph("1. Executive Summary", ss["SectionHeading"]))
    es = data["executive_summary"]
    story.append(Paragraph(f"Security Awareness Score: <b>{es['awareness_score']}/100</b> ({es['risk_assessment'].upper()} risk)", ss["BodyText2"]))
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>Key Findings:</b>", ss["BodyText2"]))
    for f_text in es["findings"]:
        story.append(Paragraph(f"&bull; {f_text}", ss["FindingText"]))
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>Recommendations:</b>", ss["BodyText2"]))
    for r_text in es["recommendations"]:
        story.append(Paragraph(f"&bull; {r_text}", ss["RecText"]))
    story.append(PageBreak())

    # -- KPI Summary --
    story.append(Paragraph("2. KPI Summary", ss["SectionHeading"]))
    story.append(_kpi_table(data, ss))
    story.append(Spacer(1, 12))
    funnel = data["funnel"]
    total_employees = data["risk_overview"]["total_employees"]
    story.append(Paragraph(f"Campaign Funnel: {funnel[0]['count']} Sent &rarr; {funnel[1]['count']} Opened &rarr; {funnel[2]['count']} Clicked &rarr; {funnel[3]['count']} Submitted &rarr; {funnel[4]['count']} Reported", ss["BodyText2"]))
    story.append(Paragraph(f"Total Employees Monitored: {total_employees}", ss["BodyText2"]))
    story.append(PageBreak())

    # -- Department Breakdown --
    story.append(Paragraph("3. Department Breakdown", ss["SectionHeading"]))
    depts = data["highest_risk_departments"]
    if depts:
        story.append(_dept_table(depts, ss))
    heatmap = data["heatmap"]
    if heatmap:
        story.append(Spacer(1, 12))
        story.append(Paragraph("<b>Risk Segmentation by Department:</b>", ss["BodyText2"]))
        hm_rows = [["Department", "Low", "Medium", "High", "Critical", "Avg Risk"]]
        for h in heatmap:
            hm_rows.append([h["department"], str(h["low"]), str(h["medium"]), str(h["high"]), str(h["critical"]), str(h["avg_risk"])])
        hm_table = Table(hm_rows, colWidths=[1.2*inch, 0.6*inch, 0.7*inch, 0.6*inch, 0.7*inch, 0.7*inch])
        hm_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 8),
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 1), (-1, -1), 7),
            ("ALIGN", (1, 0), (-1, -1), "CENTER"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f8fafc"), colors.white]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        story.append(hm_table)
    story.append(PageBreak())

    # -- Campaign Performance --
    story.append(Paragraph("4. Campaign Performance", ss["SectionHeading"]))
    comp = data["department_comparison"]
    if comp:
        perf_rows = [["Department", "Open Rate", "Click Rate", "Submission Rate", "Report Rate", "Sent"]]
        for c in comp:
            perf_rows.append([c["department"], f"{c['open_rate']}%", f"{c['click_rate']}%", f"{c['submission_rate']}%", f"{c['report_rate']}%", str(c["sent"])])
        perf_table = Table(perf_rows, colWidths=[1.2*inch, 0.8*inch, 0.8*inch, 0.9*inch, 0.8*inch, 0.5*inch])
        perf_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 8),
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 1), (-1, -1), 7),
            ("ALIGN", (1, 0), (-1, -1), "CENTER"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f8fafc"), colors.white]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        story.append(perf_table)

    # -- Training Impact --
    impact = data["training_impact"]
    story.append(Spacer(1, 12))
    story.append(Paragraph("5. Training Impact Analysis", ss["SectionHeading"]))
    train_rows = [["Group", "Employees", "Avg Risk Score", "Click Rate"]]
    train_rows.append(["Trained", str(impact["trained"]["employee_count"]), str(impact["trained"]["avg_risk_score"]), f"{impact['trained']['click_rate']}%"])
    train_rows.append(["Untrained", str(impact["untrained"]["employee_count"]), str(impact["untrained"]["avg_risk_score"]), f"{impact['untrained']['click_rate']}%"])
    train_table = Table(train_rows, colWidths=[1.5*inch, 1*inch, 1.2*inch, 1*inch])
    train_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 1), (-1, -1), 9),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f8fafc"), colors.white]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
    ]))
    story.append(train_table)
    story.append(Spacer(1, 8))
    story.append(Paragraph(f"Risk Reduction from Training: <b>{impact['risk_reduction']} points</b>", ss["BodyText2"]))
    story.append(PageBreak())

    # -- Employee Risk Leaders --
    story.append(Paragraph("6. Employee Risk Leaders", ss["SectionHeading"]))
    story.append(Paragraph("<b>Most Vulnerable Employees:</b>", ss["BodyText2"]))
    vulnerable = data["most_vulnerable"]
    if vulnerable:
        story.append(_vulnerable_table(vulnerable, ss))
    story.append(Spacer(1, 12))
    story.append(Paragraph("<b>Most Improved Employees:</b>", ss["BodyText2"]))
    improved = data["most_improved"]
    if improved:
        imp_rows = [["Employee", "Department", "Previous Score", "Current Score", "Improvement"]]
        for i in improved:
            imp_rows.append([i["name"], i["department"], str(i["previous_risk_score"]), str(i["risk_score"]), str(i["improvement"])])
        imp_table = Table(imp_rows, colWidths=[1.5*inch, 1.2*inch, 1*inch, 1*inch, 1*inch])
        imp_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 8),
            ("ALIGN", (2, 0), (-1, -1), "CENTER"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f8fafc"), colors.white]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        story.append(imp_table)
    story.append(PageBreak())

    # -- Recommendations --
    story.append(Paragraph("7. Recommendations", ss["SectionHeading"]))
    for i, r_text in enumerate(es["recommendations"], 1):
        story.append(Paragraph(f"{i}. {r_text}", ss["BodyText2"]))
        story.append(Spacer(1, 4))

    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph(f"Report generated on {now_str} by Phishified Security Awareness Platform.", ss["SmallText"]))

    doc.build(story)
    return buf.getvalue()
