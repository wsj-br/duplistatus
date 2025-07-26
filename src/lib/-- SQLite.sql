-- SQLite
    WITH machine_backups AS (
      SELECT DISTINCT 
        m.id as machine_id,
        m.name as machine_name,
        b.backup_name
      FROM machines m
      JOIN backups b ON b.machine_id = m.id
    ),
    latest_backups AS (
      SELECT 
        machine_id,
        backup_name,
        MAX(date) as last_backup_date
      FROM backups
      GROUP BY machine_id, backup_name
    ),
    numbered_results AS (
      SELECT 
        ROW_NUMBER() OVER (ORDER BY mb.machine_name, mb.backup_name) as id,
        mb.machine_id as machine_id,
        mb.machine_name as name,
        mb.backup_name as last_backup_name,
        lb.last_backup_date,
        b.id as last_backup_id,
        b.status as last_backup_status,
        b.duration_seconds as last_backup_duration,
        b.warnings as total_warnings,
        b.errors as total_errors,
        b.backup_list_count as last_backup_list_count,
        b.available_backups as available_backups,
        COUNT(b2.id) as backup_count
      FROM machine_backups mb
      LEFT JOIN latest_backups lb ON mb.machine_id = lb.machine_id AND mb.backup_name = lb.backup_name
      LEFT JOIN backups b ON b.machine_id = mb.machine_id AND b.date = lb.last_backup_date AND b.backup_name = mb.backup_name
      LEFT JOIN backups b2 ON b2.machine_id = mb.machine_id AND b2.backup_name = mb.backup_name
      GROUP BY mb.machine_id, mb.backup_name
    )
    SELECT * FROM numbered_results
    ORDER BY lower(name), lower(last_backup_name)
