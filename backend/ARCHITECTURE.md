# Phishified — Backend Architecture

## 1. Directory Structure

```
backend/
├── __init__.py                      # Celery app import
├── celery.py                        # Celery app definition
├── manage.py                        # Django management CLI
├── pyproject.toml                   # Project metadata + dependencies
├── .env.example                     # Environment variable template
├── config/
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py                  # Shared configuration (DRF, JWT, Celery, apps)
│   │   ├── development.py           # Dev overrides (SQLite, debug toolbar, eager Celery)
│   │   └── production.py            # Prod overrides (PostgreSQL, SMTP, HSTS)
│   ├── urls.py                      # Root URLconf
│   ├── wsgi.py                      # WSGI entry point
│   └── asgi.py                      # ASGI entry point
├── apps/
│   ├── __init__.py
│   ├── accounts/                    # Authentication & user management
│   ├── organizations/               # Multi-tenant org + department ref data
│   ├── employees/                   # Target employees, risk scoring, import
│   ├── templates/                   # Email templates (naming: Django HTML templates go elsewhere)
│   ├── landing_pages/               # Phishing landing pages
│   ├── campaigns/                   # Campaign lifecycle, assignments, activities
│   ├── training/                    # Courses, modules, enrollments, certificates
│   ├── reports/                     # Pre-computed report snapshots
│   ├── notifications/               # In-app notifications + preferences
│   └── audit/                       # Immutable compliance-grade audit trail
├── shared/                          # Cross-cutting utilities (enums, pagination, etc.)
├── requirements/
│   ├── base.txt                     # Production dependencies
│   ├── development.txt              # + dev tooling
│   └── production.txt               # + gunicorn, storages
├── static/                          # Collected static files
└── media/                           # User-uploaded files
```

---

## 2. Settings Structure

```
config/settings/
├── __init__.py          (empty)
├── base.py              Shared config across all environments
├── development.py       Dev: SQLite, debug toolbar, CORS open, eager Celery
└── production.py        Prod: PostgreSQL, SMTP, HSTS, env-driven secrets
```

| Setting | base.py | development.py | production.py |
|---------|---------|----------------|---------------|
| `DEBUG` | `False` | `True` | `False` |
| `DATABASES` | PostgreSQL config | SQLite `dev.db` | From `DATABASE_URL` env |
| `CORS` | Empty allowlist | `*` allowed | From `CORS_ALLOWED_ORIGINS` env |
| `EMAIL_BACKEND` | — | Console backend | SMTP (env-configurable) |
| `SECRET_KEY` | Placeholder | Inherited | From `DJANGO_SECRET_KEY` env |
| `CELERY_TASK_ALWAYS_EAGER` | — | `True` | `False` |
| Security (HSTS, SSL) | Off | Off | On |

Selection: `DJANGO_SETTINGS_MODULE=config.settings.development` (default in manage.py, wsgi, asgi, celery).

---

## 3. Shared/Common Modules (`backend/shared/`)

| Module | Purpose |
|--------|---------|
| `enums.py` | Centralized `TextChoices` — `UserRole`, `CampaignStatus`, `AssignmentStatus`, `AssignmentFunnelStep`, `Severity`, `NotificationCategory`, `ReportStatus`, `ActorType`, `RiskLevel` |
| `pagination.py` | Standard pagination envelope: `{ data, pagination: { page, page_size, total, total_pages } }` |
| `filters.py` | Custom filter backends (e.g. `CharInFilter` for `?status__in=a,b,c`) |
| `middleware.py` | `OrganizationMiddleware` (attaches `request.organization` from JWT claims), `RequestLoggingMiddleware` (logs slow requests) |
| `exceptions.py` | Custom exception hierarchy (`PhishifiedError`, `OrganizationMismatch`, `CampaignStateError`, `ImportError`) + DRF exception handler |

---

## 4. App Responsibilities

### accounts

| Aspect | Detail |
|--------|--------|
| Models | `User` (extends `AbstractUser`, email as username) |
| Responsibilities | Authentication (login/logout/refresh/password reset), authorization (role-based), user lifecycle (invite, activate, deactivate), JWT issuance with custom claims (`role`, `org_id`, `mfa_verified`) |
| Dependencies | `organizations` |

### organizations

| Models | `Organization`, `Department` |
| Responsibilities | Tenant lifecycle, org-level settings (`settings` JSONB), department reference data (canonical names for employee validation) |
| Dependencies | None (root tenant entity) |

### employees

| Models | `Employee`, `EmployeeRiskSnapshot` |
| Responsibilities | Employee lifecycle (create, import, deactivate), risk scoring (0–100 formula: open_rate × 0.15 + click_rate × 0.25 + submission_rate × 0.20 + training_inverse × 0.20 + repeat_offender × 0.15 − reporting_bonus), import pipeline (CSV → preview → validate → save), department validation against `departments` table (string field, app-level) |
| Dependencies | `organizations` |

### templates

| Models | `Template` |
| Responsibilities | Email template CRUD, variable substitution, category classification, usage tracking, landing page association |
| Dependencies | `organizations`, `landing_pages` |

### landing_pages

