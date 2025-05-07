import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, LineChart, PieChart, Calculator, FileText, Building2 } from 'lucide-react';
import PropertyProjections from '@/components/modeling/PropertyProjections';

const ModelingDashboard = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg">Loading modeling dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Investment Modeling Dashboard</h1>
              <p className="text-gray-600">
                Explore different property investment scenarios and their potential outcomes
              </p>
            </div>
          </div>

          <Tabs defaultValue="projections" className="space-y-6">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="projections">
                <LineChart className="w-4 h-4 mr-2" />
                Property Projections
              </TabsTrigger>
              <TabsTrigger value="portfolio">
                <PieChart className="w-4 h-4 mr-2" />
                Portfolio Potential
              </TabsTrigger>
              <TabsTrigger value="breakdown">
                <FileText className="w-4 h-4 mr-2" />
                Detailed Breakdown
              </TabsTrigger>
              <TabsTrigger value="tax">
                <Calculator className="w-4 h-4 mr-2" />
                Tax and Fees
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projections">
              <PropertyProjections />
            </TabsContent>

            <TabsContent value="portfolio">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Potential</CardTitle>
                  <CardDescription>
                    Analyze the potential performance of different portfolio compositions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Content will be added later */}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="breakdown">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Breakdown</CardTitle>
                  <CardDescription>
                    Get a comprehensive analysis of investment scenarios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Content will be added later */}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tax">
              <Card>
                <CardHeader>
                  <CardTitle>Tax and Fees</CardTitle>
                  <CardDescription>
                    Calculate tax implications and associated fees for different investment strategies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Content will be added later */}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ModelingDashboard; 