import React, { useMemo } from 'react';

function annualizeIncome(amount: number, frequency: string): number {
  switch (frequency) {
    case 'Weekly': return amount * 52;
    case 'Fortnightly': return amount * 26;
    case 'Monthly': return amount * 12;
    case 'Quarterly': return amount * 4;
    case 'Annual': return amount;
    default: return 0;
  }
}

const currency = (n: number) => n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 });

const SummarySection = ({ assets, liabilities, profile, portfolioSummary }: any) => {
  // Use useMemo to ensure calculations only run when the dependencies change
  const calculations = useMemo(() => {
    // Total asset to date (current value of all assets)
    const totalAssetToDate = assets.reduce((sum: number, a: any) => sum + (a.currentValue || 0), 0);
    
    // Total invested (sum of original purchase prices)
    const totalInvested = assets.reduce((sum: number, a: any) => sum + (a.originalPrice || 0), 0);
    
    // Income calculations
    const userIncome = Number(profile?.grossIncome || 0);
    const partnerIncome = Number(profile?.partnerIncome || 0);
    
    // Asset income (annualized)
    const assetAnnualIncome = assets.reduce((sum: number, a: any) => 
      sum + annualizeIncome(Number(a.incomeAmount || 0), a.incomeFrequency || 'Annual'), 0);
    
    // Total annual gross income including all sources
    const totalAnnualGrossIncome = userIncome + partnerIncome + assetAnnualIncome;
    
    // Liability calculations
    const totalOutstandingLoanBalance = liabilities.reduce((sum: number, l: any) => sum + (l.loanBalance || 0), 0);
    const totalLoanLimit = liabilities.reduce((sum: number, l: any) => {
      // Make sure we're working with a number
      const limitAmount = typeof l.limitAmount === 'number' ? l.limitAmount : 
                          typeof l.limitAmount === 'string' ? parseFloat(l.limitAmount) || 0 : 0;
      return sum + limitAmount;
    }, 0);
    
    // Monthly cashflow (asset income minus liability repayments)
    const monthlyAssetIncome = assetAnnualIncome / 12;
    const monthlyLiabilityExpenses = liabilities.reduce((sum: number, l: any) => 
      sum + (l.repaymentAmount || 0), 0);
    const monthlyCashflow = monthlyAssetIncome - monthlyLiabilityExpenses;
    
    // Total portfolio value (always use current calculation)
    const totalPortfolioValue = totalAssetToDate;
    
    // Total equity (assets minus liabilities)
    const totalEquity = totalAssetToDate - totalOutstandingLoanBalance;
    
    // Net annual income (gross minus tax and expenses)
    // Simple estimation, would need more detailed tax calculations in reality
    const estimatedTaxRate = 0.3; // 30% tax rate as a simple estimation
    const estimatedAnnualExpenses = monthlyLiabilityExpenses * 12;
    const netAnnualIncome = totalAnnualGrossIncome * (1 - estimatedTaxRate) - estimatedAnnualExpenses;
    
    // Number of properties
    const numberOfProperties = assets.filter((a: any) => 
      ['Primary Home', 'Investment Property'].includes(a.assetType)).length;
    
    return {
      totalAssetToDate,
      totalInvested,
      totalAnnualGrossIncome,
      totalOutstandingLoanBalance,
      totalLoanLimit,
      totalPortfolioValue,
      monthlyCashflow,
      totalEquity,
      numberOfProperties,
      netAnnualIncome
    };
  }, [assets, liabilities, profile, portfolioSummary]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-gray-500 text-sm mb-1">Total Asset to Date</div>
        <div className="text-2xl font-bold">{currency(calculations.totalAssetToDate)}</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-gray-500 text-sm mb-1">Total Invested</div>
        <div className="text-2xl font-bold">{currency(calculations.totalInvested)}</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-gray-500 text-sm mb-1">Total Annual Gross Income</div>
        <div className="text-2xl font-bold">{currency(calculations.totalAnnualGrossIncome)}</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-gray-500 text-sm mb-1">Total Annual Net Income</div>
        <div className="text-2xl font-bold">{currency(calculations.netAnnualIncome)}</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-gray-500 text-sm mb-1">Outstanding Loan Balance</div>
        <div className="text-2xl font-bold">{currency(calculations.totalOutstandingLoanBalance)}</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-gray-500 text-sm mb-1">Total Loan Limit</div>
        <div className="text-2xl font-bold">{currency(calculations.totalLoanLimit)}</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-gray-500 text-sm mb-1">Total Portfolio Value</div>
        <div className="text-2xl font-bold">{currency(calculations.totalPortfolioValue)}</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-gray-500 text-sm mb-1">Monthly Cashflow</div>
        <div className="text-2xl font-bold">{currency(calculations.monthlyCashflow)}</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-gray-500 text-sm mb-1">Total Equity</div>
        <div className="text-2xl font-bold">{currency(calculations.totalEquity)}</div>
      </div>
    </div>
  );
};

export default SummarySection; 