import React from 'react';
import { useFieldArray, useFormContext, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ASSET_TYPES, INCOME_FREQUENCIES } from './ClientDetailsForm';
import { Asset } from '@/services/api';

interface AssetListSectionProps {
  index: number;
  remove: (index: number) => void;
  control: any;
  assetTypes: string[];
  incomeFrequencies: string[];
}

const AssetListSection: React.FC<AssetListSectionProps> = ({ index, remove, control, assetTypes, incomeFrequencies }) => {
  return (
    <div key={index} className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium">Asset {index + 1}</h4>
        <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
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
                    {assetTypes.map((type) => (
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
            name={`assets.${index}.currentValue`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Value ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Current value" 
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
            name={`assets.${index}.originalPrice`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Original Price ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Original price" 
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
            name={`assets.${index}.yearPurchased`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year Purchased</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Year" 
                    min={1900} 
                    max={new Date().getFullYear()} 
                    value={field.value || new Date().getFullYear()}
                    onChange={(e) => {
                      const value = e.target.valueAsNumber || new Date().getFullYear();
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
            name={`assets.${index}.ownershipPercentage`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ownership Percentage (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="100" 
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
          <FormField
            control={control}
            name={`assets.${index}.incomeAmount`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Income Amount ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Income amount" 
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
            name={`assets.${index}.incomeFrequency`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Income Frequency</FormLabel>
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
                    {incomeFrequencies.map((frequency) => (
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
            name={`assets.${index}.description`}
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
    </div>
  );
};

export default AssetListSection; 