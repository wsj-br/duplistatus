-- SQLite
DELETE FROM backups 
WHERE id = (
  SELECT b.id
  FROM backups b
  JOIN machines m ON b.machine_id = m.id
  WHERE m.name = 'Test Machine 1'
  ORDER BY b.date DESC
  LIMIT 1
);


DELETE FROM backups 
WHERE id = (
  SELECT b.id
  FROM backups b
  JOIN machines m ON b.machine_id = m.id
  WHERE m.name = 'Test Machine 2'
  ORDER BY b.date DESC
  LIMIT 1
);

DELETE FROM backups 
WHERE id = (
  SELECT b.id
  FROM backups b
  JOIN machines m ON b.machine_id = m.id
  WHERE m.name = 'Test Machine 3'
  ORDER BY b.date DESC
  LIMIT 1
);
