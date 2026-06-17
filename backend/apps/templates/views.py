from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from apps.templates.models import EmailTemplate
from apps.templates.serializers import (
    TemplateDetailSerializer,
    TemplateListSerializer,
    TemplateWriteSerializer,
)


class TemplateViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    search_fields = ["name", "subject", "sender_name", "sender_email"]
    ordering_fields = ["name", "category", "difficulty_level", "created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = EmailTemplate.objects.filter(
            organization=self.request.user.organization
        )

        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)

        difficulty = self.request.query_params.get("difficulty_level")
        if difficulty:
            qs = qs.filter(difficulty_level=difficulty)

        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return TemplateListSerializer
        if self.action in ("create", "partial_update", "update"):
            return TemplateWriteSerializer
        return TemplateDetailSerializer

    def perform_create(self, serializer):
        serializer.save(
            organization=self.request.user.organization,
            created_by=self.request.user,
        )

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])
