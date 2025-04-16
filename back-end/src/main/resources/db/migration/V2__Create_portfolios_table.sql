-- Create portfolios table
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    total_value NUMERIC(19,2) DEFAULT 0,
    total_debt NUMERIC(19,2) DEFAULT 0,
    total_equity NUMERIC(19,2) DEFAULT 0,
    monthly_cash_flow NUMERIC(19,2) DEFAULT 0,
    annual_return NUMERIC(19,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX idx_portfolios_profile_id ON portfolios(profile_id); 