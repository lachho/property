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
    gross_income NUMERIC(19,2),
    marital_status TEXT,
    partner_income NUMERIC(19,2),
    existing_loans NUMERIC(19,2),
    dependants INTEGER
);

-- Create indexes
CREATE INDEX idx_profiles_email ON profiles(email);