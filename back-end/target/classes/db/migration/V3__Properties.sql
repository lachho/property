-- Create properties table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    purchase_price NUMERIC(19,2),
    current_value NUMERIC(19,2),
    mortgage_amount NUMERIC(19,2),
    monthly_rent NUMERIC(19,2),
    monthly_expenses NUMERIC(19,2),
    monthly_cash_flow NUMERIC(19,2),
    annual_return NUMERIC(19,2),
    year_built INTEGER,
    bedrooms INTEGER,
    bathrooms INTEGER,
    square_footage NUMERIC(19,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create property_features table
CREATE TABLE property_features (
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    feature TEXT NOT NULL,
    PRIMARY KEY (property_id, feature)
);

-- Create saved_properties table
CREATE TABLE saved_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    purchased BOOLEAN DEFAULT false,
    UNIQUE(user_id, property_id)
);

-- Create indexes
CREATE INDEX idx_properties_portfolio_id ON properties(portfolio_id);
CREATE INDEX idx_saved_properties_user_id ON saved_properties(user_id); 