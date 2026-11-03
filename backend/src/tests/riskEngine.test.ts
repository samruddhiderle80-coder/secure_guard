import { describe, it, expect } from 'vitest';
import { calculateRiskAssessment, RawAnswerInput } from '../services/riskEngine';

describe('Risk Engine Calculation', () => {
  it('should return LOW risk level and 100 score for all perfect answers', () => {
    const perfectAnswers: RawAnswerInput[] = [
      { questionId: 'q1', category: 'password', scoreEarned: 100, riskIndicator: 'NONE' },
      { questionId: 'q2', category: 'mfa', scoreEarned: 100, riskIndicator: 'NONE' },
      { questionId: 'q3', category: 'privacy', scoreEarned: 100, riskIndicator: 'NONE' },
      { questionId: 'q4', category: 'phishing', scoreEarned: 100, riskIndicator: 'NONE' },
      { questionId: 'q5', category: 'applications', scoreEarned: 100, riskIndicator: 'NONE' },
      { questionId: 'q6', category: 'recovery', scoreEarned: 100, riskIndicator: 'NONE' },
      { questionId: 'q7', category: 'awareness', scoreEarned: 100, riskIndicator: 'NONE' },
    ];

    const result = calculateRiskAssessment(perfectAnswers);
    expect(result.totalScore).toBe(100);
    expect(result.riskLevel).toBe('LOW');
    expect(result.findings.length).toBe(0);
  });

  it('should generate HIGH severity findings for missing MFA and password reuse', () => {
    const vulnerableAnswers: RawAnswerInput[] = [
      {
        questionId: 'q1', category: 'password', scoreEarned: 0,
        riskIndicator: 'HIGH', findingTitle: 'Severe Password Reuse Risk',
        findingRecommendation: 'Use unique passwords for each account.'
      },
      {
        questionId: 'q2', category: 'mfa', scoreEarned: 0,
        riskIndicator: 'HIGH', findingTitle: 'MFA Not Enabled',
        findingRecommendation: 'Enable MFA on all social accounts.'
      },
    ];

    const result = calculateRiskAssessment(vulnerableAnswers);
    expect(result.totalScore).toBeLessThan(60);
    expect(result.findings.length).toBe(2);
    expect(result.findings[0].severity).toBe('HIGH');
  });
});
