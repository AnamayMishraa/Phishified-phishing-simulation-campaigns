from django.utils import timezone

from rest_framework import filters, viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.training.models import Course, TrainingEnrollment
from apps.training.serializers import (
    CourseDetailSerializer,
    CourseListSerializer,
    TrainingEnrollmentSerializer,
)


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "category", "difficulty_level", "created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = Course.objects.filter(
            organization=self.request.user.organization,
            is_active=True,
        )

        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)

        difficulty = self.request.query_params.get("difficulty_level")
        if difficulty:
            qs = qs.filter(difficulty_level=difficulty)

        return qs.prefetch_related("modules", "enrollments")

    def get_serializer_class(self):
        if self.action == "list":
            return CourseListSerializer
        return CourseDetailSerializer


class EnrollmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TrainingEnrollmentSerializer

    def get_queryset(self):
        return TrainingEnrollment.objects.filter(
            employee__organization=self.request.user.organization
        ).select_related("employee", "course")

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        enrollment = self.get_object()
        enrollment.completed_at = timezone.now()
        enrollment.save(update_fields=["completed_at"])
        return Response(
            TrainingEnrollmentSerializer(enrollment).data,
            status=status.HTTP_200_OK,
        )
