import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5'];

const LiabilitiesBreakdown = ({ liabilities }: { liabilities: any[] }) => {
  const totalLoanBalance = liabilities.reduce((sum, l) => sum + Number(l.loanBalance || 0), 0);
  const totalLimit = liabilities.reduce((sum, l) => sum + Number(l.limitAmount || 0), 0);
  const utilizationPercentage = (totalLoanBalance / totalLimit) * 100;

  // Group liabilities by type and sum their values
  const liabilityData = liabilities.reduce((acc: any[], liability) => {
    const existingType = acc.find(item => item.name === liability.liabilityType);
    if (existingType) {
      existingType.value += Number(liability.loanBalance || 0);
    } else {
      acc.push({
        name: liability.liabilityType,
        value: Number(liability.loanBalance || 0)
      });
    }
    return acc;
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liabilities Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Pie Chart */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={liabilityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {liabilityData.map((entry, index) => (
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
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Overall Utilization */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">Total Credit Utilization</span>
              <span className="text-sm font-medium">{utilizationPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={utilizationPercentage} className="h-2" />
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Total Loan Balance</div>
                <div className="font-medium">
                  {new Intl.NumberFormat('en-AU', { 
                    style: 'currency', 
                    currency: 'AUD',
                    maximumFractionDigits: 0 
                  }).format(totalLoanBalance)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Credit Limit</div>
                <div className="font-medium">
                  {new Intl.NumberFormat('en-AU', { 
                    style: 'currency', 
                    currency: 'AUD',
                    maximumFractionDigits: 0 
                  }).format(totalLimit)}
                </div>
              </div>
            </div>
          </div>

          {/* Individual Loans */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Loan Details</h3>
            <div className="space-y-4">
              {liabilities.map((loan, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">{loan.liabilityType}</div>
                      <div className="text-sm text-gray-500">{loan.lenderType}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {new Intl.NumberFormat('en-AU', { 
                          style: 'currency', 
                          currency: 'AUD',
                          maximumFractionDigits: 0 
                        }).format(loan.loanBalance)}
                      </div>
                      <div className="text-sm text-gray-500">
                        of {new Intl.NumberFormat('en-AU', { 
                          style: 'currency', 
                          currency: 'AUD',
                          maximumFractionDigits: 0 
                        }).format(loan.limitAmount)}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                    <div>
                      <div className="text-gray-500">Interest Rate</div>
                      <div className="font-medium">{loan.interestRate}%</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Repayment</div>
                      <div className="font-medium">
                        {new Intl.NumberFormat('en-AU', { 
                          style: 'currency', 
                          currency: 'AUD',
                          maximumFractionDigits: 0 
                        }).format(loan.repaymentAmount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Frequency</div>
                      <div className="font-medium">{loan.repaymentFrequency}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiabilitiesBreakdown; 