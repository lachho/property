
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBorrowingCapacity } from '@/hooks/useBorrowingCapacity';

export interface FinancialData {
  income: number[];
  expenses: number[];
  assets: number[];
  liabilities: number[];
  months: string[];
}

export interface PortfolioProperty {
  id: string;
  name: string;
  purchasePrice: number;
  currentValue: number;
  growthRate: number;
  rentalIncome: number;
  expenses: number;
  mortgage: number;
}

export const useFinancialData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [financialData, setFinancialData] = useState<FinancialData>({
    income: [],
    expenses: [],
    assets: [],
    liabilities: [],
    months: []
  });
  const [portfolioProperties, setPortfolioProperties] = useState<PortfolioProperty[]>([]);
  const { calculateCapacity } = useBorrowingCapacity();

  // Mock data generation for development purposes
  const generateMockFinancialData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const income = months.map(() => Math.floor(Math.random() * 10000) + 5000);
    const expenses = months.map(() => Math.floor(Math.random() * 3000) + 2000);
    const assets = months.map((_, i) => 500000 + i * 10000 + Math.floor(Math.random() * 20000));
    const liabilities = months.map(() => 350000 - Math.floor(Math.random() * 5000));
    
    return {
      income,
      expenses,
      assets,
      liabilities,
      months
    };
  };

  const generateMockProperties = () => [
    {
      id: '1',
      name: 'Beachside Apartment',
      purchasePrice: 550000,
      currentValue: 620000,
      growthRate: 4.2,
      rentalIncome: 2300,
      expenses: 500,
      mortgage: 1800
    },
    {
      id: '2',
      name: 'City Townhouse',
      purchasePrice: 700000,
      currentValue: 780000,
      growthRate: 3.8,
      rentalIncome: 2800,
      expenses: 650,
      mortgage: 2300
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // In a real app, you would fetch this data from the database
        // For now, we're using mock data
        setFinancialData(generateMockFinancialData());
        setPortfolioProperties(generateMockProperties());
      } catch (error) {
        console.error('Error fetching financial data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load your financial data. Please try again later.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  // Calculate property growth over time
  const calculatePropertyGrowth = (property: PortfolioProperty, years: number) => {
    const growthData = [];
    let currentValue = property.purchasePrice;

    for (let i = 0; i <= years; i++) {
      growthData.push({
        year: i,
        value: Math.round(currentValue)
      });
      currentValue *= (1 + property.growthRate / 100);
    }

    return growthData;
  };

  // Calculate mortgage repayments
  const calculateMortgage = (
    loanAmount: number,
    interestRate: number,
    years: number
  ) => {
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = years * 12;
    
    const monthlyPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    return {
      monthlyPayment,
      totalRepayment: monthlyPayment * numberOfPayments,
      totalInterest: (monthlyPayment * numberOfPayments) - loanAmount
    };
  };

  // Calculate total portfolio value
  const calculateTotalPortfolioValue = () => {
    return portfolioProperties.reduce((total, property) => total + property.currentValue, 0);
  };

  // Calculate total equity
  const calculateTotalEquity = () => {
    const totalValue = calculateTotalPortfolioValue();
    const totalLiabilities = portfolioProperties.reduce((total, property) => {
      // Assume 80% of purchase price is the loan amount for this example
      return total + (property.purchasePrice * 0.8);
    }, 0);
    
    return totalValue - totalLiabilities;
  };

  // Calculate cash flow
  const calculateCashFlow = () => {
    return portfolioProperties.reduce((total, property) => {
      return total + (property.rentalIncome - property.expenses - property.mortgage);
    }, 0);
  };

  return {
    isLoading,
    financialData,
    portfolioProperties,
    calculatePropertyGrowth,
    calculateMortgage,
    calculateTotalPortfolioValue,
    calculateTotalEquity,
    calculateCashFlow
  };
};
