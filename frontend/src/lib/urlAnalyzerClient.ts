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
  score: number;
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
};

const KNOWN_SHORTENERS = [
  'bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'ow.ly', 'buff.ly', 'rb.gy'
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

  const indicators: URLIndicator[] = [];
  const recommendations: string[] = [];
  let scoreDeduction = 0;

  const isHttps = protocol === 'https:';
  if (!isHttps) {
    scoreDeduction += 30;
    indicators.push({
      id: 'http_unencrypted',
      severity: 'HIGH',
      message: 'Unencrypted HTTP Connection',
      explanation: 'Link uses plain HTTP instead of encrypted HTTPS.',
    });
  }

  const isIpHost = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  if (isIpHost) {
    scoreDeduction += 50;
    indicators.push({
      id: 'ip_address_host',
      severity: 'CRITICAL',
      message: 'Direct IP Address Hostname',
      explanation: 'Legitimate platforms use domain names, not IP addresses.',
    });
  }

  const isShortener = KNOWN_SHORTENERS.includes(hostname);
  if (isShortener) {
    scoreDeduction += 15;
    indicators.push({
      id: 'url_shortener',
      severity: 'MEDIUM',
      message: 'URL Shortener Detected',
      explanation: 'Shortened URLs obfuscate true destination domain.',
    });
  }

  for (const [brand, officialDomains] of Object.entries(OFFICIAL_BRAND_DOMAINS)) {
    const brandInHost = hostname.includes(brand);
    const isOfficial = officialDomains.some(official => hostname === official || hostname.endsWith('.' + official));

    if (brandInHost && !isOfficial) {
      scoreDeduction += 45;
      indicators.push({
        id: `impersonation_${brand}`,
        severity: 'CRITICAL',
        message: `Potential ${brand.toUpperCase()} Brand Impersonation`,
        explanation: `Hostname contains "${brand}" but is NOT official (${officialDomains.join(', ')}).`,
      });
    }
  }

  const score = Math.max(0, 100 - scoreDeduction);
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (score < 40) riskLevel = 'CRITICAL';
  else if (score < 65) riskLevel = 'HIGH';
  else if (score < 85) riskLevel = 'MEDIUM';

  const disclaimer = indicators.length === 0
    ? 'No suspicious indicators were detected by the checks performed.'
    : 'Security analysis detected risk indicators for this URL. Exercise caution.';

  return {
    url: rawUrl,
    hostname,
    protocol,
    riskLevel,
    score,
    isHttps,
    isIpHost,
    isShortener,
    indicators,
    recommendations,
    disclaimer,
  };
}
