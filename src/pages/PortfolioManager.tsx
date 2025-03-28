
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PortfolioManager = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow section-padding">
        <div className="container-custom">
          <h1 className="heading-lg mb-6">Portfolio Manager</h1>
          <p className="text-lg text-gray-600 mb-8">
            Manage your property portfolio, track investments, monitor client relationships, and visualize performance and goals.
          </p>
          <div className="p-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-center text-gray-500">
              Portfolio manager dashboard to be implemented.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PortfolioManager;
