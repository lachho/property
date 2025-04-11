-- Create portfolio table
CREATE TABLE portfolio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    target_value NUMERIC,
    target_yield NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create portfolio_properties table for many-to-many relationship
CREATE TABLE portfolio_properties (
    portfolio_id UUID REFERENCES portfolio(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    PRIMARY KEY (portfolio_id, property_id)
);

-- Create indexes
CREATE INDEX idx_portfolio_user_id ON portfolio(user_id);
CREATE INDEX idx_portfolio_properties_portfolio_id ON portfolio_properties(portfolio_id);
CREATE INDEX idx_portfolio_properties_property_id ON portfolio_properties(property_id); 