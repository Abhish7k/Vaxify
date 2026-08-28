-- Baseline schema matching the Hibernate mapping used before Flyway.
-- Existing databases skip this file via flyway baseline-on-migrate.

CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255),
    phone VARCHAR(255),
    role VARCHAR(255),
    created_at DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE hospitals (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    license_number VARCHAR(255) NOT NULL,
    city VARCHAR(255),
    state VARCHAR(255),
    pincode VARCHAR(255),
    hospital_document_data LONGTEXT,
    staff_user_id BIGINT NOT NULL,
    status VARCHAR(255) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_hospitals_staff_user UNIQUE (staff_user_id),
    CONSTRAINT fk_hospitals_staff_user FOREIGN KEY (staff_user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE vaccines (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255),
    type VARCHAR(255),
    manufacturer VARCHAR(255),
    stock INT,
    capacity INT,
    hospital_id BIGINT,
    created_at DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_vaccines_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE slots (
    id BIGINT NOT NULL AUTO_INCREMENT,
    hospital_id BIGINT NOT NULL,
    slot_date DATE NOT NULL,
    start_time TIME(0) NOT NULL,
    end_time TIME(0) NOT NULL,
    capacity INT NOT NULL,
    booked_count INT NOT NULL,
    status VARCHAR(255) NOT NULL,
    created_at DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_slots_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE appointments (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    slot_id BIGINT NOT NULL,
    vaccine_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_appointments_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_appointments_slot FOREIGN KEY (slot_id) REFERENCES slots (id) ON DELETE CASCADE,
    CONSTRAINT fk_appointments_vaccine FOREIGN KEY (vaccine_id) REFERENCES vaccines (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
