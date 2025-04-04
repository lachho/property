
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileEdit, FileCog, Plus } from 'lucide-react';
import PortfolioValueChart from '@/components/charts/PortfolioValueChart';
import PropertyAllocationChart from '@/components/charts/PropertyAllocationChart';
import CashFlowChart from '@/components/charts/CashFlowChart';

interface PortfolioOverviewTabProps {
  portfolioValueData: any[];
  propertyAllocationData: any[];
  cashFlowData: any[];
}

const PortfolioOverviewTab: React.FC<PortfolioOverviewTabProps> = ({
  portfolioValueData,
  propertyAllocationData,
  cashFlowData
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PortfolioValueChart data={portfolioValueData} />
        <PropertyAllocationChart data={propertyAllocationData} />
      </div>
      
      <CashFlowChart data={cashFlowData} />
      
      <Card>
        <CardHeader>
          <CardTitle>Financial Management</CardTitle>
          <CardDescription>
            Update your financial information to get more accurate portfolio projections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <FileEdit className="h-4 w-4" />
              Update Income Details
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <FileCog className="h-4 w-4" />
              Manage Loan Information
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add External Asset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioOverviewTab;
