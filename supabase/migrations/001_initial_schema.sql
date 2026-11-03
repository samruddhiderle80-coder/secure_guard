-- Social Guard Database Schema and RLS Policies

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. User Roles Table (Strict RBAC)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- 3. Assessment Questions Table
CREATE TABLE IF NOT EXISTS public.assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('password', 'mfa', 'privacy', 'phishing', 'applications', 'recovery', 'awareness')),
  question_text TEXT NOT NULL,
  explanation TEXT,
  weight NUMERIC(4,2) NOT NULL DEFAULT 1.0,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Assessment Options Table
CREATE TABLE IF NOT EXISTS public.assessment_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  score_value INT NOT NULL CHECK (score_value BETWEEN 0 AND 100),
  risk_indicator TEXT CHECK (risk_indicator IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'NONE')),
  finding_title TEXT,
  finding_recommendation TEXT
);

-- 5. Security Assessments Table
CREATE TABLE IF NOT EXISTS public.security_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_score INT NOT NULL CHECK (total_score BETWEEN 0 AND 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
  category_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Assessment Answers Table
CREATE TABLE IF NOT EXISTS public.assessment_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.security_assessments(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.assessment_options(id) ON DELETE CASCADE,
  score_earned INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Security Findings Table
CREATE TABLE IF NOT EXISTS public.security_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.security_assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('HIGH', 'MEDIUM', 'LOW')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Phishing Scenarios Table
CREATE TABLE IF NOT EXISTS public.phishing_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  context_type TEXT NOT NULL,
  message_sender TEXT NOT NULL,
  message_content TEXT NOT NULL,
  option_choices JSONB NOT NULL,
  correct_option_id TEXT NOT NULL,
  explanation TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Phishing Attempts Table
CREATE TABLE IF NOT EXISTS public.phishing_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES public.phishing_scenarios(id) ON DELETE CASCADE,
  selected_option_id TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Educational Training Modules Table
CREATE TABLE IF NOT EXISTS public.training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  content JSONB NOT NULL,
  quiz JSONB NOT NULL,
  estimated_minutes INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Training Progress Table
CREATE TABLE IF NOT EXISTS public.training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  score INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, module_id)
);

-- 12. Privacy Self-Assessments Table
CREATE TABLE IF NOT EXISTS public.privacy_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exposure_score INT NOT NULL CHECK (exposure_score BETWEEN 0 AND 100),
  exposure_level TEXT NOT NULL CHECK (exposure_level IN ('LOW', 'MODERATE', 'HIGH')),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. MFA Security Checklists Table
CREATE TABLE IF NOT EXISTS public.mfa_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  completed_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- 14. Security Incidents Table
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  incident_type TEXT NOT NULL CHECK (incident_type IN ('PHISHING', 'ACCOUNT_TAKEOVER', 'FAKE_PROFILE', 'MALICIOUS_LINK', 'SCAM', 'IMPERSONATION', 'PRIVACY_EXPOSURE', 'SUSPICIOUS_LOGIN', 'HARASSMENT', 'OTHER')),
  description TEXT NOT NULL,
  incident_date DATE NOT NULL,
  access_lost BOOLEAN NOT NULL DEFAULT FALSE,
  credentials_shared BOOLEAN NOT NULL DEFAULT FALSE,
  financial_loss BOOLEAN NOT NULL DEFAULT FALSE,
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'RESOLVED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. User Feedback Table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  ease_of_use INT NOT NULL CHECK (ease_of_use BETWEEN 1 AND 5),
  usefulness INT NOT NULL CHECK (usefulness BETWEEN 1 AND 5),
  most_useful_feature TEXT,
  would_recommend BOOLEAN NOT NULL DEFAULT TRUE,
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Security Event Logs Table
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES for Performance
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON public.security_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_findings_user_id ON public.security_findings(user_id);
CREATE INDEX IF NOT EXISTS idx_findings_assessment_id ON public.security_findings(assessment_id);
CREATE INDEX IF NOT EXISTS idx_phishing_attempts_user_id ON public.phishing_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_user_id ON public.training_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_incidents_user_id ON public.incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- ROW LEVEL SECURITY (RLS) POLICIES

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phishing_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Helper function to check if requesting user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_roles.user_id = $1 AND role = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = $1 AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin(auth.uid()));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User Roles Policies
CREATE POLICY "Users can read own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Assessment Questions & Options Policies (Public read)
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view assessment questions" ON public.assessment_questions FOR SELECT USING (true);
CREATE POLICY "Anyone can view assessment options" ON public.assessment_options FOR SELECT USING (true);

-- Security Assessments Policies
CREATE POLICY "Users can view own assessments" ON public.security_assessments FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users can insert own assessments" ON public.security_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Security Findings Policies
CREATE POLICY "Users can view own findings" ON public.security_findings FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users can insert own findings" ON public.security_findings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own findings" ON public.security_findings FOR UPDATE USING (auth.uid() = user_id);

-- Phishing Scenarios & Attempts Policies
ALTER TABLE public.phishing_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view phishing scenarios" ON public.phishing_scenarios FOR SELECT USING (true);
CREATE POLICY "Users can view own phishing attempts" ON public.phishing_attempts FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users can insert own phishing attempts" ON public.phishing_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Educational Training Modules & Progress
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view training modules" ON public.training_modules FOR SELECT USING (true);
CREATE POLICY "Users can view own training progress" ON public.training_progress FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users can insert/update own training progress" ON public.training_progress FOR ALL USING (auth.uid() = user_id);

-- Privacy Assessments Policies
CREATE POLICY "Users can view own privacy assessments" ON public.privacy_assessments FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users can insert own privacy assessments" ON public.privacy_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- MFA Checklists Policies
CREATE POLICY "Users can view own mfa checklists" ON public.mfa_checklists FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users can insert/update own mfa checklists" ON public.mfa_checklists FOR ALL USING (auth.uid() = user_id);

-- Incidents Policies
CREATE POLICY "Users can view own incidents" ON public.incidents FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users can insert own incidents" ON public.incidents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update incidents" ON public.incidents FOR UPDATE USING (public.is_admin(auth.uid()));

-- Feedback Policies
CREATE POLICY "Users can view own feedback" ON public.feedback FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users can insert own feedback" ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Security Events Policies
CREATE POLICY "Users can view own security events" ON public.security_events FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users can insert security events" ON public.security_events FOR INSERT WITH CHECK (auth.uid() = user_id);
