import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type ProjectionData = {
  year: number;
  propertyValue: number;
  debt: number;
  equity: number;
};

const GROWTH_RATES = {
  low: 0.03, // 3% annual growth
  medium: 0.05, // 5% annual growth
  high: 0.07, // 7% annual growth
};

const PropertyProjections = () => {
  // State for input values
  const [propertyValue, setPropertyValue] = useState<number>(750000);
  const [growthRate, setGrowthRate] = useState<'low' | 'medium' | 'high'>('medium');
  const [loanType, setLoanType] = useState<'interestOnly' | 'principalAndInterest'>('principalAndInterest');
  const [projectionData, setProjectionData] = useState<ProjectionData[]>([]);
  const [interestRate, setInterestRate] = useState<number>(5.5);

  // Calculate projections when inputs change
  useEffect(() => {
    calculateProjections();
  }, [propertyValue, growthRate, loanType, interestRate]);

  const calculateProjections = () => {
    const years = 30;
    const data: ProjectionData[] = [];
    const annualGrowthRate = GROWTH_RATES[growthRate];
    
    // Initial values
    // Starting with 5% deposit (95% LVR)
    const initialDeposit = propertyValue * 0.05;
    let currentDebt = propertyValue - initialDeposit;
    let currentValue = propertyValue;
    
    // For Principal and Interest loan
    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = years * 12;
    const monthlyPayment = loanType === 'principalAndInterest' 
      ? (currentDebt * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)
      : 0;

    // Year 0 (starting point)
    data.push({
      year: 0,
      propertyValue: currentValue,
      debt: currentDebt,
      equity: currentValue - currentDebt,
    });

    for (let year = 1; year <= years; year++) {
      // Apply Home Guarantee Scheme in year 1 (additional 15% coverage)
      if (year === 1) {
        // Home Guarantee Scheme provides 15% coverage
        // This effectively reduces the debt by 15% of the property value
        currentDebt = currentDebt - (propertyValue * 0.15);
      }

      // Calculate property growth for this year
      currentValue = currentValue * (1 + annualGrowthRate);

      // Calculate debt reduction for this year if principal and interest
      if (loanType === 'principalAndInterest') {
        // Total annual payment
        const annualPayment = monthlyPayment * 12;
        // Calculate annual interest
        const annualInterest = currentDebt * (interestRate / 100);
        // Principal repayment is the difference
        const principalRepayment = annualPayment - annualInterest;
        
        // Ensure we don't go below zero
        currentDebt = Math.max(0, currentDebt - principalRepayment);
      }
      // Interest only loan doesn't reduce principal

      // Add data point for this year
      data.push({
        year,
        propertyValue: Math.round(currentValue),
        debt: Math.round(currentDebt),
        equity: Math.round(currentValue - currentDebt),
      });
    }

    setProjectionData(data);
  };

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="propertyValue">Property Value</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">$</span>
                  <Input
                    id="propertyValue"
                    type="number"
                    value={propertyValue}
                    onChange={(e) => setPropertyValue(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="growthRate">Capital Growth Rate</Label>
                <Select
                  value={growthRate}
                  onValueChange={(value) => setGrowthRate(value as 'low' | 'medium' | 'high')}
                >
                  <SelectTrigger id="growthRate">
                    <SelectValue placeholder="Select growth rate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (3% per annum)</SelectItem>
                    <SelectItem value="medium">Medium (5% per annum)</SelectItem>
                    <SelectItem value="high">High (7% per annum)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  step="0.1"
                  min="0"
                  max="20"
                  className="flex-1"
                />
              </div>

              <div>
                <Label htmlFor="loanType">Loan Type</Label>
                <Select
                  value={loanType}
                  onValueChange={(value) => setLoanType(value as 'interestOnly' | 'principalAndInterest')}
                >
                  <SelectTrigger id="loanType">
                    <SelectValue placeholder="Select loan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interestOnly">Interest Only</SelectItem>
                    <SelectItem value="principalAndInterest">Principal & Interest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={calculateProjections} className="w-full">
                Recalculate Projections
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium text-lg mb-2">Key Assumptions</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Initial deposit is 5% of property value</li>
              <li>Home Guarantee Scheme provides 15% coverage in Year 1</li>
              <li>For Principal & Interest loans, a 30-year term is assumed</li>
              <li>Interest Only loans do not reduce principal over time</li>
              <li>Capital growth is compound and applied annually</li>
              <li>Inflation and market fluctuations are not included</li>
              <li>No additional contributions or withdrawals from equity are considered</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="graph" className="w-full">
        <TabsList>
          <TabsTrigger value="graph">Graph</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>
        
        <TabsContent value="graph" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={projectionData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="year" 
                      label={{ value: 'Years', position: 'insideBottomRight', offset: -10 }} 
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                      label={{ value: 'Amount (AUD)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${formatCurrency(Number(value))}`, '']} 
                      labelFormatter={(label) => `Year ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="propertyValue" 
                      name="Property Value" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="debt" 
                      name="Debt" 
                      stroke="#ff7300" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="equity" 
                      name="Equity" 
                      stroke="#82ca9d" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="table" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Property Value</TableHead>
                      <TableHead>Debt</TableHead>
                      <TableHead>Equity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectionData.map((data) => (
                      <TableRow key={data.year}>
                        <TableCell>{data.year}</TableCell>
                        <TableCell>{formatCurrency(data.propertyValue)}</TableCell>
                        <TableCell>{formatCurrency(data.debt)}</TableCell>
                        <TableCell>{formatCurrency(data.equity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <h3 className="font-medium mb-2">Disclaimer</h3>
        <p className="text-sm text-gray-600">
          Note that the projections listed above simply illustrate the outcome calculated from the input values 
          and the assumptions contained in the model. Hence the figures can be varied as required and are in no 
          way intended to be a guarantee of future performance. All financial decisions should be made in 
          consultation with a qualified financial advisor.
        </p>
      </div>
    </div>
  );
};

export default PropertyProjections; 