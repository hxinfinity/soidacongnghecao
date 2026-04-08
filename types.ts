
export enum Severity {
  VERY_LIGHT = 'Rất nhẹ',
  LIGHT = 'Nhẹ',
  MEDIUM = 'Trung bình',
  HEAVY = 'Nặng',
  VERY_HEAVY = 'Rất nặng'
}

export interface SkinMetric {
  name: string;
  score: number; // 0-100
  severity: Severity;
  analysis: string;
  cause: string;
  highlight_areas: string;
  recommendation: string;
}

export interface LayerAnalysis {
  title: string;
  description: string;
  metrics: string[];
  heatmap_description: string;
}

export interface SymmetryAnalysis {
  balance_score: number;
  weak_side: string;
  comparison: string;
  t_zone_vs_u_zone: string;
}

export interface AgingPrediction {
  without_care: string;
  with_care: string;
  improvement_percent: number;
}

export interface TreatmentRecommendation {
  plan_name: string;
  description: string;
  duration_30_days: string;
  duration_60_days: string;
  duration_90_days: string;
  suggested_services: string[];
}

export interface SkinAnalysisResult {
  overview: {
    skin_score: number;
    skin_type: string;
    top_3_issues: string[];
    weakest_area: string;
  };
  layers: {
    surface: LayerAnalysis;
    pigmentation: LayerAnalysis;
    dermis: LayerAnalysis;
    vascular: LayerAnalysis;
  };
  detailed_metrics: SkinMetric[];
  symmetry: SymmetryAnalysis;
  aging: AgingPrediction;
  treatment: TreatmentRecommendation;
}
