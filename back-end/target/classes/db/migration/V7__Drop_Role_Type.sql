-- Drop the user_role enum type since we're now using VARCHAR
DO $$ 
BEGIN
  -- Check if the type exists before trying to drop it
  IF EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'user_role'
  ) THEN
    -- Drop the type
    DROP TYPE user_role;
  END IF;
END $$; 