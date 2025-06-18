import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { calculateTax } from '@/utils/taxCalculations';

// Depreciation rates for different property types over 10 years
const DEPRECIATION_RATES = {
  Apartment: [2.7, 2.2, 2.0, 1.8, 1.5, 1.4, 1.4, 1.3, 1.3, 1.4],
  Townhouse: [2.75, 2.35, 2.1, 2.0, 1.6, 1.45, 1.45, 1.5, 1.6, 1.35],
  House: [2.45, 2.0, 1.7, 1.45, 1.45, 1.4, 1.35, 1.35, 1.35, 1.2],
  'Dual Key': [2.45, 2.0, 1.7, 1.45, 1.45, 1.4, 1.35, 1.35, 1.35, 1.2]
};

type PropertyType = 'Apartment' | 'Townhouse' | 'House' | 'Dual Key';

interface NegativeGearingTabProps {}

const NegativeGearingTab: React.FC<NegativeGearingTabProps> = () => {
  // Property details
  const [propertyType, setPropertyType] = useState<PropertyType>('House');
  const [propertyPrice, setPropertyPrice] = useState<number>(600000);
  const [ownershipPercentage, setOwnershipPercentage] = useState<number>(100);
  const [currentTaxableIncome, setCurrentTaxableIncome] = useState<number>(77000);
  const [selectedYear, setSelectedYear] = useState<number>(1);

  // Calculate rental income based on property price (approximately 2.5% annual yield)
  const estimatedAnnualRent = useMemo(() => {
    return Math.round((propertyPrice * 0.025) / 100) * 100;
  }, [propertyPrice]);
  
  // Calculate weekly rent
  const weeklyRent = useMemo(() => {
    return Math.round(estimatedAnnualRent / 52);
  }, [estimatedAnnualRent]);

  // Calculate depreciation claim based on property type and year
  const depreciationAmount = useMemo(() => {
    const depreciationRate = DEPRECIATION_RATES[propertyType][selectedYear - 1] / 100;
    return Math.round(propertyPrice * depreciationRate);
  }, [propertyType, propertyPrice, selectedYear]);

  // Calculate other expenses (approx 1.5% of property value for insurance, maintenance, etc.)
  const otherExpenses = useMemo(() => {
    return Math.round(propertyPrice * 0.015);
  }, [propertyPrice]);

  // Calculate interest expenses (assuming 80% LVR at 5.5% interest)
  const interestExpense = useMemo(() => {
    const loan = propertyPrice * 0.8;
    return Math.round(loan * 0.055);
  }, [propertyPrice]);

  // Calculate total rental deductions
  const totalDeductions = useMemo(() => {
    return depreciationAmount + otherExpenses + interestExpense;
  }, [depreciationAmount, otherExpenses, interestExpense]);

  // Calculate tax implications
  const taxAnalysis = useMemo(() => {
    // Adjust for ownership percentage
    const ownershipFactor = ownershipPercentage / 100;
    const adjustedRentalIncome = estimatedAnnualRent * ownershipFactor;
    const adjustedDeductions = totalDeductions * ownershipFactor;
    
    // Calculate new taxable income
    const newTaxableIncome = currentTaxableIncome + adjustedRentalIncome - adjustedDeductions;
    
    // Calculate taxes
    const currentTax = calculateTax(currentTaxableIncome);
    const newTax = calculateTax(newTaxableIncome);
    const taxSavings = currentTax - newTax;
    
    return {
      rentalIncome: adjustedRentalIncome,
      totalIncome: currentTaxableIncome + adjustedRentalIncome,
      rentalDeductions: adjustedDeductions,
      newTaxableIncome,
      currentTax,
      newTax,
      taxSavings
    };
  }, [currentTaxableIncome, estimatedAnnualRent, totalDeductions, ownershipPercentage]);

  // Format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', { 
      style: 'currency', 
      currency: 'AUD',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Property Input Section */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type</Label>
                <Select 
                  value={propertyType}
                  onValueChange={(value) => setPropertyType(value as PropertyType)}
                >
                  <SelectTrigger id="propertyType">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Townhouse">Townhouse</SelectItem>
                    <SelectItem value="House">House</SelectItem>
                    <SelectItem value="Dual Key">Dual Key</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="propertyPrice">Property Price</Label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">$</span>
                  <Input
                    id="propertyPrice"
                    type="number"
                    value={propertyPrice}
                    onChange={(e) => setPropertyPrice(Number(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ownershipPercentage">Ownership Percentage</Label>
                <div className="flex items-center">
                  <Input
                    id="ownershipPercentage"
                    type="number"
                    value={ownershipPercentage}
                    onChange={(e) => setOwnershipPercentage(Number(e.target.value))}
                    min={1}
                    max={100}
                  />
                  <span className="text-gray-500 ml-2">%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currentTaxableIncome">Your Current Taxable Income</Label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">$</span>
                  <Input
                    id="currentTaxableIncome"
                    type="number"
                    value={currentTaxableIncome}
                    onChange={(e) => setCurrentTaxableIncome(Number(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="selectedYear">Depreciation Year</Label>
                <Select 
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(Number(value))}
                >
                  <SelectTrigger id="selectedYear">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        Year {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Depreciation Rate Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Apartment</TableHead>
                      <TableHead>Townhouse</TableHead>
                      <TableHead>House</TableHead>
                      <TableHead>Dual Key</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((year) => (
                      <TableRow key={year} className={year === selectedYear ? "bg-blue-50" : ""}>
                        <TableCell className="font-medium">Year {year}</TableCell>
                        <TableCell>{DEPRECIATION_RATES.Apartment[year - 1]}%</TableCell>
                        <TableCell>{DEPRECIATION_RATES.Townhouse[year - 1]}%</TableCell>
                        <TableCell>{DEPRECIATION_RATES.House[year - 1]}%</TableCell>
                        <TableCell>{DEPRECIATION_RATES['Dual Key'][year - 1]}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Results Section */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Property Cash Flow Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Income</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Weekly Rent:</span>
                      <span className="font-medium">{formatCurrency(weeklyRent)}/week</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual Rental Income:</span>
                      <span className="font-medium">{formatCurrency(estimatedAnnualRent)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Expenses</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Interest (5.5% on 80% LVR):</span>
                      <span className="font-medium">{formatCurrency(interestExpense)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Depreciation (Year {selectedYear}):</span>
                      <span className="font-medium">{formatCurrency(depreciationAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Other Expenses:</span>
                      <span className="font-medium">{formatCurrency(otherExpenses)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total Deductions:</span>
                      <span>{formatCurrency(totalDeductions)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="text-lg font-semibold mb-4">Tax Impact Analysis</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="col-span-2 font-medium text-blue-800">Ownership: {ownershipPercentage}%</div>
                    <div>Current Taxable Income:</div>
                    <div className="text-right font-medium">{formatCurrency(currentTaxableIncome)}</div>
                    <div>Rental Income:</div>
                    <div className="text-right font-medium">{formatCurrency(taxAnalysis.rentalIncome)}</div>
                    <div>Total Income:</div>
                    <div className="text-right font-medium">{formatCurrency(taxAnalysis.totalIncome)}</div>
                    <div>Rental Deductions:</div>
                    <div className="text-right font-medium">{formatCurrency(taxAnalysis.rentalDeductions)}</div>
                    <div>New Taxable Income:</div>
                    <div className="text-right font-medium">{formatCurrency(taxAnalysis.newTaxableIncome)}</div>
                    
                    <div className="col-span-2 border-t border-blue-200 mt-2 pt-2"></div>
                    
                    <div>Current Tax:</div>
                    <div className="text-right font-medium">{formatCurrency(taxAnalysis.currentTax)}</div>
                    <div>New Tax:</div>
                    <div className="text-right font-medium">{formatCurrency(taxAnalysis.newTax)}</div>
                    
                    <div className="col-span-2 border-t border-blue-200 mt-2 pt-2"></div>
                    
                    <div className="font-bold">Tax Savings:</div>
                    <div className="text-right font-bold text-green-600">{formatCurrency(taxAnalysis.taxSavings)}</div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-2">Analysis Summary</h3>
                <p>
                  This {propertyType.toLowerCase()} priced at {formatCurrency(propertyPrice)} will be negatively geared 
                  by approximately {formatCurrency(totalDeductions - estimatedAnnualRent)} per year. 
                  Based on your current income of {formatCurrency(currentTaxableIncome)}, this property 
                  investment would save you <span className="font-bold text-green-600">{formatCurrency(taxAnalysis.taxSavings)}</span> in 
                  tax for year {selectedYear} of ownership.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NegativeGearingTab; 