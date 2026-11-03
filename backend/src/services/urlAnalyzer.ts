export interface URLIndicator {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  message: string;
  explanation: string;
}

export interface URLAnalysisResult {
  url: string;
  hostname: string;
  protocol: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number; // 0 to 100 (100 = safest)
  isHttps: boolean;
  isIpHost: boolean;
  isShortener: boolean;
  indicators: URLIndicator[];
  recommendations: string[];
  disclaimer: string;
}

const OFFICIAL_BRAND_DOMAINS: Record<string, string[]> = {
  instagram: ['instagram.com', 'instagr.am'],
  facebook: ['facebook.com', 'fb.com', 'meta.com'],
  meta: ['meta.com', 'facebook.com', 'instagram.com'],
  twitter: ['twitter.com', 'x.com', 't.co'],
  x: ['x.com', 'twitter.com', 't.co'],
  linkedin: ['linkedin.com', 'licdn.com'],
  whatsapp: ['whatsapp.com', 'wa.me'],
  google: ['google.com', 'youtube.com', 'accounts.google.com'],
};

const KNOWN_SHORTENERS = [
  'bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'ow.ly', 'buff.ly', 'rb.gy', 'cutt.ly', 'goo.gl', 'shorturl.at', 'bl.ink'
];

export function analyzeUrl(inputUrl: string): URLAnalysisResult {
  let rawUrl = inputUrl.trim();
  if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    rawUrl = 'https://' + rawUrl;
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Invalid URL format provided.');
  }

  const hostname = parsed.hostname.toLowerCase();
  const protocol = parsed.protocol.toLowerCase();
  const path = parsed.pathname + parsed.search;

  const indicators: URLIndicator[] = [];
  const recommendations: string[] = [];
  let scoreDeduction = 0;

  // 1. Check HTTPS
  const isHttps = protocol === 'https:';
  if (!isHttps) {
    scoreDeduction += 30;
    indicators.push({
      id: 'http_unencrypted',
      severity: 'HIGH',
      message: 'Unencrypted HTTP Connection',
      explanation: 'This link uses insecure HTTP instead of encrypted HTTPS, allowing eavesdroppers to intercept data.',
    });
    recommendations.push('Do not enter passwords or sensitive information over an HTTP connection.');
  }

  // 2. Check IP Address Hostname
  const isIpHost = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || /^0x[0-9a-fA-F]+/i.test(hostname);
  if (isIpHost) {
    scoreDeduction += 50;
    indicators.push({
      id: 'ip_address_host',
      severity: 'CRITICAL',
      message: 'Direct IP Address Hostname',
      explanation: 'Legitimate social media platforms use registered domain names, not raw IP addresses.',
    });
    recommendations.push('Avoid logging into accounts via numerical IP addresses.');
  }

  // 3. Check Subdomain depth
  const domainParts = hostname.split('.');
  if (domainParts.length > 3 && !isIpHost) {
    scoreDeduction += 20;
    indicators.push({
      id: 'excessive_subdomains',
      severity: 'MEDIUM',
      message: 'Multiple Subdomains Detected',
      explanation: 'Phishing campaigns often use deep subdomains (e.g. login.verify.account.domain.com) to mimic legitimate sites.',
    });
    recommendations.push('Inspect the root domain carefully before entering credentials.');
  }

  // 4. Check URL Shortener
  const isShortener = KNOWN_SHORTENERS.includes(hostname);
  if (isShortener) {
    scoreDeduction += 15;
    indicators.push({
      id: 'url_shortener',
      severity: 'MEDIUM',
      message: 'URL Shortening Service Detected',
      explanation: 'Shortened URLs obfuscate the true destination target domain.',
    });
    recommendations.push('Use a URL expander tool or hover over links to verify the final destination domain.');
  }

  // 5. Brand Impersonation / Typosquatting Check
  for (const [brand, officialDomains] of Object.entries(OFFICIAL_BRAND_DOMAINS)) {
    const brandInHost = hostname.includes(brand);
    const isOfficial = officialDomains.some(official => hostname === official || hostname.endsWith('.' + official));

    if (brandInHost && !isOfficial) {
      scoreDeduction += 45;
      indicators.push({
        id: `impersonation_${brand}`,
        severity: 'CRITICAL',
        message: `Potential ${brand.toUpperCase()} Brand Impersonation`,
        explanation: `The hostname includes "${brand}" but is NOT an official ${brand} domain (${officialDomains.join(', ')}).`,
      });
      recommendations.push(`Never enter your ${brand.toUpperCase()} credentials on non-official hostnames.`);
    }
  }

  // 6. Suspicious Keyword Indicators in Path/Query
  const suspiciousKeywords = ['verify', 'login-security', 'appeal', 'suspended', 're-verify', 'claim-badge', 'free-followers', 'password-reset'];
  const pathMatches = suspiciousKeywords.filter(keyword => path.toLowerCase().includes(keyword) || hostname.includes(keyword));
  if (pathMatches.length > 0 && scoreDeduction > 0) {
    scoreDeduction += 15;
    indicators.push({
      id: 'suspicious_keywords',
      severity: 'HIGH',
      message: 'Social Engineering Keywords Detected',
      explanation: `URL contains common social engineering trigger words: "${pathMatches.join(', ')}".`,
    });
    recommendations.push('Be extremely skeptical of links prompting immediate security re-verification.');
  }

  // 7. Calculate Final Score & Risk Level
  const calculatedScore = Math.max(0, 100 - scoreDeduction);
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

  if (calculatedScore < 40) {
    riskLevel = 'CRITICAL';
  } else if (calculatedScore < 65) {
    riskLevel = 'HIGH';
  } else if (calculatedScore < 85) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }

  const disclaimer = indicators.length === 0
    ? 'No suspicious indicators were detected by the checks performed. Note: Social Guard provides threat heuristics; always verify sender identities through official channels.'
    : 'Security analysis detected risk indicators for this URL. Exercise caution and avoid submitting account credentials.';

  return {
    url: rawUrl,
    hostname,
    protocol,
    riskLevel,
    score: calculatedScore,
    isHttps,
    isIpHost,
    isShortener,
    indicators,
    recommendations,
    disclaimer,
  };
}
