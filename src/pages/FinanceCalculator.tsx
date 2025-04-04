
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMortgageCalculator } from '@/hooks/useMortgageCalculator';
import { Loader2, Calculator, ArrowRight } from 'lucide-react';
import { MortgageResultsDialog } from '@/components/MortgageResultsDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const FinanceCalculator = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('mortgage');
  const { calculateMortgage } = useMortgageCalculator();
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingReport, setIsSendingReport] = useState(false);
  
  // Mortgage calculator state
  const [loanAmount, setLoanAmount] = useState<number>(500000);
  const [interestRate, setInterestRate] = useState<number>(5.5);
  const [loanTerm, setLoanTerm] = useState<string>("30");
  const [repaymentFrequency, setRepaymentFrequency] = useState<"weekly" | "fortnightly" | "monthly">("monthly");
  const [loanType, setLoanType] = useState<"principal_and_interest" | "interest_only">("principal_and_interest");
  const [additionalRepayments, setAdditionalRepayments] = useState<number>(0);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  const handleCalculate = () => {
    setIsLoading(true);
    
    try {
      const calculationResults = calculateMortgage({
        loanAmount,
        interestRate,
        loanTerm,
        repaymentFrequency,
        loanType,
        additionalRepayments
      });
      
      setResults(calculationResults);
      setResultsOpen(true);
    } catch (error) {
      console.error('Calculation error:', error);
      toast({
        title: "Calculation Error",
        description: "There was an error calculating your mortgage. Please check your inputs and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendReport = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to send a report to your email.",
        variant: "default"
      });
      return;
    }
    
    setIsSendingReport(true);
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();
        
      if (profileError) throw profileError;
      
      const email = profileData.email;
      
      const { data, error } = await supabase
        .functions
        .invoke('send-mortgage-report', {
          body: {
            email,
            calculationData: {
              loanAmount,
              interestRate,
              loanTerm,
              repaymentFrequency,
              loanType,
              additionalRepayments,
              results
            }
          }
        });
        
      if (error) throw error;
      
      toast({
        title: "Report Sent",
        description: "Your mortgage calculation report has been sent to your email.",
      });
      
    } catch (error) {
      console.error('Error sending report:', error);
      toast({
        title: "Error",
        description: "We couldn't send your report. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSendingReport(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container px-4 mx-auto">
          <h1 className="text-3xl font-bold mb-2">Finance Calculator</h1>
          <p className="text-gray-600 mb-6">Calculate mortgage repayments and other financial metrics</p>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full sm:w-auto mb-6">
              <TabsTrigger value="mortgage">Mortgage Calculator</TabsTrigger>
              <TabsTrigger value="investment" disabled>Investment Returns</TabsTrigger>
              <TabsTrigger value="rental" disabled>Rental Yield</TabsTrigger>
            </TabsList>
            
            <TabsContent value="mortgage">
              <Card>
                <CardHeader>
                  <CardTitle>Mortgage Repayment Calculator</CardTitle>
                  <CardDescription>
                    Calculate your regular repayments, interest, and loan term
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="loanAmount">Loan Amount ($)</Label>
                        <Input 
                          id="loanAmount" 
                          type="number" 
                          value={loanAmount} 
                          onChange={(e) => setLoanAmount(Number(e.target.value))}
                          min={1000}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="interestRate">Interest Rate (%)</Label>
                        <Input 
                          id="interestRate" 
                          type="number" 
                          value={interestRate} 
                          onChange={(e) => setInterestRate(Number(e.target.value))}
                          step={0.01}
                          min={0.01}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="loanTerm">Loan Term (years)</Label>
                        <Select value={loanTerm} onValueChange={setLoanTerm}>
                          <SelectTrigger id="loanTerm">
                            <SelectValue placeholder="Select loan term" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 year</SelectItem>
                            <SelectItem value="5">5 years</SelectItem>
                            <SelectItem value="10">10 years</SelectItem>
                            <SelectItem value="15">15 years</SelectItem>
                            <SelectItem value="20">20 years</SelectItem>
                            <SelectItem value="25">25 years</SelectItem>
                            <SelectItem value="30">30 years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="repaymentFrequency">Repayment Frequency</Label>
                        <Select value={repaymentFrequency} onValueChange={(value) => setRepaymentFrequency(value as "weekly" | "fortnightly" | "monthly")}>
                          <SelectTrigger id="repaymentFrequency">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="fortnightly">Fortnightly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="loanType">Loan Type</Label>
                        <Select value={loanType} onValueChange={(value) => setLoanType(value as "principal_and_interest" | "interest_only")}>
                          <SelectTrigger id="loanType">
                            <SelectValue placeholder="Select loan type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="principal_and_interest">Principal and Interest</SelectItem>
                            <SelectItem value="interest_only">Interest Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="additionalRepayments">Additional Monthly Repayments ($)</Label>
                        <Input 
                          id="additionalRepayments" 
                          type="number" 
                          value={additionalRepayments} 
                          onChange={(e) => setAdditionalRepayments(Number(e.target.value))}
                          min={0}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                    <Button 
                      variant="default" 
                      size="lg" 
                      className="w-full sm:w-auto"
                      onClick={handleCalculate}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Calculating...
                        </>
                      ) : (
                        <>
                          <Calculator className="mr-2 h-4 w-4" />
                          Calculate Repayments
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
      
      {/* Mortgage Results Dialog */}
      {results && (
        <MortgageResultsDialog
          open={resultsOpen}
          onOpenChange={setResultsOpen}
          mortgageData={{
            loanAmount: loanAmount,
            interestRate: interestRate,
            loanTerm: loanTerm,
            repaymentFrequency: repaymentFrequency,
            loanType: loanType,
            additionalRepayments: additionalRepayments,
            results: results
          }}
          onSendReport={handleSendReport}
          isSendingReport={isSendingReport}
        />
      )}
    </div>
  );
};

export default FinanceCalculator;
