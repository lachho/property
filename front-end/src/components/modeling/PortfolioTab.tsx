import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PropertyCard from './PropertyCard';
import { calculatePortfolioProjections } from './utils';
import { formatCurrency, PropertyGrowthRate, PortfolioProperty, PortfolioData } from './types';

// Simple random ID generator - no need for uuid package
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

interface PortfolioTabProps {
  defaultInterestRate?: number;
}

const PortfolioTab: React.FC<PortfolioTabProps> = ({
  defaultInterestRate = 5.5
}) => {
  // State for portfolio properties
  const [properties, setProperties] = useState<PortfolioProperty[]>([
    { id: generateId(), propertyValue: 500000, growthRate: 'medium', acquired: null },
    { id: generateId(), propertyValue: 600000, growthRate: 'medium', acquired: null },
    { id: generateId(), propertyValue: 750000, growthRate: 'medium', acquired: null }
  ]);
  const [portfolioData, setPortfolioData] = useState<PortfolioData[]>([]);
  const [activeView, setActiveView] = useState<'summary' | 'individual'>('summary');
  const [lastProjection, setLastProjection] = useState<Record<string, number>>({});

  // Calculate portfolio projections
  useEffect(() => {
    recalculateProjections();
  }, [properties]);

  const recalculateProjections = () => {
    const data = calculatePortfolioProjections(properties);
    setPortfolioData(data);
    
    // Track when each property was acquired for UI display
    const acquiredYears: Record<string, number> = {};
    properties.forEach(prop => {
      if (prop.acquired !== null) {
        acquiredYears[prop.id] = prop.acquired;
      }
    });
    
    // Find when properties were acquired in the simulation
    if (data.length) {
      data.forEach(yearData => {
        // Check which properties exist in this year
        yearData.properties.forEach(prop => {
          if (prop.value > 0 && !acquiredYears[prop.id]) {
            acquiredYears[prop.id] = yearData.year;
          }
        });
      });
    }
    
    setLastProjection(acquiredYears);
  };

  // Update property values
  const updateProperty = (id: string, field: 'propertyValue' | 'growthRate', value: any) => {
    const updatedProperties = properties.map(prop => {
      if (prop.id === id) {
        return { ...prop, [field]: value };
      }
      return prop;
    });
    
    setProperties(updatedProperties);
  };

  // Add a new property
  const addProperty = () => {
    const newProperty: PortfolioProperty = {
      id: generateId(),
      propertyValue: 500000,
      growthRate: 'medium',
      acquired: null
    };
    
    setProperties([...properties, newProperty]);
  };

  // Remove a property
  const removeProperty = (id: string) => {
    // Prevent removing the first property
    if (properties.length <= 1) return;
    
    setProperties(properties.filter(prop => prop.id !== id));
  };

  // Get colors for individual property lines
  const getPropertyColor = (index: number) => {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00C49F', '#FFBB28', '#FF8042'];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Property Portfolio</h2>
          <Button onClick={addProperty}>Add Property</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property, index) => (
            <PropertyCard 
              key={property.id}
              property={property}
              index={index}
              onUpdate={updateProperty}
              onDelete={removeProperty}
              acquiredYear={lastProjection[property.id] || property.acquired}
            />
          ))}
        </div>

        <Button onClick={recalculateProjections} className="w-full">
          Recalculate Portfolio Projections
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium text-lg mb-2">Portfolio Strategy Assumptions</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Initial deposit is 10% of first property value</li>
            <li>Additional 5% of property value is added to loan for fees and costs</li>
            <li>Properties are purchased using Interest Only loans</li>
            <li>New properties are acquired when refinancing existing properties provides enough for a 10% deposit</li>
            <li>Refinancing limit is 80% of current property value</li>
            <li>Capital growth is compound and applied annually</li>
            <li>Inflation and market fluctuations are not included</li>
          </ul>
        </CardContent>
      </Card>

      <Tabs defaultValue="summary" value={activeView} onValueChange={(value) => setActiveView(value as 'summary' | 'individual')} className="w-full">
        <TabsList>
          <TabsTrigger value="summary">Total Portfolio</TabsTrigger>
          <TabsTrigger value="individual">Individual Properties</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="pt-4">
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium text-lg mb-4">Total Portfolio Growth</h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={portfolioData}
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
                        dataKey="totalValue" 
                        name="Total Property Value" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="totalDebt" 
                        name="Total Debt" 
                        stroke="#ff7300" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="totalEquity" 
                        name="Total Equity" 
                        stroke="#82ca9d" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium text-lg mb-4">Portfolio Projection Table</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Year</TableHead>
                        <TableHead>Total Value</TableHead>
                        <TableHead>Total Debt</TableHead>
                        <TableHead>Total Equity</TableHead>
                        <TableHead>Properties Acquired</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {portfolioData.map((data) => (
                        <TableRow key={data.year}>
                          <TableCell>{data.year}</TableCell>
                          <TableCell>{formatCurrency(data.totalValue)}</TableCell>
                          <TableCell>{formatCurrency(data.totalDebt)}</TableCell>
                          <TableCell>{formatCurrency(data.totalEquity)}</TableCell>
                          <TableCell>
                            {data.properties.filter(p => p.value > 0).length}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="individual" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium text-lg mb-4">Individual Property Values</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={portfolioData}
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
                    {properties.map((property, index) => (
                      <Line 
                        key={property.id}
                        type="monotone" 
                        dataKey={`properties[${index}].value`}
                        name={`Property ${index + 1} Value`}
                        stroke={getPropertyColor(index)}
                        activeDot={{ r: 6 }}
                        connectNulls={true}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardContent className="pt-6">
              <h3 className="font-medium text-lg mb-4">Individual Property Equity</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={portfolioData}
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
                    {properties.map((property, index) => (
                      <Line 
                        key={property.id}
                        type="monotone" 
                        dataKey={`properties[${index}].value`}
                        name={`Property ${index + 1} Value`}
                        stroke={getPropertyColor(index)}
                        activeDot={{ r: 6 }}
                        connectNulls={true}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioTab;