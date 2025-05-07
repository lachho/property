import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LIABILITY_TYPES, REPAYMENT_FREQUENCIES, TERM_TYPES, LOAN_TYPES } from './ClientDetailsForm';
import { Liability } from '@/services/api';

interface LiabilityListSectionProps {
  index: number;
  remove: (index: number) => void;
  control: any;
  liabilityTypes: string[];
  repaymentFrequencies: string[];
  termTypes: string[];
  loanTypes: string[];
}

const LiabilityListSection: React.FC<LiabilityListSectionProps> = ({ 
  index, 
  remove, 
  control, 
  liabilityTypes, 
  repaymentFrequencies, 
  termTypes, 
  loanTypes 
}) => {
  return (
    <div key={index} className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium">Liability {index + 1}</h4>
        <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
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
                    {liabilityTypes.map((type) => (
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
            control={control}
            name={`liabilities.${index}.isPrimaryResidence`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Is Primary Residence?</FormLabel>
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name={`liabilities.${index}.loanBalance`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loan Balance ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Loan balance" 
                    min={0} 
                    value={field.value || 0}
                    onChange={(e) => {
                      const value = e.target.valueAsNumber || 0;
                      field.onChange(value);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`liabilities.${index}.limitAmount`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Limit Amount ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Limit amount" 
                    min={0} 
                    value={field.value || 0}
                    onChange={(e) => {
                      const value = e.target.valueAsNumber || 0;
                      field.onChange(value);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name={`liabilities.${index}.lenderType`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lender Type</FormLabel>
                <FormControl>
                  <Input placeholder="Lender type" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`liabilities.${index}.interestRate`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interest Rate (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Interest rate" 
                    min={0} 
                    max={100} 
                    value={field.value || 0}
                    onChange={(e) => {
                      const value = e.target.valueAsNumber || 0;
                      field.onChange(value);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name={`liabilities.${index}.termType`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Term Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select term type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {termTypes.map((type) => (
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
            control={control}
            name={`liabilities.${index}.repaymentAmount`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repayment Amount ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Repayment amount" 
                    min={0} 
                    value={field.value || 0}
                    onChange={(e) => {
                      const value = e.target.valueAsNumber || 0;
                      field.onChange(value);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name={`liabilities.${index}.repaymentFrequency`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repayment Frequency</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {repaymentFrequencies.map((frequency) => (
                      <SelectItem key={frequency} value={frequency}>
                        {frequency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`liabilities.${index}.loanType`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loan Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select loan type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loanTypes.map((type) => (
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
          control={control}
          name={`liabilities.${index}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Description" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default LiabilityListSection; 