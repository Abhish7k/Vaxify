-- Keep appointment history when vaccines or slots are deleted.
-- Existing Hibernate schemas use generated FK names, not fk_appointments_*.

SET @fk := (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'appointments'
      AND COLUMN_NAME = 'vaccine_id'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    LIMIT 1
);
SET @sql := IF(@fk IS NULL,
    'SELECT 1',
    CONCAT('ALTER TABLE appointments DROP FOREIGN KEY `', @fk, '`'));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has := (
    SELECT COUNT(1)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'appointments'
      AND CONSTRAINT_NAME = 'fk_appointments_vaccine'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @sql := IF(@has = 0,
    'ALTER TABLE appointments ADD CONSTRAINT fk_appointments_vaccine FOREIGN KEY (vaccine_id) REFERENCES vaccines (id)',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk := (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'appointments'
      AND COLUMN_NAME = 'slot_id'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    LIMIT 1
);
SET @sql := IF(@fk IS NULL,
    'SELECT 1',
    CONCAT('ALTER TABLE appointments DROP FOREIGN KEY `', @fk, '`'));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has := (
    SELECT COUNT(1)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'appointments'
      AND CONSTRAINT_NAME = 'fk_appointments_slot'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @sql := IF(@has = 0,
    'ALTER TABLE appointments ADD CONSTRAINT fk_appointments_slot FOREIGN KEY (slot_id) REFERENCES slots (id)',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
