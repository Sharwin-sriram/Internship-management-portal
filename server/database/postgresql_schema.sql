-- PostgreSQL reference schema for Interview Management
-- The running API uses MongoDB (Mongoose). Use this if migrating to PostgreSQL.

CREATE TYPE interview_type AS ENUM ('phone', 'video', 'in-person');
CREATE TYPE interview_status AS ENUM (
  'pending', 'scheduled', 'accepted', 'declined',
  'reschedule_requested', 'rescheduled', 'completed', 'cancelled'
);
CREATE TYPE round_outcome AS ENUM ('pending', 'passed', 'failed', 'skipped');
CREATE TYPE recommendation_type AS ENUM (
  'strong_hire', 'hire', 'neutral', 'no_hire', 'strong_no_hire'
);
CREATE TYPE notification_channel AS ENUM ('email', 'in_app', 'sms');
CREATE TYPE calendar_provider AS ENUM ('google');
CREATE TYPE calendar_sync_status AS ENUM ('pending', 'synced', 'failed');

CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  scheduled_by UUID REFERENCES users(id),
  round_number INTEGER NOT NULL DEFAULT 1 CHECK (round_number >= 1),
  scheduled_at TIMESTAMPTZ NOT NULL,
  interview_date DATE,
  interview_time VARCHAR(10),
  interview_type interview_type NOT NULL,
  interviewer_id UUID REFERENCES users(id),
  meeting_link TEXT DEFAULT '',
  instructions TEXT DEFAULT '',
  status interview_status NOT NULL DEFAULT 'pending',
  reschedule_reason TEXT DEFAULT '',
  reschedule_requested_at TIMESTAMPTZ,
  invitation_sent_at TIMESTAMPTZ,
  reminder_24h_sent BOOLEAN DEFAULT FALSE,
  reminder_1h_sent BOOLEAN DEFAULT FALSE,
  google_event_id VARCHAR(255) DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interviews_student_scheduled ON interviews(student_id, scheduled_at);
CREATE INDEX idx_interviews_interviewer_scheduled ON interviews(interviewer_id, scheduled_at);
CREATE INDEX idx_interviews_company_scheduled ON interviews(company_id, scheduled_at);
CREATE INDEX idx_interviews_application ON interviews(application_id);

CREATE TABLE interview_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL CHECK (round_number >= 1),
  outcome round_outcome NOT NULL DEFAULT 'pending',
  advanced_by UUID REFERENCES users(id),
  advanced_at TIMESTAMPTZ,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (application_id, round_number)
);

CREATE TABLE interview_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL UNIQUE REFERENCES interviews(id) ON DELETE CASCADE,
  interviewer_id UUID NOT NULL REFERENCES users(id),
  technical_skills NUMERIC(4,2) NOT NULL CHECK (technical_skills BETWEEN 0 AND 10),
  communication NUMERIC(4,2) NOT NULL CHECK (communication BETWEEN 0 AND 10),
  problem_solving NUMERIC(4,2) NOT NULL CHECK (problem_solving BETWEEN 0 AND 10),
  confidence NUMERIC(4,2) NOT NULL CHECK (confidence BETWEEN 0 AND 10),
  comments TEXT DEFAULT '',
  recommendation recommendation_type NOT NULL,
  rubric_scores JSONB DEFAULT '{}',
  released_to_student BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) DEFAULT '',
  message TEXT DEFAULT '',
  action_url TEXT DEFAULT '',
  event_type VARCHAR(100) NOT NULL,
  payload JSONB DEFAULT '{}',
  channel notification_channel DEFAULT 'in_app',
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);

CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  provider calendar_provider DEFAULT 'google',
  external_event_id VARCHAR(255) DEFAULT '',
  calendar_id VARCHAR(255) DEFAULT 'primary',
  sync_status calendar_sync_status DEFAULT 'pending',
  html_link TEXT DEFAULT '',
  raw_response JSONB,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calendar_events_interview ON calendar_events(interview_id);
