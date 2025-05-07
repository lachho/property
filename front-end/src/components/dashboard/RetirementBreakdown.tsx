import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const RetirementBreakdown = ({ profile }: { profile: any }) => {
  // Calculate years until retirement
  const currentAge = Number(profile?.age || 0);
  const retirementAge = Number(profile?.retirementAge || 65);
  const yearsUntilRetirement = Math.max(0, retirementAge - currentAge);

  // Calculate superannuation balance and growth
  const superBalance = Number(profile?.superBalance || 0);
  const annualContribution = Number(profile?.superContribution || 0);
  const employerContribution = Number(profile?.grossIncome || 0) * 0.105; // 10.5% employer contribution
  const totalAnnualContribution = annualContribution + employerContribution;

  // Projected balance at retirement (simple calculation)
  const annualReturn = 0.07; // 7% annual return
  const projectedBalance = superBalance * Math.pow(1 + annualReturn, yearsUntilRetirement) +
    totalAnnualContribution * ((Math.pow(1 + annualReturn, yearsUntilRetirement) - 1) / annualReturn);

  // Calculate retirement income (4% rule)
  const annualRetirementIncome = projectedBalance * 0.04;
  const monthlyRetirementIncome = annualRetirementIncome / 12;

  // Calculate progress to retirement goal
  const targetBalance = Number(profile?.retirementTarget || 0);
  const progressPercentage = (superBalance / targetBalance) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Retirement Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Status */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Current Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Current Balance</div>
                <div className="text-xl font-bold">
                  {new Intl.NumberFormat('en-AU', { 
                    style: 'currency', 
                    currency: 'AUD',
                    maximumFractionDigits: 0 
                  }).format(superBalance)}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Years Until Retirement</div>
                <div className="text-xl font-bold">{yearsUntilRetirement}</div>
              </div>
            </div>
          </div>

          {/* Progress to Goal */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">Progress to Retirement Goal</span>
              <span className="text-sm font-medium">{progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="mt-2 text-right text-sm">
              Target: {new Intl.NumberFormat('en-AU', { 
                style: 'currency', 
                currency: 'AUD',
                maximumFractionDigits: 0 
              }).format(targetBalance)}
            </div>
          </div>

          {/* Contributions */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Annual Contributions</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Personal Contribution</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('en-AU', { 
                    style: 'currency', 
                    currency: 'AUD',
                    maximumFractionDigits: 0 
                  }).format(annualContribution)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Employer Contribution</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('en-AU', { 
                    style: 'currency', 
                    currency: 'AUD',
                    maximumFractionDigits: 0 
                  }).format(employerContribution)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Total Annual Contribution</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('en-AU', { 
                    style: 'currency', 
                    currency: 'AUD',
                    maximumFractionDigits: 0 
                  }).format(totalAnnualContribution)}
                </span>
              </div>
            </div>
          </div>

          {/* Projections */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Retirement Projections</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Projected Balance at Retirement</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('en-AU', { 
                    style: 'currency', 
                    currency: 'AUD',
                    maximumFractionDigits: 0 
                  }).format(projectedBalance)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Projected Monthly Income</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('en-AU', { 
                    style: 'currency', 
                    currency: 'AUD',
                    maximumFractionDigits: 0 
                  }).format(monthlyRetirementIncome)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RetirementBreakdown; 