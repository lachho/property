import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface MortgagePosition {
  propertyValue: number;
  loanBalance: number;
  interestRate: number;
  monthlyRepayment: number;
  remainingTerm: number; // in years
}

interface PersonalHomeMortgageProps {
  assets: any[];
  liabilities: any[];
}

const currency = (n: number) => n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 });
const percentage = (n: number) => `${n.toFixed(2)}%`;

const PersonalHomeMortgageSection: React.FC<PersonalHomeMortgageProps> = ({ assets, liabilities }) => {
  const mortgagePosition = useMemo(() => {
    // Find primary residence asset
    const primaryHome = assets.find(asset => asset.assetType === 'Primary Home');
    
    // Find primary home loan
    const homeLoan = liabilities.find(loan => 
      (loan.isPrimaryResidence === true || loan.liabilityType === 'Mortgage') && 
      loan.loanBalance > 0
    );
    
    if (!primaryHome || !homeLoan) {
      return null;
    }
    
    return {
      propertyValue: primaryHome.currentValue || 0,
      loanBalance: homeLoan.loanBalance || 0,
      interestRate: homeLoan.interestRate || 0,
      monthlyRepayment: homeLoan.repaymentAmount || 0,
      remainingTerm: 25, // Assumed default
    };
  }, [assets, liabilities]);

  if (!mortgagePosition) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Personal Home Mortgage Position</CardTitle>
          <CardDescription>No primary residence or mortgage found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            Add a Primary Home asset and a Mortgage liability to see your position.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const { propertyValue, loanBalance, interestRate, monthlyRepayment, remainingTerm } = mortgagePosition;
  const equity = propertyValue - loanBalance;
  const equityPercentage = (equity / propertyValue) * 100;
  const loanToValueRatio = (loanBalance / propertyValue) * 100;
  const annualRepayments = monthlyRepayment * 12;
  const estimatedYearsToPayoff = loanBalance / annualRepayments;
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Personal Home Mortgage Position</CardTitle>
        <CardDescription>Current position of your primary residence</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Equity: {currency(equity)} ({percentage(equityPercentage)})</span>
            <span className="text-sm font-medium">Loan: {currency(loanBalance)} ({percentage(loanToValueRatio)})</span>
          </div>
          <Progress value={equityPercentage} className="h-4" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border p-4">
            <div className="text-gray-500 text-sm mb-1">Property Value</div>
            <div className="text-xl font-bold">{currency(propertyValue)}</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-gray-500 text-sm mb-1">Loan Balance</div>
            <div className="text-xl font-bold">{currency(loanBalance)}</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-gray-500 text-sm mb-1">Equity</div>
            <div className="text-xl font-bold">{currency(equity)}</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-gray-500 text-sm mb-1">Interest Rate</div>
            <div className="text-xl font-bold">{percentage(interestRate)}</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-gray-500 text-sm mb-1">Monthly Repayment</div>
            <div className="text-xl font-bold">{currency(monthlyRepayment)}</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-gray-500 text-sm mb-1">Est. Years to Payoff</div>
            <div className="text-xl font-bold">{estimatedYearsToPayoff.toFixed(1)} years</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalHomeMortgageSection; 