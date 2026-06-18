from rest_framework import serializers

from apps.landing_pages.models import LandingPage


class LandingPageListSerializer(serializers.ModelSerializer):
    category = serializers.CharField()

    class Meta:
        model = LandingPage
        fields = [
            "id",
            "name",
            "slug",
            "category",
            "is_active",
            "created_at",
        ]


class LandingPageDetailSerializer(serializers.ModelSerializer):
    category = serializers.CharField()
    difficulty_level = serializers.CharField()
    created_by_name = serializers.CharField(
        source="created_by.name", read_only=True, default=""
    )

    class Meta:
        model = LandingPage
        fields = [
            "id",
            "organization_id",
            "name",
            "slug",
            "category",
            "title",
            "html_content",
            "css_content",
            "difficulty_level",
            "is_active",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "organization_id", "created_at", "updated_at"]


class LandingPageWriteSerializer(serializers.ModelSerializer):
    category = serializers.ChoiceField(
        choices=LandingPage._meta.get_field("category").choices
    )
    difficulty_level = serializers.ChoiceField(
        choices=LandingPage._meta.get_field("difficulty_level").choices,
        required=False,
    )

    class Meta:
        model = LandingPage
        fields = [
            "id",
            "name",
            "slug",
            "category",
            "title",
            "html_content",
            "css_content",
            "difficulty_level",
            "is_active",
        ]
        read_only_fields = ["id"]
