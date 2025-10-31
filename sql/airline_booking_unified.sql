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
AFTER INSERT ON TICKETS FOR EACH ROW
BEGIN
    UPDATE BOOKINGS
    SET total_amount = (SELECT SUM(price) FROM TICKETS WHERE booking_id = :NEW.booking_id)
    WHERE booking_id = :NEW.booking_id;
END;
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

PROMPT 'Inserting sample data...';

-- Airlines
INSERT INTO AIRLINES (name, iata_code, icao_code, country) VALUES ('Air India', 'AI', 'AIC', 'India');
INSERT INTO AIRLINES (name, iata_code, icao_code, country) VALUES ('IndiGo', '6E', 'IGO', 'India');
INSERT INTO AIRLINES (name, iata_code, icao_code, country) VALUES ('SpiceJet', 'SG', 'SEJ', 'India');
INSERT INTO AIRLINES (name, iata_code, icao_code, country) VALUES ('Vistara', 'UK', 'VTI', 'India');
INSERT INTO AIRLINES (name, iata_code, icao_code, country) VALUES ('Go First', 'G8', 'GOW', 'India');

-- Airports
INSERT INTO AIRPORTS (name, code, city, country, latitude, longitude, timezone) VALUES ('Indira Gandhi International Airport', 'DEL', 'New Delhi', 'India', 28.566535, 77.103088, 'Asia/Kolkata');
INSERT INTO AIRPORTS (name, code, city, country, latitude, longitude, timezone) VALUES ('Chhatrapati Shivaji Maharaj International Airport', 'BOM', 'Mumbai', 'India', 19.088686, 72.867919, 'Asia/Kolkata');
INSERT INTO AIRPORTS (name, code, city, country, latitude, longitude, timezone) VALUES ('Kempegowda International Airport', 'BLR', 'Bengaluru', 'India', 13.198889, 77.705556, 'Asia/Kolkata');
INSERT INTO AIRPORTS (name, code, city, country, latitude, longitude, timezone) VALUES ('Rajiv Gandhi International Airport', 'HYD', 'Hyderabad', 'India', 17.231381, 78.429378, 'Asia/Kolkata');
INSERT INTO AIRPORTS (name, code, city, country, latitude, longitude, timezone) VALUES ('Netaji Subhas Chandra Bose International Airport', 'CCU', 'Kolkata', 'India', 22.654739, 88.446722, 'Asia/Kolkata');
INSERT INTO AIRPORTS (name, code, city, country, latitude, longitude, timezone) VALUES ('Chennai International Airport', 'MAA', 'Chennai', 'India', 12.990005, 80.169286, 'Asia/Kolkata');
INSERT INTO AIRPORTS (name, code, city, country, latitude, longitude, timezone) VALUES ('Sardar Vallabhbhai Patel International Airport', 'AMD', 'Ahmedabad', 'India', 23.077242, 72.634658, 'Asia/Kolkata');
INSERT INTO AIRPORTS (name, code, city, country, latitude, longitude, timezone) VALUES ('Cochin International Airport', 'COK', 'Kochi', 'India', 10.152008, 76.401947, 'Asia/Kolkata');
INSERT INTO AIRPORTS (name, code, city, country, latitude, longitude, timezone) VALUES ('Goa International Airport', 'GOI', 'Goa', 'India', 15.380833, 73.831422, 'Asia/Kolkata');
INSERT INTO AIRPORTS (name, code, city, country, latitude, longitude, timezone) VALUES ('Pune Airport', 'PNQ', 'Pune', 'India', 18.582111, 73.919697, 'Asia/Kolkata');

-- Users
INSERT INTO USERS (username, password_hash, email, full_name, role, active) VALUES ('admin', 'e10adc3949ba59abbe56e057f20f883e', 'admin@airtickets.in', 'Rajesh Kumar', 'admin', 1);
INSERT INTO USERS (username, password_hash, email, full_name, role, active) VALUES ('priya.sharma', '5f4dcc3b5aa765d61d8327deb882cf99', 'priya.sharma@gmail.com', 'Priya Sharma', 'customer', 1);
INSERT INTO USERS (username, password_hash, email, full_name, role, active) VALUES ('amit.patel', '098f6bcd4621d373cade4e832627b4f6', 'amit.patel@yahoo.com', 'Amit Patel', 'customer', 1);

-- Passengers
INSERT INTO PASSENGERS (first_name, last_name, email, phone, passport_number, date_of_birth, nationality) VALUES ('Rahul', 'Verma', 'rahul.verma@gmail.com', '+91-9876543210', 'M1234567', TO_DATE('1990-05-15', 'YYYY-MM-DD'), 'Indian');
INSERT INTO PASSENGERS (first_name, last_name, email, phone, passport_number, date_of_birth, nationality) VALUES ('Priya', 'Sharma', 'priya.sharma@gmail.com', '+91-9876543211', 'M2345678', TO_DATE('1992-08-22', 'YYYY-MM-DD'), 'Indian');
INSERT INTO PASSENGERS (first_name, last_name, email, phone, passport_number, date_of_birth, nationality) VALUES ('Amit', 'Patel', 'amit.patel@yahoo.com', '+91-9876543212', 'M3456789', TO_DATE('1988-03-10', 'YYYY-MM-DD'), 'Indian');
INSERT INTO PASSENGERS (first_name, last_name, email, phone, passport_number, date_of_birth, nationality) VALUES ('Sneha', 'Reddy', 'sneha.reddy@outlook.com', '+91-9876543213', 'M4567890', TO_DATE('1995-11-30', 'YYYY-MM-DD'), 'Indian');
INSERT INTO PASSENGERS (first_name, last_name, email, phone, passport_number, date_of_birth, nationality) VALUES ('Vijay', 'Kumar', 'vijay.kumar@hotmail.com', '+91-9876543214', 'M5678901', TO_DATE('1987-07-18', 'YYYY-MM-DD'), 'Indian');

