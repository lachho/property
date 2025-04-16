import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { 
  Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DatePicker } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import apiService, { Asset, Liability, Profile, ProfileDetailsDto } from '@/services/api';

// Type definitions to match backend entities
type AssetType = {
  id?: number;
  assetType: string;
  currentValue: number;
  originalPrice: number;
  yearPurchased: number;
  ownershipPercentage: number;
  incomeAmount: number;
  incomeFrequency: string;
  description?: string;
  profile?: { id: string } | null;
};

type LiabilityType = {
  id?: number;
  liabilityType: string;
  isPrimaryResidence?: boolean;
  loanBalance: number;
  limitAmount?: number;
  lenderType: string;
  interestRate: number;
  termType: string;
  repaymentAmount: number;
  repaymentFrequency: string;
  loanType: string;
  description?: string;
  profile?: { id: string } | null;
};

type ClientFormData = {
  // Personal Details
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  phone: string;
  address: string;
  email: string;
  
  // Occupation Details
  occupation: string;
  employer: string;
  employmentLength: number;
  employmentType: string;
  onProbation: boolean;
  grossIncome: number;
  nonTaxableIncome: number;
  
  // Partner Assessment
  assessWithPartner: boolean;
  partnerFirstName: string;
  partnerLastName: string;
  partnerDob: Date | null;
  partnerMobile: string;
  partnerAddress: string;
  partnerEmail: string;
  partnerOccupation: string;
  partnerEmployer: string;
  partnerEmploymentLength: number;
  partnerEmploymentType: string;
  partnerOnProbation: boolean;
  partnerIncome: number;
  partnerNonTaxableIncome: number;
  
  // Expense Details
  isRenting: boolean;
  rentPerWeek: number;
  monthlyLivingExpenses: number;
  residenceHistory: string;
  dependants: number;
  dependantsAgeRanges: string;
  
  // Retirement Details
  retirementPassiveIncomeGoal: number;
  desiredRetirementAge: number;
  
  // Repeatable Sections
  assets: AssetType[];
  liabilities: LiabilityType[];
};

interface ClientDetailsFormProps {
  clientId?: string;
  onSaved?: () => void;
}

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Casual', 'Self-employed', 'Contract', 'Unemployed'];
const ASSET_TYPES = ['Primary Home', 'Investment Property', 'Business', 'Shares', 'Super', 'Savings', 'Other'];
const LIABILITY_TYPES = ['Mortgage', 'Credit Card', 'Vehicle Loan', 'HECS', 'Childcare', 'School', 'Insurance', 'Private Health', 'Other Loans', 'Share Margin Lending'];
const INCOME_FREQUENCIES = ['Weekly', 'Fortnightly', 'Monthly', 'Quarterly', 'Annual'];
const REPAYMENT_FREQUENCIES = ['Weekly', 'Fortnightly', 'Monthly'];
const TERM_TYPES = ['Fixed', 'Variable'];
const LOAN_TYPES = ['Interest Only', 'Principal and Interest'];

