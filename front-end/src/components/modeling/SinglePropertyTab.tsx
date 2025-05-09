import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { calculateSinglePropertyProjection } from './utils';
import { formatCurrency, PropertyGrowthRate, LoanType, ProjectionData } from './types';

interface SinglePropertyTabProps {
  defaultPropertyValue?: number;
  defaultGrowthRate?: PropertyGrowthRate;
  defaultLoanType?: LoanType;
  defaultInterestRate?: number;
}

const SinglePropertyTab: React.FC<SinglePropertyTabProps> = ({
  defaultPropertyValue = 750000,
  defaultGrowthRate = 'medium',
  defaultLoanType = 'interestOnly',
  defaultInterestRate = 5.5
}) => {
  // State for input values
  const [propertyValue, setPropertyValue] = useState<number>(defaultPropertyValue);
  const [growthRate, setGrowthRate] = useState<PropertyGrowthRate>(defaultGrowthRate);
  const [loanType, setLoanType] = useState<LoanType>(defaultLoanType);
  const [interestRate, setInterestRate] = useState<number>(defaultInterestRate);
  const [projectionData, setProjectionData] = useState<ProjectionData[]>([]);
  const [activeView, setActiveView] = useState<'graph' | 'table'>('graph');

  // Calculate projections when inputs change
  useEffect(() => {
    recalculateProjections();
  }, [propertyValue, growthRate, loanType, interestRate]);

  const recalculateProjections = () => {
    const data = calculateSinglePropertyProjection(
      propertyValue,
      growthRate,
      loanType,
      interestRate
    );
    setProjectionData(data);
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
                  onValueChange={(value) => setGrowthRate(value as PropertyGrowthRate)}
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
                  onValueChange={(value) => setLoanType(value as LoanType)}
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

              <Button onClick={recalculateProjections} className="w-full">
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

      <Tabs defaultValue="graph" value={activeView} onValueChange={(value) => setActiveView(value as 'graph' | 'table')} className="w-full">
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
    </div>
  );
};

export default SinglePropertyTab; 