-- Flights (20 flights connecting various cities)
INSERT INTO FLIGHTS (airline_id, flight_number, origin_airport_id, destination_airport_id, departure_time, arrival_time, duration_minutes, price, available_seats, status)
VALUES (1000, 'AI101', 1000, 1001, TO_TIMESTAMP('2025-11-01 06:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2025-11-01 08:30:00', 'YYYY-MM-DD HH24:MI:SS'), 150, 5500.00, 180, 'scheduled');

INSERT INTO FLIGHTS (airline_id, flight_number, origin_airport_id, destination_airport_id, departure_time, arrival_time, duration_minutes, price, available_seats, status)
VALUES (1000, 'AI202', 1001, 1002, TO_TIMESTAMP('2025-11-01 09:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2025-11-01 11:30:00', 'YYYY-MM-DD HH24:MI:SS'), 150, 6200.00, 160, 'scheduled');

INSERT INTO FLIGHTS (airline_id, flight_number, origin_airport_id, destination_airport_id, departure_time, arrival_time, duration_minutes, price, available_seats, status)
VALUES (1000, 'AI303', 1002, 1003, TO_TIMESTAMP('2025-11-02 14:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2025-11-02 15:00:00', 'YYYY-MM-DD HH24:MI:SS'), 60, 3800.00, 150, 'scheduled');

INSERT INTO FLIGHTS (airline_id, flight_number, origin_airport_id, destination_airport_id, departure_time, arrival_time, duration_minutes, price, available_seats, status)
VALUES (1001, '6E501', 1000, 1005, TO_TIMESTAMP('2025-11-01 07:30:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2025-11-01 10:45:00', 'YYYY-MM-DD HH24:MI:SS'), 195, 4800.00, 186, 'scheduled');

INSERT INTO FLIGHTS (airline_id, flight_number, origin_airport_id, destination_airport_id, departure_time, arrival_time, duration_minutes, price, available_seats, status)
VALUES (1002, 'SG201', 1001, 1008, TO_TIMESTAMP('2025-11-01 10:30:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2025-11-01 11:45:00', 'YYYY-MM-DD HH24:MI:SS'), 75, 2500.00, 189, 'scheduled');

-- Bookings (5 sample bookings)
INSERT INTO BOOKINGS (user_id, passenger_id, booking_date, status, total_amount, payment_status)
VALUES (2001, 50000, TO_DATE('2025-10-15', 'YYYY-MM-DD'), 'confirmed', 5500.00, 'COMPLETED');

INSERT INTO BOOKINGS (user_id, passenger_id, booking_date, status, total_amount, payment_status)
VALUES (2001, 50001, TO_DATE('2025-10-16', 'YYYY-MM-DD'), 'confirmed', 6200.00, 'COMPLETED');

INSERT INTO BOOKINGS (user_id, passenger_id, booking_date, status, total_amount, payment_status)
VALUES (2002, 50002, TO_DATE('2025-10-17', 'YYYY-MM-DD'), 'confirmed', 4800.00, 'COMPLETED');

INSERT INTO BOOKINGS (user_id, passenger_id, booking_date, status, total_amount, payment_status)
VALUES (2002, 50003, TO_DATE('2025-10-18', 'YYYY-MM-DD'), 'pending', 3200.00, 'PENDING');

-- Tickets
INSERT INTO TICKETS (booking_id, flight_id, seat_number, fare_class, price, status)
VALUES (300000, 10000, '12A', 'Economy', 5500.00, 'confirmed');

INSERT INTO TICKETS (booking_id, flight_id, seat_number, fare_class, price, status)
VALUES (300001, 10001, '15B', 'Economy', 6200.00, 'confirmed');

INSERT INTO TICKETS (booking_id, flight_id, seat_number, fare_class, price, status)
VALUES (300002, 10003, '8C', 'Economy', 4800.00, 'confirmed');

-- Payments
INSERT INTO PAYMENTS (booking_id, amount, method, status, transaction_reference)
VALUES (300000, 5500.00, 'Credit Card', 'completed', 'TXN20251015001');

INSERT INTO PAYMENTS (booking_id, amount, method, status, transaction_reference)
VALUES (300001, 6200.00, 'Debit Card', 'completed', 'TXN20251016001');

INSERT INTO PAYMENTS (booking_id, amount, method, status, transaction_reference)
VALUES (300002, 4800.00, 'UPI', 'completed', 'TXN20251017001');

COMMIT;

PROMPT 'Sample data inserted.';
PROMPT '';

-- ============================================
-- COMPLETION
-- ============================================

PROMPT '============================================';
PROMPT 'SETUP COMPLETED SUCCESSFULLY!';
PROMPT '============================================';
PROMPT 'Summary:';
PROMPT '- 5 Airlines inserted';
PROMPT '- 10 Airports inserted';
PROMPT '- 5 Flights inserted';
PROMPT '- 5 Passengers inserted';
PROMPT '- 3 Users inserted';
PROMPT '- 4 Bookings inserted';
PROMPT '- 3 Tickets inserted';
PROMPT '- 3 Payments inserted';
PROMPT '- All triggers, views, and constraints created';
PROMPT '';
PROMPT 'You can now:';
PROMPT '1. Query flights: SELECT * FROM v_flight_schedule;';
PROMPT '2. Query bookings: SELECT * FROM v_booking_summary;';
PROMPT '3. Start the Node.js backend server';
PROMPT '';
