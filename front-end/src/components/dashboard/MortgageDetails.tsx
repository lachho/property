import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MortgageDetailsProps {
  primaryMortgage: any;
  dateOfBirth: string | null;
}

const MortgageDetails: React.FC<MortgageDetailsProps> = ({ primaryMortgage, dateOfBirth }) => {
  const calculateYearsRemaining = (balance: number, monthlyPayment: number, interestRate: number) => {
    if (!balance || !monthlyPayment || !interestRate) return 0;
    
    const monthlyRate = interestRate / 100 / 12;
    let remainingBalance = balance;
    let months = 0;
    
    while (remainingBalance > 0 && months < 600) { // Cap at 50 years
      const interest = remainingBalance * monthlyRate;
      const principal = monthlyPayment - interest;
      remainingBalance -= principal;
      months++;
    }
    
    return months / 12;
  };

  const calculatePayoffAge = (yearsRemaining: number) => {
    if (!dateOfBirth || !yearsRemaining) return null;
    
    const dob = new Date(dateOfBirth);
    const currentAge = new Date().getFullYear() - dob.getFullYear();
    return currentAge + yearsRemaining;
  };

  const yearsRemaining = useMemo(() => 
    calculateYearsRemaining(
      primaryMortgage?.loanBalance || 0,
      primaryMortgage?.repaymentAmount || 0,
      primaryMortgage?.interestRate || 0
    ),
    [primaryMortgage]
  );

  const payoffAge = useMemo(() => 
    calculatePayoffAge(yearsRemaining),
    [yearsRemaining, dateOfBirth]
  );

  // Generate data for the line chart
  const generateChartData = () => {
    if (!primaryMortgage) return [];
    
    const data = [];
    const monthlyRate = primaryMortgage.interestRate / 100 / 12;
    let remainingBalance = primaryMortgage.loanBalance;
    let month = 0;
    
    while (remainingBalance > 0 && month < 600) {
      const interest = remainingBalance * monthlyRate;
      const principal = primaryMortgage.repaymentAmount - interest;
      remainingBalance -= principal;
      
      data.push({
        month: month,
        balance: Math.max(0, remainingBalance)
      });
      
      month++;
    }
    
    return data;
  };

  const chartData = useMemo(() => generateChartData(), [primaryMortgage]);

  if (!primaryMortgage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Personal Home Mortgage Position</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No primary residence mortgage found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Home Mortgage Position</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Mortgage Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Current Debt Against Home</div>
              <div className="font-medium">
                {new Intl.NumberFormat('en-AU', { 
                  style: 'currency', 
                  currency: 'AUD',
                  maximumFractionDigits: 0 
                }).format(primaryMortgage.loanBalance)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Current Monthly Repayments</div>
              <div className="font-medium">
                {new Intl.NumberFormat('en-AU', { 
                  style: 'currency', 
                  currency: 'AUD',
                  maximumFractionDigits: 0 
                }).format(primaryMortgage.repaymentAmount)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Years Remaining on Loan</div>
              <div className="font-medium">{yearsRemaining.toFixed(1)} years</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Age When Home is Paid Off</div>
              <div className="font-medium">{payoffAge ? payoffAge.toFixed(1) : 'N/A'}</div>
            </div>
          </div>

          {/* Line Chart */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  label={{ value: 'Months', position: 'insideBottom', offset: -5 }} 
                />
                <YAxis 
                  label={{ value: 'Balance', angle: -90, position: 'insideLeft' }}
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
                  labelFormatter={(label) => `Month ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#8884d8" 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MortgageDetails; 