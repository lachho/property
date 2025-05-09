/**
 * Calculate Australian income tax based on current tax brackets (2023-2024)
 * @param income Taxable income in AUD
 * @returns Tax amount in AUD
 */
export const calculateTax = (income: number): number => {
  if (income <= 18200) return 0;
  if (income <= 45000) return (income - 18200) * 0.16;
  if (income <= 135000) return 4288 + (income - 45000) * 0.30;
  if (income <= 190000) return 31288 + (income - 135000) * 0.37;
  return 51638 + (income - 190000) * 0.45;
};

/**
 * Format a number as AUD currency 
 * @param amount The amount to format
 * @param fractionDigits Number of fraction digits (defaults to 0)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, fractionDigits = 0): string => {
  return new Intl.NumberFormat('en-AU', { 
    style: 'currency', 
    currency: 'AUD',
    maximumFractionDigits: fractionDigits 
  }).format(amount);
};

/**
 * Get the marginal tax rate for a given income
 * @param income Taxable income in AUD
 * @returns Marginal tax rate as a percentage (e.g., 37%)
 */
export const getMarginalTaxRate = (income: number): number => {
  if (income <= 18200) return 0;
  if (income <= 45000) return 16;
  if (income <= 135000) return 30;
  if (income <= 190000) return 37;
  return 45;
};

/**
 * Calculate the effective tax rate (total tax / income)
 * @param income Taxable income in AUD
 * @returns Effective tax rate as a percentage
 */
export const getEffectiveTaxRate = (income: number): number => {
  if (income <= 0) return 0;
  const tax = calculateTax(income);
  return (tax / income) * 100;
}; 