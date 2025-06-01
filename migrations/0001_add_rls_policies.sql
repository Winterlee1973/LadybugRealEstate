ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to view all properties
CREATE POLICY "Enable read access for all authenticated users" ON properties
FOR SELECT USING (auth.role() = 'authenticated');

-- Policy to allow sellers to insert their own properties
CREATE POLICY "Allow sellers to insert their own properties" ON properties
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow sellers to update their own properties
CREATE POLICY "Allow sellers to update their own properties" ON properties
FOR UPDATE USING (auth.uid() = user_id);

-- Policy to allow sellers to delete their own properties
CREATE POLICY "Allow sellers to delete their own properties" ON properties
FOR DELETE USING (auth.uid() = user_id);