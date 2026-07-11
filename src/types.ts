export type AnalysisType = "PROS_CONS" | "COMPARISON" | "SWOT";

export interface ProConItem {
  id: string;
  text: string;
  isPro: boolean; // true for Pro, false for Con
  impact: number; // 1 to 5 scale
  category: string; // e.g., Career, Financial, Personal, Health
  explanation?: string;
}

export interface ProsConsAnalysis {
  decisionId: string;
  title: string;
  context?: string;
  items: ProConItem[];
  verdict: string;
  confidence: number; // 1 to 100 confidence score
  summary: string;
}

export interface CriteriaRating {
  optionName: string;
  rating: number; // 1 to 5 rating
  description: string;
  pros: string[];
  cons: string[];
}

export interface ComparisonCriteria {
  id: string;
  name: string; // e.g., Cost, Growth, Location
  weight: number; // 1 to 5 scale of importance
  ratings: CriteriaRating[]; // Rating for each option
}

export interface ComparisonAnalysis {
  decisionId: string;
  title: string;
  options: string[]; // e.g., ["Move to Seattle", "Stay Remote"]
  context?: string;
  criteriaList: ComparisonCriteria[];
  verdict: string;
  winningOption: string;
  summary: string;
}

export interface SWOTItem {
  id: string;
  text: string;
  explanation: string;
  priority: "High" | "Medium" | "Low";
}

export interface SWOTActionItem {
  id: string;
  quadrant: "Strengths" | "Weaknesses" | "Opportunities" | "Threats";
  title: string;
  description: string;
  strategyType: string; // e.g., "Leverage Strengths", "Address Weaknesses", "Seize Opportunities", "Defend Against Threats"
}

export interface SWOTAnalysis {
  decisionId: string;
  title: string;
  context?: string;
  strengths: SWOTItem[];
  weaknesses: SWOTItem[];
  opportunities: SWOTItem[];
  threats: SWOTItem[];
  strategies: SWOTActionItem[];
  verdict: string;
  summary: string;
}

export interface Decision {
  id: string;
  title: string;
  context: string;
  analysisType: AnalysisType;
  options?: string[]; // for comparison (e.g., ["A", "B"])
  createdAt: string;
  
  // Populated based on analysisType
  prosCons?: ProsConsAnalysis;
  comparison?: ComparisonAnalysis;
  swot?: SWOTAnalysis;
}
