
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const BorrowingCapacity = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow section-padding">
        <div className="container-custom">
          <h1 className="heading-lg mb-6">Borrowing Capacity Calculator</h1>
          <p className="text-lg text-gray-600 mb-8">
            This tool will help you determine how much you can borrow based on your income, expenses, and current financial situation.
          </p>
          <div className="p-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-center text-gray-500">
              Borrowing capacity calculator to be implemented.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BorrowingCapacity;
