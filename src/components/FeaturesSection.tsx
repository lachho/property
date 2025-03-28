
import React from 'react';
import { Check, Target, TrendingUp, Shield, Users, Clock } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Target className="h-8 w-8 text-theme-blue" />,
      title: 'Accurate Calculations',
      description: 'Our tools use the latest financial models to ensure precise and reliable results.'
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-theme-blue" />,
      title: 'Investment Analysis',
      description: 'Analyze potential returns and performance metrics for your property investments.'
    },
    {
      icon: <Shield className="h-8 w-8 text-theme-blue" />,
      title: 'Secure Portfolio Management',
      description: 'Keep your investment data secure with our encrypted portfolio management system.'
    },
    {
      icon: <Users className="h-8 w-8 text-theme-blue" />,
      title: 'Client Management',
      description: 'Manage client relationships and track their investment journey and goals.'
    },
    {
      icon: <Clock className="h-8 w-8 text-theme-blue" />,
      title: 'Time Savings',
      description: 'Save hours of research and calculations with our streamlined investment tools.'
    },
    {
      icon: <Check className="h-8 w-8 text-theme-blue" />,
      title: 'Expert Insights',
      description: 'Access professional insights based on market data and investment strategies.'
    }
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-4">Why Choose Our Platform</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our comprehensive suite of property investment tools is designed to help you make informed decisions and maximize your returns.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 inline-block p-3 bg-theme-blue/10 rounded-full">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
