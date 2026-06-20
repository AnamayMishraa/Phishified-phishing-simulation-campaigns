from datetime import timedelta
from calendar import month_abbr

from django.db.models import Avg, Count, Sum, Q, Value, F
from django.db.models.functions import Coalesce, TruncMonth
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.campaigns.models import Campaign, CampaignActivity, CampaignAssignment
from apps.employees.models import Employee, EmployeeRiskSnapshot
from apps.dashboard.serializers import DashboardSerializer


TYPE_MAP = {
    "sent": "campaign",
    "opened": "campaign",
    "clicked": "click",
    "submitted": "click",
    "reported": "report",
    "event": "campaign",
}

MONTH_LABELS = [m.lower() for m in month_abbr if m]


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        org = request.user.organization
        now = timezone.now()

        # ------------------------------------------------------------------
        # 1. KPIs
        # ------------------------------------------------------------------

        # Active Campaigns
        active_campaigns = Campaign.objects.filter(
            organization=org, status="active"
        ).count()

        one_week_ago = now - timedelta(days=7)
        active_one_week_ago = Campaign.objects.filter(
            organization=org, status="active",
            created_at__lt=one_week_ago,
        ).count()
        active_change = active_campaigns - active_one_week_ago

        # Employees Tested (distinct employees with >=1 assignment)
        tested_count = (
            CampaignAssignment.objects
            .filter(campaign__organization=org)
            .values("employee")
            .distinct()
            .count()
        )

        three_months_ago = now - timedelta(days=90)
        tested_prev = (
            CampaignAssignment.objects
            .filter(
                campaign__organization=org,
                campaign__created_at__lt=three_months_ago,
            )
            .values("employee")
            .distinct()
            .count()
        )
        tested_change = tested_count - tested_prev

        # Click Rate + Credential Submission Rate (aggregate across all campaigns)
        agg = Campaign.objects.filter(organization=org).aggregate(
            total_sent=Coalesce(Sum("sent_count"), Value(0)),
            total_clicks=Coalesce(Sum("click_count"), Value(0)),
            total_submissions=Coalesce(Sum("submission_count"), Value(0)),
        )
        total_sent = agg["total_sent"]
        total_clicks = agg["total_clicks"]
        total_submissions = agg["total_submissions"]

        click_rate = round(total_clicks / total_sent * 100, 1) if total_sent else 0.0
        submission_rate = round(total_submissions / total_sent * 100, 1) if total_sent else 0.0

        one_month_ago = now - timedelta(days=30)
        agg_prev = Campaign.objects.filter(
            organization=org, created_at__lt=one_month_ago,
        ).aggregate(
            total_sent=Coalesce(Sum("sent_count"), Value(0)),
            total_clicks=Coalesce(Sum("click_count"), Value(0)),
            total_submissions=Coalesce(Sum("submission_count"), Value(0)),
        )
        prev_sent = agg_prev["total_sent"]
        prev_clicks = agg_prev["total_clicks"]
        prev_submissions = agg_prev["total_submissions"]
        prev_click_rate = round(prev_clicks / prev_sent * 100, 1) if prev_sent else 0.0
        prev_submission_rate = round(prev_submissions / prev_sent * 100, 1) if prev_sent else 0.0

        click_rate_change = round(click_rate - prev_click_rate, 1)
        submission_rate_change = round(submission_rate - prev_submission_rate, 1)

        # Training Completion (placeholder until Training app exists)
        training_completion = 0.0

        kpis = {
            "active_campaigns": {
                "value": active_campaigns,
                "change": {
                    "value": f"{active_change:+d}",
                    "trend": "up" if active_change > 0 else ("down" if active_change < 0 else "neutral"),
                    "label": "this week",
                },
            },
            "employees_tested": {
                "value": tested_count,
                "change": {
                    "value": f"{tested_change:+d}",
                    "trend": "up" if tested_change > 0 else ("down" if tested_change < 0 else "neutral"),
                    "label": "this quarter",
                },
            },
            "click_rate": {
                "value": click_rate,
                "change": {
                    "value": f"{click_rate_change:+.1f}%",
                    "trend": "down" if click_rate_change < 0 else ("up" if click_rate_change > 0 else "neutral"),
                    "label": "vs last month",
                },
            },
            "credential_submission": {
                "value": submission_rate,
                "change": {
                    "value": f"{submission_rate_change:+.1f}%",
                    "trend": "up" if submission_rate_change > 0 else ("down" if submission_rate_change < 0 else "neutral"),
                    "label": "vs last quarter",
                },
            },
            "training_completion": {
                "value": training_completion,
                "change": {
                    "value": "0%",
                    "trend": "neutral",
                    "label": "overall",
                },
            },
        }

        # ------------------------------------------------------------------
        # 2. Campaign Performance (12-month click / report rate)
        # ------------------------------------------------------------------
        twelve_months_ago = now - timedelta(days=365)

        monthly_qs = (
            Campaign.objects
            .filter(organization=org, created_at__gte=twelve_months_ago)
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(
                total_sent=Coalesce(Sum("sent_count"), Value(0)),
                total_clicks=Coalesce(Sum("click_count"), Value(0)),
                total_reports=Coalesce(Sum("report_count"), Value(0)),
            )
            .order_by("month")
        )

        monthly_by_label = {}
        for row in monthly_qs:
            m = row["month"]
            if m is None:
                continue
            label = month_abbr[m.month].lower()
            sent = row["total_sent"]
            clicks = row["total_clicks"]
            reports = row["total_reports"]
            monthly_by_label[label] = {
                "click_rate": round(clicks / sent * 100, 1) if sent else 0.0,
                "report_rate": round(reports / sent * 100, 1) if sent else 0.0,
            }

        campaign_performance = []
        for i in range(11, -1, -1):
            m = now.month - i
            y = now.year
            while m < 1:
                m += 12
                y -= 1
            label = month_abbr[m].lower()
            data = monthly_by_label.get(label, {"click_rate": 0.0, "report_rate": 0.0})
            campaign_performance.append({"month": label, **data})

        # ------------------------------------------------------------------
        # 3. Department Risk (avg risk score per department)
        # ------------------------------------------------------------------
        dept_qs = (
            Employee.objects
            .filter(organization=org, department__isnull=False, is_active=True)
            .values(dept_name=F("department__name"))
            .annotate(
                risk=Avg("risk_score"),
                employee_count=Count("id"),
            )
            .order_by("-risk")
        )

        department_risk = [
            {
                "name": d["dept_name"],
                "risk": round(d["risk"], 1) if d["risk"] else 0.0,
                "employee_count": d["employee_count"],
            }
            for d in dept_qs
        ]

        # ------------------------------------------------------------------
        # 4. Recent Activities (last 10 campaign activities)
        # ------------------------------------------------------------------
        activities_qs = (
            CampaignActivity.objects
            .filter(campaign__organization=org)
            .select_related("campaign")
            .order_by("-timestamp")[:10]
        )

        recent_activities = [
            {
                "id": a.id,
                "type": TYPE_MAP.get(a.activity_type, "campaign"),
                "message": a.message,
                "department": a.campaign.department or "",
                "timestamp": a.timestamp,
            }
            for a in activities_qs
        ]

        # ------------------------------------------------------------------
        # 5. High Risk Employees (top 5 by risk_score — high + critical)
        # ------------------------------------------------------------------
        high_risk_qs = (
            Employee.objects
            .filter(
                organization=org,
                risk_level__in=["high", "critical"],
                is_active=True,
            )
            .annotate(
                total_phish_clicked=Count(
                    "campaign_assignments",
                    filter=Q(campaign_assignments__clicked_at__isnull=False),
                ),
            )
            .select_related("department")
            .order_by("-risk_score")[:5]
        )

        high_risk_employees = [
            {
                "id": e.id,
                "name": f"{e.first_name} {e.last_name}",
                "department": e.department.name if e.department else "",
                "total_phish_clicked": e.total_phish_clicked,
                "risk_score": e.risk_score,
            }
            for e in high_risk_qs
        ]

        # ------------------------------------------------------------------
        # 6. Most Improved Employees (largest risk_score decrease vs earlier snapshot)
        # ------------------------------------------------------------------
        improved_qs = (
            Employee.objects
            .filter(organization=org, is_active=True)
            .select_related("department")
            .order_by("risk_score")[:10]
        )

        most_improved_employees = []
        for e in improved_qs:
            prev_snapshot = (
                EmployeeRiskSnapshot.objects
                .filter(employee=e)
                .order_by("-snapshot_date")
                .first()
            )
            prev_score = prev_snapshot.risk_score if prev_snapshot else e.risk_score
            improvement = max(0, prev_score - e.risk_score)
            if improvement > 0 or not prev_snapshot:
                most_improved_employees.append(
                    {
                        "id": e.id,
                        "name": f"{e.first_name} {e.last_name}",
                        "department": e.department.name if e.department else "",
                        "risk_score": e.risk_score,
                        "previous_risk_score": prev_score,
                        "improvement": improvement,
                    }
                )

        most_improved_employees = sorted(
            most_improved_employees, key=lambda x: x["improvement"], reverse=True
        )[:5]

        # ------------------------------------------------------------------
        # 7. Highest Reporting Employees (most emails reported)
        # ------------------------------------------------------------------
        reporting_qs = (
            Employee.objects
            .filter(organization=org, is_active=True)
            .annotate(
                total_reported=Count(
                    "campaign_assignments",
                    filter=Q(campaign_assignments__reported_at__isnull=False),
                ),
            )
            .filter(total_reported__gt=0)
            .select_related("department")
            .order_by("-total_reported")[:5]
        )

        highest_reporting_employees = [
            {
                "id": e.id,
                "name": f"{e.first_name} {e.last_name}",
                "department": e.department.name if e.department else "",
                "total_reported": e.total_reported,
                "risk_score": e.risk_score,
            }
            for e in reporting_qs
        ]

        # ------------------------------------------------------------------
        # Response
        # ------------------------------------------------------------------
        data = {
            "kpis": kpis,
            "campaign_performance": campaign_performance,
            "department_risk": department_risk,
            "recent_activities": recent_activities,
            "high_risk_employees": high_risk_employees,
            "most_improved_employees": most_improved_employees,
            "highest_reporting_employees": highest_reporting_employees,
        }

        serializer = DashboardSerializer(data)
        return Response(serializer.data)
