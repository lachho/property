-- Create enum type for user roles
CREATE TYPE user_role AS ENUM ('ADMIN', 'CLIENT');

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT,
    last_name TEXT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    phone TEXT,
    date_of_birth TIMESTAMP WITH TIME ZONE,
    role user_role NOT NULL DEFAULT 'CLIENT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    gross_income NUMERIC,
    marital_status TEXT,
    partner_income NUMERIC,
    existing_loans NUMERIC,
    dependants INTEGER
);

-- Create properties table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    price NUMERIC NOT NULL,
    beds INTEGER NOT NULL,
    baths INTEGER NOT NULL,
    area NUMERIC NOT NULL,
    description TEXT,
    image_url TEXT,
    growth_rate NUMERIC,
    rental_yield NUMERIC,
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
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_growth_rate ON properties(growth_rate);
CREATE INDEX idx_saved_properties_user_id ON saved_properties(user_id); 