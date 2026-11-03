export interface CategoryScores {
  password: number;
  mfa: number;
  privacy: number;
  phishing: number;
  applications: number;
  recovery: number;
  awareness: number;
}

export interface RawAnswerInput {
  questionId: string;
  optionId?: string;
  category: keyof CategoryScores;
  scoreEarned: number; // 0 to 100
  weight?: number;
  riskIndicator?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'NONE';
  findingTitle?: string;
  findingRecommendation?: string;
  questionText?: string;
}

export interface SecurityFindingResult {
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  recommendation: string;
}

export interface AssessmentCalculationResult {
  totalScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  categoryScores: CategoryScores;
  findings: SecurityFindingResult[];
  summaryText: string;
}

export const CATEGORY_WEIGHTS: Record<keyof CategoryScores, number> = {
  password: 0.20,
  mfa: 0.20,
  privacy: 0.15,
  phishing: 0.20,
  applications: 0.10,
  recovery: 0.10,
  awareness: 0.05,
};

export function calculateRiskAssessment(answers: RawAnswerInput[]): AssessmentCalculationResult {
  const categoryTotals: Record<keyof CategoryScores, { totalScore: number; count: number }> = {
    password: { totalScore: 0, count: 0 },
    mfa: { totalScore: 0, count: 0 },
    privacy: { totalScore: 0, count: 0 },
    phishing: { totalScore: 0, count: 0 },
    applications: { totalScore: 0, count: 0 },
    recovery: { totalScore: 0, count: 0 },
    awareness: { totalScore: 0, count: 0 },
  };

  const findings: SecurityFindingResult[] = [];

  for (const answer of answers) {
    const cat = answer.category;
    if (categoryTotals[cat] !== undefined) {
      categoryTotals[cat].totalScore += Math.max(0, Math.min(100, answer.scoreEarned));
      categoryTotals[cat].count += 1;
    }

    if (answer.riskIndicator && answer.riskIndicator !== 'NONE' && answer.findingTitle && answer.findingRecommendation) {
      let severity: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
      if (answer.riskIndicator === 'CRITICAL' || answer.riskIndicator === 'HIGH') {
        severity = 'HIGH';
      } else if (answer.riskIndicator === 'MEDIUM') {
        severity = 'MEDIUM';
      } else {
        severity = 'LOW';
      }

      findings.push({
        severity,
        title: answer.findingTitle,
        description: `Assessment identified a vulnerability in your ${cat.toUpperCase()} configuration: ${answer.questionText || answer.findingTitle}`,
        recommendation: answer.findingRecommendation,
      });
    }
  }

  const hasAnyAnswers = Object.values(categoryTotals).some(c => c.count > 0);

  const categoryScores: CategoryScores = {
    password: categoryTotals.password.count > 0 ? Math.round(categoryTotals.password.totalScore / categoryTotals.password.count) : (hasAnyAnswers ? 0 : 100),
    mfa: categoryTotals.mfa.count > 0 ? Math.round(categoryTotals.mfa.totalScore / categoryTotals.mfa.count) : (hasAnyAnswers ? 0 : 100),
    privacy: categoryTotals.privacy.count > 0 ? Math.round(categoryTotals.privacy.totalScore / categoryTotals.privacy.count) : (hasAnyAnswers ? 0 : 100),
    phishing: categoryTotals.phishing.count > 0 ? Math.round(categoryTotals.phishing.totalScore / categoryTotals.phishing.count) : (hasAnyAnswers ? 0 : 100),
    applications: categoryTotals.applications.count > 0 ? Math.round(categoryTotals.applications.totalScore / categoryTotals.applications.count) : (hasAnyAnswers ? 0 : 100),
    recovery: categoryTotals.recovery.count > 0 ? Math.round(categoryTotals.recovery.totalScore / categoryTotals.recovery.count) : (hasAnyAnswers ? 0 : 100),
    awareness: categoryTotals.awareness.count > 0 ? Math.round(categoryTotals.awareness.totalScore / categoryTotals.awareness.count) : (hasAnyAnswers ? 0 : 100),
  };

  let weightedScore = 0;
  for (const catKey of Object.keys(CATEGORY_WEIGHTS) as Array<keyof CategoryScores>) {
    weightedScore += categoryScores[catKey] * CATEGORY_WEIGHTS[catKey];
  }

  const totalScore = Math.round(weightedScore);

  let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  let summaryText = '';

  if (totalScore >= 80) {
    riskLevel = 'LOW';
    summaryText = 'Your social media security posture is robust. Continue maintaining strong MFA controls and routine session audits.';
  } else if (totalScore >= 60) {
    riskLevel = 'MODERATE';
    summaryText = 'Your assessment indicates good baseline security practices, with clear opportunities for improvement in privacy and phishing defense.';
  } else if (totalScore >= 40) {
    riskLevel = 'HIGH';
    summaryText = 'High security risks detected. Several critical safeguards like Multi-Factor Authentication or unique passwords are missing.';
  } else {
    riskLevel = 'CRITICAL';
    summaryText = 'Critical security posture alert! Your account practices present severe vulnerability to credential stuffing and phishing attacks.';
  }

  return {
    totalScore,
    riskLevel,
    categoryScores,
    findings,
    summaryText,
  };
}
