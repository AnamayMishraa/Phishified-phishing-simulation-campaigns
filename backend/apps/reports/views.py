from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from apps.reports.models import Report
from apps.reports.serializers import ReportDetailSerializer, ReportListSerializer


class ReportViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "status", "generated_at"]
    ordering = ["-generated_at"]

    def get_queryset(self):
        qs = Report.objects.filter(
            organization=self.request.user.organization,
        )

        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)

        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return ReportListSerializer
        return ReportDetailSerializer
