
import React from 'react';
import { SkinMetric, Severity } from '../types';

interface MetricCardProps {
  metric: SkinMetric;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case Severity.VERY_LIGHT: return 'bg-green-100 text-green-700';
    case Severity.LIGHT: return 'bg-blue-100 text-blue-700';
    case Severity.MEDIUM: return 'bg-yellow-100 text-yellow-700';
    case Severity.HEAVY: return 'bg-orange-100 text-orange-700';
    case Severity.VERY_HEAVY: return 'bg-red-100 text-red-700';
    default: return 'bg-[#0F3B2E]/10 text-[#0F3B2E]/80';
  }
};

const getScoreColor = (score: number) => {
  if (score > 80) return 'text-green-600';
  if (score > 60) return 'text-blue-600';
  if (score > 40) return 'text-yellow-600';
  return 'text-red-600';
};

export const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#0F3B2E]/10 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-[#0F3B2E]">{metric.name}</h3>
          <span className={`text-xs px-2 py-1 rounded-full font-semibold uppercase mt-1 inline-block ${getSeverityColor(metric.severity)}`}>
            {metric.severity}
          </span>
        </div>
        <div className={`text-2xl font-bold ${getScoreColor(metric.score)}`}>
          {metric.score}%
        </div>
      </div>
      
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-[#0F3B2E]/60 font-medium uppercase text-[10px] tracking-wider mb-1">Phân tích</p>
          <p className="text-[#0F3B2E]/90 line-clamp-3">{metric.analysis}</p>
        </div>
        
        <div>
          <p className="text-[#0F3B2E]/60 font-medium uppercase text-[10px] tracking-wider mb-1">Nguyên nhân</p>
          <p className="text-[#0F3B2E]/90 italic">{metric.cause}</p>
        </div>

        <div className="pt-2 border-t border-[#0F3B2E]/5">
           <p className="text-[#0F3B2E] font-semibold text-xs mb-1">
             <i className="fas fa-lightbulb mr-1"></i> Gợi ý chuyên môn
           </p>
           <p className="text-[#0F3B2E]/80 text-xs italic">{metric.recommendation}</p>
        </div>
      </div>
    </div>
  );
};
