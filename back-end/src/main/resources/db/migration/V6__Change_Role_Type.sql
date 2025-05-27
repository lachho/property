-- Change role column from user_role enum type to VARCHAR
ALTER TABLE profiles ALTER COLUMN role TYPE VARCHAR USING role::VARCHAR; 