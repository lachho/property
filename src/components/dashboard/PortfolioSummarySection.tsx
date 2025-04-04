
import React from 'react';
import PortfolioSummary from '@/components/PortfolioSummary';

interface PortfolioSummarySectionProps {
  totalPortfolioValue: number;
  portfolioGrowthPercentage: number;
  monthlyCashflow: number;
  cashflowPercentage: number;
  totalEquity: number;
  equityPercentage: number;
  propertiesCount: number;
}

const PortfolioSummarySection: React.FC<PortfolioSummarySectionProps> = ({
  totalPortfolioValue,
  portfolioGrowthPercentage,
  monthlyCashflow,
  cashflowPercentage,
  totalEquity,
  equityPercentage,
  propertiesCount
}) => {
  return (
    <PortfolioSummary 
      totalValue={totalPortfolioValue || 0}
      growthPercentage={portfolioGrowthPercentage}
      cashflow={monthlyCashflow}
      cashflowPercentage={cashflowPercentage}
      equity={totalEquity}
      equityPercentage={equityPercentage}
      propertyCount={propertiesCount}
    />
  );
};

export default PortfolioSummarySection;
