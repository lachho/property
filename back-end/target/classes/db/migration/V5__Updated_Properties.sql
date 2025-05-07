-- Rebuild properties table to match frontend fields
DROP TABLE IF EXISTS property_features CASCADE;
DROP TABLE IF EXISTS saved_properties CASCADE;
DROP TABLE IF EXISTS properties CASCADE;

CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    CONSTRAINT portfolio_id FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
    name TEXT NOT NULL,
    street TEXT NOT NULL,
    suburb TEXT NOT NULL,
    state TEXT NOT NULL,
    postcode TEXT NOT NULL,
    description TEXT,
    price NUMERIC(19,2),
    beds INTEGER,
    baths INTEGER,
    area INTEGER,
    growth_rate NUMERIC(5,2),
    rental_yield NUMERIC(5,2),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE property_features (
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    feature TEXT NOT NULL,
    PRIMARY KEY (property_id, feature)
);

CREATE TABLE saved_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    purchased BOOLEAN DEFAULT false,
    UNIQUE(user_id, property_id)
);

CREATE INDEX idx_properties_portfolio_id ON properties(portfolio_id);
CREATE INDEX idx_saved_properties_user_id ON saved_properties(user_id); 