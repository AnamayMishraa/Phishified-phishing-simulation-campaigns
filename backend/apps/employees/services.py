from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from django.db import transaction
from django.utils import timezone

from apps.employees.models import Employee, EmployeeRiskSnapshot, RiskLevel

if TYPE_CHECKING:
    from apps.campaigns.models import Campaign

logger = logging.getLogger(__name__)

RISK_RULES: dict[str, int] = {
    "open": 10,
    "click": 30,
    "submit": 60,
    "report": -20,
}


class RiskService:
    @staticmethod
    def on_open(employee: Employee, campaign: Campaign) -> None:
        RiskService._update_risk(
            employee,
            delta=RISK_RULES["open"],
            reason=f"Opened phishing email in campaign '{campaign.name}'",
        )

    @staticmethod
    def on_click(employee: Employee, campaign: Campaign) -> None:
        RiskService._update_risk(
            employee,
            delta=RISK_RULES["click"],
            reason=f"Clicked phishing link in campaign '{campaign.name}'",
        )

    @staticmethod
    def on_submit(employee: Employee, campaign: Campaign) -> None:
        RiskService._update_risk(
            employee,
            delta=RISK_RULES["submit"],
            reason=f"Submitted credentials in campaign '{campaign.name}'",
        )

    @staticmethod
    def on_report(employee: Employee) -> None:
        RiskService._update_risk(
            employee,
            delta=RISK_RULES["report"],
            reason="Reported phishing email",
        )

    @staticmethod
    def _get_risk_level(score: int) -> str:
        if score >= 81:
            return RiskLevel.CRITICAL
        if score >= 51:
            return RiskLevel.HIGH
        if score >= 21:
            return RiskLevel.MEDIUM
        return RiskLevel.LOW

    @staticmethod
    @transaction.atomic
    def _update_risk(employee: Employee, delta: int, reason: str) -> None:
        old_score = employee.risk_score
        new_score = max(0, min(100, old_score + delta))
        new_level = RiskService._get_risk_level(new_score)

        employee.risk_score = new_score
        employee.risk_level = new_level
        employee.save(update_fields=["risk_score", "risk_level", "updated_at"])

        EmployeeRiskSnapshot.objects.create(
            employee=employee,
            risk_score=new_score,
            risk_level=new_level,
            factors={
                "delta": delta,
                "previous_score": old_score,
            },
            trigger_reason=reason,
            snapshot_date=timezone.now().date(),
        )

        logger.info(
            "Risk update for employee %s %s: %d → %d (%s) — %s",
            employee.first_name,
            employee.last_name,
            old_score,
            new_score,
            new_level,
            reason,
        )
