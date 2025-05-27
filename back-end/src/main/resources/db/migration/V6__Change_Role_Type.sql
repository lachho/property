-- Change role column from user_role enum type to VARCHAR
DO $$ 
BEGIN
  -- Check if the column exists and is of type user_role
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'role' 
    AND data_type = 'USER-DEFINED'
  ) THEN
    -- Change the column type to VARCHAR
    ALTER TABLE profiles ALTER COLUMN role TYPE VARCHAR USING role::VARCHAR;
  END IF;
END $$; 