import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
  label: string;
}

interface TaxDetailsProps {
  grossIncome: number;
  expenses: number;
}

const defaultTaxBrackets: TaxBracket[] = [
  { min: 0, max: 18200, rate: 0, label: "$0 - $18,200" },
  { min: 18201, max: 45000, rate: 0.19, label: "$18,201 - $45,000" },
  { min: 45001, max: 120000, rate: 0.325, label: "$45,001 - $120,000" },
  { min: 120001, max: 180000, rate: 0.37, label: "$120,001 - $180,000" },
  { min: 180001, max: null, rate: 0.45, label: "$180,001+" }
];

const currency = (n: number) => n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 });

const TaxDetailsSection: React.FC<TaxDetailsProps> = ({ grossIncome, expenses }) => {
  const [taxBrackets, setTaxBrackets] = useState<TaxBracket[]>(defaultTaxBrackets);
  const [netIncome, setNetIncome] = useState<number>(0);
  const [taxPaid, setTaxPaid] = useState<number>(0);
  const [effectiveTaxRate, setEffectiveTaxRate] = useState<number>(0);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  useEffect(() => {
    calculateTax(grossIncome);
  }, [grossIncome, expenses, taxBrackets]);

  const calculateTax = (income: number) => {
    let totalTax = 0;
    let remainingIncome = income;

    // Calculate tax based on brackets
    for (let i = 0; i < taxBrackets.length; i++) {
      const bracket = taxBrackets[i];
      const min = bracket.min;
      const max = bracket.max;
      const rate = bracket.rate;

      if (remainingIncome <= 0) break;

      const taxableInThisBracket = max === null
        ? remainingIncome 
        : Math.min(remainingIncome, max - min + 1);

      const taxInThisBracket = taxableInThisBracket * rate;
      totalTax += taxInThisBracket;

      remainingIncome -= taxableInThisBracket;
    }

    const calculatedNetIncome = income - totalTax - expenses;
    const calculatedEffectiveTaxRate = income > 0 ? (totalTax / income) * 100 : 0;

    setTaxPaid(totalTax);
    setNetIncome(calculatedNetIncome);
    setEffectiveTaxRate(calculatedEffectiveTaxRate);
  };

  const handleRateChange = (index: number, newRate: number) => {
    const updatedBrackets = [...taxBrackets];
    updatedBrackets[index].rate = newRate;
    setTaxBrackets(updatedBrackets);
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Income Tax Details</span>
          <Button variant="outline" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
        </CardTitle>
        <CardDescription>Tax calculation and net income estimation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg border p-4">
            <div className="text-gray-500 text-sm mb-1">Gross Annual Income</div>
            <div className="text-xl font-bold">{currency(grossIncome)}</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-gray-500 text-sm mb-1">Estimated Annual Tax</div>
            <div className="text-xl font-bold">{currency(taxPaid)}</div>
            <div className="text-xs text-muted-foreground">Effective Rate: {effectiveTaxRate.toFixed(1)}%</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-gray-500 text-sm mb-1">Net Annual Income</div>
            <div className="text-xl font-bold">{currency(netIncome)}</div>
            <div className="text-xs text-muted-foreground">After tax and expenses</div>
          </div>
        </div>

        {showDetails && (
          <div className="border rounded-lg p-4 mt-4">
            <h3 className="font-medium mb-4">Customize Tax Brackets</h3>
            <div className="space-y-6">
              {taxBrackets.map((bracket, index) => (
                <div key={index} className="grid grid-cols-8 gap-4 items-center">
                  <div className="col-span-3">
                    <Label>{bracket.label}</Label>
                  </div>
                  <div className="col-span-3">
                    <Slider
                      defaultValue={[bracket.rate * 100]}
                      max={100}
                      step={1}
                      onValueChange={(values) => handleRateChange(index, values[0] / 100)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={(bracket.rate * 100).toFixed(1)}
                      min={0}
                      max={100}
                      step={0.1}
                      onChange={(e) => handleRateChange(index, parseFloat(e.target.value) / 100)}
                      className="w-full"
                    />
                    <span className="text-xs text-right w-full block">%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Adjust tax brackets to better match your actual tax situation.
              These rates are based on the Australian tax system but can be customized.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaxDetailsSection; 