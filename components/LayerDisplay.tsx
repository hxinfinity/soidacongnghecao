
import React from 'react';
import { LayerAnalysis } from '../types';

interface LayerDisplayProps {
  layer: LayerAnalysis;
  icon: string;
  color: string;
}

export const LayerDisplay: React.FC<LayerDisplayProps> = ({ layer, icon, color }) => {
  return (
    <div className={`p-6 rounded-3xl border ${color} bg-white shadow-lg`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[#E6C65C] ${color.replace('border-', 'bg-').split(' ')[0]}`}>
          <i className={`fas ${icon} text-xl`}></i>
        </div>
        <h3 className="text-xl font-bold text-[#0F3B2E]">{layer.title}</h3>
      </div>
      
      <p className="text-[#0F3B2E]/80 text-sm mb-4 leading-relaxed">
        {layer.description}
      </p>
      
      <div className="mb-4">
        <p className="text-xs font-bold text-[#0F3B2E]/60 uppercase tracking-widest mb-2">Chỉ số theo dõi</p>
        <div className="flex flex-wrap gap-2">
          {layer.metrics.map((m, idx) => (
            <span key={idx} className="px-3 py-1 bg-[#0F3B2E]/5 border border-[#0F3B2E]/10 rounded-lg text-xs font-medium text-[#0F3B2E]/80">
              {m}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4 bg-[#0F3B2E]/5 rounded-xl border border-dashed border-[#0F3B2E]/20">
        <p className="text-xs font-bold text-[#0F3B2E] uppercase tracking-widest mb-1">Heatmap Diagnostic</p>
        <p className="text-[#0F3B2E]/80 text-xs italic">{layer.heatmap_description}</p>
      </div>
    </div>
  );
};
