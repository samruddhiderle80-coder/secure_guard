export interface PasswordAnalysis {
  length: number;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSpecialChars: boolean;
  hasRepeatedPatterns: boolean;
  hasSequentialChars: boolean;
  hasCommonPatterns: boolean;
  entropyBits: number;
  score: number; // 0 to 100
  label: 'Weak' | 'Moderate' | 'Strong' | 'Very Strong';
  recommendations: string[];
  checks: {
    lengthCheck: boolean;
    uppercaseCheck: boolean;
    lowercaseCheck: boolean;
    numberCheck: boolean;
    specialCheck: boolean;
    noRepeatCheck: boolean;
    noSequentialCheck: boolean;
  };
}

const COMMON_PASSWORDS = [
  '123456', 'password', '12345678', 'qwerty', '123456789', '12345', '1234', '111111',
  '1234567', 'dragon', 'welcome', 'admin', 'password1', 'socialmedia', 'iloveyou', 'sunshine',
  'letmein', 'monkey', 'princess', 'football', 'shadow', 'superman', 'master'
];

export function analyzePassword(password: string): PasswordAnalysis {
  if (!password) {
    return {
      length: 0,
      hasUppercase: false,
      hasLowercase: false,
      hasNumbers: false,
      hasSpecialChars: false,
      hasRepeatedPatterns: false,
      hasSequentialChars: false,
      hasCommonPatterns: false,
      entropyBits: 0,
      score: 0,
      label: 'Weak',
      recommendations: ['Enter a password to begin real-time client-side analysis.'],
      checks: {
        lengthCheck: false,
        uppercaseCheck: false,
        lowercaseCheck: false,
        numberCheck: false,
        specialCheck: false,
        noRepeatCheck: true,
        noSequentialCheck: true,
      },
    };
  }

  const length = password.length;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[^A-Za-z0-9]/.test(password);

  // Check repeated characters (e.g. "aaa", "111")
  const hasRepeatedPatterns = /(.)\1{2,}/.test(password);

  // Check sequential characters (e.g. "abc", "123", "qwerty")
  const hasSequentialChars = /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789|890|qwerty)/i.test(password);

  // Check common password list
  const hasCommonPatterns = COMMON_PASSWORDS.some(common => password.toLowerCase().includes(common));

  // Calculate Character Pool Size for Entropy
  let poolSize = 0;
  if (hasLowercase) poolSize += 26;
  if (hasUppercase) poolSize += 26;
  if (hasNumbers) poolSize += 10;
  if (hasSpecialChars) poolSize += 32;

  const entropyBits = poolSize > 0 ? Math.round(length * Math.log2(poolSize)) : 0;

  let score = 0;
  if (length >= 8) score += 20;
  if (length >= 12) score += 20;
  if (length >= 16) score += 10;

  if (hasUppercase) score += 10;
  if (hasLowercase) score += 10;
  if (hasNumbers) score += 15;
  if (hasSpecialChars) score += 15;

  if (hasRepeatedPatterns) score -= 15;
  if (hasSequentialChars) score -= 15;
  if (hasCommonPatterns) score -= 40;

  score = Math.max(0, Math.min(100, score));

  let label: 'Weak' | 'Moderate' | 'Strong' | 'Very Strong' = 'Weak';
  if (score >= 85) label = 'Very Strong';
  else if (score >= 65) label = 'Strong';
  else if (score >= 45) label = 'Moderate';
  else label = 'Weak';

  const recommendations: string[] = [];
  if (length < 12) recommendations.push('Increase length to at least 12–16 characters (or use a multi-word passphrase).');
  if (!hasUppercase) recommendations.push('Add uppercase letters (A–Z).');
  if (!hasLowercase) recommendations.push('Add lowercase letters (a–z).');
  if (!hasNumbers) recommendations.push('Add numeric digits (0–9).');
  if (!hasSpecialChars) recommendations.push('Include special symbols (e.g. !@#$%^&*).');
  if (hasRepeatedPatterns) recommendations.push('Remove repeated character clusters (e.g., "aaa" or "111").');
  if (hasSequentialChars) recommendations.push('Avoid sequential patterns like "123", "abc", or "qwerty".');
  if (hasCommonPatterns) recommendations.push('Avoid dictionary words and common password patterns.');

  if (recommendations.length === 0) {
    recommendations.push('Excellent passphrase architecture! Save credentials in your password manager.');
  }

  return {
    length,
    hasUppercase,
    hasLowercase,
    hasNumbers,
    hasSpecialChars,
    hasRepeatedPatterns,
    hasSequentialChars,
    hasCommonPatterns,
    entropyBits,
    score,
    label,
    recommendations,
    checks: {
      lengthCheck: length >= 12,
      uppercaseCheck: hasUppercase,
      lowercaseCheck: hasLowercase,
      numberCheck: hasNumbers,
      specialCheck: hasSpecialChars,
      noRepeatCheck: !hasRepeatedPatterns,
      noSequentialCheck: !hasSequentialChars,
    },
  };
}
