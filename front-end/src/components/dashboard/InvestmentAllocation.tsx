import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const InvestmentAllocation = ({ assets }: { assets: any[] }) => {
  // Group assets by type and sum their values
  const allocationData = assets.reduce((acc: any[], asset) => {
    const existingType = acc.find(item => item.name === asset.assetType);
    if (existingType) {
      existingType.value += Number(asset.currentValue || 0);
    } else {
      acc.push({
        name: asset.assetType,
        value: Number(asset.currentValue || 0)
      });
    }
    return acc;
  }, []);

  const totalValue = allocationData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {allocationData.map((entry, index) => (
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
        <div className="mt-4 grid grid-cols-2 gap-4">
          {allocationData.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span>{item.name}</span>
              </div>
              <span className="font-medium">
                {new Intl.NumberFormat('en-AU', { 
                  style: 'currency', 
                  currency: 'AUD',
                  maximumFractionDigits: 0 
                }).format(item.value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentAllocation; 