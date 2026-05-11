-- Enable RLS on comments table if not already enabled
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy to prevent inserting comments on archived posts
CREATE POLICY "Prevent comments on archived posts" ON comments
FOR INSERT WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM items
    WHERE items.id = comments.item_id
    AND items.status = 'archived'
  )
);

-- Policy to prevent updating comments on archived posts
CREATE POLICY "Prevent updating comments on archived posts" ON comments
FOR UPDATE USING (
  NOT EXISTS (
    SELECT 1 FROM items
    WHERE items.id = comments.item_id
    AND items.status = 'archived'
  )
);

-- Policy to prevent deleting comments on archived posts
CREATE POLICY "Prevent deleting comments on archived posts" ON comments
FOR DELETE USING (
  NOT EXISTS (
    SELECT 1 FROM items
    WHERE items.id = comments.item_id
    AND items.status = 'archived'
  )
);

-- Allow users to view all comments (including on archived posts)
CREATE POLICY "Users can view all comments" ON comments
FOR SELECT USING (true);