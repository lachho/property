import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, LineChart, PieChart, Calculator, FileText, Building2, TrendingDown, BriefcaseBusiness } from 'lucide-react';
import SinglePropertyTab from '@/components/modeling/SinglePropertyTab';
import PortfolioTab from '@/components/modeling/PortfolioTab';
import NegativeGearingTab from '@/components/modeling/NegativeGearingTab';

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

          <Tabs defaultValue="market-reality" className="space-y-6">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="market-reality">
                <BriefcaseBusiness className="w-4 h-4 mr-2" />
                Market Reality
              </TabsTrigger>
              <TabsTrigger value="single">
                <LineChart className="w-4 h-4 mr-2" />
                Single Property
              </TabsTrigger>
              <TabsTrigger value="portfolio">
                <PieChart className="w-4 h-4 mr-2" />
                Portfolio Potential
              </TabsTrigger>
              <TabsTrigger value="negative-gearing">
                <TrendingDown className="w-4 h-4 mr-2" />
                Negative Gearing
              </TabsTrigger>
              <TabsTrigger value="breakdown">
                <FileText className="w-4 h-4 mr-2" />
                Detailed Breakdown
              </TabsTrigger>
            </TabsList>

            <TabsContent value="market-reality" className="pt-4">
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle>The Property Investment Reality in Australia</CardTitle>
                  <CardDescription className="text-gray-700">
                    Australian Tax Office data highlights the challenges of scaling a property portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-blue-200">
                          <th className="py-2 px-3 text-left">Portfolio Size</th>
                          <th className="py-2 px-3 text-left">Number of Investors</th>
                          <th className="py-2 px-3 text-left">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-blue-100">
                          <td className="py-2 px-3">One property</td>
                          <td className="py-2 px-3">1,284,852 investors</td>
                          <td className="py-2 px-3">73% of all property investors</td>
                        </tr>
                        <tr className="border-b border-blue-100">
                          <td className="py-2 px-3">Two properties</td>
                          <td className="py-2 px-3">318,295 investors</td>
                          <td className="py-2 px-3">18% of all property investors</td>
                        </tr>
                        <tr className="border-b border-blue-100">
                          <td className="py-2 px-3">Three properties</td>
                          <td className="py-2 px-3">96,991 investors</td>
                          <td className="py-2 px-3">5% of all property investors</td>
                        </tr>
                        <tr className="border-b border-blue-100">
                          <td className="py-2 px-3">Four properties</td>
                          <td className="py-2 px-3">34,967 investors</td>
                          <td className="py-2 px-3">2% of all property investors</td>
                        </tr>
                        <tr className="border-b border-blue-100">
                          <td className="py-2 px-3">Five properties</td>
                          <td className="py-2 px-3">14,555 investors</td>
                          <td className="py-2 px-3">1% of all property investors</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3">Six or more properties</td>
                          <td className="py-2 px-3">15,264 investors</td>
                          <td className="py-2 px-3">1% of all property investors</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-4 bg-white p-4 rounded-md border border-blue-200">
                    <p className="text-gray-700 font-medium">
                      As a percentage of eligible adults, very few Australians invest in property. Of those that do, even fewer move past their first one.
                    </p>
                    <p className="text-gray-700 mt-2">
                      <strong>Why?</strong> Most people don't have a plan, guidance, and accountability. This highlights the importance of working with professional property strategists.
                    </p>
                    <div className="mt-4">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Book a Strategy Session
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="single" className="pt-4">
              <SinglePropertyTab defaultInterestRate={5.5} />
              
              <div className="bg-gray-50 p-4 mt-6 rounded-md border border-gray-200">
                <h3 className="font-medium mb-2">Disclaimer</h3>
                <p className="text-sm text-gray-600">
                  Note that the projections listed above simply illustrate the outcome calculated from the input values 
                  and the assumptions contained in the model. Hence the figures can be varied as required and are in no 
                  way intended to be a guarantee of future performance. All financial decisions should be made in 
                  consultation with a qualified financial advisor.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="portfolio" className="pt-4">
              <PortfolioTab defaultInterestRate={5.5} />
              
              <div className="bg-gray-50 p-4 mt-6 rounded-md border border-gray-200">
                <h3 className="font-medium mb-2">Disclaimer</h3>
                <p className="text-sm text-gray-600">
                  Note that the projections listed above simply illustrate the outcome calculated from the input values 
                  and the assumptions contained in the model. Hence the figures can be varied as required and are in no 
                  way intended to be a guarantee of future performance. All financial decisions should be made in 
                  consultation with a qualified financial advisor.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="negative-gearing" className="pt-4">
              <NegativeGearingTab />
              
              <div className="bg-gray-50 p-4 mt-6 rounded-md border border-gray-200">
                <h3 className="font-medium mb-2">Disclaimer</h3>
                <p className="text-sm text-gray-600">
                  Note that the tax estimations listed above simply illustrate potential outcomes calculated from the input values.
                  Actual tax outcomes will depend on individual circumstances and may vary. All financial and tax decisions should 
                  be made in consultation with a qualified financial advisor and tax professional.
                </p>
              </div>
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
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ModelingDashboard; 