export type PropertyGrowthRate = 'low' | 'medium' | 'high';
export type LoanType = 'interestOnly' | 'principalAndInterest';

export const GROWTH_RATES: Record<PropertyGrowthRate, number> = {
  low: 0.03, // 3% annual growth
  medium: 0.05, // 5% annual growth
  high: 0.07, // 7% annual growth
};

export interface ProjectionData {
  year: number;
  propertyValue: number;
  debt: number;
  equity: number;
}

export interface PortfolioProperty {
  id: string;
  propertyValue: number;
  growthRate: PropertyGrowthRate;
  acquired: number | null; // The year when property was acquired, null if not yet acquired
}

export interface PropertyState extends PortfolioProperty {
  debt: number;
  value: number;
  equity: number;
}

export interface PortfolioData {
  year: number;
  totalValue: number;
  totalDebt: number;
  totalEquity: number;
  properties: {
    id: string;
    value: number;
    debt: number;
    equity: number;
  }[];
}

// Utility function to format currency
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}; 