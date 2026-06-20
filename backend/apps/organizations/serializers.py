from rest_framework import serializers

from apps.organizations.crypto import decrypt_value, encrypt_value
from apps.organizations.models import InfrastructureSetting


class InfrastructureSettingSerializer(serializers.ModelSerializer):
    smtp_password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
    )
    smtp_verified = serializers.BooleanField(read_only=True, default=False)
    landing_domain_verified = serializers.BooleanField(read_only=True, default=False)

    class Meta:
        model = InfrastructureSetting
        fields = [
            "id",
            "company_name",
            "sender_name",
            "sender_email",
            "landing_domain",
            "landing_domain_verified",
            "email_provider",
            "smtp_host",
            "smtp_port",
            "smtp_username",
            "smtp_password",
            "smtp_verified",
        ]
        read_only_fields = ["id"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.smtp_password_enc:
            try:
                data["smtp_password"] = "••••••••"
            except Exception:
                data["smtp_password"] = ""
        else:
            data["smtp_password"] = ""
        return data

    def update(self, instance, validated_data):
        raw_password = validated_data.pop("smtp_password", None)
        if raw_password:
            validated_data["smtp_password_enc"] = encrypt_value(raw_password)
        elif raw_password is not None and not raw_password:
            validated_data["smtp_password_enc"] = ""
        return super().update(instance, validated_data)

    def create(self, validated_data):
        raw_password = validated_data.pop("smtp_password", None)
        if raw_password:
            validated_data["smtp_password_enc"] = encrypt_value(raw_password)
        return super().create(validated_data)



