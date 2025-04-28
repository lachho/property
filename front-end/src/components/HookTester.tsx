import React, { useState } from 'react';
import { useBorrowingCapacity, BorrowingFormData, LeadData as BorrowingLeadData } from '@/hooks/useBorrowingCapacity';
import { useMortgageCalculator, MortgageFormData, LeadData as MortgageLeadData } from '@/hooks/useMortgageCalculator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const HookTester = () => {
  const { submitLead: submitBorrowingLead, calculateCapacity } = useBorrowingCapacity();
  const { submitLead: submitMortgageLead, calculateMortgage } = useMortgageCalculator();
  
  // Form states
  const [name, setName] = useState('Test User');
  const [email, setEmail] = useState('test@example.com');
  const [phone, setPhone] = useState('0412345678');
  
  // Test borrowing capacity hook
  const testBorrowingHook = async () => {
    const formData: BorrowingFormData = {
      grossIncome: 100000,
      maritalStatus: 'single',
      dependants: 0,
      existingLoans: 10000
    };
    
    const leadData: BorrowingLeadData = {
      name,
      email,
      phone
    };
    
    const borrowingCapacity = calculateCapacity(formData);
    console.log('Calculated borrowing capacity:', borrowingCapacity);
    
    const result = await submitBorrowingLead(leadData, formData, borrowingCapacity);
    console.log('Borrowing lead submission result:', result);
  };
  
  // Test mortgage calculator hook
  const testMortgageHook = async () => {
    const mortgageFormData: MortgageFormData = {
      loanAmount: 500000,
      interestRate: 4.5,
      loanTerm: '30',
      repaymentFrequency: 'monthly',
      loanType: 'principal_and_interest',
      additionalRepayments: 0
    };
    
    const results = calculateMortgage(mortgageFormData);
    console.log('Mortgage calculation results:', results);
    
    const leadData: MortgageLeadData = {
      firstName: name.split(' ')[0],
      lastName: name.split(' ').slice(1).join(' '),
      email,
      phone,
      purchaseTimeframe: '6-12 months',
      privacyPolicy: true,
      mortgageDetails: {
        ...mortgageFormData,
        results
      }
    };
    
    const result = await submitMortgageLead(leadData);
    console.log('Mortgage lead submission result:', result);
  };
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Hook Tester</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Test Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Borrowing Capacity Hook</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testBorrowingHook}>
              Test Borrowing Capacity Hook
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Mortgage Calculator Hook</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testMortgageHook}>
              Test Mortgage Calculator Hook
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HookTester; 