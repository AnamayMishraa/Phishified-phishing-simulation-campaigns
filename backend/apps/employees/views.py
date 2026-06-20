from django.db.models import Avg, Count, F, FloatField, Q, Value
from django.db.models.functions import Coalesce
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.employees.models import Employee, EmployeeRiskSnapshot
from apps.employees.serializers import (
    EmployeeDetailSerializer,
    EmployeeListSerializer,
    EmployeeRiskSnapshotSerializer,
    EmployeeWriteSerializer,
    LeaderboardSerializer,
)


class EmployeeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    search_fields = ["first_name", "last_name", "email", "position"]
    ordering_fields = [
        "last_name",
        "first_name",
        "risk_score",
        "created_at",
        "department",
    ]
    ordering = ["last_name", "first_name"]

    def get_queryset(self):
        qs = Employee.objects.filter(organization=self.request.user.organization)
        qs = qs.select_related("department")

        department = self.request.query_params.get("department")
        if department:
            qs = qs.filter(department_id=department)

        risk_level = self.request.query_params.get("risk_level")
        if risk_level:
            qs = qs.filter(risk_level=risk_level)

        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return EmployeeListSerializer
        if self.action in ("create", "partial_update", "update"):
            return EmployeeWriteSerializer
        return EmployeeDetailSerializer

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])

    @action(detail=False, methods=["get"])
    def leaderboard(self, request):
        org = request.user.organization
        qs = Employee.objects.filter(organization=org, is_active=True)
        qs = qs.select_related("department")

        department = request.query_params.get("department")
        if department:
            qs = qs.filter(department_id=department)

        qs = qs.annotate(
            campaigns_participated=Count(
                "campaign_assignments",
                filter=Q(campaign_assignments__sent_at__isnull=False),
                distinct=True,
            ),
            total_assignments=Count(
                "campaign_assignments",
                filter=Q(campaign_assignments__sent_at__isnull=False),
            ),
            total_opens=Count(
                "campaign_assignments",
                filter=Q(campaign_assignments__opened_at__isnull=False),
            ),
            total_clicks=Count(
                "campaign_assignments",
                filter=Q(campaign_assignments__clicked_at__isnull=False),
            ),
            total_submissions=Count(
                "campaign_assignments",
                filter=Q(campaign_assignments__submitted_at__isnull=False),
            ),
            total_reports=Count(
                "campaign_assignments",
                filter=Q(campaign_assignments__reported_at__isnull=False),
            ),
        )

        qs = qs.annotate(
            open_rate=Coalesce(
                (F("total_opens") * 100.0 / F("total_assignments")),
                Value(0.0),
                output_field=FloatField(),
            ),
            click_rate=Coalesce(
                (F("total_clicks") * 100.0 / F("total_assignments")),
                Value(0.0),
                output_field=FloatField(),
            ),
            submission_rate=Coalesce(
                (F("total_submissions") * 100.0 / F("total_assignments")),
                Value(0.0),
                output_field=FloatField(),
            ),
            report_rate=Coalesce(
                (F("total_reports") * 100.0 / F("total_assignments")),
                Value(0.0),
                output_field=FloatField(),
            ),
        )

        ordering = request.query_params.get("ordering", "-risk_score")
        allowed = {
            "risk_score", "-risk_score",
            "first_name", "-first_name",
            "last_name", "-last_name",
            "open_rate", "-open_rate",
            "click_rate", "-click_rate",
            "submission_rate", "-submission_rate",
            "report_rate", "-report_rate",
            "campaigns_participated", "-campaigns_participated",
        }
        if ordering in allowed:
            qs = qs.order_by(ordering)

        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = LeaderboardSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = LeaderboardSerializer(qs, many=True)
        return Response(serializer.data)


class EmployeeRiskSnapshotViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EmployeeRiskSnapshotSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return EmployeeRiskSnapshot.objects.filter(
            employee__organization=self.request.user.organization,
            employee_id=self.kwargs["employee_pk"],
        ).order_by("-snapshot_date")
