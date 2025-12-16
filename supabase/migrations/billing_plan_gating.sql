-- ============================================================
-- Migration: billing_plan_gating.sql
-- Run this once in Supabase SQL editor.
-- ============================================================

-- 1. Add plan & credits columns to businesses table (if not already present)
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS plan            TEXT    NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS credits_balance NUMERIC NOT NULL DEFAULT 200,
  ADD COLUMN IF NOT EXISTS credits_used    NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;

-- 2. Ensure usage_logs table exists with correct schema
CREATE TABLE IF NOT EXISTS usage_logs (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  type             TEXT        NOT NULL,          -- 'chat' | 'voice' | 'campaign' | 'rag'
  credits_deducted NUMERIC     NOT NULL DEFAULT 1,
  meta             JSONB       DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_business_id ON usage_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at  ON usage_logs(created_at DESC);

-- 3. Atomic decrement_credits RPC (prevents race conditions)
CREATE OR REPLACE FUNCTION decrement_credits(
  p_business_id UUID,
  p_amount      NUMERIC
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE businesses
  SET
    credits_balance = GREATEST(credits_balance - p_amount, 0),
    credits_used    = credits_used + p_amount
  WHERE id = p_business_id;
END;
$$;

-- 4. RPC to add (top-up) credits
CREATE OR REPLACE FUNCTION add_credits(
  p_business_id UUID,
  p_amount      NUMERIC,
  p_plan        TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE businesses
  SET
    credits_balance = credits_balance + p_amount,
    plan            = COALESCE(p_plan, plan),
    plan_expires_at = NOW() + INTERVAL '30 days'
  WHERE id = p_business_id;
END;
$$;

-- 5. Function to check if a business has sufficient credits
CREATE OR REPLACE FUNCTION has_credits(
  p_business_id UUID,
  p_cost        NUMERIC DEFAULT 1
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance NUMERIC;
BEGIN
  SELECT credits_balance INTO v_balance
  FROM businesses
  WHERE id = p_business_id;

  RETURN COALESCE(v_balance, 0) >= p_cost;
END;
$$;

-- 6. Row-level security: businesses can only see their own data
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usage_logs_own_business" ON usage_logs
  FOR SELECT USING (
    business_id IN (
      SELECT business_id FROM profiles WHERE id = auth.uid()
    )
  );
