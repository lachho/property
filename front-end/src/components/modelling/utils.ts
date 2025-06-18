import { 
  GROWTH_RATES, 
  ProjectionData, 
  PropertyGrowthRate, 
  LoanType, 
  PortfolioProperty,
  PortfolioData,
  PropertyState
} from './types';

// Calculate single property projections
export const calculateSinglePropertyProjection = (
  propertyValue: number, 
  growthRate: PropertyGrowthRate, 
  loanType: LoanType, 
  interestRate: number,
  years: number = 30,
  withHomeGuaranteeScheme: boolean = true
): ProjectionData[] => {
  const data: ProjectionData[] = [];
  const annualGrowthRate = GROWTH_RATES[growthRate];
  
  // Initial values
  // Starting with 5% deposit (95% LVR)
  const initialDeposit = propertyValue * 0.05;
  let currentDebt = propertyValue - initialDeposit;
  let currentValue = propertyValue;
  
  // For Principal and Interest loan
  const monthlyInterestRate = interestRate / 100 / 12;
  const numberOfPayments = years * 12;
  const monthlyPayment = loanType === 'principalAndInterest' 
    ? (currentDebt * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)
    : 0;

  // Year 0 (starting point)
  data.push({
    year: 0,
    propertyValue: currentValue,
    debt: currentDebt,
    equity: currentValue - currentDebt,
  });

  for (let year = 1; year <= years; year++) {
    // Apply Home Guarantee Scheme in year 1 (additional 15% coverage)
    if (year === 1 && withHomeGuaranteeScheme) {
      // Home Guarantee Scheme provides 15% coverage
      // This effectively reduces the debt by 15% of the property value
      currentDebt = currentDebt - (propertyValue * 0.15);
    }

    // Calculate property growth for this year
    currentValue = currentValue * (1 + annualGrowthRate);

    // Calculate debt reduction for this year if principal and interest
    if (loanType === 'principalAndInterest') {
      // Total annual payment
      const annualPayment = monthlyPayment * 12;
      // Calculate annual interest
      const annualInterest = currentDebt * (interestRate / 100);
      // Principal repayment is the difference
      const principalRepayment = annualPayment - annualInterest;
      
      // Ensure we don't go below zero
      currentDebt = Math.max(0, currentDebt - principalRepayment);
    }
    // Interest only loan doesn't reduce principal

    // Add data point for this year
    data.push({
      year,
      propertyValue: Math.round(currentValue),
      debt: Math.round(currentDebt),
      equity: Math.round(currentValue - currentDebt),
    });
  }

  return data;
};

// Calculate portfolio projections
export const calculatePortfolioProjections = (
  properties: PortfolioProperty[],
  years: number = 30,
  initialDepositPercentage: number = 0.1,
  feesPercentage: number = 0.05,
  refinanceLimit: number = 0.8
): PortfolioData[] => {
  const data: PortfolioData[] = [];
  
  if (properties.length === 0) return data;
  
  // Make a copy of properties to work with
  const workingProperties: PropertyState[] = properties.map(prop => ({
    ...prop,
    debt: 0,
    value: prop.propertyValue,
    equity: 0,
  }));
  
  // Set first property as acquired at year 0 if not already set
  if (!properties.some(p => p.acquired === 0)) {
    workingProperties[0].acquired = 0;
  }
  
  // Setup initially acquired properties
  workingProperties.forEach(prop => {
    if (prop.acquired === 0) {
      // Initial property setup with deposit and additional costs
      prop.debt = prop.value * (1 - initialDepositPercentage) + (prop.value * feesPercentage);
      prop.equity = prop.value - prop.debt;
    }
  });
  
  for (let year = 0; year <= years; year++) {
    // Calculate growth and update values for each property
    let totalValue = 0;
    let totalDebt = 0;
    let totalEquity = 0;
    
    // Current state of properties for this year
    const propertiesState = workingProperties.map(prop => {
      if (prop.acquired !== null && prop.acquired <= year) {
        // Calculate growth for existing properties
        const yearsHeld = year - prop.acquired;
        const annualGrowthRate = GROWTH_RATES[prop.growthRate];
        const currentValue = prop.propertyValue * Math.pow(1 + annualGrowthRate, yearsHeld);
        
        // For this model, debt stays constant (interest only)
        const currentDebt = prop.debt;
        const currentEquity = currentValue - currentDebt;
        
        totalValue += currentValue;
        totalDebt += currentDebt;
        totalEquity += currentEquity;
        
        return {
          id: prop.id,
          value: currentValue,
          debt: currentDebt,
          equity: currentEquity
        };
      } else {
        // Property not yet acquired
        return {
          id: prop.id,
          value: 0,
          debt: 0,
          equity: 0
        };
      }
    });
    
    // Add data point for this year
    data.push({
      year,
      totalValue: Math.round(totalValue),
      totalDebt: Math.round(totalDebt),
      totalEquity: Math.round(totalEquity),
      properties: propertiesState
    });
    
    // Check if we can acquire a new property through refinancing
    if (year > 0) {
      // Find the next unacquired property
      const nextPropertyIndex = workingProperties.findIndex(prop => prop.acquired === null);
      
      if (nextPropertyIndex !== -1) {
        // Calculate total refinance amount possible (refinanceLimit of property value - current debt)
        let availableEquity = 0;
        
        for (let i = 0; i < workingProperties.length; i++) {
          if (i !== nextPropertyIndex) { // Don't include the property we're trying to acquire
            const prop = workingProperties[i];
            if (prop.acquired !== null && prop.acquired <= year) {
              const propData = propertiesState[i];
              // Can refinance up to limit of current value
              const refinanceAmount = (propData.value * refinanceLimit) - propData.debt;
              if (refinanceAmount > 0) {
                availableEquity += refinanceAmount;
              }
            }
          }
        }
        
        // Check if we have enough for a deposit
        const nextProperty = workingProperties[nextPropertyIndex];
        const requiredDeposit = nextProperty.propertyValue * initialDepositPercentage;
        
        if (availableEquity >= requiredDeposit) {
          // We can acquire the next property!
          nextProperty.acquired = year + 1; // Will be acquired next year
          
          // Update the debt of this property (90% of value + fees)
          nextProperty.debt = nextProperty.propertyValue * (1 - initialDepositPercentage) + 
                             (nextProperty.propertyValue * feesPercentage);
          
          // Update existing properties' debt (refinance to get the deposit)
          let remainingDepositNeeded = requiredDeposit;
          
          for (let i = 0; i < workingProperties.length && remainingDepositNeeded > 0; i++) {
            if (i !== nextPropertyIndex) {
              const prop = workingProperties[i];
              if (prop.acquired !== null && prop.acquired <= year) {
                const propData = propertiesState[i];
                // Max we can take from this property
                const refinanceAmount = Math.min(
                  (propData.value * refinanceLimit) - propData.debt,
                  remainingDepositNeeded
                );
                
                if (refinanceAmount > 0) {
                  prop.debt += refinanceAmount;
                  remainingDepositNeeded -= refinanceAmount;
                }
              }
            }
          }
        }
      }
    }
  }
  
  return data;
}; 