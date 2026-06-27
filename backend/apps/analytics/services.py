from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Optional

from django.db.models import Avg, Count, Q, F, Value
from django.db.models.functions import Coalesce
from django.utils import timezone

from apps.campaigns.models import Campaign, CampaignAssignment
from apps.employees.models import Employee, EmployeeRiskSnapshot
from apps.training.models import TrainingEnrollment


@dataclass
class AnalyticsFilter:
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    campaign_id: Optional[str] = None
    department_id: Optional[str] = None


class AnalyticsService:
    """Enterprise-grade analytics service with aggregation-based queries."""

    def __init__(self, org, filters: Optional[AnalyticsFilter] = None):
        self.org = org
        self.f = filters or AnalyticsFilter()
        self._apply_default_dates()

    def _apply_default_dates(self):
        now = timezone.now()
        if not self.f.date_from:
            self.f.date_from = now - timedelta(days=365)
        if not self.f.date_to:
            self.f.date_to = now

    def _campaign_qs(self):
        qs = Campaign.objects.filter(organization=self.org)
        if self.f.campaign_id:
            qs = qs.filter(id=self.f.campaign_id)
        return qs

    def _assignment_qs(self):
        qs = CampaignAssignment.objects.filter(
            campaign__organization=self.org,
            campaign__created_at__gte=self.f.date_from,
            campaign__created_at__lte=self.f.date_to,
        )
        if self.f.campaign_id:
            qs = qs.filter(campaign_id=self.f.campaign_id)
        if self.f.department_id:
            qs = qs.filter(employee__department_id=self.f.department_id)
        return qs

    def _employee_qs(self):
        qs = Employee.objects.filter(
            organization=self.org, is_active=True,
        )
        if self.f.department_id:
            qs = qs.filter(department_id=self.f.department_id)
        return qs

    # ------------------------------------------------------------------
    # KPIs
    # ------------------------------------------------------------------

    def get_kpis(self) -> dict:
        assignments = self._assignment_qs()
        agg = assignments.aggregate(
            total_sent=Coalesce(Count("id", filter=Q(sent_at__isnull=False)), Value(0)),
            total_opens=Coalesce(Count("id", filter=Q(opened_at__isnull=False)), Value(0)),
            total_clicks=Coalesce(Count("id", filter=Q(clicked_at__isnull=False)), Value(0)),
            total_submissions=Coalesce(Count("id", filter=Q(submitted_at__isnull=False)), Value(0)),
            total_reports=Coalesce(Count("id", filter=Q(reported_at__isnull=False)), Value(0)),
        )
        sent = agg["total_sent"]
        opens = agg["total_opens"]
        clicks = agg["total_clicks"]
        submissions = agg["total_submissions"]
        reports = agg["total_reports"]

        open_rate = round(opens / sent * 100, 1) if sent else 0.0
        click_rate = round(clicks / sent * 100, 1) if sent else 0.0
        submission_rate = round(submissions / sent * 100, 1) if sent else 0.0
        report_rate = round(reports / sent * 100, 1) if sent else 0.0

        avg_risk = self._employee_qs().aggregate(
            v=Avg("risk_score"),
        )["v"] or 0.0

        employees_count = self._employee_qs().count()
        trained_count = TrainingEnrollment.objects.filter(
            employee__organization=self.org,
            employee__is_active=True,
            completed_at__isnull=False,
        ).values("employee").distinct().count()
        training_completion = round(trained_count / employees_count * 100, 1) if employees_count else 0.0

        report_assignments = assignments.filter(
            reported_at__isnull=False, sent_at__isnull=False,
        ).values_list("reported_at", "sent_at")
        total_minutes = 0.0
        report_count = 0
        for reported_at, sent_at in report_assignments:
            if reported_at and sent_at:
                total_minutes += (reported_at - sent_at).total_seconds() / 60.0
                report_count += 1
        avg_report_time = round(total_minutes / report_count, 1) if report_count else 0.0

        risk_culture = (report_rate / (click_rate + report_rate) * 100) if (click_rate + report_rate) > 0 else 50.0
        awareness_score = round(
            (100.0 - avg_risk) * 0.5
            + risk_culture * 0.25
            + training_completion * 0.25,
            1,
        )

        return {
            "security_awareness_score": {"value": awareness_score, "change": None},
            "open_rate": {"value": open_rate, "change": None},
            "click_rate": {"value": click_rate, "change": None},
            "submission_rate": {"value": submission_rate, "change": None},
            "report_rate": {"value": report_rate, "change": None},
            "avg_report_time_minutes": {"value": avg_report_time, "change": None},
            "training_completion_pct": {"value": training_completion, "change": None},
        }

    # ------------------------------------------------------------------
    # Campaign Funnel
    # ------------------------------------------------------------------

    def get_campaign_funnel(self) -> list:
        assignments = self._assignment_qs()
        agg = assignments.aggregate(
            sent=Coalesce(Count("id", filter=Q(sent_at__isnull=False)), Value(0)),
            opened=Coalesce(Count("id", filter=Q(opened_at__isnull=False)), Value(0)),
            clicked=Coalesce(Count("id", filter=Q(clicked_at__isnull=False)), Value(0)),
            submitted=Coalesce(Count("id", filter=Q(submitted_at__isnull=False)), Value(0)),
            reported=Coalesce(Count("id", filter=Q(reported_at__isnull=False)), Value(0)),
        )
        return [
            {"stage": "Sent", "count": agg["sent"]},
            {"stage": "Opened", "count": agg["opened"]},
            {"stage": "Clicked", "count": agg["clicked"]},
            {"stage": "Submitted", "count": agg["submitted"]},
            {"stage": "Reported", "count": agg["reported"]},
        ]

    # ------------------------------------------------------------------
    # Department Risk Heatmap
    # ------------------------------------------------------------------

    def get_department_heatmap(self) -> list:
        qs = (
            Employee.objects
            .filter(organization=self.org, is_active=True, department__isnull=False)
            .values(dept_name=F("department__name"))
            .annotate(
                low=Count("id", filter=Q(risk_level="low")),
                medium=Count("id", filter=Q(risk_level="medium")),
                high=Count("id", filter=Q(risk_level="high")),
                critical=Count("id", filter=Q(risk_level="critical")),
                total=Count("id"),
                avg_risk=Coalesce(Avg("risk_score"), Value(0.0)),
            )
            .order_by("-avg_risk")
        )
        return [
            {
                "department": d["dept_name"],
                "low": d["low"],
                "medium": d["medium"],
                "high": d["high"],
                "critical": d["critical"],
                "total": d["total"],
                "avg_risk": round(d["avg_risk"], 1),
            }
            for d in qs
        ]

    # ------------------------------------------------------------------
    # Risk Trend Timeline (monthly avg risk score)
    # ------------------------------------------------------------------

    def get_risk_trend_timeline(self) -> list:
        snapshots = (
            EmployeeRiskSnapshot.objects
            .filter(
                employee__organization=self.org,
                snapshot_date__gte=self.f.date_from,
                snapshot_date__lte=self.f.date_to,
            )
            .values("snapshot_date")
            .annotate(avg_risk=Coalesce(Avg("risk_score"), Value(0.0)))
            .order_by("snapshot_date")
        )
        return [
            {"date": s["snapshot_date"].isoformat(), "avg_risk": round(s["avg_risk"], 1)}
            for s in snapshots
        ]

    # ------------------------------------------------------------------
    # Department Comparison
    # ------------------------------------------------------------------

    def get_department_comparison(self) -> list:
        assignments_qs = self._assignment_qs().filter(
            employee__department__isnull=False,
        )
        dept_agg = (
            assignments_qs
            .values(dept_name=F("employee__department__name"))
            .annotate(
                sent=Coalesce(Count("id", filter=Q(sent_at__isnull=False)), Value(0)),
                opened=Coalesce(Count("id", filter=Q(opened_at__isnull=False)), Value(0)),
                clicked=Coalesce(Count("id", filter=Q(clicked_at__isnull=False)), Value(0)),
                submitted=Coalesce(Count("id", filter=Q(submitted_at__isnull=False)), Value(0)),
                reported=Coalesce(Count("id", filter=Q(reported_at__isnull=False)), Value(0)),
            )
            .order_by("dept_name")
        )
        result = []
        for d in dept_agg:
            s = d["sent"]
            result.append({
                "department": d["dept_name"],
                "open_rate": round(d["opened"] / s * 100, 1) if s else 0.0,
                "click_rate": round(d["clicked"] / s * 100, 1) if s else 0.0,
                "submission_rate": round(d["submitted"] / s * 100, 1) if s else 0.0,
                "report_rate": round(d["reported"] / s * 100, 1) if s else 0.0,
                "sent": d["sent"],
            })
        return result

    # ------------------------------------------------------------------
    # Training Impact Analysis
    # ------------------------------------------------------------------

    def get_training_impact(self) -> dict:
        employees = self._employee_qs()
        trained_ids = set(
            TrainingEnrollment.objects
            .filter(
                employee__organization=self.org,
                completed_at__isnull=False,
            )
            .values_list("employee_id", flat=True)
            .distinct()
        )
        trained = employees.filter(id__in=trained_ids)
        untrained = employees.exclude(id__in=trained_ids)

        trained_agg = trained.aggregate(
            avg_risk=Coalesce(Avg("risk_score"), Value(0.0)),
            count=Count("id"),
        )
        untrained_agg = untrained.aggregate(
            avg_risk=Coalesce(Avg("risk_score"), Value(0.0)),
            count=Count("id"),
        )
        trained_assignments = self._assignment_qs().filter(employee_id__in=trained_ids)
        untrained_assignments = self._assignment_qs().exclude(employee_id__in=trained_ids)

        def _click_rate(qs):
            a = qs.aggregate(
                s=Coalesce(Count("id", filter=Q(sent_at__isnull=False)), Value(0)),
                c=Coalesce(Count("id", filter=Q(clicked_at__isnull=False)), Value(0)),
            )
            return round(a["c"] / a["s"] * 100, 1) if a["s"] else 0.0

        return {
            "trained": {
                "employee_count": trained_agg["count"],
                "avg_risk_score": round(trained_agg["avg_risk"], 1),
                "click_rate": _click_rate(trained_assignments),
            },
            "untrained": {
                "employee_count": untrained_agg["count"],
                "avg_risk_score": round(untrained_agg["avg_risk"], 1),
                "click_rate": _click_rate(untrained_assignments),
            },
            "risk_reduction": round(
                max(0, untrained_agg["avg_risk"] - trained_agg["avg_risk"]), 1
            ),
        }

    # ------------------------------------------------------------------
    # Organization Risk Overview
    # ------------------------------------------------------------------

    def get_risk_overview(self) -> dict:
        employees = self._employee_qs()
        seg = employees.aggregate(
            low=Count("id", filter=Q(risk_level="low")),
            medium=Count("id", filter=Q(risk_level="medium")),
            high=Count("id", filter=Q(risk_level="high")),
            critical=Count("id", filter=Q(risk_level="critical")),
            total=Count("id"),
        )
        return {
            "segmentation": {
                "low": seg["low"],
                "medium": seg["medium"],
                "high": seg["high"],
                "critical": seg["critical"],
            },
            "total_employees": seg["total"],
        }

    # ------------------------------------------------------------------
    # Most Vulnerable Employees
    # ------------------------------------------------------------------

    def get_most_vulnerable_employees(self, limit: int = 10) -> list:
        qs = (
            self._employee_qs()
            .filter(risk_level__in=["high", "critical"])
            .annotate(
                total_clicked=Count(
                    "campaign_assignments",
                    filter=Q(campaign_assignments__clicked_at__isnull=False),
                ),
            )
            .select_related("department")
            .order_by("-risk_score")[:limit]
        )
        return [
            {
                "id": e.id,
                "name": f"{e.first_name} {e.last_name}",
                "department": e.department.name if e.department else "",
                "risk_score": e.risk_score,
                "risk_level": e.risk_level,
                "total_phish_clicked": e.total_clicked,
            }
            for e in qs
        ]

    # ------------------------------------------------------------------
    # Most Improved Employees
    # ------------------------------------------------------------------

    def get_most_improved_employees(self, limit: int = 5) -> list:
        qs = self._employee_qs().select_related("department").order_by("risk_score")[:limit * 3]
        result = []
        for e in qs:
            prev = (
                EmployeeRiskSnapshot.objects
                .filter(employee=e)
                .order_by("-snapshot_date")
                .first()
            )
            prev_score = prev.risk_score if prev else e.risk_score
            improvement = max(0, prev_score - e.risk_score)
            if improvement > 0 or not prev:
                result.append({
                    "id": e.id,
                    "name": f"{e.first_name} {e.last_name}",
                    "department": e.department.name if e.department else "",
                    "risk_score": e.risk_score,
                    "previous_risk_score": prev_score,
                    "improvement": improvement,
                })
        return sorted(result, key=lambda x: x["improvement"], reverse=True)[:limit]

    # ------------------------------------------------------------------
    # Fastest Reporters
    # ------------------------------------------------------------------

    def get_fastest_reporters(self, limit: int = 5) -> list:
        qs = list(
            self._assignment_qs()
            .filter(reported_at__isnull=False, sent_at__isnull=False)
            .select_related("employee__department", "campaign")
            .order_by("reported_at")
        )
        qs.sort(key=lambda a: (a.reported_at - a.sent_at).total_seconds() if a.reported_at and a.sent_at else 0)
        result = []
        for a in qs[:limit]:
            diff = (a.reported_at - a.sent_at).total_seconds() / 60.0 if a.reported_at and a.sent_at else 0.0
            result.append({
                "id": a.employee.id,
                "name": f"{a.employee.first_name} {a.employee.last_name}",
                "department": a.employee.department.name if a.employee.department else "",
                "report_time_minutes": round(diff, 1),
                "campaign": a.campaign.name,
            })
        return result

    # ------------------------------------------------------------------
    # Highest Risk Departments
    # ------------------------------------------------------------------

    def get_highest_risk_departments(self, limit: int = 10) -> list:
        qs = (
            self._employee_qs()
            .filter(department__isnull=False)
            .values(dept_name=F("department__name"))
            .annotate(
                avg_risk=Coalesce(Avg("risk_score"), Value(0.0)),
                employee_count=Count("id"),
                high_risk_count=Count("id", filter=Q(risk_level__in=["high", "critical"])),
            )
            .order_by("-avg_risk")[:limit]
        )
        return [
            {
                "department": d["dept_name"],
                "avg_risk": round(d["avg_risk"], 1),
                "employee_count": d["employee_count"],
                "high_risk_count": d["high_risk_count"],
            }
            for d in qs
        ]

    # ------------------------------------------------------------------
    # Executive Summary (natural-language text)
    # ------------------------------------------------------------------

    def get_executive_summary(self) -> dict:
        kpis = self.get_kpis()
        overview = self.get_risk_overview()
        depts = self.get_highest_risk_departments(3)
        vulnerable = self.get_most_vulnerable_employees(3)
        improved = self.get_most_improved_employees(3)
        impact = self.get_training_impact()

        score = kpis["security_awareness_score"]["value"]
        click_rate = kpis["click_rate"]["value"]
        report_rate = kpis["report_rate"]["value"]
        training_pct = kpis["training_completion_pct"]["value"]

        risk_assessment = "low" if score >= 70 else ("moderate" if score >= 50 else "high")
        top_dept = depts[0]["department"] if depts else "N/A"
        top_dept_risk = depts[0]["avg_risk"] if depts else 0.0
        risk_reduction = impact["risk_reduction"]

        findings = []
        recommendations = []

        findings.append(f"Security Awareness Score is {score}/100, indicating {risk_assessment} risk.")
        findings.append(f"Overall phishing click rate is {click_rate}%.")
        findings.append(f"Employee report rate is {report_rate}%.")

        if click_rate > 15:
            findings.append(f"Click rate exceeds the 15% benchmark by {round(click_rate - 15, 1)} percentage points.")
            recommendations.append("Increase frequency of simulated phishing campaigns focused on click reduction.")
        else:
            recommendations.append("Maintain current phishing simulation cadence — click rate is within acceptable range.")

        if report_rate < 30:
            findings.append(f"Report rate of {report_rate}% is below the 30% target.")
            recommendations.append("Launch a reporting incentive program to encourage prompt threat reporting.")
        else:
            recommendations.append("Reporting culture is strong — continue to recognize and reward reporters.")

        if training_pct < 60:
            findings.append(f"Training completion rate is {training_pct}% — below the 60% target.")
            recommendations.append("Assign mandatory security awareness training to all employees who have not completed it.")
        else:
            recommendations.append("Training adoption is strong — consider adding advanced modules for power users.")

        if risk_reduction > 5:
            recommendations.append(
                f"Trained employees score {risk_reduction} points lower on average. "
                "Expand training program to cover remaining untrained employees."
            )

        if depts:
            findings.append(f"Highest risk department: {top_dept} (avg risk {top_dept_risk}).")
            for d in depts[1:3]:
                recommendations.append(
                    f"Conduct targeted intervention in {d['department']} (avg risk {d['avg_risk']})."
                )

        if vulnerable:
            recommendations.append(
                f"Schedule one-on-one coaching for {vulnerable[0]['name']} "
                f"(risk score {vulnerable[0]['risk_score']})."
            )

        if improved:
            recommendations.append(
                f"Recognize {improved[0]['name']} for {improved[0]['improvement']}-point risk improvement."
            )

        if overview["segmentation"]["critical"] > 0:
            findings.append(
                f"{overview['segmentation']['critical']} employee(s) at CRITICAL risk level require immediate intervention."
            )
            recommendations.append("Escalate critical-risk employees to HR for mandatory security review.")

        return {
            "awareness_score": score,
            "risk_assessment": risk_assessment,
            "findings": findings,
            "recommendations": recommendations[:6],
            "generated_at": timezone.now().isoformat(),
        }

    # ------------------------------------------------------------------
    # All Data (for PDF report generation and executive view)
    # ------------------------------------------------------------------

    def get_all_data(self) -> dict:
        return {
            "kpis": self.get_kpis(),
            "funnel": self.get_campaign_funnel(),
            "heatmap": self.get_department_heatmap(),
            "risk_trend": self.get_risk_trend_timeline(),
            "department_comparison": self.get_department_comparison(),
            "training_impact": self.get_training_impact(),
            "risk_overview": self.get_risk_overview(),
            "most_vulnerable": self.get_most_vulnerable_employees(),
            "most_improved": self.get_most_improved_employees(),
            "fastest_reporters": self.get_fastest_reporters(),
            "highest_risk_departments": self.get_highest_risk_departments(),
            "executive_summary": self.get_executive_summary(),
        }
