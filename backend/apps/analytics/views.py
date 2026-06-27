import csv
import io
from datetime import datetime, timedelta

from django.http import HttpResponse
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.analytics.pdf_report import generate_executive_report
from apps.analytics.serializers import AllAnalyticsSerializer
from apps.analytics.services import AnalyticsFilter, AnalyticsService
from apps.campaigns.models import Campaign
from apps.employees.models import Employee
from apps.organizations.models import Department


def _parse_filters(request):
    """Parse common query params into an AnalyticsFilter."""
    now = timezone.now()
    date_range = request.query_params.get("date_range", "90d")
    date_from = request.query_params.get("date_from")
    date_to = request.query_params.get("date_to")

    if date_from and date_to:
        try:
            date_from_dt = datetime.fromisoformat(date_from)
            date_to_dt = datetime.fromisoformat(date_to)
        except (ValueError, TypeError):
            date_from_dt = now - timedelta(days=90)
            date_to_dt = now
    else:
        days = {"7d": 7, "30d": 30, "90d": 90, "1y": 365}.get(date_range, 90)
        date_from_dt = now - timedelta(days=days)
        date_to_dt = now

    return AnalyticsFilter(
        date_from=date_from_dt,
        date_to=date_to_dt,
        campaign_id=request.query_params.get("campaign_id"),
        department_id=request.query_params.get("department_id"),
    )


# ------------------------------------------------------------------
# Executive Analytics — all data required for the enterprise view
# ------------------------------------------------------------------

class ExecutiveAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        svc = AnalyticsService(request.user.organization, _parse_filters(request))
        data = svc.get_all_data()
        serializer = AllAnalyticsSerializer(data)
        return Response(serializer.data)


# ------------------------------------------------------------------
# Specific sub-endpoints (for chart-level fetching)
# ------------------------------------------------------------------

class AnalyticsKpiView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        svc = AnalyticsService(request.user.organization, _parse_filters(request))
        return Response(svc.get_kpis())


class CampaignFunnelView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        svc = AnalyticsService(request.user.organization, _parse_filters(request))
        return Response(svc.get_campaign_funnel())


class DepartmentHeatmapView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        svc = AnalyticsService(request.user.organization, _parse_filters(request))
        return Response(svc.get_department_heatmap())


class RiskTrendView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        svc = AnalyticsService(request.user.organization, _parse_filters(request))
        return Response(svc.get_risk_trend_timeline())


class DepartmentComparisonView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        svc = AnalyticsService(request.user.organization, _parse_filters(request))
        return Response(svc.get_department_comparison())


class TrainingImpactView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        svc = AnalyticsService(request.user.organization, _parse_filters(request))
        return Response(svc.get_training_impact())


class ExecutiveSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        svc = AnalyticsService(request.user.organization, _parse_filters(request))
        return Response(svc.get_executive_summary())


# ------------------------------------------------------------------
# Filters helper — returns available filter options
# ------------------------------------------------------------------

class AnalyticsFiltersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        org = request.user.organization
        campaigns = Campaign.objects.filter(organization=org).values("id", "name").order_by("-created_at")
        departments = Department.objects.filter(organization=org, is_active=True).values("id", "name").order_by("name")
        return Response({
            "campaigns": list(campaigns),
            "departments": list(departments),
        })


# ------------------------------------------------------------------
# CSV Exports
# ------------------------------------------------------------------

class ExportEmployeeRiskCsvView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        org = request.user.organization
        svc = AnalyticsService(org, _parse_filters(request))
        employees = (
            svc._employee_qs()
            .select_related("department")
            .annotate(
                total_sent=__import__("django.db.models").Count(
                    "campaign_assignments",
                    filter=__import__("django.db.models").Q(campaign_assignments__sent_at__isnull=False),
                ),
                total_clicked=__import__("django.db.models").Count(
                    "campaign_assignments",
                    filter=__import__("django.db.models").Q(campaign_assignments__clicked_at__isnull=False),
                ),
                total_reported=__import__("django.db.models").Count(
                    "campaign_assignments",
                    filter=__import__("django.db.models").Q(campaign_assignments__reported_at__isnull=False),
                ),
            )
            .order_by("-risk_score")
        )

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = "attachment; filename=employee_risk_report.csv"
        writer = csv.writer(response)
        writer.writerow(["Name", "Email", "Department", "Risk Score", "Risk Level", "Campaigns Sent", "Phish Clicked", "Phish Reported"])
        for e in employees:
            writer.writerow([
                f"{e.first_name} {e.last_name}",
                e.email,
                e.department.name if e.department else "",
                e.risk_score,
                e.risk_level,
                getattr(e, "total_sent", 0),
                getattr(e, "total_clicked", 0),
                getattr(e, "total_reported", 0),
            ])
        return response


class ExportCampaignPerformanceCsvView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        org = request.user.organization
        svc = AnalyticsService(org, _parse_filters(request))
        campaigns = svc._campaign_qs().order_by("-created_at")

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = "attachment; filename=campaign_performance.csv"
        writer = csv.writer(response)
        writer.writerow(["Campaign", "Status", "Type", "Department", "Sent", "Opens", "Clicks", "Submissions", "Reports", "Open Rate", "Click Rate", "Submission Rate", "Report Rate", "Launched"])
        for c in campaigns:
            writer.writerow([
                c.name, c.status, c.type, c.department,
                c.sent_count, c.open_count, c.click_count, c.submission_count, c.report_count,
                f"{round(c.open_rate * 100, 1)}%",
                f"{round(c.click_rate * 100, 1)}%",
                f"{round(c.submission_rate * 100, 1)}%",
                f"{round(c.report_rate * 100, 1)}%",
                c.launched_at.isoformat() if c.launched_at else "",
            ])
        return response


class ExportAnalyticsCsvView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        org = request.user.organization
        svc = AnalyticsService(org, _parse_filters(request))
        kpis = svc.get_kpis()

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = "attachment; filename=analytics_summary.csv"
        writer = csv.writer(response)
        writer.writerow(["Metric", "Value"])
        for key, val in kpis.items():
            writer.writerow([key.replace("_", " ").title(), val["value"]])
        writer.writerow([])
        writer.writerow(["Funnel Stage", "Count"])
        for stage in svc.get_campaign_funnel():
            writer.writerow([stage["stage"], stage["count"]])
        return response


# ------------------------------------------------------------------
# PDF Export
# ------------------------------------------------------------------

class ExportPdfView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        org = request.user.organization
        svc = AnalyticsService(org, _parse_filters(request))
        data = svc.get_all_data()
        org_name = getattr(org, "name", "Organization")
        pdf_bytes = generate_executive_report(data, org_name)

        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="executive_security_report_{datetime.now().strftime("%Y%m%d")}.pdf"'
        response["Content-Length"] = len(pdf_bytes)
        return response
