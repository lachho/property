import React from 'react';
import { Link } from 'react-router-dom';
import { Calculator, LineChart, LayoutDashboard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ToolsSection = () => {
  const tools = [
    {
      id: 'borrowing-capacity',
      title: 'Borrowing Capacity Calculator',
      description: 'Find out how much you can borrow based on your income, expenses, and current financial situation.',
      icon: <Calculator size={48} className="text-theme-blue" />,
      path: '/borrowing-capacity'
    },
    {
      id: 'mortgage-calculator',
      title: 'Mortgage Calculator',
      description: 'Calculate mortgage payments, interest rates, loan terms, and more to plan your property financing.',
      icon: <LineChart size={48} className="text-theme-blue" />,
      path: '/mortgage-calculator'
    },
    {
      id: 'portfolio-manager',
      title: 'Portfolio Manager',
      description: 'Manage your property portfolio, track investments, and visualize your performance and goals.',
      icon: <LayoutDashboard size={48} className="text-theme-blue" />,
      path: '/portfolio-manager'
    }
  ];

  return (
    <section id="tools-section" className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-4">Our Property Investment Tools</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Leverage our suite of specialized tools designed to help you make informed property investment decisions.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <Card key={tool.id} className="border-none shadow-lg transition-all hover:shadow-xl">
              <CardHeader className="pb-2">
                <div className="mb-4">{tool.icon}</div>
                <CardTitle className="text-xl">{tool.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{tool.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <Link to={tool.path} className="w-full">
                  <Button className="w-full" variant="outline">
                    Access Tool
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