const ClientDetailsForm: React.FC<ClientDetailsFormProps> = ({ clientId, onSaved }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<ClientFormData>({
    defaultValues: {
      // Personal Details
      firstName: '',
      lastName: '',
      dateOfBirth: null,
      phone: '',
      address: '',
      email: '',
      
      // Occupation Details
      occupation: '',
      employer: '',
      employmentLength: 0,
      employmentType: '',
      onProbation: false,
      grossIncome: 0,
      nonTaxableIncome: 0,
      
      // Partner Assessment
      assessWithPartner: false,
      partnerFirstName: '',
      partnerLastName: '',
      partnerDob: null,
      partnerMobile: '',
      partnerAddress: '',
      partnerEmail: '',
      partnerOccupation: '',
      partnerEmployer: '',
      partnerEmploymentLength: 0,
      partnerEmploymentType: '',
      partnerOnProbation: false,
      partnerIncome: 0,
      partnerNonTaxableIncome: 0,
      
      // Expense Details
      isRenting: false,
      rentPerWeek: 0,
      monthlyLivingExpenses: 0,
      residenceHistory: '',
      dependants: 0,
      dependantsAgeRanges: '',
      
      // Retirement Details
      retirementPassiveIncomeGoal: 0,
      desiredRetirementAge: 65,
      
      // Repeatable Sections
      assets: [],
      liabilities: []
    }
  });
  
  const { fields: assetFields, append: appendAsset, remove: removeAsset } = useFieldArray({
    control: form.control,
    name: "assets"
  });
  
  const { fields: liabilityFields, append: appendLiability, remove: removeLiability } = useFieldArray({
    control: form.control,
    name: "liabilities"
  });
  
  useEffect(() => {
    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);
  
  const fetchClientData = async () => {
    if (!clientId) return;
    
    setIsLoading(true);
    try {
      // Fetch profile details including assets and liabilities
      const response = await apiService.getProfileDetails(clientId);
      const profileDetails = response.data;
      
      if (profileDetails) {
        const profile = profileDetails.profile;
        
        // Format dates from strings to Date objects
        const dateOfBirth = profile.dateOfBirth ? new Date(profile.dateOfBirth) : null;
        const partnerDob = profile.partnerDob ? new Date(profile.partnerDob) : null;
        
        // Prepare assets and liabilities to match form structure
        const formattedAssets = profileDetails.assets.map((asset: AssetType) => ({
          ...asset,
          // Ensure numeric fields are numbers
          currentValue: Number(asset.currentValue),
          originalPrice: Number(asset.originalPrice),
          yearPurchased: Number(asset.yearPurchased),
          ownershipPercentage: Number(asset.ownershipPercentage),
          incomeAmount: Number(asset.incomeAmount)
        }));
        
        const formattedLiabilities = profileDetails.liabilities.map((liability: LiabilityType) => ({
          ...liability,
          // Ensure numeric fields are numbers
          loanBalance: Number(liability.loanBalance),
          limitAmount: liability.limitAmount ? Number(liability.limitAmount) : 0,
          interestRate: Number(liability.interestRate),
          repaymentAmount: Number(liability.repaymentAmount)
        }));
        
        form.reset({
          // Personal Details
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          dateOfBirth: dateOfBirth,
          phone: profile.phone || '',
          address: profile.address || '',
          email: profile.email || '',
          
          // Occupation Details
          occupation: profile.occupation || '',
          employer: profile.employer || '',
          employmentLength: profile.employmentLength || 0,
          employmentType: profile.employmentType || '',
          onProbation: profile.onProbation || false,
          grossIncome: profile.grossIncome || 0,
          nonTaxableIncome: profile.nonTaxableIncome || 0,
          
          // Partner Assessment
          assessWithPartner: profile.assessWithPartner || false,
          partnerFirstName: profile.partnerFirstName || '',
          partnerLastName: profile.partnerLastName || '',
          partnerDob: partnerDob,
          partnerMobile: profile.partnerMobile || '',
          partnerAddress: profile.partnerAddress || '',
          partnerEmail: profile.partnerEmail || '',
          partnerOccupation: profile.partnerOccupation || '',
          partnerEmployer: profile.partnerEmployer || '',
          partnerEmploymentLength: profile.partnerEmploymentLength || 0,
          partnerEmploymentType: profile.partnerEmploymentType || '',
          partnerOnProbation: profile.partnerOnProbation || false,
          partnerIncome: profile.partnerIncome || 0,
          partnerNonTaxableIncome: profile.partnerNonTaxableIncome || 0,
          
          // Expense Details
          isRenting: profile.isRenting || false,
          rentPerWeek: profile.rentPerWeek || 0,
          monthlyLivingExpenses: profile.monthlyLivingExpenses || 0,
          residenceHistory: profile.residenceHistory || '',
          dependants: profile.dependants || 0,
          dependantsAgeRanges: profile.dependantsAgeRanges || '',
          
          // Retirement Details
          retirementPassiveIncomeGoal: profile.retirementPassiveIncomeGoal || 0,
          desiredRetirementAge: profile.desiredRetirementAge || 65,
          
          // Repeatable Sections
          assets: formattedAssets || [],
          liabilities: formattedLiabilities || []
        });
      }
      
    } catch (error) {
      console.error('Error fetching client data:', error);
      toast({
        title: "Error",
        description: "Failed to load client data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const onSubmit = async (data: ClientFormData) => {
    setIsSaving(true);
    try {
      // Prepare asset data - ensure numeric values are actually numbers
      const formattedAssets = data.assets.map(asset => ({
        ...asset,
        currentValue: Number(asset.currentValue),
        originalPrice: Number(asset.originalPrice),
        yearPurchased: Number(asset.yearPurchased),
        ownershipPercentage: Number(asset.ownershipPercentage),
        incomeAmount: Number(asset.incomeAmount),
        // Remove the profile reference - it will be assigned by the backend
        profile: undefined
      }));
      
      // Prepare liability data - ensure numeric values are actually numbers
      const formattedLiabilities = data.liabilities.map(liability => ({
        ...liability,
        loanBalance: Number(liability.loanBalance),
        limitAmount: liability.limitAmount ? Number(liability.limitAmount) : undefined,
        interestRate: Number(liability.interestRate),
        repaymentAmount: Number(liability.repaymentAmount),
        // Remove the profile reference - it will be assigned by the backend
        profile: undefined
      }));
      
      // Format the data for the API
      const formattedData = {
        profile: {
          // Personal Details
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          phone: data.phone,
          address: data.address,
          email: data.email,
          
          // Occupation Details
          occupation: data.occupation,
          employer: data.employer,
          employmentLength: Number(data.employmentLength),
          employmentType: data.employmentType,
          onProbation: data.onProbation,
          grossIncome: Number(data.grossIncome),
          nonTaxableIncome: Number(data.nonTaxableIncome),
          
          // Partner Assessment
          assessWithPartner: data.assessWithPartner,
          partnerFirstName: data.partnerFirstName,
          partnerLastName: data.partnerLastName,
          partnerDob: data.partnerDob,
          partnerMobile: data.partnerMobile,
          partnerAddress: data.partnerAddress,
          partnerEmail: data.partnerEmail,
          partnerOccupation: data.partnerOccupation,
          partnerEmployer: data.partnerEmployer,
          partnerEmploymentLength: Number(data.partnerEmploymentLength),
          partnerEmploymentType: data.partnerEmploymentType,
          partnerOnProbation: data.partnerOnProbation,
          partnerIncome: Number(data.partnerIncome),
          partnerNonTaxableIncome: Number(data.partnerNonTaxableIncome),
          
          // Expense Details
          isRenting: data.isRenting,
          rentPerWeek: Number(data.rentPerWeek),
          monthlyLivingExpenses: Number(data.monthlyLivingExpenses),
          residenceHistory: data.residenceHistory,
          dependants: Number(data.dependants),
          dependantsAgeRanges: data.dependantsAgeRanges,
          
          // Retirement Details
          retirementPassiveIncomeGoal: Number(data.retirementPassiveIncomeGoal),
          desiredRetirementAge: Number(data.desiredRetirementAge),
          
          // Required fields from Profile interface
          income: Number(data.grossIncome), // Use grossIncome as income
          additionalIncome: Number(data.nonTaxableIncome), // Use nonTaxableIncome as additionalIncome
          additionalIncomeSource: "Other", // Default value
          savings: 0, // Default value, add UI field if needed
          assets: [], // Will be populated by the backend
          liabilities: [] // Will be populated by the backend
        },
        assets: formattedAssets,
        liabilities: formattedLiabilities
      };
      
      if (clientId) {
        // Update existing client
        await apiService.updateProfileDetails(clientId, formattedData);
        toast({
          title: "Success",
          description: "Client details saved successfully"
        });
      } else {
        // Create new client
        await apiService.createProfileDetails(formattedData);
        toast({
          title: "Success",
          description: "New client created successfully"
        });
      }
      
      if (onSaved) {
        onSaved();
      }
      
    } catch (error) {
      console.error('Error saving client data:', error);
      toast({
        title: "Error",
        description: "Failed to save client data",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const addNewAsset = () => {
    appendAsset({
      assetType: '',
      currentValue: 0,
      originalPrice: 0,
      yearPurchased: new Date().getFullYear(),
      ownershipPercentage: 100,
      incomeAmount: 0,
      incomeFrequency: 'Monthly',
      description: ''
    });
  };
  
  const addNewLiability = () => {
    appendLiability({
      liabilityType: '',
      loanBalance: 0,
      limitAmount: 0,
      lenderType: '',
      interestRate: 0,
      termType: 'Variable',
      repaymentAmount: 0,
      repaymentFrequency: 'Monthly',
      loanType: 'Principal and Interest',
      description: ''
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid grid-cols-6 mb-6">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="occupation">Occupation</TabsTrigger>
            <TabsTrigger value="partner">Partner</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
          </TabsList>
          
          {/* Personal Details Tab */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
                <CardDescription>Enter client's basic personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Last name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <DatePicker 
                            date={field.value} 
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email address" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Full address" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Occupation Details Tab */}
          <TabsContent value="occupation">
            <Card>
              <CardHeader>
                <CardTitle>Occupation Details</CardTitle>
                <CardDescription>Enter client's occupation and income information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupation</FormLabel>
                        <FormControl>
                          <Input placeholder="Occupation" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="employer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employer</FormLabel>
                        <FormControl>
                          <Input placeholder="Employer" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="employmentLength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Length of Employment (years)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Years" 
                            min={0} 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="employmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EMPLOYMENT_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="onProbation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">On Probation</FormLabel>
                        <FormDescription>
                          Is the client currently on probation at their job?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="grossIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gross Income ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Annual gross income" 
                            min={0} 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="nonTaxableIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Non-Taxable Income ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Annual non-taxable income" 
                            min={0} 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Partner Assessment Tab */}
          <TabsContent value="partner">
            <Card>
              <CardHeader>
                <CardTitle>Partner Assessment</CardTitle>
                <CardDescription>Include partner details for joint assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="assessWithPartner"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Assess with Partner</FormLabel>
                        <FormDescription>
                          Enable to include partner in financial assessment
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {form.watch("assessWithPartner") && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="partnerFirstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Partner First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="First name" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="partnerLastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Partner Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Last name" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="partnerDob"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Partner Date of Birth</FormLabel>
                            <FormControl>
                              <DatePicker 
                                date={field.value} 
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date()}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="partnerMobile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Partner Mobile Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Phone number" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="partnerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Partner Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Email address" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="partnerAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Partner Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Full address" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="border-t pt-6">
                      <h3 className="font-medium mb-4">Partner Occupation Details</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="partnerOccupation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Partner Occupation</FormLabel>
                              <FormControl>
                                <Input placeholder="Occupation" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="partnerEmployer"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Partner Employer</FormLabel>
                              <FormControl>
                                <Input placeholder="Employer" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="partnerEmploymentLength"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Partner Length of Employment (years)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Years" 
                                  min={0} 
                                  {...field} 
                                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="partnerEmploymentType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Partner Employment Type</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select employment type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {EMPLOYMENT_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="partnerOnProbation"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Partner On Probation</FormLabel>
                              <FormDescription>
                                Is the partner currently on probation at their job?
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <FormField
                          control={form.control}
                          name="partnerIncome"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Partner Gross Income ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Annual gross income" 
                                  min={0} 
                                  {...field} 
                                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="partnerNonTaxableIncome"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Partner Non-Taxable Income ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Annual non-taxable income" 
                                  min={0} 
                                  {...field} 
                                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Expenses Tab */}
          <TabsContent value="expenses">
            <Card>
              <CardHeader>
                <CardTitle>Expense & Retirement Details</CardTitle>
                <CardDescription>Enter expense information and retirement goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Expense Details */}
                <div className="space-y-6">
                  <h3 className="font-medium">Expense Details</h3>
                  
                  <FormField
                    control={form.control}
                    name="isRenting"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Renting?</FormLabel>
                          <FormDescription>
                            Is the client currently renting a property?
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("isRenting") && (
                    <FormField
                      control={form.control}
                      name="rentPerWeek"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rent per Week ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Weekly rent" 
                              min={0} 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={form.control}
                    name="monthlyLivingExpenses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Monthly Living Expenses ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Monthly expenses" 
                            min={0} 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="residenceHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Residence History (last 3 years)</FormLabel>
                        <FormDescription>
                          List previous addresses if client has moved in the last 3 years
                        </FormDescription>
                        <FormControl>
                          <Textarea 
                            placeholder="Previous addresses" 
                            {...field} 
                            className="min-h-[100px]"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="dependants"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Dependants</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Number of dependants" 
                              min={0} 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    {form.watch("dependants") > 0 && (
                      <FormField
                        control={form.control}
                        name="dependantsAgeRanges"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age Ranges of Dependants</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., 2-5, 8-10, 15-18" 
                                {...field} 
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
                
                {/* Retirement Details */}
                <div className="border-t pt-6 space-y-6">
                  <h3 className="font-medium">Retirement Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="retirementPassiveIncomeGoal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passive Income Goal for Retirement ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Annual passive income goal" 
                              min={0} 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="desiredRetirementAge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Desired Retirement Age</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Retirement age" 
                              min={0} 
                              max={120} 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.valueAsNumber || 65)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Assets Tab */}
          <TabsContent value="assets">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Assets</CardTitle>
                  <CardDescription>Add client's assets</CardDescription>
                </div>
                <Button type="button" onClick={addNewAsset} size="sm">
                  <Plus className="mr-1 h-4 w-4" /> Add Asset
                </Button>
              </CardHeader>
              <CardContent>
                {assetFields.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No assets added. Click the button above to add an asset.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {assetFields.map((field, index) => (
                      <div key={field.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium">Asset {index + 1}</h4>
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="sm"
                            onClick={() => removeAsset(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`assets.${index}.assetType`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Asset Type</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select asset type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {ASSET_TYPES.map((type) => (
                                        <SelectItem key={type} value={type}>
                                          {type}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`assets.${index}.currentValue`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Current Value ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="Current value" 
                                      min={0} 
                                      {...field} 
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          {/* Other asset fields can go here - we've shortened this for brevity */}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Liabilities Tab */}
          <TabsContent value="liabilities">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Liabilities</CardTitle>
                  <CardDescription>Add client's liabilities</CardDescription>
                </div>
                <Button type="button" onClick={addNewLiability} size="sm">
                  <Plus className="mr-1 h-4 w-4" /> Add Liability
                </Button>
              </CardHeader>
              <CardContent>
                {liabilityFields.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No liabilities added. Click the button above to add a liability.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {liabilityFields.map((field, index) => (
                      <div key={field.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium">Liability {index + 1}</h4>
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="sm"
                            onClick={() => removeLiability(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`liabilities.${index}.liabilityType`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Liability Type</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select liability type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {LIABILITY_TYPES.map((type) => (
                                        <SelectItem key={type} value={type}>
                                          {type}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`liabilities.${index}.loanBalance`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Loan Balance ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="Loan balance" 
                                      min={0} 
                                      {...field} 
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          {/* Other liability fields can go here - shortened for brevity */}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Client Details'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ClientDetailsForm; 