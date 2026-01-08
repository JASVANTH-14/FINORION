import { Shield, AlertTriangle, TrendingUp, Network } from 'lucide-react';
import { ScreeningResult } from '../lib/supabase';
import RiskChart from './RiskChart';

interface ResultsDisplayProps {
  result: ScreeningResult;
}

export default function ResultsDisplay({ result }: ResultsDisplayProps) {
  const matches = result.matched_entities as Array<{
    name: string;
    type: string;
    country: string;
    sanction_list: string;
    risk_level: string;
    match_score: number;
  }>;

  const amlFlags = result.aml_flags as Array<{
    type: string;
    description: string;
    severity: string;
  }>;

  const networkAnalysis = result.network_analysis as {
    directMatches: number;
    riskFactors: string[];
    networkScore: number;
    connectedEntities: string[];
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border-2 border-[#0A988B] rounded-lg p-6 bg-[#112836]/50 backdrop-blur-sm">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#0A988B]" />
            Risk Assessment
          </h3>
          <RiskChart
            riskPercentage={result.risk_percentage}
            overallRiskLevel={result.overall_risk_level}
          />
        </div>

        <div className="border-2 border-[#0A988B] rounded-lg p-6 bg-[#112836]/50 backdrop-blur-sm">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#0A988B]" />
            Screening Details
          </h3>
          <div className="space-y-4 text-white">
            <div className="flex justify-between items-center pb-3 border-b border-[#0A988B]/30">
              <span className="text-gray-300">Customer Name:</span>
              <span className="font-semibold">{result.customer_name}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-[#0A988B]/30">
              <span className="text-gray-300">Country:</span>
              <span className="font-semibold">{result.customer_country}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-[#0A988B]/30">
              <span className="text-gray-300">Device IP:</span>
              <span className="font-mono text-sm">{result.device_ip}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-[#0A988B]/30">
              <span className="text-gray-300">Screening Time:</span>
              <span className="text-sm">
                {new Date(result.screening_timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border-2 border-[#0A988B] rounded-lg p-6 bg-[#112836]/50 backdrop-blur-sm">
          <h4 className="text-lg font-semibold text-white mb-4">Similarity Scores</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-white mb-2">
                <span>Name Similarity</span>
                <span className="font-bold">{result.similarity_score.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-[#0A988B] to-[#0A988B]/70 transition-all duration-500"
                  style={{ width: `${result.similarity_score}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-white mb-2">
                <span>Country Risk Score</span>
                <span className="font-bold">{result.country_risk_score.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                  style={{ width: `${result.country_risk_score}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {networkAnalysis && (
          <div className="border-2 border-[#0A988B] rounded-lg p-6 bg-[#112836]/50 backdrop-blur-sm">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Network className="w-5 h-5 text-[#0A988B]" />
              Network Analysis
            </h4>
            <div className="space-y-3 text-white">
              <div className="flex justify-between">
                <span className="text-gray-300">Direct Matches:</span>
                <span className="font-semibold">{networkAnalysis.directMatches}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Network Score:</span>
                <span className="font-semibold">{networkAnalysis.networkScore}</span>
              </div>
              {networkAnalysis.riskFactors && networkAnalysis.riskFactors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#0A988B]/30">
                  <p className="text-sm text-gray-300 mb-2">Risk Factors:</p>
                  <ul className="space-y-1">
                    {networkAnalysis.riskFactors.map((factor, idx) => (
                      <li key={idx} className="text-sm text-gray-200 flex items-start gap-2">
                        <span className="text-[#0A988B] mt-1">•</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {matches && matches.length > 0 && (
        <div className="border-2 border-[#0A988B] rounded-lg p-6 bg-[#112836]/50 backdrop-blur-sm">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Matched Entities ({matches.length})
          </h4>
          <div className="space-y-4">
            {matches.slice(0, 5).map((match, index) => (
              <div
                key={index}
                className="border border-[#0A988B]/40 rounded-lg p-4 bg-[#112836]/30 hover:bg-[#112836]/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="text-white font-semibold">{match.name}</h5>
                  <span className="text-[#0A988B] font-bold text-sm">
                    {match.match_score.toFixed(1)}% Match
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">Type: </span>
                    <span className="text-white">{match.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Country: </span>
                    <span className="text-white">{match.country}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">List: </span>
                    <span className="text-white">{match.sanction_list}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Risk: </span>
                    <span
                      className={`font-semibold ${
                        match.risk_level === 'critical'
                          ? 'text-red-500'
                          : match.risk_level === 'high'
                          ? 'text-orange-500'
                          : match.risk_level === 'medium'
                          ? 'text-yellow-500'
                          : 'text-green-500'
                      }`}
                    >
                      {match.risk_level.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {amlFlags && amlFlags.length > 0 && (
        <div className="border-2 border-[#0A988B] rounded-lg p-6 bg-[#112836]/50 backdrop-blur-sm">
          <h4 className="text-lg font-semibold text-white mb-4">AML Flags</h4>
          <div className="space-y-3">
            {amlFlags.map((flag, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-[#112836]/30 border border-[#0A988B]/20"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1 ${
                    flag.severity === 'critical'
                      ? 'bg-red-500'
                      : flag.severity === 'high'
                      ? 'bg-orange-500'
                      : flag.severity === 'medium'
                      ? 'bg-yellow-500'
                      : 'bg-gray-500'
                  }`}
                ></div>
                <div>
                  <span
                    className={`text-sm font-semibold ${
                      flag.severity === 'critical'
                        ? 'text-red-400'
                        : flag.severity === 'high'
                        ? 'text-orange-400'
                        : flag.severity === 'medium'
                        ? 'text-yellow-400'
                        : 'text-gray-400'
                    }`}
                  >
                    [{flag.severity.toUpperCase()}]
                  </span>
                  <span className="text-white ml-2">{flag.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-2 border-[#0A988B] rounded-lg p-6 bg-[#112836]/50 backdrop-blur-sm">
        <h4 className="text-lg font-semibold text-white mb-4">AI Explanation</h4>
        <pre className="text-sm text-gray-200 whitespace-pre-wrap font-mono leading-relaxed">
          {result.ai_explanation}
        </pre>
      </div>
    </div>
  );
}
