
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Home, DollarSign, Building } from 'lucide-react';

interface PortfolioSummaryProps {
  totalValue: number;
  growthPercentage: number;
  cashflow: number;
  cashflowPercentage: number;
  equity: number;
  equityPercentage: number;
  propertyCount: number;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  totalValue,
  growthPercentage,
  cashflow,
  cashflowPercentage,
  equity,
  equityPercentage,
  propertyCount,
}) => {
  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-sm text-gray-500 font-normal">Total Portfolio Value</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center">
            <Home className="mr-2 h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">{formatCurrency(totalValue)}</span>
          </div>
          <div className="flex items-center mt-2 text-green-600">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span className="text-sm">{growthPercentage}% growth</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-sm text-gray-500 font-normal">Monthly Cashflow</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center">
            <DollarSign className="mr-2 h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">{formatCurrency(cashflow)}</span>
          </div>
          <div className={`flex items-center mt-2 ${cashflowPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {cashflowPercentage >= 0 ? (
              <ArrowUpRight className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 mr-1" />
            )}
            <span className="text-sm">{Math.abs(cashflowPercentage)}% {cashflowPercentage >= 0 ? 'increase' : 'decrease'}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-sm text-gray-500 font-normal">Total Equity</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center">
            <Building className="mr-2 h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">{formatCurrency(equity)}</span>
          </div>
          <div className={`flex items-center mt-2 ${equityPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {equityPercentage >= 0 ? (
              <ArrowUpRight className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 mr-1" />
            )}
            <span className="text-sm">{Math.abs(equityPercentage)}% {equityPercentage >= 0 ? 'growth' : 'decline'}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-sm text-gray-500 font-normal">Properties</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center">
            <Building className="mr-2 h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">{propertyCount}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioSummary;
