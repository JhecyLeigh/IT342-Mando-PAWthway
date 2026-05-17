CREATE DATABASE IF NOT EXISTS vetclinic_db_clean
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vetclinic_db_clean;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT NOT NULL AUTO_INCREMENT,
  firstname VARCHAR(255) NOT NULL,
  lastname VARCHAR(255) DEFAULT NULL,
  email VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL DEFAULT 'USER',
  clinic_id BIGINT DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email),
  UNIQUE KEY uk_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pets (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  pet_name VARCHAR(255) NOT NULL,
  pet_type VARCHAR(255) NOT NULL,
  age INT DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_pets_user_id (user_id),
  CONSTRAINT fk_pets_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS appointments (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  clinic_id BIGINT NOT NULL,
  pet_id BIGINT NOT NULL,
  pet_type VARCHAR(100) NOT NULL,
  pet_age INT NOT NULL,
  service VARCHAR(500) NOT NULL,
  appointment_date_time DATETIME NOT NULL,
  status VARCHAR(255) DEFAULT 'PENDING',
  notes VARCHAR(1000) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_appointments_user_id (user_id),
  KEY idx_appointments_clinic_id (clinic_id),
  KEY idx_appointments_pet_id (pet_id),
  KEY idx_appointments_status (status),
  KEY idx_appointments_date_time (appointment_date_time),
  CONSTRAINT fk_appointments_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_appointments_pet
    FOREIGN KEY (pet_id) REFERENCES pets (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS clinic_logs (
  id BIGINT NOT NULL AUTO_INCREMENT,
  clinic_id BIGINT NOT NULL,
  appointment_id BIGINT DEFAULT NULL,
  actor_user_id BIGINT DEFAULT NULL,
  actor_role VARCHAR(50) DEFAULT NULL,
  actor_name VARCHAR(255) DEFAULT NULL,
  action_type VARCHAR(100) NOT NULL,
  details VARCHAR(1000) DEFAULT NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_clinic_logs_clinic_id (clinic_id),
  KEY idx_clinic_logs_appointment_id (appointment_id),
  KEY idx_clinic_logs_actor_user_id (actor_user_id),
  KEY idx_clinic_logs_action_type (action_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional seed data example:
-- INSERT INTO users (firstname, lastname, email, username, password, role, clinic_id)
-- VALUES ('Admin', 'User', 'admin@example.com', 'admin', '<bcrypt-hash>', 'ADMIN', 1);
