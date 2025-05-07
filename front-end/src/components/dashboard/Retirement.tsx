import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface RetirementProps {
  profile: any;
  assets: any[];
  liabilities: any[];
}

const Retirement: React.FC<RetirementProps> = ({ profile, assets, liabilities }) => {
  // Constants
  const RETIREMENT_AGE = 65;
  const LIFE_EXPECTANCY = 85; // Assumed life expectancy
  const INFLATION_RATE = 0.03; // 3% annual inflation
  const INVESTMENT_RETURN = 0.07; // 7% annual return

  const calculations = useMemo(() => {
    const currentAge = new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear();
    const yearsUntilRetirement = RETIREMENT_AGE - currentAge;
    const yearsRetired = LIFE_EXPECTANCY - RETIREMENT_AGE;

    // Calculate total portfolio value
    const totalPortfolioValue = assets.reduce((sum, asset) => {
      if (asset.assetType === 'Investment' || asset.assetType === 'Superannuation') {
        return sum + Number(asset.currentValue || 0);
      }
      return sum;
    }, 0);

    // Calculate total debt
    const totalDebt = liabilities.reduce((sum, liability) => 
      sum + Number(liability.loanBalance || 0), 0);

    // Net portfolio value
    const netPortfolioValue = totalPortfolioValue - totalDebt;

    // Calculate required retirement income
    const currentAnnualIncome = Number(profile.occupationDetails?.annualIncome || 0);
    const retirementIncomeNeeded = currentAnnualIncome * 0.7; // Assuming 70% of current income needed

    // Calculate total income needed for retirement (adjusted for inflation)
    const totalRetirementIncomeNeeded = retirementIncomeNeeded * yearsRetired * 
      Math.pow(1 + INFLATION_RATE, yearsUntilRetirement);

    // Calculate annual savings needed
    const futureValue = totalRetirementIncomeNeeded;
    const presentValue = netPortfolioValue;
    const years = yearsUntilRetirement;
    const rate = INVESTMENT_RETURN;

    const annualSavingsNeeded = (futureValue - presentValue * Math.pow(1 + rate, years)) / 
      ((Math.pow(1 + rate, years) - 1) / rate);

    // Calculate tax paid until retirement
    const annualTax = currentAnnualIncome * 0.3; // Assuming 30% tax rate
    const totalTaxPaid = annualTax * yearsUntilRetirement;

    return {
      yearsUntilRetirement,
      yearsRetired,
      currentAnnualIncome,
      retirementIncomeNeeded,
      totalRetirementIncomeNeeded,
      netPortfolioValue,
      annualSavingsNeeded,
      totalTaxPaid,
      portfolioShortfall: totalRetirementIncomeNeeded - netPortfolioValue
    };
  }, [profile, assets, liabilities]);

  // Data for portfolio composition pie chart
  const portfolioData = useMemo(() => {
    const investmentAssets = assets.filter(asset => 
      asset.assetType === 'Investment' || asset.assetType === 'Superannuation'
    );
    
    return investmentAssets.map(asset => ({
      name: asset.assetType,
      value: Number(asset.currentValue || 0)
    }));
  }, [assets]);

  // Data for retirement savings projection line chart
  const projectionData = useMemo(() => {
    const data = [];
    let currentValue = calculations.netPortfolioValue;
    const annualContribution = calculations.annualSavingsNeeded;

    for (let year = 0; year <= calculations.yearsUntilRetirement; year++) {
      data.push({
        year,
        value: currentValue,
        target: calculations.totalRetirementIncomeNeeded * (year / calculations.yearsUntilRetirement)
      });
      currentValue = (currentValue + annualContribution) * (1 + INVESTMENT_RETURN);
    }

    return data;
  }, [calculations]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Retirement Planning</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Years Until Retirement</div>
              <div className="text-xl font-bold">{calculations.yearsUntilRetirement}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Years in Retirement</div>
              <div className="text-xl font-bold">{calculations.yearsRetired}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Current Annual Income</div>
              <div className="text-xl font-bold">
                {new Intl.NumberFormat('en-AU', { 
                  style: 'currency', 
                  currency: 'AUD',
                  maximumFractionDigits: 0 
                }).format(calculations.currentAnnualIncome)}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Retirement Income Needed</div>
              <div className="text-xl font-bold">
                {new Intl.NumberFormat('en-AU', { 
                  style: 'currency', 
                  currency: 'AUD',
                  maximumFractionDigits: 0 
                }).format(calculations.retirementIncomeNeeded)}
              </div>
            </div>
          </div>

          {/* Portfolio Composition */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Portfolio Composition</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => 
                      new Intl.NumberFormat('en-AU', { 
                        style: 'currency', 
                        currency: 'AUD',
                        maximumFractionDigits: 0 
                      }).format(value)
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Retirement Savings Projection */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Retirement Savings Projection</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="year" 
                    label={{ value: 'Years', position: 'insideBottom', offset: -5 }} 
                  />
                  <YAxis 
                    label={{ value: 'Value', angle: -90, position: 'insideLeft' }}
                    tickFormatter={(value) => 
                      new Intl.NumberFormat('en-AU', { 
                        style: 'currency', 
                        currency: 'AUD',
                        maximumFractionDigits: 0 
                      }).format(value)
                    }
                  />
                  <Tooltip 
                    formatter={(value: number) => 
                      new Intl.NumberFormat('en-AU', { 
                        style: 'currency', 
                        currency: 'AUD',
                        maximumFractionDigits: 0 
                      }).format(value)
                    }
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    name="Projected Value"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#82ca9d" 
                    name="Target Value"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Total Income Needed</div>
              <div className="text-xl font-bold">
                {new Intl.NumberFormat('en-AU', { 
                  style: 'currency', 
                  currency: 'AUD',
                  maximumFractionDigits: 0 
                }).format(calculations.totalRetirementIncomeNeeded)}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Portfolio Shortfall</div>
              <div className="text-xl font-bold">
                {new Intl.NumberFormat('en-AU', { 
                  style: 'currency', 
                  currency: 'AUD',
                  maximumFractionDigits: 0 
                }).format(calculations.portfolioShortfall)}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Annual Savings Needed</div>
              <div className="text-xl font-bold">
                {new Intl.NumberFormat('en-AU', { 
                  style: 'currency', 
                  currency: 'AUD',
                  maximumFractionDigits: 0 
                }).format(calculations.annualSavingsNeeded)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Retirement; 