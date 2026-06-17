from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from apps.employees.models import Employee, EmployeeRiskSnapshot
from apps.employees.serializers import (
    EmployeeDetailSerializer,
    EmployeeListSerializer,
    EmployeeRiskSnapshotSerializer,
    EmployeeWriteSerializer,
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


class EmployeeRiskSnapshotViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EmployeeRiskSnapshotSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return EmployeeRiskSnapshot.objects.filter(
            employee__organization=self.request.user.organization,
            employee_id=self.kwargs["employee_pk"],
        ).order_by("-snapshot_date")
