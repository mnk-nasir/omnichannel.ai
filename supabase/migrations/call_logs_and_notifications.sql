-- ============================================================
-- Migration: call_logs_and_notifications.sql
-- Description: Adds call_logs table, notifications table,
-- and a low-credit trigger.
-- Run this once in Supabase SQL editor.
-- ============================================================

-- 1. Call Logs Table
CREATE TABLE IF NOT EXISTS call_logs (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  vapi_call_id     TEXT        NOT NULL UNIQUE,
  type             TEXT        NOT NULL, -- 'inboundPhoneCall' | 'outboundPhoneCall'
  status           TEXT        NOT NULL, -- 'ended', 'completed', 'failed', 'missed', etc.
  phone_number     TEXT        NOT NULL, -- Customer or Caller phone number
  started_at       TIMESTAMPTZ,
  ended_at         TIMESTAMPTZ,
  duration         NUMERIC     DEFAULT 0,
  cost             NUMERIC     DEFAULT 0,
  recording_url    TEXT,
  transcript       TEXT,
  summary          TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_logs_business_id ON call_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_vapi_call_id ON call_logs(vapi_call_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_created_at  ON call_logs(created_at DESC);

-- 2. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title            TEXT        NOT NULL,
  message          TEXT        NOT NULL,
  type             TEXT        NOT NULL DEFAULT 'info', -- 'info' | 'warning' | 'error' | 'success'
  read_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_business_id ON notifications(business_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at  ON notifications(created_at DESC);

-- 3. Row Level Security (RLS)
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "call_logs_own_business" ON call_logs
  FOR SELECT USING (
    business_id IN (
      SELECT business_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "notifications_own_business" ON notifications
  FOR SELECT USING (
    business_id IN (
      SELECT business_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Update Policy to mark notifications as read
CREATE POLICY "notifications_update_own_business" ON notifications
  FOR UPDATE USING (
    business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
  ) WITH CHECK (
    business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
  );

-- 4. Automatically trigger low-credit notification in decrement_credits
CREATE OR REPLACE FUNCTION decrement_credits(
  p_business_id UUID,
  p_amount      NUMERIC
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance   NUMERIC;
  v_used      NUMERIC;
  v_plan_limit NUMERIC;
  v_plan      TEXT;
BEGIN
  -- 1. Deduct credits
  UPDATE businesses
  SET
    credits_balance = GREATEST(credits_balance - p_amount, 0),
    credits_used    = credits_used + p_amount
  WHERE id = p_business_id
  RETURNING credits_balance, credits_used, plan INTO v_balance, v_used, v_plan;

  -- 2. Determine base limits (simple approximation mapped from gateway logic)
  IF v_plan = 'free' THEN v_plan_limit := 200;
  ELSIF v_plan = 'starter' THEN v_plan_limit := 1000;
  ELSIF v_plan = 'growth' THEN v_plan_limit := 5000;
  ELSIF v_plan = 'agency' THEN v_plan_limit := 20000;
  ELSE v_plan_limit := 200; END IF;

  -- 3. Alert if balance is low (e.g. <= 10% of limit or <= 20 credits)
  -- BUT only if we haven't warned them in the last 24 hours.
  IF v_balance <= LEAST(v_plan_limit * 0.1, 20.0) THEN
    IF NOT EXISTS (
      SELECT 1 FROM notifications 
      WHERE business_id = p_business_id 
        AND type = 'warning' 
        AND title = 'Low Credits Alert' 
        AND created_at > NOW() - INTERVAL '24 hours'
    ) THEN
      INSERT INTO notifications (business_id, title, message, type)
      VALUES (
        p_business_id, 
        'Low Credits Alert', 
        'Your AI credits balance is running critically low. Please top up to avoid interruptions to your active operations.', 
        'warning'
      );
    END IF;
  END IF;
  
  -- 4. Alert on depletion
  IF v_balance = 0 AND p_amount > 0 THEN
    IF NOT EXISTS (
      SELECT 1 FROM notifications 
      WHERE business_id = p_business_id 
        AND type = 'error' 
        AND title = 'Credits Depleted' 
        AND created_at > NOW() - INTERVAL '24 hours'
    ) THEN
      INSERT INTO notifications (business_id, title, message, type)
      VALUES (
        p_business_id, 
        'Credits Depleted', 
        'Your AI credits balance is 0. All AI chat, voice, and campaign operations have been halted.', 
        'error'
      );
    END IF;
  END IF;

END;
$$;
