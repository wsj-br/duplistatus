-- SQLite
DELETE FROM backups 
WHERE id = (
  SELECT b.id
  FROM backups b
  JOIN machines m ON b.machine_id = m.id
  WHERE m.name = 'g5-server'
  ORDER BY b.date DESC
  LIMIT 1
);

  SELECT b.id, b.date
  FROM backups b
  JOIN machines m ON b.machine_id = m.id
  WHERE m.name = 'g5-server'
  ORDER BY b.date DESC
  LIMIT 5;

