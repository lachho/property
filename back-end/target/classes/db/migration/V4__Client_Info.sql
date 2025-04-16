-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS occupation VARCHAR(255),
ADD COLUMN IF NOT EXISTS employer VARCHAR(255),
ADD COLUMN IF NOT EXISTS employment_length INTEGER,
ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS on_probation BOOLEAN,
ADD COLUMN IF NOT EXISTS non_taxable_income DECIMAL(19, 2),
ADD COLUMN IF NOT EXISTS assess_with_partner BOOLEAN,
ADD COLUMN IF NOT EXISTS partner_first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS partner_last_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS partner_dob DATE,
ADD COLUMN IF NOT EXISTS partner_mobile VARCHAR(50),
ADD COLUMN IF NOT EXISTS partner_address TEXT,
ADD COLUMN IF NOT EXISTS partner_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS partner_occupation VARCHAR(255),
ADD COLUMN IF NOT EXISTS partner_employer VARCHAR(255),
ADD COLUMN IF NOT EXISTS partner_employment_length INTEGER,
ADD COLUMN IF NOT EXISTS partner_employment_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS partner_on_probation BOOLEAN,
ADD COLUMN IF NOT EXISTS partner_income DECIMAL(19, 2),
ADD COLUMN IF NOT EXISTS partner_non_taxable_income DECIMAL(19, 2),
ADD COLUMN IF NOT EXISTS is_renting BOOLEAN,
ADD COLUMN IF NOT EXISTS rent_per_week DECIMAL(19, 2),
ADD COLUMN IF NOT EXISTS monthly_living_expenses DECIMAL(19, 2),
ADD COLUMN IF NOT EXISTS residence_history TEXT,
ADD COLUMN IF NOT EXISTS dependants_age_ranges TEXT,
ADD COLUMN IF NOT EXISTS retirement_passive_income_goal DECIMAL(19, 2),
ADD COLUMN IF NOT EXISTS desired_retirement_age INTEGER;

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY,
    profile_id UUID NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    current_value DECIMAL(19, 2),
    original_price DECIMAL(19, 2),
    year_purchased INTEGER,
    ownership_percentage DECIMAL(5, 2),
    income_amount DECIMAL(19, 2),
    income_frequency VARCHAR(50),
    description TEXT,
    CONSTRAINT fk_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create liabilities table
CREATE TABLE IF NOT EXISTS liabilities (
    id UUID PRIMARY KEY,
    profile_id UUID NOT NULL,
    liability_type VARCHAR(50) NOT NULL,
    is_primary_residence BOOLEAN,
    loan_balance DECIMAL(19, 2),
    limit_amount DECIMAL(19, 2),
    lender_type VARCHAR(255),
    interest_rate DECIMAL(5, 2),
    term_type VARCHAR(50),
    repayment_amount DECIMAL(19, 2),
    repayment_frequency VARCHAR(50),
    loan_type VARCHAR(50),
    description TEXT,
    CONSTRAINT fk_profile_liability FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
); 