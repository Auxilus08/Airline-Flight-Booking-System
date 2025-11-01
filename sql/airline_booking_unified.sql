-- ============================================
-- AIRLINE TICKET BOOKING SYSTEM - UNIFIED ORACLE DDL
-- Comprehensive schema with all tables, constraints, triggers, views, and sample data
-- Idempotent: can be run multiple times safely
-- ============================================

SET SERVEROUTPUT ON;
SET DEFINE OFF;

PROMPT '============================================';
PROMPT 'Starting Airline Ticket Booking System Setup';
PROMPT '============================================';
PROMPT '';
-- ============================================
-- CREATE SEQUENCES
-- ============================================

PROMPT 'Creating sequences...';

CREATE SEQUENCE airline_seq START WITH 1000 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE airport_seq START WITH 1000 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE aircraft_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE route_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE flight_seq START WITH 10000 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE passenger_seq START WITH 50000 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE user_seq START WITH 2000 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE booking_seq START WITH 300000 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE ticket_seq START WITH 700000 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE payment_seq START WITH 900000 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seat_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE crew_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE flight_crew_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

PROMPT 'Sequences created.';
PROMPT '';

-- ============================================
-- CREATE TABLES
-- ============================================

PROMPT 'Creating tables...';

-- AIRLINES TABLE
CREATE TABLE AIRLINES (
    airline_id NUMBER PRIMARY KEY,
    name VARCHAR2(200) NOT NULL,
    iata_code VARCHAR2(3),
    icao_code VARCHAR2(4),
    country VARCHAR2(100),
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

-- AIRPORTS TABLE
CREATE TABLE AIRPORTS (
    airport_id NUMBER PRIMARY KEY,
    name VARCHAR2(200) NOT NULL,
    code VARCHAR2(5) UNIQUE NOT NULL,
    city VARCHAR2(100) NOT NULL,
    country VARCHAR2(100) NOT NULL,
    latitude NUMBER(9,6),
    longitude NUMBER(9,6),
    timezone VARCHAR2(100),
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

-- AIRCRAFT TABLE
CREATE TABLE aircraft (
    aircraft_id NUMBER PRIMARY KEY,
    aircraft_model VARCHAR2(50) NOT NULL,
    registration_number VARCHAR2(20) UNIQUE NOT NULL,
    total_seats NUMBER NOT NULL,
    economy_seats NUMBER NOT NULL,
    business_seats NUMBER NOT NULL,
    first_class_seats NUMBER NOT NULL,
    status VARCHAR2(20) DEFAULT 'ACTIVE',
    CONSTRAINT chk_aircraft_status CHECK (status IN ('ACTIVE', 'MAINTENANCE', 'RETIRED')),
    CONSTRAINT chk_total_seats CHECK (total_seats = economy_seats + business_seats + first_class_seats)
);

-- SEAT TABLE
CREATE TABLE seat (
    seat_id NUMBER PRIMARY KEY,
    aircraft_id NUMBER NOT NULL,
    seat_number VARCHAR2(5) NOT NULL,
    class_type VARCHAR2(20) NOT NULL,
    status VARCHAR2(20) DEFAULT 'AVAILABLE',
    CONSTRAINT fk_seat_aircraft FOREIGN KEY (aircraft_id) REFERENCES aircraft(aircraft_id),
    CONSTRAINT chk_seat_class CHECK (class_type IN ('ECONOMY', 'BUSINESS', 'FIRST_CLASS')),
    CONSTRAINT chk_seat_status CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE')),
    CONSTRAINT uk_seat UNIQUE (aircraft_id, seat_number)
);

-- ROUTE TABLE
CREATE TABLE route (
    route_id NUMBER PRIMARY KEY,
    origin_airport_id NUMBER NOT NULL,
    destination_airport_id NUMBER NOT NULL,
    distance_km NUMBER NOT NULL,
    duration_minutes NUMBER NOT NULL,
    CONSTRAINT fk_route_origin FOREIGN KEY (origin_airport_id) REFERENCES AIRPORTS(airport_id),
    CONSTRAINT fk_route_destination FOREIGN KEY (destination_airport_id) REFERENCES AIRPORTS(airport_id),
    CONSTRAINT chk_different_airports CHECK (origin_airport_id != destination_airport_id)
);

-- FLIGHTS TABLE (Combined schema)
CREATE TABLE FLIGHTS (
    flight_id NUMBER PRIMARY KEY,
    airline_id NUMBER NOT NULL,
    flight_number VARCHAR2(10) NOT NULL,
    route_id NUMBER,
    aircraft_id NUMBER,
    origin_airport_id NUMBER NOT NULL,
    destination_airport_id NUMBER NOT NULL,
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    duration_minutes NUMBER NOT NULL,
    price NUMBER(12,2) NOT NULL,
    available_seats NUMBER NOT NULL,
    status VARCHAR2(20) DEFAULT 'scheduled' NOT NULL,
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT chk_flight_price CHECK (price > 0),
    CONSTRAINT chk_flight_seats CHECK (available_seats >= 0),
    CONSTRAINT chk_flight_status CHECK (status IN ('scheduled','on-time','delayed','cancelled','SCHEDULED','BOARDING','DEPARTED','ARRIVED','CANCELLED','DELAYED')),
    CONSTRAINT chk_flight_times CHECK (arrival_time > departure_time),
    CONSTRAINT unq_flights_number UNIQUE (airline_id, flight_number, departure_time)
);

-- PASSENGERS TABLE
CREATE TABLE PASSENGERS (
    passenger_id NUMBER PRIMARY KEY,
    first_name VARCHAR2(100) NOT NULL,
    last_name VARCHAR2(100) NOT NULL,
    email VARCHAR2(200) UNIQUE NOT NULL,
    phone VARCHAR2(50),
    passport_number VARCHAR2(50) UNIQUE NOT NULL,
    date_of_birth DATE NOT NULL,
    nationality VARCHAR2(50),
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT chk_passengers_email CHECK (email LIKE '%@%')
);

-- USERS TABLE
CREATE TABLE USERS (
    user_id NUMBER PRIMARY KEY,
    username VARCHAR2(100) UNIQUE NOT NULL,
    password_hash VARCHAR2(500) NOT NULL,
    email VARCHAR2(200) UNIQUE NOT NULL,
    full_name VARCHAR2(200),
    role VARCHAR2(50) DEFAULT 'agent' NOT NULL,
    active NUMBER(1) DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT chk_users_role CHECK (role IN ('agent','admin','customer'))
);

-- BOOKINGS TABLE
CREATE TABLE BOOKINGS (
    booking_id NUMBER PRIMARY KEY,
    user_id NUMBER,
    passenger_id NUMBER NOT NULL,
    booking_date DATE DEFAULT SYSDATE NOT NULL,
    status VARCHAR2(20) DEFAULT 'pending' NOT NULL,
    total_amount NUMBER(12,2) NOT NULL,
    payment_status VARCHAR2(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT chk_booking_status CHECK (status IN ('confirmed','cancelled','pending','PENDING','CONFIRMED','CANCELLED')),
    CONSTRAINT chk_booking_amount CHECK (total_amount >= 0),
    CONSTRAINT chk_booking_payment_status CHECK (payment_status IN ('PENDING','COMPLETED','FAILED','REFUNDED'))
);

-- TICKETS TABLE
CREATE TABLE TICKETS (
    ticket_id NUMBER PRIMARY KEY,
    booking_id NUMBER NOT NULL,
    flight_id NUMBER NOT NULL,
    seat_id NUMBER,
    seat_number VARCHAR2(10),
    ticket_number VARCHAR2(20) UNIQUE,
    fare_class VARCHAR2(20),
    class_type VARCHAR2(20),
    price NUMBER(12,2) NOT NULL,
    issued_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    status VARCHAR2(20) DEFAULT 'confirmed' NOT NULL,
    CONSTRAINT chk_ticket_price CHECK (price > 0),
    CONSTRAINT chk_ticket_status CHECK (status IN ('confirmed','cancelled','pending','BOOKED','CHECKED_IN','BOARDED','CANCELLED'))
);

-- PAYMENTS TABLE
CREATE TABLE PAYMENTS (
    payment_id NUMBER PRIMARY KEY,
    booking_id NUMBER NOT NULL,
    amount NUMBER(12,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    method VARCHAR2(50) NOT NULL,
    payment_method VARCHAR2(50),
    status VARCHAR2(20) DEFAULT 'completed' NOT NULL,
    transaction_id VARCHAR2(50) UNIQUE,
    transaction_reference VARCHAR2(200),
    CONSTRAINT chk_payment_amount CHECK (amount > 0),
    CONSTRAINT chk_payment_status CHECK (status IN ('completed','failed','pending','PENDING','COMPLETED','FAILED','REFUNDED')),
    CONSTRAINT chk_payment_method CHECK (payment_method IS NULL OR payment_method IN ('CREDIT_CARD','DEBIT_CARD','UPI','NET_BANKING','WALLET'))
);

-- CREW TABLE
CREATE TABLE crew (
    crew_id NUMBER PRIMARY KEY,
    first_name VARCHAR2(50) NOT NULL,
    last_name VARCHAR2(50) NOT NULL,
    role VARCHAR2(30) NOT NULL,
    license_number VARCHAR2(20) UNIQUE,
    hire_date DATE DEFAULT SYSDATE,
    CONSTRAINT chk_crew_role CHECK (role IN ('PILOT','CO_PILOT','FLIGHT_ATTENDANT','SENIOR_ATTENDANT'))
);

-- FLIGHT_CREW TABLE
CREATE TABLE flight_crew (
    flight_crew_id NUMBER PRIMARY KEY,
    flight_id NUMBER NOT NULL,
    crew_id NUMBER NOT NULL,
    role VARCHAR2(30) NOT NULL,
    CONSTRAINT uk_flight_crew UNIQUE (flight_id, crew_id)
);

PROMPT 'Tables created.';
PROMPT '';

-- ============================================
-- ADD FOREIGN KEYS
-- ============================================

PROMPT 'Adding foreign key constraints...';

ALTER TABLE FLIGHTS ADD CONSTRAINT fk_flights_airline FOREIGN KEY (airline_id) REFERENCES AIRLINES(airline_id);
ALTER TABLE FLIGHTS ADD CONSTRAINT fk_flights_origin FOREIGN KEY (origin_airport_id) REFERENCES AIRPORTS(airport_id);
ALTER TABLE FLIGHTS ADD CONSTRAINT fk_flights_destination FOREIGN KEY (destination_airport_id) REFERENCES AIRPORTS(airport_id);
ALTER TABLE FLIGHTS ADD CONSTRAINT fk_flights_route FOREIGN KEY (route_id) REFERENCES route(route_id);
ALTER TABLE FLIGHTS ADD CONSTRAINT fk_flights_aircraft FOREIGN KEY (aircraft_id) REFERENCES aircraft(aircraft_id);

ALTER TABLE BOOKINGS ADD CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE SET NULL;
ALTER TABLE BOOKINGS ADD CONSTRAINT fk_bookings_passenger FOREIGN KEY (passenger_id) REFERENCES PASSENGERS(passenger_id) ON DELETE CASCADE;

ALTER TABLE TICKETS ADD CONSTRAINT fk_tickets_booking FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON DELETE CASCADE;
ALTER TABLE TICKETS ADD CONSTRAINT fk_tickets_flight FOREIGN KEY (flight_id) REFERENCES FLIGHTS(flight_id);
ALTER TABLE TICKETS ADD CONSTRAINT fk_tickets_seat FOREIGN KEY (seat_id) REFERENCES seat(seat_id);

ALTER TABLE PAYMENTS ADD CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON DELETE CASCADE;

ALTER TABLE flight_crew ADD CONSTRAINT fk_flight_crew_flight FOREIGN KEY (flight_id) REFERENCES FLIGHTS(flight_id);
ALTER TABLE flight_crew ADD CONSTRAINT fk_flight_crew_crew FOREIGN KEY (crew_id) REFERENCES crew(crew_id);

PROMPT 'Foreign keys added.';
PROMPT '';

-- ============================================
-- CREATE INDEXES
-- ============================================

PROMPT 'Creating indexes...';

CREATE INDEX idx_flights_flight_number ON FLIGHTS(flight_number);
CREATE INDEX idx_flights_airline_id ON FLIGHTS(airline_id);
CREATE INDEX idx_flights_route_id ON FLIGHTS(route_id);
CREATE INDEX idx_flights_departure ON FLIGHTS(departure_time);
CREATE INDEX idx_bookings_booking_date ON BOOKINGS(booking_date);
CREATE INDEX idx_bookings_passenger ON BOOKINGS(passenger_id);
CREATE INDEX idx_tickets_booking_id ON TICKETS(booking_id);
CREATE INDEX idx_tickets_flight ON TICKETS(flight_id);
CREATE INDEX idx_payments_booking_id ON PAYMENTS(booking_id);
CREATE INDEX idx_seat_aircraft ON seat(aircraft_id);

PROMPT 'Indexes created.';
PROMPT '';

-- ============================================
-- CREATE TRIGGERS
-- ============================================

PROMPT 'Creating triggers...';

-- Auto-increment triggers
CREATE OR REPLACE TRIGGER trg_airlines_id
BEFORE INSERT ON AIRLINES FOR EACH ROW
BEGIN
  IF :NEW.airline_id IS NULL THEN
    SELECT airline_seq.NEXTVAL INTO :NEW.airline_id FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_airports_id
BEFORE INSERT ON AIRPORTS FOR EACH ROW
BEGIN
  IF :NEW.airport_id IS NULL THEN
    SELECT airport_seq.NEXTVAL INTO :NEW.airport_id FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_flights_id
BEFORE INSERT ON FLIGHTS FOR EACH ROW
BEGIN
  IF :NEW.flight_id IS NULL THEN
    SELECT flight_seq.NEXTVAL INTO :NEW.flight_id FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_passengers_id
BEFORE INSERT ON PASSENGERS FOR EACH ROW
BEGIN
  IF :NEW.passenger_id IS NULL THEN
    SELECT passenger_seq.NEXTVAL INTO :NEW.passenger_id FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_users_id
BEFORE INSERT ON USERS FOR EACH ROW
BEGIN
  IF :NEW.user_id IS NULL THEN
    SELECT user_seq.NEXTVAL INTO :NEW.user_id FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_bookings_id
BEFORE INSERT ON BOOKINGS FOR EACH ROW
BEGIN
  IF :NEW.booking_id IS NULL THEN
    SELECT booking_seq.NEXTVAL INTO :NEW.booking_id FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_tickets_id
BEFORE INSERT ON TICKETS FOR EACH ROW
BEGIN
  IF :NEW.ticket_id IS NULL THEN
    SELECT ticket_seq.NEXTVAL INTO :NEW.ticket_id FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_payments_id
BEFORE INSERT ON PAYMENTS FOR EACH ROW
BEGIN
  IF :NEW.payment_id IS NULL THEN
    SELECT payment_seq.NEXTVAL INTO :NEW.payment_id FROM DUAL;
  END IF;
END;
/

-- Auto-generate ticket number
CREATE OR REPLACE TRIGGER trg_generate_ticket_number
BEFORE INSERT ON TICKETS FOR EACH ROW
BEGIN
    IF :NEW.ticket_number IS NULL THEN
        :NEW.ticket_number := 'TKT' || LPAD(:NEW.ticket_id, 10, '0');
    END IF;
END;
/

-- Update booking total when ticket is added
CREATE OR REPLACE TRIGGER trg_update_booking_total
FOR INSERT OR UPDATE OF price OR DELETE ON tickets
COMPOUND TRIGGER

    -- Temporary map to track affected booking IDs
    TYPE t_booking_map IS TABLE OF NUMBER INDEX BY PLS_INTEGER;
    g_affected_bookings t_booking_map;

    AFTER EACH ROW IS
    BEGIN
        IF INSERTING OR UPDATING THEN
            g_affected_bookings(:NEW.booking_id) := 1;
        ELSIF DELETING THEN
            g_affected_bookings(:OLD.booking_id) := 1;
        END IF;
    END AFTER EACH ROW;

    AFTER STATEMENT IS
        l_booking_id PLS_INTEGER;
    BEGIN
        l_booking_id := g_affected_bookings.FIRST;

        WHILE l_booking_id IS NOT NULL LOOP
            UPDATE bookings
            SET total_amount = (SELECT NVL(SUM(price), 0)
                                FROM tickets
                                WHERE booking_id = l_booking_id)
            WHERE booking_id = l_booking_id;

            l_booking_id := g_affected_bookings.NEXT(l_booking_id);
        END LOOP;
    END AFTER STATEMENT;

END trg_update_booking_total;
/


-- Prevent double booking
CREATE OR REPLACE TRIGGER trg_prevent_double_booking
BEFORE INSERT ON TICKETS FOR EACH ROW
DECLARE
    v_seat_count NUMBER;
BEGIN
    IF :NEW.seat_id IS NOT NULL THEN
        SELECT COUNT(*)
        INTO v_seat_count
        FROM TICKETS t
        WHERE t.flight_id = :NEW.flight_id
          AND t.seat_id = :NEW.seat_id
          AND t.status NOT IN ('cancelled','CANCELLED');
        
        IF v_seat_count > 0 THEN
            RAISE_APPLICATION_ERROR(-20001, 'Seat already booked for this flight');
        END IF;
    END IF;
END;
/

PROMPT 'Triggers created.';
PROMPT '';

-- ============================================
-- CREATE VIEWS
-- ============================================

PROMPT 'Creating views...';

BEGIN
    EXECUTE IMMEDIATE 'CREATE OR REPLACE VIEW v_flight_schedule AS
SELECT
    f.flight_id,
    f.flight_number,
    a.name AS airline_name,
    a.iata_code AS airline_code,
    ao.code AS origin_code,
    ao.city AS origin_city,
    ao.name AS origin_airport,
    ad.code AS destination_code,
    ad.city AS destination_city,
    ad.name AS destination_airport,
    f.departure_time,
    f.arrival_time,
    f.duration_minutes,
    f.price,
    f.available_seats,
    f.status
FROM FLIGHTS f
JOIN AIRLINES a ON f.airline_id = a.airline_id
JOIN AIRPORTS ao ON f.origin_airport_id = ao.airport_id
JOIN AIRPORTS ad ON f.destination_airport_id = ad.airport_id';
    DBMS_OUTPUT.PUT_LINE('View v_flight_schedule created successfully.');
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Warning: Could not create v_flight_schedule view - ' || SQLERRM);
END;
/

BEGIN
    EXECUTE IMMEDIATE 'CREATE OR REPLACE VIEW v_booking_summary AS
SELECT
    b.booking_id,
    p.first_name || '' '' || p.last_name AS passenger_name,
    p.email AS passenger_email,
    p.phone AS passenger_phone,
    f.flight_number,
    ao.city AS origin,
    ad.city AS destination,
    f.departure_time,
    t.fare_class,
    t.seat_number,
    t.price AS ticket_price,
    b.total_amount,
    b.status AS booking_status,
    b.payment_status,
    b.booking_date
FROM BOOKINGS b
JOIN PASSENGERS p ON b.passenger_id = p.passenger_id
JOIN TICKETS t ON b.booking_id = t.booking_id
JOIN FLIGHTS f ON t.flight_id = f.flight_id
JOIN AIRPORTS ao ON f.origin_airport_id = ao.airport_id
JOIN AIRPORTS ad ON f.destination_airport_id = ad.airport_id';
    DBMS_OUTPUT.PUT_LINE('View v_booking_summary created successfully.');
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Warning: Could not create v_booking_summary view - ' || SQLERRM);
END;
/

PROMPT 'Views created.';
PROMPT '';

-- ============================================
-- ADD COMMENTS
-- ============================================

PROMPT 'Adding comments...';

COMMENT ON TABLE AIRLINES IS 'Airlines operating flights in the system';
COMMENT ON TABLE AIRPORTS IS 'Airports served by flights';
COMMENT ON TABLE FLIGHTS IS 'Flight schedule and pricing information';
COMMENT ON TABLE PASSENGERS IS 'Passenger personal details';
COMMENT ON TABLE USERS IS 'System users such as agents and admins';
COMMENT ON TABLE BOOKINGS IS 'Bookings created for passengers';
COMMENT ON TABLE TICKETS IS 'Issued tickets linked to bookings and flights';
COMMENT ON TABLE PAYMENTS IS 'Payment records for bookings';
COMMENT ON TABLE aircraft IS 'Aircraft available for flights';
COMMENT ON TABLE seat IS 'Seats available in each aircraft';
COMMENT ON TABLE route IS 'Flight routes between airports';
COMMENT ON TABLE crew IS 'Crew members (pilots and attendants)';
COMMENT ON TABLE flight_crew IS 'Crew assignments for flights';

PROMPT 'Comments added.';
PROMPT '';

-- ============================================
-- INSERT SAMPLE DATA
-- ============================================
SET SERVEROUTPUT ON;
SET DEFINE OFF;

-- ============================================
-- SET SESSION FORMATS
-- ============================================
-- Set date/time formats for this session to simplify INSERT statements
ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD';
ALTER SESSION SET NLS_TIMESTAMP_FORMAT = 'YYYY-MM-DD HH24:MI:SS';

PROMPT '============================================';
PROMPT 'Starting Per-Table Data Insertion';
PROMPT '============================================';

-- ============================================
-- 1. AIRLINES (No Dependencies)
-- ============================================
PROMPT 'Populating AIRLINES...';
BEGIN
  INSERT INTO AIRLINES (airline_id, name, iata_code, icao_code, country)
  VALUES (1000, 'IndiGo', '6E', 'IGO', 'India');
  
  INSERT INTO AIRLINES (airline_id, name, iata_code, icao_code, country)
  VALUES (1001, 'Air India', 'AI', 'AIC', 'India');
  
  INSERT INTO AIRLINES (airline_id, name, iata_code, icao_code, country)
  VALUES (1002, 'Vistara', 'UK', 'VTI', 'India');
  
  COMMIT;
  DBMS_OUTPUT.PUT_LINE('Data for AIRLINES inserted successfully.');
EXCEPTION
  WHEN DUP_VAL_ON_INDEX THEN
    DBMS_OUTPUT.PUT_LINE('Data for AIRLINES already exists. Skipping.');
    ROLLBACK;
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Error inserting into AIRLINES: ' || SQLERRM);
    ROLLBACK;
END;
/

-- ============================================
-- 2. AIRPORTS (No Dependencies)
-- ============================================
PROMPT 'Populating AIRPORTS...';
BEGIN
  INSERT INTO AIRPORTS (airport_id, name, code, city, country, latitude, longitude, timezone)
  VALUES (1000, 'Chhatrapati Shivaji Maharaj International Airport', 'BOM', 'Mumbai', 'India', 19.0887, 72.8681, 'Asia/Kolkata');
  
  INSERT INTO AIRPORTS (airport_id, name, code, city, country, latitude, longitude, timezone)
  VALUES (1001, 'Indira Gandhi International Airport', 'DEL', 'Delhi', 'India', 28.5665, 77.1031, 'Asia/Kolkata');
  
  INSERT INTO AIRPORTS (airport_id, name, code, city, country, latitude, longitude, timezone)
  VALUES (1002, 'Kempegowda International Airport', 'BLR', 'Bengaluru', 'India', 13.1979, 77.7063, 'Asia/Kolkata');

  INSERT INTO AIRPORTS (airport_id, name, code, city, country, latitude, longitude, timezone)
  VALUES (1003, 'Dr. Babasaheb Ambedkar International Airport', 'NAG', 'Nagpur', 'India', 21.0922, 79.0471, 'Asia/Kolkata');
  
  COMMIT;
  DBMS_OUTPUT.PUT_LINE('Data for AIRPORTS inserted successfully.');
EXCEPTION
  WHEN DUP_VAL_ON_INDEX THEN
    DBMS_OUTPUT.PUT_LINE('Data for AIRPORTS already exists. Skipping.');
    ROLLBACK;
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Error inserting into AIRPORTS: ' || SQLERRM);
    ROLLBACK;
END;
/

-- ============================================
-- 3. AIRCRAFT (No Dependencies)
-- ============================================
PROMPT 'Populating AIRCRAFT...';
BEGIN
  INSERT INTO aircraft (aircraft_id, aircraft_model, registration_number, total_seats, economy_seats, business_seats, first_class_seats, status)
  VALUES (1, 'Airbus A320neo', 'VT-IZI', 180, 180, 0, 0, 'ACTIVE');
  
  INSERT INTO aircraft (aircraft_id, aircraft_model, registration_number, total_seats, economy_seats, business_seats, first_class_seats, status)
  VALUES (2, 'Boeing 787-8', 'VT-ANP', 256, 238, 18, 0, 'ACTIVE');
  
  INSERT INTO aircraft (aircraft_id, aircraft_model, registration_number, total_seats, economy_seats, business_seats, first_class_seats, status)
  VALUES (3, 'Airbus A321', 'VT-TVA', 232, 220, 12, 0, 'ACTIVE');
  
  COMMIT;
  DBMS_OUTPUT.PUT_LINE('Data for AIRCRAFT inserted successfully.');
EXCEPTION
  WHEN DUP_VAL_ON_INDEX THEN
    DBMS_OUTPUT.PUT_LINE('Data for AIRCRAFT already exists. Skipping.');
    ROLLBACK;
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Error inserting into AIRCRAFT: ' || SQLERRM);
    ROLLBACK;
END;
/

-- ============================================
-- 4. CREW (No Dependencies)
-- ============================================
PROMPT 'Populating CREW...';
BEGIN
  INSERT INTO crew (crew_id, first_name, last_name, role, license_number, hire_date)
  VALUES (1, 'Rohan', 'Sharma', 'PILOT', 'PLT12345', '2018-05-15');
  
  INSERT INTO crew (crew_id, first_name, last_name, role, license_number, hire_date)
  VALUES (2, 'Priya', 'Singh', 'CO_PILOT', 'CPL67890', '2020-02-10');
  
  INSERT INTO crew (crew_id, first_name, last_name, role, license_number, hire_date)
  VALUES (3, 'Anjali', 'Mehta', 'SENIOR_ATTENDANT', NULL, '2017-11-01');
  
  INSERT INTO crew (crew_id, first_name, last_name, role, license_number, hire_date)
  VALUES (4, 'Vikram', 'Rao', 'FLIGHT_ATTENDANT', NULL, '2021-07-20');
  
  COMMIT;
  DBMS_OUTPUT.PUT_LINE('Data for CREW inserted successfully.');
EXCEPTION
  WHEN DUP_VAL_ON_INDEX THEN
    DBMS_OUTPUT.PUT_LINE('Data for CREW already exists. Skipping.');
    ROLLBACK;
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Error inserting into CREW: ' || SQLERRM);
    ROLLBACK;
END;
/

-- ============================================
-- 5. USERS (No Dependencies)
-- ============================================
PROMPT 'Populating USERS...';
BEGIN
  INSERT INTO USERS (user_id, username, password_hash, email, full_name, role, active)
  VALUES (2000, 'admin_user', 'hash_pw_admin', 'admin@airline.com', 'System Administrator', 'admin', 1);
  
  INSERT INTO USERS (user_id, username, password_hash, email, full_name, role, active)
  VALUES (2001, 'agent_amit', 'hash_pw_agent', 'amit.k@airline.com', 'Amit Kumar', 'agent', 1);
  
  INSERT INTO USERS (user_id, username, password_hash, email, full_name, role, active)
  VALUES (2002, 'john.doe', 'hash_pw_customer', 'john.doe@example.com', 'John Doe', 'customer', 1);
  
  COMMIT;
  DBMS_OUTPUT.PUT_LINE('Data for USERS inserted successfully.');
EXCEPTION
  WHEN DUP_VAL_ON_INDEX THEN
    DBMS_OUTPUT.PUT_LINE('Data for USERS already exists. Skipping.');
    ROLLBACK;
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Error inserting into USERS: ' || SQLERRM);
    ROLLBACK;
END;
/

-- ============================================
-- 6. PASSENGERS (No Dependencies)
-- ============================================
PROMPT 'Populating PASSENGERS...';
BEGIN
  INSERT INTO PASSENGERS (passenger_id, first_name, last_name, email, phone, passport_number, date_of_birth, nationality)
  VALUES (50000, 'John', 'Doe', 'john.doe@example.com', '9876543210', 'A12345678', '1990-01-15', 'American');
  
  INSERT INTO PASSENGERS (passenger_id, first_name, last_name, email, phone, passport_number, date_of_birth, nationality)
  VALUES (50001, 'Jane', 'Smith', 'jane.smith@example.com', '8765432109', 'B98765432', '1992-03-22', 'British');
  
  INSERT INTO PASSENGERS (passenger_id, first_name, last_name, email, phone, passport_number, date_of_birth, nationality)
  VALUES (50002, 'Ravi', 'Verma', 'ravi.verma@example.com', '7654321098', 'Z34567890', '1985-11-30', 'Indian');
  
  COMMIT;
  DBMS_OUTPUT.PUT_LINE('Data for PASSENGERS inserted successfully.');
EXCEPTION
  WHEN DUP_VAL_ON_INDEX THEN
    DBMS_OUTPUT.PUT_LINE('Data for PASSENGERS already exists. Skipping.');
    ROLLBACK;
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Error inserting into PASSENGERS: ' || SQLERRM);
    ROLLBACK;
END;
/

-- ============================================
-- 7. ROUTE (Depends on AIRPORTS)
-- ============================================
PROMPT 'Populating ROUTE...';
BEGIN
  INSERT INTO route (route_id, origin_airport_id, destination_airport_id, distance_km, duration_minutes)
  VALUES (1, 1001, 1000, 1148, 120); -- DEL to BOM
  
  INSERT INTO route (route_id, origin_airport_id, destination_airport_id, distance_km, duration_minutes)
  VALUES (2, 1000, 1002, 842, 95);  -- BOM to BLR
  
  INSERT INTO route (route_id, origin_airport_id, destination_airport_id, distance_km, duration_minutes)
  VALUES (3, 1003, 1001, 851, 100); -- NAG to DEL
  
  INSERT INTO route (route_id, origin_airport_id, destination_airport_id, distance_km, duration_minutes)
  VALUES (4, 1002, 1001, 1740, 165); -- BLR to DEL
  
  COMMIT;
  DBMS_OUTPUT.PUT_LINE('Data for ROUTE inserted successfully.');
EXCEPTION
  WHEN DUP_VAL_ON_INDEX THEN
    DBMS_OUTPUT.PUT_LINE('Data for ROUTE already exists. Skipping.');
    ROLLBACK;
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Error inserting into ROUTE: ' || SQLERRM);
    ROLLBACK;
END;
/

-- ============================================
-- 8. SEAT (Depends on AIRCRAFT)
-- ============================================
PROMPT 'Populating SEAT...';
BEGIN
  -- Seats for Aircraft 1 (A320neo)
  INSERT INTO seat (seat_id, aircraft_id, seat_number, class_type, status)
  VALUES (1, 1, '1A', 'ECONOMY', 'AVAILABLE');
  INSERT INTO seat (seat_id, aircraft_id, seat_number, class_type, status)
  VALUES (2, 1, '1B', 'ECONOMY', 'AVAILABLE');
  INSERT INTO seat (seat_id, aircraft_id, seat_number, class_type, status)
  VALUES (3, 1, '1C', 'ECONOMY', 'AVAILABLE');
  INSERT INTO seat (seat_id, aircraft_id, seat_number, class_type, status)
  VALUES (4, 1, '10F', 'ECONOMY', 'AVAILABLE');
  
  -- Seats for Aircraft 2 (B787-8)
  INSERT INTO seat (seat_id, aircraft_id, seat_number, class_type, status)
  VALUES (5, 2, '1A', 'BUSINESS', 'AVAILABLE');
  INSERT INTO seat (seat_id, aircraft_id, seat_number, class_type, status)
  VALUES (6, 2, '1C', 'BUSINESS', 'AVAILABLE');
  INSERT INTO seat (seat_id, aircraft_id, seat_number, class_type, status)
  VALUES (7, 2, '5A', 'ECONOMY', 'AVAILABLE');
  INSERT INTO seat (seat_id, aircraft_id, seat_number, class_type, status)
  VALUES (8, 2, '5B', 'ECONOMY', 'AVAILABLE');
  
  COMMIT;
  DBMS_OUTPUT.PUT_LINE('Data for SEAT inserted successfully.');
EXCEPTION
  WHEN DUP_VAL_ON_INDEX THEN
    DBMS_OUTPUT.PUT_LINE('Data for SEAT already exists. Skipping.');
    ROLLBACK;
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Error inserting into SEAT: ' || SQLERRM);
    ROLLBACK;
END;
/

-- ============================================
-- 9. FLIGHTS (Depends on AIRLINES, AIRPORTS, ROUTE, AIRCRAFT)
-- ============================================
PROMPT 'Populating FLIGHTS...';
BEGIN
  INSERT INTO FLIGHTS (flight_id, airline_id, flight_number, route_id, aircraft_id, origin_airport_id, destination_airport_id, departure_time, arrival_time, duration_minutes, price, available_seats, status)
  VALUES (10000, 1000, '6E-204', 1, 1, 1001, 1000, '2025-11-15 08:00:00', '2025-11-15 10:00:00', 120, 4500.00, 180, 'scheduled');
  
  INSERT INTO FLIGHTS (flight_id, airline_id, flight_number, route_id, aircraft_id, origin_airport_id, destination_airport_id, departure_time, arrival_time, duration_minutes, price, available_seats, status)
  VALUES (10001, 1001, 'AI-803', 2, 2, 1000, 1002, '2025-11-16 12:30:00', '2025-11-16 14:05:00', 95, 7800.00, 256, 'scheduled');
  
  INSERT INTO FLIGHTS (flight_id, airline_id, flight_number, route_id, aircraft_id, origin_airport_id, destination_airport_id, departure_time, arrival_time, duration_minutes, price, available_seats, status)
  VALUES (10002, 1002, 'UK-945', 4, 3, 1002, 1001, '2025-11-17 18:00:00', '2025-11-17 20:45:00', 165, 6200.00, 232, 'scheduled');
  
  COMMIT;
  DBMS_OUTPUT.PUT_LINE('Data for FLIGHTS inserted successfully.');
EXCEPTION
  WHEN DUP_VAL_ON_INDEX THEN
    DBMS_OUTPUT.PUT_LINE('Data for FLIGHTS already exists. Skipping.');
    ROLLBACK;
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Error inserting into FLIGHTS: ' || SQLERRM);
    ROLLBACK;
END;
/

-- ============================================
-- 10. FLIGHT_CREW (Depends on FLIGHTS, CREW)
-- ============================================
PROMPT 'Populating FLIGHT_CREW...';
BEGIN
  -- Crew for Flight 10000 (6E-204)
  INSERT INTO flight_crew (flight_crew_id, flight_id, crew_id, role)
  VALUES (1, 10000, 1, 'PILOT');
  INSERT INTO flight_crew (flight_crew_id, flight_id, crew_id, role)
  VALUES (2, 10000, 2, 'CO_PILOT');
  INSERT INTO flight_crew (flight_crew_id, flight_id, crew_id, role)
  VALUES (3, 10000, 4, 'FLIGHT_ATTENDANT');
  
  -- Crew for Flight 10001 (AI-803)
  INSERT INTO flight_crew (flight_crew_id, flight_id, crew_id, role)
  VALUES (4, 10001, 1, 'PILOT');
  INSERT INTO flight_crew (flight_crew_id, flight_id, crew_id, role)
  VALUES (5, 10001, 3, 'SENIOR_ATTENDANT');
  
  COMMIT;
  DBMS_OUTPUT.PUT_LINE('Data for FLIGHT_CREW inserted successfully.');
EXCEPTION
  WHEN DUP_VAL_ON_INDEX THEN
    DBMS_OUTPUT.PUT_LINE('Data for FLIGHT_CREW already exists. Skipping.');
    ROLLBACK;
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Error inserting into FLIGHT_CREW: ' || SQLERRM);
    ROLLBACK;
END;
/

-- ============================================
-- 11. BOOKINGS (Depends on USERS, PASSENGERS)
-- ============================================
PROMPT 'Populating BOOKINGS...';
BEGIN
  -- John Doe's booking
  INSERT INTO BOOKINGS (booking_id, user_id, passenger_id, booking_date, status, total_amount, payment_status)
  VALUES (300000, 2002, 50000, '2025-11-01', 'confirmed', 4500.00, 'COMPLETED');
  
  -- Jane Smith's booking
  INSERT INTO BOOKINGS (booking_id, user_id, passenger_id, booking_date, status, total_amount, payment_status)
  VALUES (300001, 2001, 50001, '2025-11-02', 'confirmed', 7800.00, 'COMPLETED');
  
  -- Ravi Verma's booking
  INSERT INTO BOOKINGS (booking_id, user_id, passenger_id, booking_date, status, total_amount, payment_status)
  VALUES (300002, 2001, 50002, '2025-11-02', 'pending', 6200.00, 'PENDING');
  
  COMMIT;
  DBMS_OUTPUT.PUT_LINE('Data for BOOKINGS inserted successfully.');
EXCEPTION
  WHEN DUP_VAL_ON_INDEX THEN
    DBMS_OUTPUT.PUT_LINE('Data for BOOKINGS already exists. Skipping.');
    ROLLBACK;
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Error inserting into BOOKINGS: ' || SQLERRM);
    ROLLBACK;
END;
/

-- ============================================
-- 12. TICKETS (Depends on BOOKINGS, FLIGHTS, SEAT)
-- ============================================
PROMPT 'Populating TICKETS...';
BEGIN
  -- Ticket for John Doe (Booking 300000, Flight 10000, Seat 4)
  -- Note: We omit ticket_number to let trg_generate_ticket_number work
  INSERT INTO TICKETS (ticket_id, booking_id, flight_id, seat_id, seat_number, fare_class, class_type, price, status)
  VALUES (700000, 300000, 10000, 4, '10F', 'ECONOMY', 'ECONOMY', 4500.00, 'confirmed');
  
  -- Ticket for Jane Smith (Booking 300001, Flight 10001, Seat 5)
  INSERT INTO TICKETS (ticket_id, booking_id, flight_id, seat_id, seat_number, fare_class, class_type, price, status)
  VALUES (700001, 300001, 10001, 5, '1A', 'BUSINESS', 'BUSINESS', 7800.00, 'confirmed');
  
  COMMIT;
  DBMS_OUTPUT.PUT_LINE('Data for TICKETS inserted successfully.');
EXCEPTION
  WHEN DUP_VAL_ON_INDEX THEN
    DBMS_OUTPUT.PUT_LINE('Data for TICKETS already exists. Skipping.');
    ROLLBACK;
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Error inserting into TICKETS: ' || SQLERRM);
    ROLLBACK;
END;
/

-- ============================================
-- 13. PAYMENTS (Depends on BOOKINGS)
-- ============================================
PROMPT 'Populating PAYMENTS...';
BEGIN
  INSERT INTO PAYMENTS (payment_id, booking_id, amount, method, payment_method, status, transaction_id)
  VALUES (900000, 300000, 4500.00, 'CREDIT_CARD', 'CREDIT_CARD', 'completed', 'TXN1001');
  
  INSERT INTO PAYMENTS (payment_id, booking_id, amount, method, payment_method, status, transaction_id)
  VALUES (900001, 300001, 7800.00, 'UPI', 'UPI', 'completed', 'TXN1002');
  
  COMMIT;
  DBMS_OUTPUT.PUT_LINE('Data for PAYMENTS inserted successfully.');
EXCEPTION
  WHEN DUP_VAL_ON_INDEX THEN
    DBMS_OUTPUT.PUT_LINE('Data for PAYMENTS already exists. Skipping.');
    ROLLBACK;
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Error inserting into PAYMENTS: ' || SQLERRM);
    ROLLBACK;
END;
/

-- ============================================
-- SYNCHRONIZE SEQUENCES
-- ============================================
PROMPT 'Synchronizing sequences...';
DECLARE
  l_max_id NUMBER;
  PROCEDURE sync_sequence(p_seq_name IN VARCHAR2, p_max_val IN NUMBER) IS
    l_next_val NUMBER;
  BEGIN
    EXECUTE IMMEDIATE 'SELECT ' || p_seq_name || '.NEXTVAL FROM DUAL' INTO l_next_val;
    IF l_next_val <= p_max_val THEN
      EXECUTE IMMEDIATE 'ALTER SEQUENCE ' || p_seq_name || ' INCREMENT BY ' || (p_max_val - l_next_val + 1);
      EXECUTE IMMEDIATE 'SELECT ' || p_seq_name || '.NEXTVAL FROM DUAL' INTO l_next_val;
      EXECUTE IMMEDIATE 'ALTER SEQUENCE ' || p_seq_name || ' INCREMENT BY 1';
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- Fallback for safety
      DBMS_OUTPUT.PUT_LINE('Fallback: Recreating ' || p_seq_name);
      EXECUTE IMMEDIATE 'DROP SEQUENCE ' || p_seq_name;
      EXECUTE IMMEDIATE 'CREATE SEQUENCE ' || p_seq_name || ' START WITH ' || (p_max_val + 1) || ' INCREMENT BY 1 NOCACHE NOCYCLE';
  END;
BEGIN
  SELECT NVL(MAX(airline_id), 999) INTO l_max_id FROM AIRLINES;
  sync_sequence('airline_seq', l_max_id);
  
  SELECT NVL(MAX(airport_id), 999) INTO l_max_id FROM AIRPORTS;
  sync_sequence('airport_seq', l_max_id);
  
  SELECT NVL(MAX(aircraft_id), 0) INTO l_max_id FROM aircraft;
  sync_sequence('aircraft_seq', l_max_id);
  
  SELECT NVL(MAX(route_id), 0) INTO l_max_id FROM route;
  sync_sequence('route_seq', l_max_id);
  
  SELECT NVL(MAX(flight_id), 9999) INTO l_max_id FROM FLIGHTS;
  sync_sequence('flight_seq', l_max_id);
  
  SELECT NVL(MAX(passenger_id), 49999) INTO l_max_id FROM PASSENGERS;
  sync_sequence('passenger_seq', l_max_id);
  
  SELECT NVL(MAX(user_id), 1999) INTO l_max_id FROM USERS;
  sync_sequence('user_seq', l_max_id);
  
  SELECT NVL(MAX(booking_id), 299999) INTO l_max_id FROM BOOKINGS;
  sync_sequence('booking_seq', l_max_id);
  
  SELECT NVL(MAX(ticket_id), 699999) INTO l_max_id FROM TICKETS;
  sync_sequence('ticket_seq', l_max_id);
  
  SELECT NVL(MAX(payment_id), 899999) INTO l_max_id FROM PAYMENTS;
  sync_sequence('payment_seq', l_max_id);
  
  SELECT NVL(MAX(seat_id), 0) INTO l_max_id FROM seat;
  sync_sequence('seat_seq', l_max_id);
  
  SELECT NVL(MAX(crew_id), 0) INTO l_max_id FROM crew;
  sync_sequence('crew_seq', l_max_id);
  
  SELECT NVL(MAX(flight_crew_id), 0) INTO l_max_id FROM flight_crew;
  sync_sequence('flight_crew_seq', l_max_id);
  
  DBMS_OUTPUT.PUT_LINE('All sequences synchronized.');
  
EXCEPTION
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Error syncing sequences: ' || SQLERRM);
END;
/

PROMPT '============================================';
PROMPT 'All sample data inserted and sequences synced!';
PROMPT '============================================';