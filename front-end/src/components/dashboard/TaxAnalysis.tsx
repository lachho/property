import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateTax, formatCurrency } from '@/utils/taxCalculations';

interface TaxAnalysisProps {
  profile: any;
  assets: any[];
  liabilities: any[];
}

const TaxAnalysis: React.FC<TaxAnalysisProps> = ({ profile, assets, liabilities }) => {
  const calculations = useMemo(() => {
    const grossIncome = Number(profile.grossIncome || 0);
    const partnerIncome = Number(profile.partnerIncome || 0);
    const nonTaxableIncome = Number(profile.nonTaxableIncome || 0);
    const partnerNonTaxableIncome = Number(profile.partnerNonTaxableIncome || 0);

    // Calculate tax for primary income
    const primaryTax = calculateTax(grossIncome);
    const primaryNetIncome = grossIncome - primaryTax;

    // Calculate tax for partner income if applicable
    const partnerTax = profile.assessWithPartner ? calculateTax(partnerIncome) : 0;
    const partnerNetIncome = partnerIncome - partnerTax;

    // Calculate total household income
    const totalGrossIncome = grossIncome + partnerIncome;
    const totalNonTaxableIncome = nonTaxableIncome + partnerNonTaxableIncome;
    const totalTax = primaryTax + partnerTax;
    const totalNetIncome = primaryNetIncome + partnerNetIncome + totalNonTaxableIncome;

    // Calculate effective tax rate
    const effectiveTaxRate = totalGrossIncome > 0 ? (totalTax / totalGrossIncome) * 100 : 0;

    // Generate tax bracket data for visualization
    const taxBrackets = [
      { name: '0-18,200', rate: '0%', threshold: 18200 },
      { name: '18,201-45,000', rate: '16%', threshold: 45000 },
      { name: '45,001-135,000', rate: '30%', threshold: 135000 },
      { name: '135,001-190,000', rate: '37%', threshold: 190000 },
      { name: '190,001+', rate: '45%', threshold: Infinity }
    ];

    return {
      primaryTax,
      primaryNetIncome,
      partnerTax,
      partnerNetIncome,
      totalGrossIncome,
      totalNonTaxableIncome,
      totalTax,
      totalNetIncome,
      effectiveTaxRate,
      taxBrackets
    };
  }, [profile]);

  // Data for tax bracket visualization
  const taxBracketData = useMemo(() => {
    return calculations.taxBrackets.map(bracket => ({
      name: bracket.name,
      rate: bracket.rate,
      threshold: bracket.threshold
    }));
  }, [calculations.taxBrackets]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Total Gross Income</div>
              <div className="text-xl font-bold">
                {formatCurrency(calculations.totalGrossIncome)}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Total Tax Paid</div>
              <div className="text-xl font-bold">
                {formatCurrency(calculations.totalTax)}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Total Net Income</div>
              <div className="text-xl font-bold">
                {formatCurrency(calculations.totalNetIncome)}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Effective Tax Rate</div>
              <div className="text-xl font-bold">{calculations.effectiveTaxRate.toFixed(1)}%</div>
            </div>
          </div>

          {/* Tax Bracket Visualization */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tax Brackets</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taxBracketData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    label={{ value: 'Threshold', angle: -90, position: 'insideLeft' }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="threshold" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Primary Income</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Gross Income:</span>
                  <span className="font-medium">
                    {formatCurrency(Number(profile.grossIncome || 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax Paid:</span>
                  <span className="font-medium">
                    {formatCurrency(calculations.primaryTax)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Net Income:</span>
                  <span className="font-medium">
                    {formatCurrency(calculations.primaryNetIncome)}
                  </span>
                </div>
              </div>
            </div>

            {profile.assessWithPartner && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Partner Income</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gross Income:</span>
                    <span className="font-medium">
                      {formatCurrency(Number(profile.partnerIncome || 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax Paid:</span>
                    <span className="font-medium">
                      {formatCurrency(calculations.partnerTax)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Net Income:</span>
                    <span className="font-medium">
                      {formatCurrency(calculations.partnerNetIncome)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaxAnalysis; 