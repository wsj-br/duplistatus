-- SQLite
-- Delete the last backup for each server
-- This script removes the most recent backup record for each server

DELETE FROM backups 
WHERE id IN (
  SELECT b.id
  FROM backups b
  JOIN servers s ON b.server_id = s.id
  WHERE b.id IN (
    SELECT b2.id
    FROM backups b2
    WHERE b2.server_id = b.server_id
    ORDER BY b2.date DESC
    LIMIT 1
  )
);

-- Alternative: Delete last backup for specific servers by name
-- Uncomment and modify the server names as needed:

-- DELETE FROM backups 
-- WHERE id = (
--   SELECT b.id
--   FROM backups b
--   JOIN servers s ON b.server_id = s.id
--   WHERE s.name = 'Test Server 1'
--   ORDER BY b.date DESC
--   LIMIT 1
-- );

-- DELETE FROM backups 
-- WHERE id = (
--   SELECT b.id
--   FROM backups b
--   JOIN servers s ON b.server_id = s.id
--   WHERE s.name = 'Test Server 2'
--   ORDER BY b.date DESC
--   LIMIT 1
-- );

-- DELETE FROM backups 
-- WHERE id = (
--   SELECT b.id
--   FROM backups b
--   JOIN servers s ON b.server_id = s.id
--   WHERE s.name = 'Test Server 3'
--   ORDER BY b.date DESC
--   LIMIT 1
-- );
