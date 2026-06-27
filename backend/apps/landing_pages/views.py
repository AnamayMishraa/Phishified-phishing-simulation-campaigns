import logging

from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views import View

from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from apps.landing_pages.models import LandingPage
from apps.landing_pages.serializers import (
    LandingPageDetailSerializer,
    LandingPageListSerializer,
    LandingPageWriteSerializer,
)

logger = logging.getLogger(__name__)


class LandingPageViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    search_fields = ["name", "slug", "title"]
    ordering_fields = ["name", "category", "created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = LandingPage.objects.filter(
            organization=self.request.user.organization
        )

        if self.action == "list":
            qs = qs.filter(is_active=True)

        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)

        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return LandingPageListSerializer
        if self.action in ("create", "partial_update", "update"):
            return LandingPageWriteSerializer
        return LandingPageDetailSerializer

    def perform_create(self, serializer):
        serializer.save(
            organization=self.request.user.organization,
            created_by=self.request.user,
        )

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])


class PublicLandingPageView(View):
    def get(self, request, slug):
        page = get_object_or_404(LandingPage, slug=slug, is_active=True)
        return JsonResponse({
            "name": page.name,
            "slug": page.slug,
            "category": page.category,
            "html_content": page.html_content,
            "css_content": page.css_content,
        })
