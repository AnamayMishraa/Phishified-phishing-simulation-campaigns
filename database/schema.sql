-- ============================================================================
-- Phishified — PostgreSQL Schema
-- Architecture review applied: see database/ARCHITECTURE_REVIEW.md for decisions
-- ============================================================================

-- ============================================================================
-- CUSTOM ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM (
  'admin', 'analyst', 'viewer'
);

CREATE TYPE campaign_status AS ENUM (
  'draft', 'scheduled', 'running', 'completed', 'cancelled', 'archived'
);

CREATE TYPE assignment_funnel_step AS ENUM (
  'bounced', 'submitted', 'clicked', 'opened', 'sent', 'pending'
);

CREATE TYPE assignment_status AS ENUM (
  'pending', 'sent', 'opened', 'clicked', 'submitted', 'reported', 'bounced'
);

CREATE TYPE severity AS ENUM (
  'info', 'warning', 'error', 'critical'
);

CREATE TYPE notification_category AS ENUM (
  'campaign', 'report', 'employee', 'training', 'auth', 'system', 'alert'
);

CREATE TYPE report_status AS ENUM (
  'generating', 'completed', 'failed'
);

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================

CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(100) NOT NULL,
  domain        VARCHAR(255),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  settings      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_organizations_slug ON organizations (slug);

-- ============================================================================
-- DEPARTMENTS
-- Reference table for canonical department names per organization.
-- The employees.department column remains a string (no FK join on hot path).
-- This table provides validation, filter dropdowns, rename operations,
-- and department-level configuration (risk thresholds, training targets).
-- ============================================================================

CREATE TABLE departments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name              VARCHAR(255) NOT NULL,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (organization_id, name)
);

CREATE INDEX idx_departments_org ON departments (organization_id);

-- ============================================================================
-- USERS
-- ============================================================================

CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email             VARCHAR(255) NOT NULL,
  name              VARCHAR(255) NOT NULL,
  role              user_role NOT NULL DEFAULT 'viewer',
  is_active         BOOLEAN NOT NULL DEFAULT true,
  last_login_at     TIMESTAMPTZ,
  preferences       JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_org_email ON users (organization_id, email);
CREATE INDEX idx_users_org_role ON users (organization_id, role);

-- ============================================================================
-- EMPLOYEES
-- department is a string validated against departments table at app layer.
-- ============================================================================

