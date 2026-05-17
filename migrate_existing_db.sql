CREATE DATABASE IF NOT EXISTS vetclinic_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vetclinic_db;

CREATE TABLE IF NOT EXISTS clinics (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  area VARCHAR(255) DEFAULT NULL,
  address VARCHAR(500) DEFAULT NULL,
  phone VARCHAR(100) DEFAULT NULL,
  schedule VARCHAR(255) DEFAULT NULL,
  notes VARCHAR(1000) DEFAULT NULL,
  status VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO clinics (id, name, area, address, phone, schedule, notes, status) VALUES
(1, 'Animal Kingdom Veterinary Hospital', 'Lahug', '38 Gorordo Ave, Cebu City, 6000 Cebu', '(032) 383 7512', 'Mon-Sun 8:00 AM-6:00 PM', 'Full-service veterinary hospital in the Lahug area.', 'Open'),
(2, 'Animal Wellness Veterinary Clinic - Banawa Centrale', 'Banawa', '8 R. Duterte St, Banawa, Cebu City, 6000 Cebu', '+63 917 705 7819', 'Mon-Sun 10:00 AM-7:00 PM', 'Banawa branch for consultations, vaccinations, and pet care.', 'Open'),
(3, 'Aycardo Veterinary Center Inc. - Main Branch', 'Pardo', '68 J. Alcantara St, Cebu City, 6000 Cebu', '(032) 407 8004', 'Mon-Sat 9:00 AM-12:00 PM, Mon-Sat 1:00 PM-6:00 PM', 'Main Aycardo branch in Cebu City.', 'Open'),
(4, 'Caminade Animal Hospital', 'Mabolo', 'M. J. Cuenco Ave, Cebu City, 6000 Cebu', '+63 932 197 6459', 'Mon-Sat 8:00 AM-5:00 PM', 'Animal hospital serving the Mabolo and North Reclamation area.', 'Open'),
(5, 'Doc John''s Vet Clinic - DJVC Lahug', 'Lahug', '935K Salinas Dr, Brgy Lahug, Cebu City, 6000 Cebu', '+63 927 631 4605', 'Daily 9:00 AM-6:00 PM, with 24/7 emergency services', 'Lahug branch with emergency care and extended service windows.', '24/7'),
(6, 'FC Mabolo Animal Clinic', 'Mabolo', 'Juan Luna Ave Ext, Cebu City, 6000 Cebu', '(032) 233 2039', 'Clinic hours available on request', 'Mabolo clinic listed along Juan Luna Avenue Extension.', 'Open'),
(7, 'Gorre Animal Health Clinic', 'Cogon Ramos', '0005 R.R. Landon Street, Cebu City, 6000 Cebu', '(032) 253 1550', 'Mon-Sat 10:00 AM-12:00 PM, Mon-Sat 2:00 PM-5:00 PM, Sun Closed', 'Central Cebu City clinic near Cogon Ramos.', 'Open'),
(8, 'Happy Tails Veterinary Clinic', 'Labangon', 'Ground Floor, Unit 2 Labangon Town Center, Cebu City, 6000 Cebu', '+63 954 298 4479', '24/7', 'Labangon-based veterinary clinic in a commercial center with 24-hour service.', '24/7'),
(9, 'Pet Centre Animal Clinic', 'San Nicolas', '6 F. Jaca St, Cebu City, 6000 Cebu', '+63 32 516 0323', 'Mon-Sat 9:00 AM-5:00 PM', 'Pet centre with consistent daytime clinic hours.', 'Open'),
(10, 'The Urban Vets', 'Citywide', 'Home-service veterinary practice serving Cebu City', '+63 927 480 1284', 'Mon-Sun 9:00 AM-5:00 PM', 'Mobile veterinary service for home consultations across Cebu.', 'Appointment Only'),
(11, 'Vida''s Pet Home and Animal Clinic', 'Labangon', '320 Katipunan St, Labangon, Cebu City, 6000 Cebu', '+63 923 825 0604', 'Mon-Sat 9:00 AM-12:00 PM, Mon-Sat 3:00 PM-6:00 PM', 'Clinic with a split weekly schedule in Labangon.', 'Limited Hours')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  area = VALUES(area),
  address = VALUES(address),
  phone = VALUES(phone),
  schedule = VALUES(schedule),
  notes = VALUES(notes),
  status = VALUES(status);

DELIMITER //

CREATE PROCEDURE migrate_vetclinic_schema()
BEGIN
  DECLARE has_appointments_table INT DEFAULT 0;
  DECLARE has_clinic_name INT DEFAULT 0;
  DECLARE has_clinic_id INT DEFAULT 0;
  DECLARE has_pet_id INT DEFAULT 0;
  DECLARE has_pet_name INT DEFAULT 0;
  DECLARE has_fk_clinic INT DEFAULT 0;
  DECLARE has_fk_pet INT DEFAULT 0;

  SELECT COUNT(*)
    INTO has_appointments_table
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'appointments';

  IF has_appointments_table = 1 THEN
    SELECT COUNT(*)
      INTO has_clinic_name
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'appointments'
      AND column_name = 'clinic_name';

    SELECT COUNT(*)
      INTO has_clinic_id
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'appointments'
      AND column_name = 'clinic_id';

    SELECT COUNT(*)
      INTO has_pet_id
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'appointments'
      AND column_name = 'pet_id';

    SELECT COUNT(*)
      INTO has_pet_name
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'appointments'
      AND column_name = 'pet_name';

    IF has_clinic_name = 0 AND has_clinic_id = 1 THEN
      SET @sql_text := 'ALTER TABLE appointments CHANGE COLUMN clinic_id clinic_name BIGINT NOT NULL';
      PREPARE stmt FROM @sql_text;
      EXECUTE stmt;
      DEALLOCATE PREPARE stmt;
    END IF;

    IF has_pet_id = 0 AND has_pet_name = 1 THEN
      SET @sql_text := 'ALTER TABLE appointments CHANGE COLUMN pet_name pet_id BIGINT NOT NULL';
      PREPARE stmt FROM @sql_text;
      EXECUTE stmt;
      DEALLOCATE PREPARE stmt;
    END IF;

    SELECT COUNT(*)
      INTO has_fk_clinic
    FROM information_schema.table_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = 'appointments'
      AND constraint_name = 'fk_appointments_clinic';

    IF has_fk_clinic = 0 THEN
      SET @sql_text := 'ALTER TABLE appointments ADD CONSTRAINT fk_appointments_clinic FOREIGN KEY (clinic_name) REFERENCES clinics (id) ON DELETE RESTRICT';
      PREPARE stmt FROM @sql_text;
      EXECUTE stmt;
      DEALLOCATE PREPARE stmt;
    END IF;

    SELECT COUNT(*)
      INTO has_fk_pet
    FROM information_schema.table_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = 'appointments'
      AND constraint_name = 'fk_appointments_pet';

    IF has_fk_pet = 0 THEN
      SET @sql_text := 'ALTER TABLE appointments ADD CONSTRAINT fk_appointments_pet FOREIGN KEY (pet_id) REFERENCES pets (id) ON DELETE CASCADE';
      PREPARE stmt FROM @sql_text;
      EXECUTE stmt;
      DEALLOCATE PREPARE stmt;
    END IF;
  END IF;
END//

DELIMITER ;

CALL migrate_vetclinic_schema();
DROP PROCEDURE migrate_vetclinic_schema;
