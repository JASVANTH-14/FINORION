import { supabase, SanctionEntity, ScreeningResult } from '../lib/supabase';

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 100;

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 100;

  const editDistance = levenshteinDistance(longer, shorter);
  const similarity = ((longer.length - editDistance) / longer.length) * 100;

  const partialMatch = longer.includes(shorter) || shorter.includes(longer);
  if (partialMatch) {
    return Math.max(similarity, 75);
  }

  return similarity;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

const countryRiskScores: Record<string, number> = {
  'Iran': 95,
  'North Korea': 98,
  'Syria': 92,
  'Russia': 85,
  'Belarus': 75,
  'Venezuela': 70,
  'Yemen': 88,
  'China': 45,
  'United States': 10,
  'United Kingdom': 12,
  'Germany': 15,
  'France': 15,
  'Canada': 12,
  'Australia': 12,
  'India': 35,
  'Brazil': 40,
  'Mexico': 50,
  'South Africa': 45,
};

function getCountryRiskScore(country: string): number {
  return countryRiskScores[country] || 30;
}

export async function performScreening(
  customerName: string,
  customerCountry: string,
  deviceIp: string
): Promise<ScreeningResult> {
  const { data: watchlist, error } = await supabase
    .from('sanction_watchlist')
    .select('*');

  if (error || !watchlist) {
    throw new Error('Failed to fetch sanction watchlist');
  }

  let highestSimilarity = 0;
  const matchedEntities: Array<{
    entity: SanctionEntity;
    score: number;
  }> = [];

  watchlist.forEach((entity: SanctionEntity) => {
    const nameScore = calculateSimilarity(customerName, entity.entity_name);

    let maxAliasScore = 0;
    if (entity.aliases && entity.aliases.length > 0) {
      entity.aliases.forEach(alias => {
        const aliasScore = calculateSimilarity(customerName, alias);
        maxAliasScore = Math.max(maxAliasScore, aliasScore);
      });
    }

    const finalScore = Math.max(nameScore, maxAliasScore);

    if (finalScore > 60) {
      matchedEntities.push({
        entity,
        score: finalScore
      });
    }

    highestSimilarity = Math.max(highestSimilarity, finalScore);
  });

  matchedEntities.sort((a, b) => b.score - a.score);

  const countryRisk = getCountryRiskScore(customerCountry);

  const networkRiskFactors = [];
  let networkRiskScore = 0;

  if (matchedEntities.length > 0) {
    networkRiskFactors.push('Direct name match in sanction database');
    networkRiskScore += 30;
  }

  if (countryRisk > 70) {
    networkRiskFactors.push('High-risk jurisdiction');
    networkRiskScore += 20;
  }

  if (matchedEntities.some(m => m.entity.risk_level === 'critical')) {
    networkRiskFactors.push('Critical entity match detected');
    networkRiskScore += 25;
  }

  const amlFlags = [];
  if (highestSimilarity > 90) {
    amlFlags.push({
      type: 'HIGH_MATCH',
      description: 'Very high name similarity to sanctioned entity',
      severity: 'critical'
    });
  }

  if (countryRisk > 80) {
    amlFlags.push({
      type: 'HIGH_RISK_COUNTRY',
      description: 'Customer from high-risk jurisdiction',
      severity: 'high'
    });
  }

  if (matchedEntities.length > 1) {
    amlFlags.push({
      type: 'MULTIPLE_MATCHES',
      description: 'Multiple potential matches in sanction lists',
      severity: 'medium'
    });
  }

  const riskPercentage = Math.min(
    (highestSimilarity * 0.6 + countryRisk * 0.3 + networkRiskScore * 0.1),
    100
  );

  let overallRiskLevel = 'low';
  if (riskPercentage >= 80) overallRiskLevel = 'critical';
  else if (riskPercentage >= 60) overallRiskLevel = 'high';
  else if (riskPercentage >= 40) overallRiskLevel = 'medium';

  const aiExplanation = generateAIExplanation(
    customerName,
    customerCountry,
    highestSimilarity,
    countryRisk,
    matchedEntities,
    overallRiskLevel,
    networkRiskFactors,
    amlFlags
  );

  const networkAnalysis = {
    directMatches: matchedEntities.length,
    riskFactors: networkRiskFactors,
    networkScore: networkRiskScore,
    connectedEntities: matchedEntities.slice(0, 3).map(m => m.entity.entity_name)
  };

  const result: ScreeningResult = {
    customer_name: customerName,
    customer_country: customerCountry,
    device_ip: deviceIp,
    similarity_score: parseFloat(highestSimilarity.toFixed(2)),
    country_risk_score: countryRisk,
    overall_risk_level: overallRiskLevel,
    risk_percentage: parseFloat(riskPercentage.toFixed(2)),
    matched_entities: matchedEntities.map(m => ({
      name: m.entity.entity_name,
      type: m.entity.entity_type,
      country: m.entity.country,
      sanction_list: m.entity.sanction_list,
      risk_level: m.entity.risk_level,
      match_score: parseFloat(m.score.toFixed(2))
    })),
    ai_explanation: aiExplanation,
    network_analysis: networkAnalysis,
    aml_flags: amlFlags,
    screening_timestamp: new Date().toISOString()
  };

  const { error: insertError } = await supabase
    .from('screening_results')
    .insert([result]);

  if (insertError) {
    console.error('Failed to save screening result:', insertError);
  }

  return result;
}

