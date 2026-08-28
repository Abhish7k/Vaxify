-- Align enum columns with JPA STRING mappings, repair any duplicate
-- booking rows, then add uniqueness. Safe to run on an empty duplicate set.

-- Hibernate @Enumerated(STRING) expects varchar, not MySQL ENUM.
ALTER TABLE users MODIFY COLUMN role VARCHAR(255) NULL;
ALTER TABLE hospitals MODIFY COLUMN status VARCHAR(255) NOT NULL;
ALTER TABLE slots MODIFY COLUMN status VARCHAR(255) NOT NULL;
ALTER TABLE appointments MODIFY COLUMN status VARCHAR(20) NOT NULL;

-- Point appointments at the surviving slot when (hospital, date, start) is duplicated.
UPDATE appointments a
INNER JOIN slots s_dup ON a.slot_id = s_dup.id
INNER JOIN (
    SELECT hospital_id, slot_date, start_time, MIN(id) AS keep_id
    FROM slots
    GROUP BY hospital_id, slot_date, start_time
    HAVING COUNT(*) > 1
) g ON s_dup.hospital_id = g.hospital_id
   AND s_dup.slot_date = g.slot_date
   AND s_dup.start_time = g.start_time
SET a.slot_id = g.keep_id
WHERE s_dup.id <> g.keep_id;

DELETE s FROM slots s
INNER JOIN (
    SELECT hospital_id, slot_date, start_time, MIN(id) AS keep_id
    FROM slots
    GROUP BY hospital_id, slot_date, start_time
    HAVING COUNT(*) > 1
) g ON s.hospital_id = g.hospital_id
   AND s.slot_date = g.slot_date
   AND s.start_time = g.start_time
WHERE s.id <> g.keep_id;

-- Keep the oldest BOOKED row per user+slot; extras cannot share the unique key.
UPDATE appointments a
INNER JOIN (
    SELECT user_id, slot_id, MIN(id) AS keep_id
    FROM appointments
    WHERE status = 'BOOKED'
    GROUP BY user_id, slot_id
    HAVING COUNT(*) > 1
) d ON a.user_id = d.user_id AND a.slot_id = d.slot_id
SET a.status = 'CANCELLED'
WHERE a.status = 'BOOKED' AND a.id <> d.keep_id;

SET @slot_idx := (
    SELECT COUNT(1) FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'slots'
      AND index_name = 'uk_slots_hospital_date_start'
);
SET @sql := IF(@slot_idx = 0,
    'ALTER TABLE slots ADD UNIQUE INDEX uk_slots_hospital_date_start (hospital_id, slot_date, start_time)',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @booked_col := (
    SELECT COUNT(1) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'appointments'
      AND column_name = 'booked_slot_key'
);
SET @sql := IF(@booked_col = 0,
    'ALTER TABLE appointments ADD COLUMN booked_slot_key VARCHAR(64) GENERATED ALWAYS AS (IF(status = ''BOOKED'', CONCAT(user_id, '':'', slot_id), NULL)) STORED',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @booked_idx := (
    SELECT COUNT(1) FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'appointments'
      AND index_name = 'uk_appointments_active_user_slot'
);
SET @sql := IF(@booked_idx = 0,
    'ALTER TABLE appointments ADD UNIQUE INDEX uk_appointments_active_user_slot (booked_slot_key)',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
