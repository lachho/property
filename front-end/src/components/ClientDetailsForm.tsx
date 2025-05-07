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
import apiService, { Asset, Liability, Profile, ProfileDetailsDto, Portfolio } from '@/services/api';
import AssetListSection from './AssetListSection';
import LiabilityListSection from './LiabilityListSection';

type AddressFields = {
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
};

type PartnerAddressFields = {
  partnerStreet: string;
  partnerSuburb: string;
  partnerState: string;
  partnerPostcode: string;
  partnerCountry: string;
};

type ClientFormData = {
  // Personal Details
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  phone: string;
  email: string;
  // Split address
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
  
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
  partnerEmail: string;
  // Split partner address
  partnerStreet: string;
  partnerSuburb: string;
  partnerState: string;
  partnerPostcode: string;
  partnerCountry: string;
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
  
  // Other
  existingLoans: number;
  maritalStatus: string;
  
  // Repeatable Sections
  assets: Asset[];
  liabilities: Liability[];
  portfolios: Portfolio[];
};

interface ClientDetailsFormProps {
  clientId?: string;
  onSaved?: () => void;
}

export const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Casual', 'Self-employed', 'Contract', 'Unemployed'];
export const ASSET_TYPES = ['Primary Home', 'Investment Property', 'Business', 'Shares', 'Super', 'Savings', 'Other'];
export const LIABILITY_TYPES = ['Mortgage', 'Credit Card', 'Vehicle Loan', 'HECS', 'Childcare', 'School', 'Insurance', 'Private Health', 'Other Loans', 'Share Margin Lending'];
export const INCOME_FREQUENCIES = ['Weekly', 'Fortnightly', 'Monthly', 'Quarterly', 'Annual'];
export const REPAYMENT_FREQUENCIES = ['Weekly', 'Fortnightly', 'Monthly'];
export const TERM_TYPES = ['Fixed', 'Variable'];
export const LOAN_TYPES = ['Interest Only', 'Principal and Interest'];

// Helper functions for address parsing and joining
function parseAddress(address: string | null | undefined = ''): AddressFields {
  // Handle null or undefined address
  if (!address) {
    return { street: '', suburb: '', state: '', postcode: '', country: '' };
  }
  
  // Very simple split: Street, Suburb, State, Postcode, Country
  // e.g. "123 Main St, Sydney, NSW, 2000, Australia"
  const [street = '', suburb = '', state = '', postcode = '', country = ''] = address.split(',').map(s => s.trim());
  return { street, suburb, state, postcode, country };
}

