from rest_framework import serializers

from apps.templates.models import EmailTemplate


class TemplateListSerializer(serializers.ModelSerializer):
    category = serializers.CharField()
    difficulty_level = serializers.CharField()

    class Meta:
        model = EmailTemplate
        fields = [
            "id",
            "name",
            "category",
            "difficulty_level",
            "subject",
            "sender_name",
            "is_active",
            "created_at",
        ]


class TemplateDetailSerializer(serializers.ModelSerializer):
    category = serializers.CharField()
    difficulty_level = serializers.CharField()
    created_by_name = serializers.CharField(
        source="created_by.name", read_only=True, default=""
    )

    class Meta:
        model = EmailTemplate
        fields = [
            "id",
            "organization_id",
            "name",
            "category",
            "subject",
            "sender_name",
            "sender_email",
            "html_content",
            "plain_text_content",
            "difficulty_level",
            "tags",
            "is_active",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "organization_id", "created_at", "updated_at"]


class TemplateWriteSerializer(serializers.ModelSerializer):
    category = serializers.ChoiceField(choices=EmailTemplate._meta.get_field("category").choices)
    difficulty_level = serializers.ChoiceField(
        choices=EmailTemplate._meta.get_field("difficulty_level").choices
    )

    class Meta:
        model = EmailTemplate
        fields = [
            "id",
            "name",
            "category",
            "subject",
            "sender_name",
            "sender_email",
            "html_content",
            "plain_text_content",
            "difficulty_level",
            "tags",
            "is_active",
        ]
        read_only_fields = ["id"]
