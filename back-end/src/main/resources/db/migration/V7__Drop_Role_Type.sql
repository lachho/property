-- Drop the user_role enum type since we're now using VARCHAR
DO $$ 
BEGIN
  -- First remove any default value constraints that might be using the type
  ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;
  
  -- Then drop the type with CASCADE to handle any remaining dependencies
  IF EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'user_role'
  ) THEN
    DROP TYPE user_role CASCADE;
  END IF;
END $$; 