function joinAddress({ street, suburb, state, postcode, country }: AddressFields): string {
  return [street, suburb, state, postcode, country].filter(Boolean).join(', ');
}

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
      email: '',
      street: '',
      suburb: '',
      state: '',
      postcode: '',
      country: '',
      
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
      partnerEmail: '',
      partnerStreet: '',
      partnerSuburb: '',
      partnerState: '',
      partnerPostcode: '',
      partnerCountry: '',
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
      
      // Other
      existingLoans: 0,
      maritalStatus: '',
      
      // Repeatable Sections
      assets: [],
      liabilities: [],
      portfolios: []
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
    if (!clientId) {
      console.error('No clientId provided to fetchClientData');
      toast({
        title: "Error",
        description: "No client ID provided.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      // Fetch profile details including assets and liabilities
      const response = await apiService.getProfileDetails(clientId);
      const profileDetails = response.data;
      console.log('Fetched profileDetails for clientId', clientId, profileDetails);
      
      // Add validation for profile data
      if (!profileDetails) {
        throw new Error('No profile details received from API');
      }
      
      if (!profileDetails.profile) {
        throw new Error('Profile data is missing from API response');
      }
      
      const profile = profileDetails.profile;
      console.log('Profile data:', profile);
      
      // Log address data before parsing
      console.log('Raw address data:', {
        address: profile.address,
        partnerAddress: profile.partnerAddress
      });
      
      // Format dates from strings to Date objects
      const dateOfBirth = profile.dateOfBirth ? new Date(profile.dateOfBirth) : null;
      const partnerDob = profile.partnerDob ? new Date(profile.partnerDob) : null;
      
      // Parse addresses
      const { street, suburb, state, postcode, country } = parseAddress(profile.address);
      const { street: partnerStreet, suburb: partnerSuburb, state: partnerState, postcode: partnerPostcode, country: partnerCountry } = parseAddress(profile.partnerAddress);
      
      // Log parsed data
      console.log('Parsed address data:', { street, suburb, state, postcode, country });
      console.log('Parsed partner address data:', { partnerStreet, partnerSuburb, partnerState, partnerPostcode, partnerCountry });
      
      // Prepare assets and liabilities to match form structure
      const formattedAssets = (profileDetails.assets || []).map((asset: Asset) => {
        console.log('Processing asset:', asset);
        return {
          ...asset,
          // Ensure numeric fields are numbers
          currentValue: Number(asset.currentValue),
          originalPrice: Number(asset.originalPrice),
          yearPurchased: Number(asset.yearPurchased),
          ownershipPercentage: Number(asset.ownershipPercentage),
          incomeAmount: Number(asset.incomeAmount)
        };
      });
      
      const formattedLiabilities = (profileDetails.liabilities || []).map((liability: Liability) => {
        console.log('Processing liability:', liability);
        return {
          ...liability,
          // Ensure numeric fields are numbers
          loanBalance: Number(liability.loanBalance),
          limitAmount: liability.limitAmount ? Number(liability.limitAmount) : 0,
          interestRate: Number(liability.interestRate),
          repaymentAmount: Number(liability.repaymentAmount)
        };
      });
      
      form.reset({
        // Personal Details
        firstName: profile.firstName,
        lastName: profile.lastName,
        dateOfBirth,
        phone: profile.phone,
        email: profile.email,
        street,
        suburb,
        state,
        postcode,
        country,
        
        // Occupation Details
        occupation: profile.occupation,
        employer: profile.employer,
        employmentLength: profile.employmentLength,
        employmentType: profile.employmentType,
        onProbation: profile.onProbation,
        grossIncome: profile.grossIncome,
        nonTaxableIncome: profile.nonTaxableIncome,
        
        // Partner Assessment
        assessWithPartner: profile.assessWithPartner,
        partnerFirstName: profile.partnerFirstName,
        partnerLastName: profile.partnerLastName,
        partnerDob,
        partnerMobile: profile.partnerMobile,
        partnerEmail: profile.partnerEmail,
        partnerStreet,
        partnerSuburb,
        partnerState,
        partnerPostcode,
        partnerCountry,
        partnerOccupation: profile.partnerOccupation,
        partnerEmployer: profile.partnerEmployer,
        partnerEmploymentLength: profile.partnerEmploymentLength,
        partnerEmploymentType: profile.partnerEmploymentType,
        partnerOnProbation: profile.partnerOnProbation,
        partnerIncome: profile.partnerIncome,
        partnerNonTaxableIncome: profile.partnerNonTaxableIncome,
        
        // Expense Details
        isRenting: profile.isRenting,
        rentPerWeek: profile.rentPerWeek,
        monthlyLivingExpenses: profile.monthlyLivingExpenses,
        residenceHistory: profile.residenceHistory,
        dependants: profile.dependants,
        dependantsAgeRanges: profile.dependantsAgeRanges,
        
        // Retirement Details
        retirementPassiveIncomeGoal: profile.retirementPassiveIncomeGoal,
        desiredRetirementAge: profile.desiredRetirementAge,
        
        // Other
        existingLoans: profile.existingLoans,
        maritalStatus: profile.maritalStatus,
        
        // Repeatable Sections
        assets: formattedAssets,
        liabilities: formattedLiabilities,
        portfolios: profileDetails.portfolios || []
      });
    } catch (error) {
      console.error('Error fetching client data:', error);
      // Log more detailed error information
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      if (error && typeof error === 'object' && 'response' in error) {
        console.error('API Error response:', error.response?.data);
        console.error('API Error status:', error.response?.status);
      }
      toast({
        title: "Error",
        description: "Failed to load client data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const onSubmit = async (data: ClientFormData) => {
    if (!clientId) {
      console.error('No clientId provided to onSubmit');
      toast({
        title: "Error",
        description: "No client ID provided.",
        variant: "destructive"
      });
      return;
    }
    setIsSaving(true);
    try {
      // Format asset and liability data
      const formattedAssets = data.assets.map(asset => ({
        ...asset,
        // Ensure numeric values are numbers
        currentValue: Number(asset.currentValue),
        originalPrice: Number(asset.originalPrice),
        yearPurchased: Number(asset.yearPurchased),
        ownershipPercentage: Number(asset.ownershipPercentage),
        incomeAmount: Number(asset.incomeAmount)
      }));
      
      const formattedLiabilities = data.liabilities.map(liability => ({
        ...liability,
        // Ensure numeric values are numbers
        loanBalance: Number(liability.loanBalance),
        limitAmount: liability.limitAmount ? Number(liability.limitAmount) : 0,
        interestRate: Number(liability.interestRate),
        repaymentAmount: Number(liability.repaymentAmount)
      }));
      
      // Construct the profile data
      // Format the data for the API
      const formattedData: ProfileDetailsDto = {
        profile: {
          // Personal Details
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          phone: data.phone,
          address: joinAddress({
            street: data.street,
            suburb: data.suburb,
            state: data.state,
            postcode: data.postcode,
            country: data.country
          }),
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
          partnerAddress: joinAddress({
            street: data.partnerStreet,
            suburb: data.partnerSuburb,
            state: data.partnerState,
            postcode: data.partnerPostcode,
            country: data.partnerCountry
          }),
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
          // Other
          existingLoans: Number(data.existingLoans),
          maritalStatus: data.maritalStatus,
          // Related entities
          assets: [],
          liabilities: [],
          portfolios: []
        },
        assets: formattedAssets,
        liabilities: formattedLiabilities,
        portfolios: data.portfolios || []
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
          <TabsList className="grid grid-cols-7 mb-6">
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
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street</FormLabel>
                      <FormControl>
                        <Input placeholder="Street" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="suburb"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Suburb</FormLabel>
                      <FormControl>
                        <Input placeholder="Suburb" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="postcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postcode</FormLabel>
                      <FormControl>
                        <Input placeholder="Postcode" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Country" {...field} />
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
                            placeholder="Any annual non-taxable income" 
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
                      name="partnerStreet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Partner Street</FormLabel>
                          <FormControl>
                            <Input placeholder="Street" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="partnerSuburb"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Partner Suburb</FormLabel>
                          <FormControl>
                            <Input placeholder="Suburb" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="partnerState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Partner State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="partnerPostcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Partner Postcode</FormLabel>
                          <FormControl>
                            <Input placeholder="Postcode" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="partnerCountry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Partner Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Country" {...field} />
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
                                  value={field.value || 0}
                                  onChange={(e) => {
                                    const value = e.target.valueAsNumber || 0;
                                    field.onChange(value);
                                    // Force form to update
                                    form.setValue("partnerIncome", value, { 
                                      shouldDirty: true,
                                      shouldTouch: true,
                                      shouldValidate: true 
                                    });
                                  }}
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
                                  value={field.value || 0}
                                  onChange={(e) => {
                                    const value = e.target.valueAsNumber || 0;
                                    field.onChange(value);
                                    // Force form to update
                                    form.setValue("partnerNonTaxableIncome", value, {
                                      shouldDirty: true,
                                      shouldTouch: true,
                                      shouldValidate: true
                                    });
                                  }}
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
                              value={field.value || 0}
                              onChange={(e) => {
                                const value = e.target.valueAsNumber || 0;
                                field.onChange(value);
                                form.setValue("rentPerWeek", value, {
                                  shouldDirty: true,
                                  shouldTouch: true,
                                  shouldValidate: true
                                });
                              }}
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
                            value={field.value || 0}
                            onChange={(e) => {
                              const value = e.target.valueAsNumber || 0;
                              field.onChange(value);
                              form.setValue("monthlyLivingExpenses", value, {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true
                              });
                            }}
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
                              value={field.value || 0}
                              onChange={(e) => {
                                const value = e.target.valueAsNumber || 0;
                                field.onChange(value);
                                form.setValue("retirementPassiveIncomeGoal", value, {
                                  shouldDirty: true,
                                  shouldTouch: true,
                                  shouldValidate: true
                                });
                              }}
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
                              value={field.value || 65}
                              onChange={(e) => {
                                const value = e.target.valueAsNumber || 65;
                                field.onChange(value);
                                form.setValue("desiredRetirementAge", value, {
                                  shouldDirty: true,
                                  shouldTouch: true,
                                  shouldValidate: true
                                });
                              }}
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
                      <AssetListSection
                        key={field.id}
                        index={index}
                        remove={removeAsset}
                        control={form.control}
                        assetTypes={ASSET_TYPES}
                        incomeFrequencies={INCOME_FREQUENCIES}
                      />
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
                      <LiabilityListSection
                        key={field.id}
                        index={index}
                        remove={removeLiability}
                        control={form.control}
                        liabilityTypes={LIABILITY_TYPES}
                        repaymentFrequencies={REPAYMENT_FREQUENCIES}
                        termTypes={TERM_TYPES}
                        loanTypes={LOAN_TYPES}
                      />
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