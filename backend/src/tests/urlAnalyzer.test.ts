import { describe, it, expect } from 'vitest';
import { analyzeUrl } from '../services/urlAnalyzer';

describe('URL Security Analyzer', () => {
  it('should flag fake brand impersonation URLs', () => {
    const result = analyzeUrl('http://instagram-verify-login.com/auth');
    expect(result.riskLevel).toBe('CRITICAL');
    expect(result.indicators.some(i => i.id.includes('impersonation'))).toBe(true);
    expect(result.indicators.some(i => i.id === 'http_unencrypted')).toBe(true);
  });

  it('should flag direct IP address hosts', () => {
    const result = analyzeUrl('http://192.168.1.50/login');
    expect(result.riskLevel).toBe('CRITICAL');
    expect(result.isIpHost).toBe(true);
  });

  it('should return LOW risk for standard official HTTPS domains', () => {
    const result = analyzeUrl('https://instagram.com/p/12345');
    expect(result.riskLevel).toBe('LOW');
    expect(result.disclaimer).toContain('No suspicious indicators were detected');
  });
});