function generateAIExplanation(
  customerName: string,
  customerCountry: string,
  similarityScore: number,
  countryRisk: number,
  matchedEntities: Array<{ entity: SanctionEntity; score: number }>,
  riskLevel: string,
  networkFactors: string[],
  amlFlags: unknown[]
): string {
  let explanation = `AI-Powered Risk Assessment for "${customerName}" from ${customerCountry}:\n\n`;

  explanation += `RISK CLASSIFICATION: ${riskLevel.toUpperCase()}\n\n`;

  explanation += `1. NAME SIMILARITY ANALYSIS:\n`;
  if (similarityScore > 90) {
    explanation += `   - Critical match detected with ${similarityScore.toFixed(1)}% similarity\n`;
    explanation += `   - High confidence that this may be the same entity\n`;
  } else if (similarityScore > 70) {
    explanation += `   - Strong similarity detected (${similarityScore.toFixed(1)}%)\n`;
    explanation += `   - Requires manual review and additional verification\n`;
  } else if (similarityScore > 50) {
    explanation += `   - Moderate similarity found (${similarityScore.toFixed(1)}%)\n`;
    explanation += `   - Could be a variant spelling or related entity\n`;
  } else {
    explanation += `   - Low similarity score (${similarityScore.toFixed(1)}%)\n`;
    explanation += `   - Minimal name-based risk detected\n`;
  }

  explanation += `\n2. GEOGRAPHIC RISK ANALYSIS:\n`;
  explanation += `   - Country Risk Score: ${countryRisk}/100\n`;
  if (countryRisk > 80) {
    explanation += `   - ${customerCountry} is classified as a high-risk jurisdiction\n`;
    explanation += `   - Enhanced due diligence required\n`;
  } else if (countryRisk > 50) {
    explanation += `   - ${customerCountry} presents moderate risk factors\n`;
    explanation += `   - Standard due diligence procedures apply\n`;
  } else {
    explanation += `   - ${customerCountry} is a lower-risk jurisdiction\n`;
  }

  if (matchedEntities.length > 0) {
    explanation += `\n3. MATCHED ENTITIES:\n`;
    matchedEntities.slice(0, 3).forEach((match, index) => {
      explanation += `   ${index + 1}. ${match.entity.entity_name} (${match.score.toFixed(1)}% match)\n`;
      explanation += `      - Type: ${match.entity.entity_type}\n`;
      explanation += `      - List: ${match.entity.sanction_list}\n`;
      explanation += `      - Risk Level: ${match.entity.risk_level}\n`;
    });
  }

  if (networkFactors.length > 0) {
    explanation += `\n4. NETWORK ANALYSIS:\n`;
    networkFactors.forEach(factor => {
      explanation += `   - ${factor}\n`;
    });
  }

  if (Array.isArray(amlFlags) && amlFlags.length > 0) {
    explanation += `\n5. AML FLAGS:\n`;
    amlFlags.forEach((flag: unknown) => {
      const f = flag as { type: string; description: string; severity: string };
      explanation += `   - [${f.severity.toUpperCase()}] ${f.description}\n`;
    });
  }

  explanation += `\n6. RECOMMENDATION:\n`;
  if (riskLevel === 'critical') {
    explanation += `   - BLOCK: Transaction should be blocked immediately\n`;
    explanation += `   - Report to compliance team for investigation\n`;
    explanation += `   - Consider filing SAR (Suspicious Activity Report)\n`;
  } else if (riskLevel === 'high') {
    explanation += `   - REVIEW: Enhanced due diligence required\n`;
    explanation += `   - Manual review by compliance officer needed\n`;
    explanation += `   - Gather additional documentation\n`;
  } else if (riskLevel === 'medium') {
    explanation += `   - CAUTION: Standard due diligence procedures\n`;
    explanation += `   - Monitor for unusual activity patterns\n`;
  } else {
    explanation += `   - PROCEED: Low risk detected\n`;
    explanation += `   - Continue with standard monitoring\n`;
  }

  return explanation;
}