| Models | `LandingPage` |
| Responsibilities | Landing page CRUD, HTML content management, brand color theming, visitor/submission counter tracking |
| Dependencies | `organizations` |

### campaigns

| Models | `Campaign`, `CampaignAssignment` (partitioned by month), `CampaignActivity` (partitioned) |
| Responsibilities | Campaign lifecycle (draft → scheduled → running → completed → cancelled → archived), assignment creation on launch, event tracking (open/click/submit/report/bounce), denormalized counter aggregation, launch orchestration (sync validate + bulk-create → async Celery email send with Redis rate limiting) |
| Dependencies | `organizations`, `templates`, `landing_pages`, `accounts` (via `created_by`) |

### training

| Models | `TrainingCourse`, `TrainingModule`, `CourseEnrollment`, `Certificate` |
| Responsibilities | Course/module management, enrollment tracking (unique per employee × course), progress tracking (% complete), certificate issuance on completion (permanent, `ON DELETE SET NULL` on enrollment_id) |
| Dependencies | `organizations`, `employees` |

### reports

| Models | `Report` |
| Responsibilities | Report lifecycle (create → generate → download → archive), pre-computed snapshot storage (`report_data` JSONB), per-type generators (executive, department, comparison) |
| Dependencies | `organizations`, `accounts` (via `generated_by`) |

### audit

| Models | `AuditLog` (partitioned) |
| Responsibilities | Immutable compliance-grade event record, action namespacing (`campaign.launched`, `auth.login_failed`, etc.), retention policy enforcement (archiver cron), query interface for audit trail views |
| Dependencies | None (all FKs are UUID fields) |

### notifications

| Models | `Notification`, `NotificationPreference` |
| Responsibilities | In-app notification delivery, read/unread/dismissed lifecycle, preference-based filtering (per-category severity thresholds), badge dot count for UI header |
| Dependencies | `organizations`, `accounts`, `audit` |

---

## 5. Dependency Graph

```
organizations (no deps)
    │
    ├── accounts ───────────────→ organizations
    ├── employees ──────────────→ organizations
    ├── landing_pages ──────────→ organizations
    │     │
    │     └── templates ────────→ organizations, landing_pages
    │           │
    │           └── campaigns ──→ organizations, templates, landing_pages, accounts
    │                              (employees via UUID, no model dep)
    ├── training ───────────────→ organizations, employees
    ├── reports ────────────────→ organizations, accounts
    ├── audit (no deps) ←─────── called by all apps via services
    └── notifications ──────────→ organizations, accounts, audit
                                   (leaf — called by all apps via services)
```

Key rules:
- **No circular dependencies** — graph is a strict DAG
- `audit` depends on **nothing** (UUID-only FKs) — every app calls `audit.log_event()` downstream
- `campaigns` has **no model dependency** on `employees` (UUID fields, app-level enforcement per architecture decision)
- `notifications` is a **leaf** — depends on `audit` (FK) but no app depends on notifications at the model level
- Dependencies flow **one direction** — root (organizations) → middle (campaigns, training) → leaf (audit, notifications)

---

## 6. JWT Authentication

| Parameter | Value |
|-----------|-------|
| Library | `djangorestframework-simplejwt` |
| Access token | 30 minutes |
| Refresh token | 24 hours |
| Rotation | Rotate on every refresh |
| Blacklisting | Blacklist old refresh on rotation |
| Custom claims | `role`, `org_id`, `mfa_verified` |

---

## 7. Campaign Launch Flow (Sync + Async)

```
POST /campaigns/{id}/launch
  │
  ├── SYNC (<500ms)
  │   ├── Validate state (draft), template, employee IDs
  │   ├── TX: bulk-create assignments, update campaign → running
  │   ├── Audit log: campaign.launched
  │   ├── Redis lock (prevents double-launch)
  │   └── Enqueue Celery: send_campaign_emails
  │
  └── ASYNC (Celery × Redis rate limit)
      ├── Batch assignments (500/batch, 50/sec rate limit)
      ├── Render + send email per batch
      ├── Update assignment statuses + campaign counters
      └── Finalize: recalculate rates, audit log, notify creator
```

---

## 8. Employee Risk Score

| Input | Weight |
|-------|--------|
| Open rate | 15% (positive) |
| Click rate | 25% (positive) |
| Credential submission rate | 20% (positive) |
| Training completion | 20% (inverse) |
| Repeat offender count | 15% (positive) |
| Reporting behavior | −15 max (bonus) |

`risk_score = clamp(Σ(weight × subscore) − reporting_bonus, 0, 100)`

Levels: Secure (0–30) | Medium Risk (31–60) | High Risk (61–100)

Recalculation triggers: assignment status change → clicked/submitted/reported, course completion, nightly cron (2 AM), manual admin action.

---

## 9. PostgreSQL Design Summary

| Table | Strategy |
|-------|----------|
| `campaign_assignments` | Partitioned by `assigned_month` (RANGE), BIGSERIAL PK, no DB-level FKs |
| `campaign_activities` | Partitioned by `created_at` (RANGE), no DB-level FKs |
| `audit_logs` | Partitioned by `created_at` (RANGE), no DB-level FKs |
| All other tables | Standard UUID PK, DB-level FKs with `ON DELETE CASCADE` or `SET NULL` |
