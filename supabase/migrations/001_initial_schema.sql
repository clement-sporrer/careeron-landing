-- Enterprise lead magnet submissions
CREATE TABLE enterprise_leads (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  email      TEXT        NOT NULL,
  data       JSONB       NOT NULL DEFAULT '{}',
  source     TEXT
);

-- Student lead magnet submissions
CREATE TABLE student_leads (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  email      TEXT        NOT NULL,
  data       JSONB       NOT NULL DEFAULT '{}',
  source     TEXT
);

-- Pre-Cal form: stored before redirect so data is never lost
CREATE TABLE booking_intents (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT now(),
  email           TEXT,
  school          TEXT,
  role            TEXT,
  meeting_type    TEXT        NOT NULL CHECK (meeting_type IN ('enterprise', 'founders')),
  cal_booking_uid TEXT,
  status          TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'booked', 'cancelled')),
  completed_at    TIMESTAMPTZ
);

-- Enable RLS — API uses service key so these policies only protect direct client access
ALTER TABLE enterprise_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_leads    ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_intents  ENABLE ROW LEVEL SECURITY;