CREATE TABLE employees (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email             VARCHAR(255) NOT NULL,
  name              VARCHAR(255) NOT NULL,
  department        VARCHAR(255) NOT NULL DEFAULT '',
  job_title         VARCHAR(255) DEFAULT '',
  risk_score        INTEGER NOT NULL DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
  risk_level        VARCHAR(20) NOT NULL DEFAULT 'low',
  is_active         BOOLEAN NOT NULL DEFAULT true,
  imported_at       TIMESTAMPTZ,
  metadata          JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_employees_org_email ON employees (organization_id, email);
CREATE INDEX idx_employees_org_dept ON employees (organization_id, department);
CREATE INDEX idx_employees_org_risk ON employees (organization_id, risk_score DESC);
CREATE INDEX idx_employees_org_active ON employees (organization_id, is_active)
  WHERE is_active = true;

-- ============================================================================
-- LANDING PAGES
-- Defined BEFORE templates to satisfy FK dependency.
-- ============================================================================

CREATE TABLE landing_pages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name              VARCHAR(255) NOT NULL,
  category          VARCHAR(100) NOT NULL DEFAULT 'login',
  page_content      TEXT NOT NULL DEFAULT '',
  brand_color       VARCHAR(7) DEFAULT '#2563eb',
  domain            VARCHAR(255),
  is_active         BOOLEAN NOT NULL DEFAULT true,
  visitor_count     INTEGER NOT NULL DEFAULT 0,
  submission_count  INTEGER NOT NULL DEFAULT 0,
  field_count       INTEGER NOT NULL DEFAULT 0,
  use_count         INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_landing_pages_org ON landing_pages (organization_id);
CREATE INDEX idx_landing_pages_org_category ON landing_pages (organization_id, category);

-- ============================================================================
-- TEMPLATES
-- ============================================================================

CREATE TABLE templates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name              VARCHAR(255) NOT NULL,
  category          VARCHAR(100) NOT NULL DEFAULT 'general',
  subject           VARCHAR(255) NOT NULL,
  sender_name       VARCHAR(255) NOT NULL,
  sender_email      VARCHAR(255) NOT NULL,
  email_body        TEXT NOT NULL,
  landing_page_id   UUID REFERENCES landing_pages(id) ON DELETE SET NULL,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  use_count         INTEGER NOT NULL DEFAULT 0,
  success_rate      NUMERIC(5,2) DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_templates_org ON templates (organization_id);
CREATE INDEX idx_templates_org_category ON templates (organization_id, category);

-- ============================================================================
-- CAMPAIGNS
-- Denormalized counters updated via triggers or app layer on assignment
-- status changes to avoid aggregate queries on campaign_assignments.
-- ============================================================================

CREATE TABLE campaigns (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name              VARCHAR(255) NOT NULL,
  description       TEXT DEFAULT '',
  status            campaign_status NOT NULL DEFAULT 'draft',
  template_id       UUID REFERENCES templates(id) ON DELETE SET NULL,
  landing_page_id   UUID REFERENCES landing_pages(id) ON DELETE SET NULL,

  -- Target configuration (denormalized for quick reference)
  target_department VARCHAR(255),
  target_count      INTEGER NOT NULL DEFAULT 0,
  scheduled_at      TIMESTAMPTZ,
  launched_at       TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,

  -- Denormalized counters (updated via triggers on campaign_assignments)
  sent_count        INTEGER NOT NULL DEFAULT 0,
  opened_count      INTEGER NOT NULL DEFAULT 0,
  clicked_count     INTEGER NOT NULL DEFAULT 0,
  submitted_count   INTEGER NOT NULL DEFAULT 0,
  reported_count    INTEGER NOT NULL DEFAULT 0,
  bounced_count     INTEGER NOT NULL DEFAULT 0,
  open_rate         NUMERIC(5,2) DEFAULT 0,
  click_rate        NUMERIC(5,2) DEFAULT 0,
  submission_rate   NUMERIC(5,2) DEFAULT 0,

  created_by        UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaigns_org ON campaigns (organization_id);
CREATE INDEX idx_campaigns_org_status ON campaigns (organization_id, status);
CREATE INDEX idx_campaigns_org_created ON campaigns (organization_id, created_at DESC);
-- Partial index for active campaigns (common filter on dashboard)
CREATE INDEX idx_campaigns_active ON campaigns (organization_id, status)
  WHERE status IN ('running', 'scheduled');

-- ============================================================================
-- CAMPAIGN ASSIGNMENTS (Large Table)
-- Monthly range partitioning on assigned_month.
-- No DB-level foreign keys — application-level enforcement.
-- ============================================================================

CREATE TABLE campaign_assignments (
  id                BIGSERIAL,
  organization_id   UUID NOT NULL,
  campaign_id       UUID NOT NULL,
  employee_id       UUID NOT NULL,

  -- Stored status set by app layer at event time.
  -- Handles orthogonal display logic: reported overrides clicked.
  -- See also funnel_step (generated) for analytics queries.
  status            assignment_status NOT NULL DEFAULT 'pending',

  -- Per-event timestamps (each set once when the corresponding event fires)
  sent_at           TIMESTAMPTZ,
  opened_at         TIMESTAMPTZ,
  clicked_at        TIMESTAMPTZ,
  submitted_at      TIMESTAMPTZ,
  reported_at       TIMESTAMPTZ,
  bounced_at        TIMESTAMPTZ,

  -- Analytics-optimized funnel step derived from immutable timestamps.
  -- This column never drifts from event timestamps and is indexable.
  -- reported_at is NOT part of the funnel — reporting is a positive
  -- behavioral outcome orthogonal to the engagement progression.
  funnel_step       assignment_funnel_step
                      GENERATED ALWAYS AS (
                        CASE
                          WHEN bounced_at    IS NOT NULL THEN 'bounced'::assignment_funnel_step
                          WHEN submitted_at IS NOT NULL THEN 'submitted'
                          WHEN clicked_at   IS NOT NULL THEN 'clicked'
                          WHEN opened_at    IS NOT NULL THEN 'opened'
                          WHEN sent_at      IS NOT NULL THEN 'sent'
                          ELSE 'pending'
                        END
                      ) STORED,

  -- Metadata captured at interaction time
  device_info       JSONB,
  ip_address        INET,
  user_agent        TEXT,
  email_opened_at   TIMESTAMPTZ,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Partition key
  assigned_month    DATE NOT NULL DEFAULT DATE_TRUNC('month', NOW()),

  PRIMARY KEY (assigned_month, id, campaign_id)
) PARTITION BY RANGE (assigned_month);

-- Child partitions created monthly by cron/pg_partman
-- Example:
--   CREATE TABLE campaign_assignments_2026_01
--     PARTITION OF campaign_assignments
--     FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
--   CREATE TABLE campaign_assignments_2026_02
--     PARTITION OF campaign_assignments
--     FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- Covering index: most common query — assignments for campaign X filtered by status
CREATE INDEX idx_ca_campaign_status
  ON campaign_assignments (organization_id, campaign_id, status, employee_id)
  INCLUDE (clicked_at, submitted_at, reported_at);

-- Covering index: employee campaign history (default query = last 12 months)
CREATE INDEX idx_ca_employee_history
  ON campaign_assignments (organization_id, employee_id, campaign_id)
  INCLUDE (status, clicked_at, submitted_at);

-- Partial index for pending/sent assignments (active targets, small working set)
CREATE INDEX idx_ca_active
  ON campaign_assignments (organization_id, campaign_id)
  WHERE status IN ('pending', 'sent');

-- Fast aggregation per campaign
CREATE INDEX idx_ca_agg_campaign
  ON campaign_assignments (campaign_id, status)
  INCLUDE (id);

-- ============================================================================
-- CAMPAIGN ACTIVITIES
-- Append-only log per campaign. No DB-level FKs — too many partitions.
-- ============================================================================

CREATE TABLE campaign_activities (
  id                BIGSERIAL,
  organization_id   UUID NOT NULL,
  campaign_id       UUID NOT NULL,
  assignment_id     BIGINT,
  employee_id       UUID,
  action            VARCHAR(100) NOT NULL,
  description       TEXT,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (created_at, id)
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_ca_act_campaign ON campaign_activities (campaign_id, created_at DESC);
CREATE INDEX idx_ca_act_org_time ON campaign_activities (organization_id, created_at DESC);

-- ============================================================================
-- TRAINING COURSES
-- ============================================================================

CREATE TABLE training_courses (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title                 VARCHAR(255) NOT NULL,
  description           TEXT DEFAULT '',
  category              VARCHAR(100) NOT NULL DEFAULT 'security_awareness',
  difficulty            VARCHAR(20) NOT NULL DEFAULT 'beginner',
  duration_minutes      INTEGER NOT NULL DEFAULT 0,
  instructor            VARCHAR(255) DEFAULT '',
  skills                TEXT[] DEFAULT '{}',
  is_published          BOOLEAN NOT NULL DEFAULT false,
  certificate_available BOOLEAN NOT NULL DEFAULT false,
  enrollment_count      INTEGER NOT NULL DEFAULT 0,
  completion_rate       NUMERIC(5,2) DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_training_org ON training_courses (organization_id);
CREATE INDEX idx_training_org_category ON training_courses (organization_id, category);

-- ============================================================================
-- TRAINING MODULES
-- ============================================================================

CREATE TABLE training_modules (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id         UUID NOT NULL REFERENCES training_courses(id) ON DELETE CASCADE,
  title             VARCHAR(255) NOT NULL,
  description       TEXT DEFAULT '',
  content_type      VARCHAR(50) NOT NULL DEFAULT 'video',
  content_url       TEXT,
  duration_minutes  INTEGER NOT NULL DEFAULT 0,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  is_required       BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_training_modules_course ON training_modules (course_id, sort_order);

-- ============================================================================
-- COURSE ENROLLMENTS
-- ============================================================================

CREATE TABLE course_enrollments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  course_id         UUID NOT NULL REFERENCES training_courses(id) ON DELETE CASCADE,
  status            VARCHAR(20) NOT NULL DEFAULT 'enrolled',
  progress_pct      NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  started_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (employee_id, course_id)
);

CREATE INDEX idx_course_enrollments_org ON course_enrollments (organization_id);
CREATE INDEX idx_course_enrollments_employee ON course_enrollments (employee_id);
CREATE INDEX idx_course_enrollments_course_status ON course_enrollments (course_id, status);

-- ============================================================================
-- CERTIFICATES
-- enrollment_id uses ON DELETE SET NULL so re-enrollment never destroys a
-- certificate record. Certificates are permanent compliance documents.
-- ============================================================================

CREATE TABLE certificates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  course_id         UUID NOT NULL REFERENCES training_courses(id) ON DELETE CASCADE,
  enrollment_id     UUID REFERENCES course_enrollments(id) ON DELETE SET NULL,
  issued_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  certificate_url   TEXT,
  metadata          JSONB DEFAULT '{}',

  UNIQUE (employee_id, course_id)
);

CREATE INDEX idx_certificates_org ON certificates (organization_id);
CREATE INDEX idx_certificates_employee ON certificates (employee_id);

-- ============================================================================
-- REPORTS
-- report_data stores pre-computed snapshot data at generation time.
-- ============================================================================

CREATE TABLE reports (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title             VARCHAR(255) NOT NULL,
  report_type       VARCHAR(100) NOT NULL,
  status            report_status NOT NULL DEFAULT 'generating',

  -- Query configuration
  date_range        DATERANGE NOT NULL,
  campaign_ids      UUID[] DEFAULT '{}',
  department_filter VARCHAR(255),

  -- Snapshot data (pre-computed at generation time)
  report_data       JSONB NOT NULL DEFAULT '{}',

  generated_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  generated_at      TIMESTAMPTZ,
  downloaded_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_org ON reports (organization_id);
CREATE INDEX idx_reports_org_type ON reports (organization_id, report_type);
CREATE INDEX idx_reports_org_created ON reports (organization_id, created_at DESC);
CREATE INDEX idx_reports_daterange ON reports USING gist (organization_id, date_range);

-- ============================================================================
-- AUDIT LOGS
-- Partitioned by month. organization_id is nullable for pre-auth events.
-- No DB-level FK on organization_id — insert path is too hot; enforcement
-- is handled at the application layer plus nightly reconciliation.
-- ============================================================================

CREATE TABLE audit_logs (
  id                UUID NOT NULL DEFAULT gen_random_uuid(),
  organization_id   UUID,
  actor_id          UUID,
  actor_type        VARCHAR(20) NOT NULL DEFAULT 'user',
  action            VARCHAR(255) NOT NULL,
  entity_type       VARCHAR(100),
  entity_id         UUID,
  entity_display    VARCHAR(255),
  changes           JSONB,
  context           JSONB NOT NULL DEFAULT '{}',
  severity          severity NOT NULL DEFAULT 'info',
  outcome           VARCHAR(20) NOT NULL DEFAULT 'success',
  failure_reason    TEXT,
  retain_until      DATE NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (created_at, id)
) PARTITION BY RANGE (created_at);

-- Multi-tenant feed: most recent events per org (excludes pre-auth)
CREATE INDEX idx_audit_org_time ON audit_logs (organization_id, created_at DESC)
  WHERE organization_id IS NOT NULL;

-- Filter by action type within an org
CREATE INDEX idx_audit_org_action ON audit_logs (organization_id, action, created_at DESC)
  WHERE organization_id IS NOT NULL;

-- "What did this user do?" — user action history
CREATE INDEX idx_audit_org_actor ON audit_logs (organization_id, actor_id, created_at DESC)
  WHERE organization_id IS NOT NULL;

-- Entity history lookups (multi-tenant safe — leads with org_id)
-- Pre-auth events (org_id IS NULL) get a separate index below.
CREATE INDEX idx_audit_entity ON audit_logs (organization_id, entity_type, entity_id, created_at DESC);

-- Pre-auth entity lookups (small subset, separated from main index)
CREATE INDEX idx_audit_entity_preauth ON audit_logs (entity_type, entity_id, created_at DESC)
  WHERE organization_id IS NULL;

-- Archiver sweep: plain index with no volatile WHERE clause
CREATE INDEX idx_audit_retain ON audit_logs (retain_until);

-- Critical/error/warning alert feed
CREATE INDEX idx_audit_severity ON audit_logs (organization_id, severity, created_at DESC)
  WHERE organization_id IS NOT NULL AND severity IN ('warning', 'error', 'critical');

-- ============================================================================
-- NOTIFICATIONS
-- organization_id has DB-level FK because volume is low.
-- ============================================================================

CREATE TABLE notifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  recipient_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  audit_log_id      UUID REFERENCES audit_logs(id) ON DELETE SET NULL,
  title             VARCHAR(255) NOT NULL,
  body              TEXT,
  category          notification_category NOT NULL,
  severity          severity NOT NULL DEFAULT 'info',
  entity_type       VARCHAR(100),
  entity_id         UUID,
  entity_display    VARCHAR(255),
  entity_route      VARCHAR(500),
  context           JSONB DEFAULT '{}',
  read_at           TIMESTAMPTZ,
  dismissed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Badge dot count: unread + not dismissed
CREATE INDEX idx_notif_unread ON notifications (recipient_id)
  WHERE read_at IS NULL AND dismissed_at IS NULL;

-- Dropdown feed: most recent undismissed
CREATE INDEX idx_notif_feed ON notifications (recipient_id, created_at DESC)
  WHERE dismissed_at IS NULL;

-- History view: all notifications for a user
CREATE INDEX idx_notif_history ON notifications (recipient_id, created_at DESC);

-- Auto-dismiss sweep: read but not yet dismissed
CREATE INDEX idx_notif_autodismiss ON notifications (created_at)
  WHERE read_at IS NOT NULL AND dismissed_at IS NULL;

-- ============================================================================
-- NOTIFICATION PREFERENCES
-- ============================================================================

CREATE TABLE notification_preferences (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category          notification_category NOT NULL,
  min_severity      severity NOT NULL DEFAULT 'info',
  in_app            BOOLEAN NOT NULL DEFAULT true,
  email             BOOLEAN NOT NULL DEFAULT false,

  UNIQUE (user_id, organization_id, category)
);

CREATE INDEX idx_notif_prefs_user ON notification_preferences (user_id);
