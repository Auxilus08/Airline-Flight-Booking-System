# Airline Ticket Booking System - Entity-Relationship Diagram

## Complete Oracle Database Design with ERD Description

---

## **1. USERS Entity**
**Purpose**: Stores system user information (customers who can make bookings)

### Attributes:
| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| USER_ID | NUMBER(10) | PRIMARY KEY | Unique user identifier |
| EMAIL | VARCHAR2(100) | UNIQUE, NOT NULL | User's email address |
| PASSWORD_HASH | VARCHAR2(256) | NOT NULL | Encrypted password |
| FIRST_NAME | VARCHAR2(50) | NOT NULL | User's first name |
| LAST_NAME | VARCHAR2(50) | NOT NULL | User's last name |
| PHONE | VARCHAR2(20) | | Contact number |
| DATE_OF_BIRTH | DATE | | User's birth date |
| CREATED_AT | TIMESTAMP | DEFAULT SYSTIMESTAMP | Account creation timestamp |
| UPDATED_AT | TIMESTAMP | DEFAULT SYSTIMESTAMP | Last update timestamp |
| IS_ACTIVE | CHAR(1) | DEFAULT 'Y', CHECK ('Y','N') | Account status |

### Constraints:
```sql
CONSTRAINT pk_users PRIMARY KEY (USER_ID)
CONSTRAINT uk_users_email UNIQUE (EMAIL)
CONSTRAINT chk_users_active CHECK (IS_ACTIVE IN ('Y', 'N'))
CONSTRAINT chk_users_email_format CHECK (REGEXP_LIKE(EMAIL, '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'))
```

### Relationships:
- **One-to-Many** with BOOKINGS (1 User → Many Bookings)

---

## **2. AIRLINES Entity**
**Purpose**: Stores airline company information

### Attributes:
| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| AIRLINE_ID | NUMBER(10) | PRIMARY KEY | Unique airline identifier |
| AIRLINE_CODE | VARCHAR2(3) | UNIQUE, NOT NULL | IATA airline code (e.g., 'AA') |
| AIRLINE_NAME | VARCHAR2(100) | NOT NULL | Full airline name |
| COUNTRY | VARCHAR2(50) | | Country of registration |
| CONTACT_NUMBER | VARCHAR2(20) | | Airline contact number |
| EMAIL | VARCHAR2(100) | | Airline email |
| WEBSITE | VARCHAR2(200) | | Airline website URL |
| IS_ACTIVE | CHAR(1) | DEFAULT 'Y', CHECK ('Y','N') | Operational status |
| CREATED_AT | TIMESTAMP | DEFAULT SYSTIMESTAMP | Record creation timestamp |

### Constraints:
```sql
CONSTRAINT pk_airlines PRIMARY KEY (AIRLINE_ID)
CONSTRAINT uk_airlines_code UNIQUE (AIRLINE_CODE)
CONSTRAINT chk_airlines_code CHECK (REGEXP_LIKE(AIRLINE_CODE, '^[A-Z]{2,3}$'))
CONSTRAINT chk_airlines_active CHECK (IS_ACTIVE IN ('Y', 'N'))
```

### Relationships:
- **One-to-Many** with FLIGHTS (1 Airline → Many Flights)

---

## **3. AIRPORTS Entity**
**Purpose**: Stores airport information worldwide

### Attributes:
| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| AIRPORT_ID | NUMBER(10) | PRIMARY KEY | Unique airport identifier |
| AIRPORT_CODE | VARCHAR2(3) | UNIQUE, NOT NULL | IATA airport code (e.g., 'JFK') |
| AIRPORT_NAME | VARCHAR2(200) | NOT NULL | Full airport name |
| CITY | VARCHAR2(100) | NOT NULL | City location |
| COUNTRY | VARCHAR2(50) | NOT NULL | Country location |
| TIMEZONE | VARCHAR2(50) | | Timezone (e.g., 'America/New_York') |
| LATITUDE | NUMBER(10,7) | | Geographic latitude |
| LONGITUDE | NUMBER(10,7) | | Geographic longitude |
| IS_ACTIVE | CHAR(1) | DEFAULT 'Y', CHECK ('Y','N') | Operational status |
| CREATED_AT | TIMESTAMP | DEFAULT SYSTIMESTAMP | Record creation timestamp |

### Constraints:
```sql
CONSTRAINT pk_airports PRIMARY KEY (AIRPORT_ID)
CONSTRAINT uk_airports_code UNIQUE (AIRPORT_CODE)
CONSTRAINT chk_airports_code CHECK (REGEXP_LIKE(AIRPORT_CODE, '^[A-Z]{3}$'))
CONSTRAINT chk_airports_active CHECK (IS_ACTIVE IN ('Y', 'N'))
CONSTRAINT chk_airports_lat CHECK (LATITUDE BETWEEN -90 AND 90)
CONSTRAINT chk_airports_lon CHECK (LONGITUDE BETWEEN -180 AND 180)
```

### Relationships:
- **One-to-Many** with FLIGHTS as Origin (1 Airport → Many Departure Flights)
- **One-to-Many** with FLIGHTS as Destination (1 Airport → Many Arrival Flights)

---

## **4. FLIGHTS Entity**
**Purpose**: Stores flight schedule and availability information

### Attributes:
| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| FLIGHT_ID | NUMBER(10) | PRIMARY KEY | Unique flight identifier |
| AIRLINE_ID | NUMBER(10) | FOREIGN KEY, NOT NULL | Reference to airline |
| FLIGHT_NUMBER | VARCHAR2(10) | NOT NULL | Flight number (e.g., 'AA123') |
| ORIGIN_AIRPORT_ID | NUMBER(10) | FOREIGN KEY, NOT NULL | Departure airport |
| DESTINATION_AIRPORT_ID | NUMBER(10) | FOREIGN KEY, NOT NULL | Arrival airport |
| DEPARTURE_TIME | TIMESTAMP | NOT NULL | Scheduled departure time |
| ARRIVAL_TIME | TIMESTAMP | NOT NULL | Scheduled arrival time |
| DURATION_MINUTES | NUMBER(5) | NOT NULL | Flight duration in minutes |
| AIRCRAFT_TYPE | VARCHAR2(50) | | Aircraft model (e.g., 'Boeing 737') |
| TOTAL_SEATS | NUMBER(4) | NOT NULL | Total available seats |
| AVAILABLE_SEATS | NUMBER(4) | NOT NULL | Currently available seats |
| BASE_PRICE | NUMBER(10,2) | NOT NULL | Base ticket price |
| STATUS | VARCHAR2(20) | DEFAULT 'SCHEDULED' | Flight status |
| CREATED_AT | TIMESTAMP | DEFAULT SYSTIMESTAMP | Record creation timestamp |
| UPDATED_AT | TIMESTAMP | DEFAULT SYSTIMESTAMP | Last update timestamp |

### Constraints:
```sql
CONSTRAINT pk_flights PRIMARY KEY (FLIGHT_ID)
CONSTRAINT fk_flights_airline FOREIGN KEY (AIRLINE_ID) REFERENCES AIRLINES(AIRLINE_ID)
CONSTRAINT fk_flights_origin FOREIGN KEY (ORIGIN_AIRPORT_ID) REFERENCES AIRPORTS(AIRPORT_ID)
CONSTRAINT fk_flights_dest FOREIGN KEY (DESTINATION_AIRPORT_ID) REFERENCES AIRPORTS(AIRPORT_ID)
CONSTRAINT chk_flights_airports CHECK (ORIGIN_AIRPORT_ID != DESTINATION_AIRPORT_ID)
CONSTRAINT chk_flights_times CHECK (ARRIVAL_TIME > DEPARTURE_TIME)
CONSTRAINT chk_flights_seats CHECK (AVAILABLE_SEATS <= TOTAL_SEATS AND AVAILABLE_SEATS >= 0)
CONSTRAINT chk_flights_price CHECK (BASE_PRICE > 0)
CONSTRAINT chk_flights_total_seats CHECK (TOTAL_SEATS > 0)
CONSTRAINT chk_flights_status CHECK (STATUS IN ('SCHEDULED', 'DELAYED', 'CANCELLED', 'DEPARTED', 'ARRIVED'))
CONSTRAINT uk_flights_unique UNIQUE (AIRLINE_ID, FLIGHT_NUMBER, DEPARTURE_TIME)
```

### Indexes:
```sql
CREATE INDEX idx_flights_route ON FLIGHTS(ORIGIN_AIRPORT_ID, DESTINATION_AIRPORT_ID, DEPARTURE_TIME);
CREATE INDEX idx_flights_status ON FLIGHTS(STATUS);
CREATE INDEX idx_flights_departure ON FLIGHTS(DEPARTURE_TIME);
```

### Relationships:
- **Many-to-One** with AIRLINES (Many Flights → 1 Airline)
- **Many-to-One** with AIRPORTS (Origin) (Many Flights → 1 Origin Airport)
- **Many-to-One** with AIRPORTS (Destination) (Many Flights → 1 Destination Airport)
- **One-to-Many** with TICKETS (1 Flight → Many Tickets)

---

## **5. PASSENGERS Entity**
**Purpose**: Stores passenger information (travelers, may differ from booking user)

### Attributes:
| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| PASSENGER_ID | NUMBER(10) | PRIMARY KEY | Unique passenger identifier |
| FIRST_NAME | VARCHAR2(50) | NOT NULL | Passenger's first name |
| LAST_NAME | VARCHAR2(50) | NOT NULL | Passenger's last name |
| DATE_OF_BIRTH | DATE | NOT NULL | Passenger's birth date |
| GENDER | CHAR(1) | CHECK ('M','F','O') | Gender |
| NATIONALITY | VARCHAR2(50) | | Passenger's nationality |
| PASSPORT_NUMBER | VARCHAR2(20) | | Passport number |
| PASSPORT_EXPIRY | DATE | | Passport expiration date |
| EMAIL | VARCHAR2(100) | | Passenger's email |
| PHONE | VARCHAR2(20) | | Passenger's phone |
| CREATED_AT | TIMESTAMP | DEFAULT SYSTIMESTAMP | Record creation timestamp |
| UPDATED_AT | TIMESTAMP | DEFAULT SYSTIMESTAMP | Last update timestamp |

### Constraints:
```sql
CONSTRAINT pk_passengers PRIMARY KEY (PASSENGER_ID)
CONSTRAINT chk_passengers_gender CHECK (GENDER IN ('M', 'F', 'O'))
CONSTRAINT chk_passengers_passport_expiry CHECK (PASSPORT_EXPIRY IS NULL OR PASSPORT_EXPIRY > DATE_OF_BIRTH)
```

### Indexes:
```sql
CREATE INDEX idx_passengers_passport ON PASSENGERS(PASSPORT_NUMBER);
CREATE INDEX idx_passengers_name ON PASSENGERS(LAST_NAME, FIRST_NAME);
```

### Relationships:
- **One-to-Many** with TICKETS (1 Passenger → Many Tickets)

---

## **6. BOOKINGS Entity**
**Purpose**: Stores booking/reservation information (parent record for multiple tickets)

### Attributes:
| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| BOOKING_ID | NUMBER(10) | PRIMARY KEY | Unique booking identifier |
| USER_ID | NUMBER(10) | FOREIGN KEY, NOT NULL | User who made the booking |
| BOOKING_REFERENCE | VARCHAR2(10) | UNIQUE, NOT NULL | PNR/Booking reference (e.g., 'ABC123XYZ') |
| BOOKING_DATE | TIMESTAMP | DEFAULT SYSTIMESTAMP, NOT NULL | Booking creation timestamp |
| TOTAL_AMOUNT | NUMBER(10,2) | NOT NULL | Total booking amount |
| BOOKING_STATUS | VARCHAR2(20) | DEFAULT 'PENDING' | Booking status |
| PAYMENT_STATUS | VARCHAR2(20) | DEFAULT 'PENDING' | Payment status |
| CONTACT_EMAIL | VARCHAR2(100) | NOT NULL | Contact email for booking |
| CONTACT_PHONE | VARCHAR2(20) | NOT NULL | Contact phone for booking |
| CREATED_AT | TIMESTAMP | DEFAULT SYSTIMESTAMP | Record creation timestamp |
| UPDATED_AT | TIMESTAMP | DEFAULT SYSTIMESTAMP | Last update timestamp |

### Constraints:
```sql
CONSTRAINT pk_bookings PRIMARY KEY (BOOKING_ID)
CONSTRAINT fk_bookings_user FOREIGN KEY (USER_ID) REFERENCES USERS(USER_ID)
CONSTRAINT uk_bookings_ref UNIQUE (BOOKING_REFERENCE)
CONSTRAINT chk_bookings_amount CHECK (TOTAL_AMOUNT > 0)
CONSTRAINT chk_bookings_status CHECK (BOOKING_STATUS IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'))
CONSTRAINT chk_bookings_payment CHECK (PAYMENT_STATUS IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED'))
```

### Indexes:
```sql
CREATE INDEX idx_bookings_user ON BOOKINGS(USER_ID);
CREATE INDEX idx_bookings_ref ON BOOKINGS(BOOKING_REFERENCE);
CREATE INDEX idx_bookings_status ON BOOKINGS(BOOKING_STATUS, PAYMENT_STATUS);
CREATE INDEX idx_bookings_date ON BOOKINGS(BOOKING_DATE);
```

### Relationships:
- **Many-to-One** with USERS (Many Bookings → 1 User)
- **One-to-Many** with TICKETS (1 Booking → Many Tickets)
- **One-to-Many** with PAYMENTS (1 Booking → Many Payments)

---

## **7. TICKETS Entity**
**Purpose**: Stores individual ticket information (one ticket per passenger per flight)

### Attributes:
| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| TICKET_ID | NUMBER(10) | PRIMARY KEY | Unique ticket identifier |
| BOOKING_ID | NUMBER(10) | FOREIGN KEY, NOT NULL | Reference to parent booking |
| FLIGHT_ID | NUMBER(10) | FOREIGN KEY, NOT NULL | Reference to flight |
| PASSENGER_ID | NUMBER(10) | FOREIGN KEY, NOT NULL | Reference to passenger |
| TICKET_NUMBER | VARCHAR2(15) | UNIQUE, NOT NULL | Unique ticket number (e-ticket) |
| SEAT_NUMBER | VARCHAR2(5) | | Assigned seat (e.g., '12A') |
| CLASS | VARCHAR2(20) | NOT NULL | Travel class |
| PRICE | NUMBER(10,2) | NOT NULL | Ticket price |
| BAGGAGE_ALLOWANCE | NUMBER(3) | DEFAULT 20 | Baggage allowance in KG |
| TICKET_STATUS | VARCHAR2(20) | DEFAULT 'BOOKED' | Ticket status |
| ISSUED_AT | TIMESTAMP | | Ticket issuance timestamp |
| CREATED_AT | TIMESTAMP | DEFAULT SYSTIMESTAMP | Record creation timestamp |
| UPDATED_AT | TIMESTAMP | DEFAULT SYSTIMESTAMP | Last update timestamp |

### Constraints:
```sql
CONSTRAINT pk_tickets PRIMARY KEY (TICKET_ID)
CONSTRAINT fk_tickets_booking FOREIGN KEY (BOOKING_ID) REFERENCES BOOKINGS(BOOKING_ID) ON DELETE CASCADE
CONSTRAINT fk_tickets_flight FOREIGN KEY (FLIGHT_ID) REFERENCES FLIGHTS(FLIGHT_ID)
CONSTRAINT fk_tickets_passenger FOREIGN KEY (PASSENGER_ID) REFERENCES PASSENGERS(PASSENGER_ID)
CONSTRAINT uk_tickets_number UNIQUE (TICKET_NUMBER)
CONSTRAINT uk_tickets_seat UNIQUE (FLIGHT_ID, SEAT_NUMBER)
CONSTRAINT chk_tickets_price CHECK (PRICE > 0)
CONSTRAINT chk_tickets_class CHECK (CLASS IN ('ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'))
CONSTRAINT chk_tickets_status CHECK (TICKET_STATUS IN ('BOOKED', 'CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'NO_SHOW'))
```

### Indexes:
```sql
CREATE INDEX idx_tickets_booking ON TICKETS(BOOKING_ID);
CREATE INDEX idx_tickets_flight ON TICKETS(FLIGHT_ID);
CREATE INDEX idx_tickets_passenger ON TICKETS(PASSENGER_ID);
CREATE INDEX idx_tickets_number ON TICKETS(TICKET_NUMBER);
```

### Relationships:
- **Many-to-One** with BOOKINGS (Many Tickets → 1 Booking)
- **Many-to-One** with FLIGHTS (Many Tickets → 1 Flight)
- **Many-to-One** with PASSENGERS (Many Tickets → 1 Passenger)

---

## **8. PAYMENTS Entity**
**Purpose**: Stores payment transaction information

### Attributes:
| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| PAYMENT_ID | NUMBER(10) | PRIMARY KEY | Unique payment identifier |
| BOOKING_ID | NUMBER(10) | FOREIGN KEY, NOT NULL | Reference to booking |
| PAYMENT_METHOD | VARCHAR2(20) | NOT NULL | Payment method used |
| PAYMENT_AMOUNT | NUMBER(10,2) | NOT NULL | Payment amount |
| TRANSACTION_ID | VARCHAR2(100) | UNIQUE | External transaction reference |
| PAYMENT_DATE | TIMESTAMP | DEFAULT SYSTIMESTAMP | Payment timestamp |
| PAYMENT_STATUS | VARCHAR2(20) | DEFAULT 'PENDING' | Payment status |
| CARD_LAST_FOUR | VARCHAR2(4) | | Last 4 digits of card (if applicable) |
| PAYMENT_GATEWAY | VARCHAR2(50) | | Payment gateway used |
| CURRENCY | VARCHAR2(3) | DEFAULT 'USD' | Currency code |
| REFUND_AMOUNT | NUMBER(10,2) | DEFAULT 0 | Refunded amount |
| REFUND_DATE | TIMESTAMP | | Refund timestamp |
| NOTES | VARCHAR2(500) | | Additional payment notes |
| CREATED_AT | TIMESTAMP | DEFAULT SYSTIMESTAMP | Record creation timestamp |
| UPDATED_AT | TIMESTAMP | DEFAULT SYSTIMESTAMP | Last update timestamp |

### Constraints:
```sql
CONSTRAINT pk_payments PRIMARY KEY (PAYMENT_ID)
CONSTRAINT fk_payments_booking FOREIGN KEY (BOOKING_ID) REFERENCES BOOKINGS(BOOKING_ID)
CONSTRAINT uk_payments_transaction UNIQUE (TRANSACTION_ID)
CONSTRAINT chk_payments_amount CHECK (PAYMENT_AMOUNT > 0)
CONSTRAINT chk_payments_refund CHECK (REFUND_AMOUNT >= 0 AND REFUND_AMOUNT <= PAYMENT_AMOUNT)
CONSTRAINT chk_payments_method CHECK (PAYMENT_METHOD IN ('CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING', 'UPI', 'WALLET', 'CASH'))
CONSTRAINT chk_payments_status CHECK (PAYMENT_STATUS IN ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'))
CONSTRAINT chk_payments_currency CHECK (REGEXP_LIKE(CURRENCY, '^[A-Z]{3}$'))
```

### Indexes:
```sql
CREATE INDEX idx_payments_booking ON PAYMENTS(BOOKING_ID);
CREATE INDEX idx_payments_transaction ON PAYMENTS(TRANSACTION_ID);
CREATE INDEX idx_payments_date ON PAYMENTS(PAYMENT_DATE);
CREATE INDEX idx_payments_status ON PAYMENTS(PAYMENT_STATUS);
```

### Relationships:
- **Many-to-One** with BOOKINGS (Many Payments → 1 Booking)

---

## **Entity Relationship Summary**

```
USERS (1) ──────< (M) BOOKINGS (1) ──────< (M) TICKETS (M) >────── (1) PASSENGERS
                                                    |
                                                    | (M)
                                                    |
                                                    ↓ (1)
                                                 FLIGHTS (M) >────── (1) AIRLINES
                                                    |
                                      ┌─────────────┴─────────────┐
                                      | (M)                       | (M)
                                      ↓ (1)                       ↓ (1)
                                  AIRPORTS                    AIRPORTS
                                  (Origin)                (Destination)

BOOKINGS (1) ──────< (M) PAYMENTS
```

---

## **Cardinality Notation**

| Relationship | Cardinality | Description |
|--------------|-------------|-------------|
| USERS ↔ BOOKINGS | 1:M | One user can make multiple bookings |
| BOOKINGS ↔ TICKETS | 1:M | One booking can contain multiple tickets |
| BOOKINGS ↔ PAYMENTS | 1:M | One booking can have multiple payment transactions |
| FLIGHTS ↔ TICKETS | 1:M | One flight can have multiple tickets |
| PASSENGERS ↔ TICKETS | 1:M | One passenger can have multiple tickets (across bookings) |
| AIRLINES ↔ FLIGHTS | 1:M | One airline operates multiple flights |
| AIRPORTS ↔ FLIGHTS (Origin) | 1:M | One airport is origin for multiple flights |
| AIRPORTS ↔ FLIGHTS (Destination) | 1:M | One airport is destination for multiple flights |

---

## **Business Rules & Constraints**

### 1. **User and Booking Rules**
- A user must be registered and active to make bookings
- Each booking must have a unique booking reference (PNR)
- A user can make multiple bookings over time
- Contact information is mandatory for all bookings

### 2. **Multi-Passenger Booking Rules**
- One booking can contain multiple tickets for different passengers
- All tickets in a booking share the same booking reference
- Total booking amount = Sum of all ticket prices in that booking
- All tickets in a booking must be paid together

### 3. **Flight and Airport Rules**
- A flight cannot have the same origin and destination airport
- Arrival time must be after departure time
- Available seats must always be ≤ Total seats and ≥ 0
- Flight numbers must be unique per airline per departure time
- Airports must have valid IATA codes (3 uppercase letters)

### 4. **Seat Availability Management (Atomic Updates)**
```sql
-- Trigger to update available seats atomically when ticket is booked
CREATE OR REPLACE TRIGGER trg_update_seat_availability
AFTER INSERT ON TICKETS
FOR EACH ROW
WHEN (NEW.TICKET_STATUS IN ('BOOKED', 'CONFIRMED'))
BEGIN
    UPDATE FLIGHTS
    SET AVAILABLE_SEATS = AVAILABLE_SEATS - 1,
        UPDATED_AT = SYSTIMESTAMP
    WHERE FLIGHT_ID = :NEW.FLIGHT_ID
    AND AVAILABLE_SEATS > 0;
    
    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'No seats available on this flight');
    END IF;
END;
/

-- Trigger to restore seats when ticket is cancelled
CREATE OR REPLACE TRIGGER trg_restore_seat_availability
AFTER UPDATE OF TICKET_STATUS ON TICKETS
FOR EACH ROW
WHEN (NEW.TICKET_STATUS = 'CANCELLED' AND OLD.TICKET_STATUS IN ('BOOKED', 'CONFIRMED'))
BEGIN
    UPDATE FLIGHTS
    SET AVAILABLE_SEATS = AVAILABLE_SEATS + 1,
        UPDATED_AT = SYSTIMESTAMP
    WHERE FLIGHT_ID = :NEW.FLIGHT_ID;
END;
/
```

### 5. **Payment Validation Rules**
- Tickets can only be confirmed after successful payment
- Payment status must be 'PAID' before booking status changes to 'CONFIRMED'
- Multiple payment attempts are allowed (for failed transactions)
- Refund amount cannot exceed original payment amount

```sql
-- Trigger to validate payment before ticket confirmation
CREATE OR REPLACE TRIGGER trg_validate_payment_before_confirm
BEFORE UPDATE OF TICKET_STATUS ON TICKETS
FOR EACH ROW
WHEN (NEW.TICKET_STATUS = 'CONFIRMED' AND OLD.TICKET_STATUS = 'BOOKED')
DECLARE
    v_payment_status VARCHAR2(20);
BEGIN
    SELECT PAYMENT_STATUS INTO v_payment_status
    FROM BOOKINGS
    WHERE BOOKING_ID = :NEW.BOOKING_ID;
    
    IF v_payment_status != 'PAID' THEN
        RAISE_APPLICATION_ERROR(-20002, 'Cannot confirm ticket without successful payment');
    END IF;
END;
/

-- Trigger to auto-update booking status when payment is successful
CREATE OR REPLACE TRIGGER trg_update_booking_on_payment
AFTER UPDATE OF PAYMENT_STATUS ON PAYMENTS
FOR EACH ROW
WHEN (NEW.PAYMENT_STATUS = 'SUCCESS' AND OLD.PAYMENT_STATUS != 'SUCCESS')
BEGIN
    UPDATE BOOKINGS
    SET PAYMENT_STATUS = 'PAID',
        BOOKING_STATUS = 'CONFIRMED',
        UPDATED_AT = SYSTIMESTAMP
    WHERE BOOKING_ID = :NEW.BOOKING_ID;
    
    UPDATE TICKETS
    SET TICKET_STATUS = 'CONFIRMED',
        ISSUED_AT = SYSTIMESTAMP,
        UPDATED_AT = SYSTIMESTAMP
    WHERE BOOKING_ID = :NEW.BOOKING_ID
    AND TICKET_STATUS = 'BOOKED';
END;
/
```

### 6. **Seat Assignment Rules**
- Seat numbers must be unique per flight
- Seat can only be assigned after ticket is confirmed
- Seat format validation (e.g., '12A', '1F')

### 7. **Ticket and Passenger Rules**
- Each ticket is associated with exactly one passenger
- A passenger can have multiple tickets across different bookings
- Passport information is mandatory for international flights
- Passenger age is calculated from date of birth

### 8. **Data Integrity Rules**
- All foreign key relationships enforce referential integrity
- Cascading delete on BOOKINGS → TICKETS relationship
- Prevent deletion of flights with existing confirmed tickets
- Audit trail maintained with CREATED_AT and UPDATED_AT timestamps

### 9. **Booking Workflow**
```
1. User creates booking (BOOKING_STATUS = 'PENDING', PAYMENT_STATUS = 'PENDING')
2. Tickets are created for each passenger (TICKET_STATUS = 'BOOKED')
3. Available seats are decremented atomically
4. Payment is processed (PAYMENT_STATUS changes to 'PROCESSING' → 'SUCCESS')
5. On successful payment:
   - BOOKING.PAYMENT_STATUS → 'PAID'
   - BOOKING.BOOKING_STATUS → 'CONFIRMED'
   - TICKETS.TICKET_STATUS → 'CONFIRMED'
   - TICKETS.ISSUED_AT is set
6. If payment fails:
   - Seats are restored
   - Tickets are cancelled
   - Booking remains in 'PENDING' state for retry
```

### 10. **Cancellation Rules**
```sql
-- Procedure for booking cancellation with seat restoration
CREATE OR REPLACE PROCEDURE cancel_booking(p_booking_id NUMBER) AS
BEGIN
    -- Update tickets to cancelled
    UPDATE TICKETS
    SET TICKET_STATUS = 'CANCELLED',
        UPDATED_AT = SYSTIMESTAMP
    WHERE BOOKING_ID = p_booking_id
    AND TICKET_STATUS IN ('BOOKED', 'CONFIRMED');
    
    -- Update booking status
    UPDATE BOOKINGS
    SET BOOKING_STATUS = 'CANCELLED',
        UPDATED_AT = SYSTIMESTAMP
    WHERE BOOKING_ID = p_booking_id;
    
    -- Process refund if payment was made
    UPDATE PAYMENTS
    SET PAYMENT_STATUS = 'REFUNDED',
        REFUND_AMOUNT = PAYMENT_AMOUNT,
        REFUND_DATE = SYSTIMESTAMP,
        UPDATED_AT = SYSTIMESTAMP
    WHERE BOOKING_ID = p_booking_id
    AND PAYMENT_STATUS = 'SUCCESS';
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/
```

---

## **Additional Database Objects**

### Sequences
```sql
CREATE SEQUENCE seq_users START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_airlines START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_airports START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_flights START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_passengers START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_bookings START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_tickets START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_payments START WITH 1 INCREMENT BY 1;
```

### Functions for Business Logic
```sql
-- Function to generate unique booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference RETURN VARCHAR2 AS
    v_ref VARCHAR2(10);
BEGIN
    SELECT 'BK' || LPAD(seq_bookings.NEXTVAL, 8, '0') INTO v_ref FROM DUAL;
    RETURN v_ref;
END;
/

-- Function to generate unique ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number RETURN VARCHAR2 AS
    v_ticket VARCHAR2(15);
BEGIN
    SELECT 'TKT' || TO_CHAR(SYSDATE, 'YYYYMMDD') || LPAD(seq_tickets.NEXTVAL, 6, '0')
    INTO v_ticket FROM DUAL;
    RETURN v_ticket;
END;
/

-- Function to check seat availability
CREATE OR REPLACE FUNCTION check_seat_availability(p_flight_id NUMBER, p_seats_needed NUMBER)
RETURN BOOLEAN AS
    v_available NUMBER;
BEGIN
    SELECT AVAILABLE_SEATS INTO v_available
    FROM FLIGHTS
    WHERE FLIGHT_ID = p_flight_id
    FOR UPDATE; -- Lock the row for update
    
    RETURN (v_available >= p_seats_needed);
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN FALSE;
END;
/
```

---

## **Sample Queries for Common Operations**

### 1. Search Flights
```sql
SELECT f.FLIGHT_ID, a.AIRLINE_NAME, f.FLIGHT_NUMBER,
       o.AIRPORT_NAME AS ORIGIN, d.AIRPORT_NAME AS DESTINATION,
       f.DEPARTURE_TIME, f.ARRIVAL_TIME, f.AVAILABLE_SEATS, f.BASE_PRICE
FROM FLIGHTS f
JOIN AIRLINES a ON f.AIRLINE_ID = a.AIRLINE_ID
JOIN AIRPORTS o ON f.ORIGIN_AIRPORT_ID = o.AIRPORT_ID
JOIN AIRPORTS d ON f.DESTINATION_AIRPORT_ID = d.AIRPORT_ID
WHERE o.CITY = 'New York'
  AND d.CITY = 'Los Angeles'
  AND TRUNC(f.DEPARTURE_TIME) = TO_DATE('2025-12-25', 'YYYY-MM-DD')
  AND f.AVAILABLE_SEATS > 0
  AND f.STATUS = 'SCHEDULED'
ORDER BY f.DEPARTURE_TIME;
```

### 2. Get User Bookings with Details
```sql
SELECT b.BOOKING_REFERENCE, b.BOOKING_DATE, b.TOTAL_AMOUNT,
       b.BOOKING_STATUS, b.PAYMENT_STATUS,
       COUNT(t.TICKET_ID) AS TOTAL_TICKETS
FROM BOOKINGS b
LEFT JOIN TICKETS t ON b.BOOKING_ID = t.BOOKING_ID
WHERE b.USER_ID = 123
GROUP BY b.BOOKING_ID, b.BOOKING_REFERENCE, b.BOOKING_DATE,
         b.TOTAL_AMOUNT, b.BOOKING_STATUS, b.PAYMENT_STATUS
ORDER BY b.BOOKING_DATE DESC;
```

### 3. Get Ticket Details for a Booking
```sql
SELECT t.TICKET_NUMBER, t.SEAT_NUMBER, t.CLASS, t.PRICE,
       p.FIRST_NAME, p.LAST_NAME, p.PASSPORT_NUMBER,
       f.FLIGHT_NUMBER, a.AIRLINE_NAME,
       o.CITY || ' (' || o.AIRPORT_CODE || ')' AS ORIGIN,
       d.CITY || ' (' || d.AIRPORT_CODE || ')' AS DESTINATION,
       f.DEPARTURE_TIME, f.ARRIVAL_TIME
FROM TICKETS t
JOIN PASSENGERS p ON t.PASSENGER_ID = p.PASSENGER_ID
JOIN FLIGHTS f ON t.FLIGHT_ID = f.FLIGHT_ID
JOIN AIRLINES a ON f.AIRLINE_ID = a.AIRLINE_ID
JOIN AIRPORTS o ON f.ORIGIN_AIRPORT_ID = o.AIRPORT_ID
JOIN AIRPORTS d ON f.DESTINATION_AIRPORT_ID = d.AIRPORT_ID
WHERE t.BOOKING_ID = 456;
```

---

## **ER Diagram Visual Description**

```
┌─────────────┐
│    USERS    │
│ ----------- │
│ *USER_ID    │───┐
│  EMAIL      │   │
│  PASSWORD   │   │
│  FIRST_NAME │   │
│  LAST_NAME  │   │
│  PHONE      │   │
│  DOB        │   │
│  IS_ACTIVE  │   │
└─────────────┘   │
                  │ 1:M (One user can make many bookings)
                  │
                  ↓
            ┌──────────────┐
            │   BOOKINGS   │
            │ ------------ │
            │ *BOOKING_ID  │───┐
            │  USER_ID (FK)│   │
            │  BOOKING_REF │   │
            │  BOOKING_DATE│   │
            │  TOTAL_AMOUNT│   │
            │  BOOKING_STS │   │
            │  PAYMENT_STS │   │
            │  CONTACT_INFO│   │
            └──────────────┘   │
                  │            │
                  │ 1:M        │ 1:M
                  │            │
                  ↓            ↓
            ┌──────────────┐  ┌──────────────┐
            │   TICKETS    │  │   PAYMENTS   │
            │ ------------ │  │ ------------ │
            │ *TICKET_ID   │  │ *PAYMENT_ID  │
            │  BOOKING_ID  │  │  BOOKING_ID  │
            │  FLIGHT_ID   │  │  AMOUNT      │
            │  PASSENGER_ID│  │  METHOD      │
            │  TICKET_NO   │  │  TRANS_ID    │
            │  SEAT_NUMBER │  │  STATUS      │
            │  CLASS       │  │  GATEWAY     │
            │  PRICE       │  │  CURRENCY    │
            │  STATUS      │  │  REFUND_AMT  │
            │  ISSUED_AT   │  │  PAYMENT_DATE│
            └──────────────┘  └──────────────┘
                  │  │
                  │  │ M:1
                  │  └────────────────┐
                  │                   │
                  │ M:1               ↓
                  │            ┌──────────────┐
                  │            │  PASSENGERS  │
                  │            │ ------------ │
                  │            │ *PASSENGER_ID│
                  │            │  FIRST_NAME  │
                  │            │  LAST_NAME   │
                  │            │  DOB         │
                  │            │  GENDER      │
                  │            │  NATIONALITY │
                  │            │  PASSPORT_NO │
                  │            │  PASSPORT_EXP│
                  │            │  EMAIL       │
                  │            │  PHONE       │
                  │            └──────────────┘
                  │
                  │ M:1
                  ↓
            ┌──────────────┐
            │   FLIGHTS    │
            │ ------------ │
            │ *FLIGHT_ID   │
            │  AIRLINE_ID  │───────┐
            │  FLIGHT_NO   │       │
            │  ORIGIN_ID   │───┐   │ M:1
            │  DEST_ID     │─┐ │   │
            │  DEPT_TIME   │ │ │   ↓
            │  ARR_TIME    │ │ │ ┌──────────────┐
            │  DURATION    │ │ │ │   AIRLINES   │
            │  AIRCRAFT    │ │ │ │ ------------ │
            │  TOTAL_SEATS │ │ │ │ *AIRLINE_ID  │
            │  AVAIL_SEATS │ │ │ │  AIRLINE_CODE│
            │  BASE_PRICE  │ │ │ │  AIRLINE_NAME│
            │  STATUS      │ │ │ │  COUNTRY     │
            └──────────────┘ │ │ │  CONTACT     │
                  │          │ │ │  EMAIL       │
                  │ M:1      │ │ │  WEBSITE     │
                  │          │ │ │  IS_ACTIVE   │
         ┌────────┴─────┐    │ │ └──────────────┘
         │              │    │ │
         │ (Destination)│    │ └─────────┐
         ↓              ↓    │           │ M:1
   ┌──────────────┐  ┌──────────────┐   │
   │   AIRPORTS   │  │   AIRPORTS   │   │
   │ ------------ │  │ ------------ │   │
   │ *AIRPORT_ID  │  │ *AIRPORT_ID  │   │
   │  AIRPORT_CODE│  │  AIRPORT_CODE│   │
   │  AIRPORT_NAME│  │  AIRPORT_NAME│   │
   │  CITY        │  │  CITY        │   │
   │  COUNTRY     │  │  COUNTRY     │   │
   │  TIMEZONE    │  │  TIMEZONE    │   │
   │  LATITUDE    │  │  LATITUDE    │   │
   │  LONGITUDE   │  │  LONGITUDE   │   │
   │  IS_ACTIVE   │  │  IS_ACTIVE   │   │
   └──────────────┘  └──────────────┘   │
         ▲                               │
         │                               │
         └───────────────────────────────┘
              (Origin)
```

---

## **Complete Table Creation Scripts**

```sql
-- =============================================
-- AIRLINE TICKET BOOKING SYSTEM - DDL SCRIPTS
-- =============================================

-- 1. USERS TABLE
CREATE TABLE USERS (
    USER_ID NUMBER(10) NOT NULL,
    EMAIL VARCHAR2(100) NOT NULL,
    PASSWORD_HASH VARCHAR2(256) NOT NULL,
    FIRST_NAME VARCHAR2(50) NOT NULL,
    LAST_NAME VARCHAR2(50) NOT NULL,
    PHONE VARCHAR2(20),
    DATE_OF_BIRTH DATE,
    CREATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP,
    IS_ACTIVE CHAR(1) DEFAULT 'Y' NOT NULL,
    
    CONSTRAINT pk_users PRIMARY KEY (USER_ID),
    CONSTRAINT uk_users_email UNIQUE (EMAIL),
    CONSTRAINT chk_users_active CHECK (IS_ACTIVE IN ('Y', 'N')),
    CONSTRAINT chk_users_email_format CHECK (REGEXP_LIKE(EMAIL, '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'))
);

-- 2. AIRLINES TABLE
CREATE TABLE AIRLINES (
    AIRLINE_ID NUMBER(10) NOT NULL,
    AIRLINE_CODE VARCHAR2(3) NOT NULL,
    AIRLINE_NAME VARCHAR2(100) NOT NULL,
    COUNTRY VARCHAR2(50),
    CONTACT_NUMBER VARCHAR2(20),
    EMAIL VARCHAR2(100),
    WEBSITE VARCHAR2(200),
    IS_ACTIVE CHAR(1) DEFAULT 'Y' NOT NULL,
    CREATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP,
    
    CONSTRAINT pk_airlines PRIMARY KEY (AIRLINE_ID),
    CONSTRAINT uk_airlines_code UNIQUE (AIRLINE_CODE),
    CONSTRAINT chk_airlines_code CHECK (REGEXP_LIKE(AIRLINE_CODE, '^[A-Z]{2,3}$')),
    CONSTRAINT chk_airlines_active CHECK (IS_ACTIVE IN ('Y', 'N'))
);

-- 3. AIRPORTS TABLE
CREATE TABLE AIRPORTS (
    AIRPORT_ID NUMBER(10) NOT NULL,
    AIRPORT_CODE VARCHAR2(3) NOT NULL,
    AIRPORT_NAME VARCHAR2(200) NOT NULL,
    CITY VARCHAR2(100) NOT NULL,
    COUNTRY VARCHAR2(50) NOT NULL,
    TIMEZONE VARCHAR2(50),
    LATITUDE NUMBER(10,7),
    LONGITUDE NUMBER(10,7),
    IS_ACTIVE CHAR(1) DEFAULT 'Y' NOT NULL,
    CREATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP,
    
    CONSTRAINT pk_airports PRIMARY KEY (AIRPORT_ID),
    CONSTRAINT uk_airports_code UNIQUE (AIRPORT_CODE),
    CONSTRAINT chk_airports_code CHECK (REGEXP_LIKE(AIRPORT_CODE, '^[A-Z]{3}$')),
    CONSTRAINT chk_airports_active CHECK (IS_ACTIVE IN ('Y', 'N')),
    CONSTRAINT chk_airports_lat CHECK (LATITUDE BETWEEN -90 AND 90),
    CONSTRAINT chk_airports_lon CHECK (LONGITUDE BETWEEN -180 AND 180)
);

-- 4. FLIGHTS TABLE
CREATE TABLE FLIGHTS (
    FLIGHT_ID NUMBER(10) NOT NULL,
    AIRLINE_ID NUMBER(10) NOT NULL,
    FLIGHT_NUMBER VARCHAR2(10) NOT NULL,
    ORIGIN_AIRPORT_ID NUMBER(10) NOT NULL,
    DESTINATION_AIRPORT_ID NUMBER(10) NOT NULL,
    DEPARTURE_TIME TIMESTAMP NOT NULL,
    ARRIVAL_TIME TIMESTAMP NOT NULL,
    DURATION_MINUTES NUMBER(5) NOT NULL,
    AIRCRAFT_TYPE VARCHAR2(50),
    TOTAL_SEATS NUMBER(4) NOT NULL,
    AVAILABLE_SEATS NUMBER(4) NOT NULL,
    BASE_PRICE NUMBER(10,2) NOT NULL,
    STATUS VARCHAR2(20) DEFAULT 'SCHEDULED' NOT NULL,
    CREATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP,
    
    CONSTRAINT pk_flights PRIMARY KEY (FLIGHT_ID),
    CONSTRAINT fk_flights_airline FOREIGN KEY (AIRLINE_ID) 
        REFERENCES AIRLINES(AIRLINE_ID),
    CONSTRAINT fk_flights_origin FOREIGN KEY (ORIGIN_AIRPORT_ID) 
        REFERENCES AIRPORTS(AIRPORT_ID),
    CONSTRAINT fk_flights_dest FOREIGN KEY (DESTINATION_AIRPORT_ID) 
        REFERENCES AIRPORTS(AIRPORT_ID),
    CONSTRAINT chk_flights_airports CHECK (ORIGIN_AIRPORT_ID != DESTINATION_AIRPORT_ID),
    CONSTRAINT chk_flights_times CHECK (ARRIVAL_TIME > DEPARTURE_TIME),
    CONSTRAINT chk_flights_seats CHECK (AVAILABLE_SEATS <= TOTAL_SEATS AND AVAILABLE_SEATS >= 0),
    CONSTRAINT chk_flights_price CHECK (BASE_PRICE > 0),
    CONSTRAINT chk_flights_total_seats CHECK (TOTAL_SEATS > 0),
    CONSTRAINT chk_flights_status CHECK (STATUS IN ('SCHEDULED', 'DELAYED', 'CANCELLED', 'DEPARTED', 'ARRIVED')),
    CONSTRAINT uk_flights_unique UNIQUE (AIRLINE_ID, FLIGHT_NUMBER, DEPARTURE_TIME)
);

-- 5. PASSENGERS TABLE
CREATE TABLE PASSENGERS (
    PASSENGER_ID NUMBER(10) NOT NULL,
    FIRST_NAME VARCHAR2(50) NOT NULL,
    LAST_NAME VARCHAR2(50) NOT NULL,
    DATE_OF_BIRTH DATE NOT NULL,
    GENDER CHAR(1),
    NATIONALITY VARCHAR2(50),
    PASSPORT_NUMBER VARCHAR2(20),
    PASSPORT_EXPIRY DATE,
    EMAIL VARCHAR2(100),
    PHONE VARCHAR2(20),
    CREATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP,
    
    CONSTRAINT pk_passengers PRIMARY KEY (PASSENGER_ID),
    CONSTRAINT chk_passengers_gender CHECK (GENDER IN ('M', 'F', 'O')),
    CONSTRAINT chk_passengers_passport_expiry CHECK (PASSPORT_EXPIRY IS NULL OR PASSPORT_EXPIRY > DATE_OF_BIRTH)
);

-- 6. BOOKINGS TABLE
CREATE TABLE BOOKINGS (
    BOOKING_ID NUMBER(10) NOT NULL,
    USER_ID NUMBER(10) NOT NULL,
    BOOKING_REFERENCE VARCHAR2(10) NOT NULL,
    BOOKING_DATE TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    TOTAL_AMOUNT NUMBER(10,2) NOT NULL,
    BOOKING_STATUS VARCHAR2(20) DEFAULT 'PENDING' NOT NULL,
    PAYMENT_STATUS VARCHAR2(20) DEFAULT 'PENDING' NOT NULL,
    CONTACT_EMAIL VARCHAR2(100) NOT NULL,
    CONTACT_PHONE VARCHAR2(20) NOT NULL,
    CREATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP,
    
    CONSTRAINT pk_bookings PRIMARY KEY (BOOKING_ID),
    CONSTRAINT fk_bookings_user FOREIGN KEY (USER_ID) 
        REFERENCES USERS(USER_ID),
    CONSTRAINT uk_bookings_ref UNIQUE (BOOKING_REFERENCE),
    CONSTRAINT chk_bookings_amount CHECK (TOTAL_AMOUNT > 0),
    CONSTRAINT chk_bookings_status CHECK (BOOKING_STATUS IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
    CONSTRAINT chk_bookings_payment CHECK (PAYMENT_STATUS IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED'))
);

-- 7. TICKETS TABLE
CREATE TABLE TICKETS (
    TICKET_ID NUMBER(10) NOT NULL,
    BOOKING_ID NUMBER(10) NOT NULL,
    FLIGHT_ID NUMBER(10) NOT NULL,
    PASSENGER_ID NUMBER(10) NOT NULL,
    TICKET_NUMBER VARCHAR2(15) NOT NULL,
    SEAT_NUMBER VARCHAR2(5),
    CLASS VARCHAR2(20) NOT NULL,
    PRICE NUMBER(10,2) NOT NULL,
    BAGGAGE_ALLOWANCE NUMBER(3) DEFAULT 20,
    TICKET_STATUS VARCHAR2(20) DEFAULT 'BOOKED' NOT NULL,
    ISSUED_AT TIMESTAMP,
    CREATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP,
    
    CONSTRAINT pk_tickets PRIMARY KEY (TICKET_ID),
    CONSTRAINT fk_tickets_booking FOREIGN KEY (BOOKING_ID) 
        REFERENCES BOOKINGS(BOOKING_ID) ON DELETE CASCADE,
    CONSTRAINT fk_tickets_flight FOREIGN KEY (FLIGHT_ID) 
        REFERENCES FLIGHTS(FLIGHT_ID),
    CONSTRAINT fk_tickets_passenger FOREIGN KEY (PASSENGER_ID) 
        REFERENCES PASSENGERS(PASSENGER_ID),
    CONSTRAINT uk_tickets_number UNIQUE (TICKET_NUMBER),
    CONSTRAINT uk_tickets_seat UNIQUE (FLIGHT_ID, SEAT_NUMBER),
    CONSTRAINT chk_tickets_price CHECK (PRICE > 0),
    CONSTRAINT chk_tickets_class CHECK (CLASS IN ('ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST')),
    CONSTRAINT chk_tickets_status CHECK (TICKET_STATUS IN ('BOOKED', 'CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'NO_SHOW'))
);

-- 8. PAYMENTS TABLE
CREATE TABLE PAYMENTS (
    PAYMENT_ID NUMBER(10) NOT NULL,
    BOOKING_ID NUMBER(10) NOT NULL,
    PAYMENT_METHOD VARCHAR2(20) NOT NULL,
    PAYMENT_AMOUNT NUMBER(10,2) NOT NULL,
    TRANSACTION_ID VARCHAR2(100),
    PAYMENT_DATE TIMESTAMP DEFAULT SYSTIMESTAMP,
    PAYMENT_STATUS VARCHAR2(20) DEFAULT 'PENDING' NOT NULL,
    CARD_LAST_FOUR VARCHAR2(4),
    PAYMENT_GATEWAY VARCHAR2(50),
    CURRENCY VARCHAR2(3) DEFAULT 'USD',
    REFUND_AMOUNT NUMBER(10,2) DEFAULT 0,
    REFUND_DATE TIMESTAMP,
    NOTES VARCHAR2(500),
    CREATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP,
    
    CONSTRAINT pk_payments PRIMARY KEY (PAYMENT_ID),
    CONSTRAINT fk_payments_booking FOREIGN KEY (BOOKING_ID) 
        REFERENCES BOOKINGS(BOOKING_ID),
    CONSTRAINT uk_payments_transaction UNIQUE (TRANSACTION_ID),
    CONSTRAINT chk_payments_amount CHECK (PAYMENT_AMOUNT > 0),
    CONSTRAINT chk_payments_refund CHECK (REFUND_AMOUNT >= 0 AND REFUND_AMOUNT <= PAYMENT_AMOUNT),
    CONSTRAINT chk_payments_method CHECK (PAYMENT_METHOD IN ('CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING', 'UPI', 'WALLET', 'CASH')),
    CONSTRAINT chk_payments_status CHECK (PAYMENT_STATUS IN ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED')),
    CONSTRAINT chk_payments_currency CHECK (REGEXP_LIKE(CURRENCY, '^[A-Z]{3}$'))
);

-- =============================================
-- CREATE SEQUENCES
-- =============================================

CREATE SEQUENCE seq_users START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_airlines START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_airports START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_flights START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_passengers START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_bookings START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_tickets START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_payments START WITH 1 INCREMENT BY 1 NOCACHE;

-- =============================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- FLIGHTS Indexes
CREATE INDEX idx_flights_route ON FLIGHTS(ORIGIN_AIRPORT_ID, DESTINATION_AIRPORT_ID, DEPARTURE_TIME);
CREATE INDEX idx_flights_status ON FLIGHTS(STATUS);
CREATE INDEX idx_flights_departure ON FLIGHTS(DEPARTURE_TIME);
CREATE INDEX idx_flights_airline ON FLIGHTS(AIRLINE_ID);

-- BOOKINGS Indexes
CREATE INDEX idx_bookings_user ON BOOKINGS(USER_ID);
CREATE INDEX idx_bookings_ref ON BOOKINGS(BOOKING_REFERENCE);
CREATE INDEX idx_bookings_status ON BOOKINGS(BOOKING_STATUS, PAYMENT_STATUS);
CREATE INDEX idx_bookings_date ON BOOKINGS(BOOKING_DATE);

-- TICKETS Indexes
CREATE INDEX idx_tickets_booking ON TICKETS(BOOKING_ID);
CREATE INDEX idx_tickets_flight ON TICKETS(FLIGHT_ID);
CREATE INDEX idx_tickets_passenger ON TICKETS(PASSENGER_ID);
CREATE INDEX idx_tickets_number ON TICKETS(TICKET_NUMBER);
CREATE INDEX idx_tickets_status ON TICKETS(TICKET_STATUS);

-- PASSENGERS Indexes
CREATE INDEX idx_passengers_passport ON PASSENGERS(PASSPORT_NUMBER);
CREATE INDEX idx_passengers_name ON PASSENGERS(LAST_NAME, FIRST_NAME);

-- PAYMENTS Indexes
CREATE INDEX idx_payments_booking ON PAYMENTS(BOOKING_ID);
CREATE INDEX idx_payments_transaction ON PAYMENTS(TRANSACTION_ID);
CREATE INDEX idx_payments_date ON PAYMENTS(PAYMENT_DATE);
CREATE INDEX idx_payments_status ON PAYMENTS(PAYMENT_STATUS);

-- =============================================
-- UTILITY FUNCTIONS
-- =============================================

-- Generate Booking Reference
CREATE OR REPLACE FUNCTION generate_booking_reference RETURN VARCHAR2 AS
    v_ref VARCHAR2(10);
BEGIN
    SELECT 'BK' || LPAD(seq_bookings.NEXTVAL, 8, '0') INTO v_ref FROM DUAL;
    RETURN v_ref;
END;
/

-- Generate Ticket Number
CREATE OR REPLACE FUNCTION generate_ticket_number RETURN VARCHAR2 AS
    v_ticket VARCHAR2(15);
BEGIN
    SELECT 'TKT' || TO_CHAR(SYSDATE, 'YYYYMMDD') || LPAD(seq_tickets.NEXTVAL, 6, '0')
    INTO v_ticket FROM DUAL;
    RETURN v_ticket;
END;
/

-- Check Seat Availability (with row locking)
CREATE OR REPLACE FUNCTION check_seat_availability(
    p_flight_id NUMBER, 
    p_seats_needed NUMBER
) RETURN BOOLEAN AS
    v_available NUMBER;
BEGIN
    SELECT AVAILABLE_SEATS INTO v_available
    FROM FLIGHTS
    WHERE FLIGHT_ID = p_flight_id
    FOR UPDATE;
    
    RETURN (v_available >= p_seats_needed);
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN FALSE;
END;
/

-- =============================================
-- TRIGGERS FOR BUSINESS LOGIC
-- =============================================

-- 1. Auto-update timestamp on record modification
CREATE OR REPLACE TRIGGER trg_users_updated
BEFORE UPDATE ON USERS
FOR EACH ROW
BEGIN
    :NEW.UPDATED_AT := SYSTIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER trg_flights_updated
BEFORE UPDATE ON FLIGHTS
FOR EACH ROW
BEGIN
    :NEW.UPDATED_AT := SYSTIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER trg_bookings_updated
BEFORE UPDATE ON BOOKINGS
FOR EACH ROW
BEGIN
    :NEW.UPDATED_AT := SYSTIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER trg_tickets_updated
BEFORE UPDATE ON TICKETS
FOR EACH ROW
BEGIN
    :NEW.UPDATED_AT := SYSTIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER trg_passengers_updated
BEFORE UPDATE ON PASSENGERS
FOR EACH ROW
BEGIN
    :NEW.UPDATED_AT := SYSTIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER trg_payments_updated
BEFORE UPDATE ON PAYMENTS
FOR EACH ROW
BEGIN
    :NEW.UPDATED_AT := SYSTIMESTAMP;
END;
/

-- 2. Update available seats when ticket is booked (ATOMIC)
CREATE OR REPLACE TRIGGER trg_update_seat_availability
AFTER INSERT ON TICKETS
FOR EACH ROW
WHEN (NEW.TICKET_STATUS IN ('BOOKED', 'CONFIRMED'))
DECLARE
    v_rows_updated NUMBER;
BEGIN
    UPDATE FLIGHTS
    SET AVAILABLE_SEATS = AVAILABLE_SEATS - 1,
        UPDATED_AT = SYSTIMESTAMP
    WHERE FLIGHT_ID = :NEW.FLIGHT_ID
    AND AVAILABLE_SEATS > 0;
    
    v_rows_updated := SQL%ROWCOUNT;
    
    IF v_rows_updated = 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'No seats available on flight ID: ' || :NEW.FLIGHT_ID);
    END IF;
END;
/

-- 3. Restore seats when ticket is cancelled
CREATE OR REPLACE TRIGGER trg_restore_seat_availability
AFTER UPDATE OF TICKET_STATUS ON TICKETS
FOR EACH ROW
WHEN (NEW.TICKET_STATUS = 'CANCELLED' AND OLD.TICKET_STATUS IN ('BOOKED', 'CONFIRMED'))
BEGIN
    UPDATE FLIGHTS
    SET AVAILABLE_SEATS = AVAILABLE_SEATS + 1,
        UPDATED_AT = SYSTIMESTAMP
    WHERE FLIGHT_ID = :NEW.FLIGHT_ID;
END;
/

-- 4. Validate payment before ticket confirmation
CREATE OR REPLACE TRIGGER trg_validate_payment_before_confirm
BEFORE UPDATE OF TICKET_STATUS ON TICKETS
FOR EACH ROW
WHEN (NEW.TICKET_STATUS = 'CONFIRMED' AND OLD.TICKET_STATUS = 'BOOKED')
DECLARE
    v_payment_status VARCHAR2(20);
BEGIN
    SELECT PAYMENT_STATUS INTO v_payment_status
    FROM BOOKINGS
    WHERE BOOKING_ID = :NEW.BOOKING_ID;
    
    IF v_payment_status != 'PAID' THEN
        RAISE_APPLICATION_ERROR(-20002, 
            'Cannot confirm ticket. Payment status is: ' || v_payment_status);
    END IF;
END;
/

-- 5. Auto-update booking and tickets on successful payment
CREATE OR REPLACE TRIGGER trg_update_booking_on_payment
AFTER UPDATE OF PAYMENT_STATUS ON PAYMENTS
FOR EACH ROW
WHEN (NEW.PAYMENT_STATUS = 'SUCCESS' AND OLD.PAYMENT_STATUS != 'SUCCESS')
BEGIN
    -- Update booking status
    UPDATE BOOKINGS
    SET PAYMENT_STATUS = 'PAID',
        BOOKING_STATUS = 'CONFIRMED',
        UPDATED_AT = SYSTIMESTAMP
    WHERE BOOKING_ID = :NEW.BOOKING_ID;
    
    -- Update all tickets in the booking
    UPDATE TICKETS
    SET TICKET_STATUS = 'CONFIRMED',
        ISSUED_AT = SYSTIMESTAMP,
        UPDATED_AT = SYSTIMESTAMP
    WHERE BOOKING_ID = :NEW.BOOKING_ID
    AND TICKET_STATUS = 'BOOKED';
END;
/

-- 6. Validate booking total amount matches ticket prices
CREATE OR REPLACE TRIGGER trg_validate_booking_amount
BEFORE INSERT ON BOOKINGS
FOR EACH ROW
BEGIN
    -- This will be validated after tickets are inserted
    -- through a separate check or procedure
    NULL;
END;
/

-- 7. Prevent deletion of flights with confirmed tickets
CREATE OR REPLACE TRIGGER trg_prevent_flight_deletion
BEFORE DELETE ON FLIGHTS
FOR EACH ROW
DECLARE
    v_ticket_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_ticket_count
    FROM TICKETS
    WHERE FLIGHT_ID = :OLD.FLIGHT_ID
    AND TICKET_STATUS IN ('CONFIRMED', 'CHECKED_IN');
    
    IF v_ticket_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20003, 
            'Cannot delete flight with confirmed tickets. Cancel tickets first.');
    END IF;
END;
/

-- =============================================
-- STORED PROCEDURES
-- =============================================

-- 1. Procedure to create a complete booking
CREATE OR REPLACE PROCEDURE create_booking(
    p_user_id IN NUMBER,
    p_contact_email IN VARCHAR2,
    p_contact_phone IN VARCHAR2,
    p_booking_id OUT NUMBER,
    p_booking_ref OUT VARCHAR2
) AS
BEGIN
    -- Generate booking reference
    p_booking_ref := generate_booking_reference();
    
    -- Get next booking ID
    SELECT seq_bookings.NEXTVAL INTO p_booking_id FROM DUAL;
    
    -- Insert booking record
    INSERT INTO BOOKINGS (
        BOOKING_ID, USER_ID, BOOKING_REFERENCE,
        TOTAL_AMOUNT, CONTACT_EMAIL, CONTACT_PHONE
    ) VALUES (
        p_booking_id, p_user_id, p_booking_ref,
        0, p_contact_email, p_contact_phone
    );
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- 2. Procedure to add ticket to booking
CREATE OR REPLACE PROCEDURE add_ticket_to_booking(
    p_booking_id IN NUMBER,
    p_flight_id IN NUMBER,
    p_passenger_id IN NUMBER,
    p_class IN VARCHAR2,
    p_price IN NUMBER,
    p_ticket_id OUT NUMBER
) AS
    v_ticket_number VARCHAR2(15);
    v_seats_available NUMBER;
BEGIN
    -- Check seat availability
    SELECT AVAILABLE_SEATS INTO v_seats_available
    FROM FLIGHTS
    WHERE FLIGHT_ID = p_flight_id
    FOR UPDATE;
    
    IF v_seats_available <= 0 THEN
        RAISE_APPLICATION_ERROR(-20004, 'No seats available on this flight');
    END IF;
    
    -- Generate ticket number
    v_ticket_number := generate_ticket_number();
    
    -- Get next ticket ID
    SELECT seq_tickets.NEXTVAL INTO p_ticket_id FROM DUAL;
    
    -- Insert ticket
    INSERT INTO TICKETS (
        TICKET_ID, BOOKING_ID, FLIGHT_ID, PASSENGER_ID,
        TICKET_NUMBER, CLASS, PRICE
    ) VALUES (
        p_ticket_id, p_booking_id, p_flight_id, p_passenger_id,
        v_ticket_number, p_class, p_price
    );
    
    -- Update booking total amount
    UPDATE BOOKINGS
    SET TOTAL_AMOUNT = TOTAL_AMOUNT + p_price,
        UPDATED_AT = SYSTIMESTAMP
    WHERE BOOKING_ID = p_booking_id;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- 3. Procedure to cancel entire booking
CREATE OR REPLACE PROCEDURE cancel_booking(
    p_booking_id IN NUMBER
) AS
    v_payment_status VARCHAR2(20);
BEGIN
    -- Check current payment status
    SELECT PAYMENT_STATUS INTO v_payment_status
    FROM BOOKINGS
    WHERE BOOKING_ID = p_booking_id;
    
    -- Update all tickets to cancelled
    UPDATE TICKETS
    SET TICKET_STATUS = 'CANCELLED',
        UPDATED_AT = SYSTIMESTAMP
    WHERE BOOKING_ID = p_booking_id
    AND TICKET_STATUS IN ('BOOKED', 'CONFIRMED');
    
    -- Update booking status
    UPDATE BOOKINGS
    SET BOOKING_STATUS = 'CANCELLED',
        UPDATED_AT = SYSTIMESTAMP
    WHERE BOOKING_ID = p_booking_id;
    
    -- Process refund if payment was successful
    IF v_payment_status = 'PAID' THEN
        UPDATE PAYMENTS
        SET PAYMENT_STATUS = 'REFUNDED',
            REFUND_AMOUNT = PAYMENT_AMOUNT,
            REFUND_DATE = SYSTIMESTAMP,
            UPDATED_AT = SYSTIMESTAMP
        WHERE BOOKING_ID = p_booking_id
        AND PAYMENT_STATUS = 'SUCCESS';
        
        UPDATE BOOKINGS
        SET PAYMENT_STATUS = 'REFUNDED'
        WHERE BOOKING_ID = p_booking_id;
    END IF;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- 4. Procedure to process payment
CREATE OR REPLACE PROCEDURE process_payment(
    p_booking_id IN NUMBER,
    p_payment_method IN VARCHAR2,
    p_payment_amount IN NUMBER,
    p_transaction_id IN VARCHAR2,
    p_payment_gateway IN VARCHAR2,
    p_payment_id OUT NUMBER
) AS
    v_booking_total NUMBER;
BEGIN
    -- Verify payment amount matches booking total
    SELECT TOTAL_AMOUNT INTO v_booking_total
    FROM BOOKINGS
    WHERE BOOKING_ID = p_booking_id;
    
    IF p_payment_amount != v_booking_total THEN
        RAISE_APPLICATION_ERROR(-20005, 
            'Payment amount does not match booking total');
    END IF;
    
    -- Get next payment ID
    SELECT seq_payments.NEXTVAL INTO p_payment_id FROM DUAL;
    
    -- Insert payment record
    INSERT INTO PAYMENTS (
        PAYMENT_ID, BOOKING_ID, PAYMENT_METHOD,
        PAYMENT_AMOUNT, TRANSACTION_ID, PAYMENT_GATEWAY,
        PAYMENT_STATUS
    ) VALUES (
        p_payment_id, p_booking_id, p_payment_method,
        p_payment_amount, p_transaction_id, p_payment_gateway,
        'SUCCESS'
    );
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- 5. Procedure to search available flights
CREATE OR REPLACE PROCEDURE search_flights(
    p_origin_code IN VARCHAR2,
    p_dest_code IN VARCHAR2,
    p_travel_date IN DATE,
    p_min_seats IN NUMBER DEFAULT 1,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
        SELECT f.FLIGHT_ID, a.AIRLINE_CODE, a.AIRLINE_NAME,
               f.FLIGHT_NUMBER,
               o.AIRPORT_CODE AS ORIGIN_CODE, o.CITY AS ORIGIN_CITY,
               d.AIRPORT_CODE AS DEST_CODE, d.CITY AS DEST_CITY,
               f.DEPARTURE_TIME, f.ARRIVAL_TIME, f.DURATION_MINUTES,
               f.AVAILABLE_SEATS, f.BASE_PRICE, f.STATUS
        FROM FLIGHTS f
        JOIN AIRLINES a ON f.AIRLINE_ID = a.AIRLINE_ID
        JOIN AIRPORTS o ON f.ORIGIN_AIRPORT_ID = o.AIRPORT_ID
        JOIN AIRPORTS d ON f.DESTINATION_AIRPORT_ID = d.AIRPORT_ID
        WHERE o.AIRPORT_CODE = p_origin_code
          AND d.AIRPORT_CODE = p_dest_code
          AND TRUNC(f.DEPARTURE_TIME) = TRUNC(p_travel_date)
          AND f.AVAILABLE_SEATS >= p_min_seats
          AND f.STATUS = 'SCHEDULED'
          AND a.IS_ACTIVE = 'Y'
        ORDER BY f.DEPARTURE_TIME;
END;
/

-- 6. Procedure to get booking details
CREATE OR REPLACE PROCEDURE get_booking_details(
    p_booking_id IN NUMBER,
    p_booking_cursor OUT SYS_REFCURSOR,
    p_tickets_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    -- Get booking information
    OPEN p_booking_cursor FOR
        SELECT b.BOOKING_ID, b.BOOKING_REFERENCE, b.BOOKING_DATE,
               b.TOTAL_AMOUNT, b.BOOKING_STATUS, b.PAYMENT_STATUS,
               b.CONTACT_EMAIL, b.CONTACT_PHONE,
               u.FIRST_NAME || ' ' || u.LAST_NAME AS BOOKED_BY,
               u.EMAIL AS USER_EMAIL
        FROM BOOKINGS b
        JOIN USERS u ON b.USER_ID = u.USER_ID
        WHERE b.BOOKING_ID = p_booking_id;
    
    -- Get all tickets in the booking
    OPEN p_tickets_cursor FOR
        SELECT t.TICKET_ID, t.TICKET_NUMBER, t.SEAT_NUMBER,
               t.CLASS, t.PRICE, t.TICKET_STATUS,
               p.FIRST_NAME || ' ' || p.LAST_NAME AS PASSENGER_NAME,
               p.PASSPORT_NUMBER, p.DATE_OF_BIRTH,
               f.FLIGHT_NUMBER, a.AIRLINE_NAME,
               o.CITY || ' (' || o.AIRPORT_CODE || ')' AS ORIGIN,
               d.CITY || ' (' || d.AIRPORT_CODE || ')' AS DESTINATION,
               f.DEPARTURE_TIME, f.ARRIVAL_TIME, f.DURATION_MINUTES
        FROM TICKETS t
        JOIN PASSENGERS p ON t.PASSENGER_ID = p.PASSENGER_ID
        JOIN FLIGHTS f ON t.FLIGHT_ID = f.FLIGHT_ID
        JOIN AIRLINES a ON f.AIRLINE_ID = a.AIRLINE_ID
        JOIN AIRPORTS o ON f.ORIGIN_AIRPORT_ID = o.AIRPORT_ID
        JOIN AIRPORTS d ON f.DESTINATION_AIRPORT_ID = d.AIRPORT_ID
        WHERE t.BOOKING_ID = p_booking_id
        ORDER BY f.DEPARTURE_TIME;
END;
/

-- 7. Procedure to check-in passenger
CREATE OR REPLACE PROCEDURE check_in_passenger(
    p_ticket_id IN NUMBER,
    p_seat_number IN VARCHAR2
) AS
    v_current_status VARCHAR2(20);
    v_flight_id NUMBER;
    v_seat_exists NUMBER;
BEGIN
    -- Get current ticket status and flight
    SELECT TICKET_STATUS, FLIGHT_ID 
    INTO v_current_status, v_flight_id
    FROM TICKETS
    WHERE TICKET_ID = p_ticket_id;
    
    -- Validate ticket status
    IF v_current_status != 'CONFIRMED' THEN
        RAISE_APPLICATION_ERROR(-20006, 
            'Cannot check-in. Ticket status is: ' || v_current_status);
    END IF;
    
    -- Check if seat is already taken
    SELECT COUNT(*) INTO v_seat_exists
    FROM TICKETS
    WHERE FLIGHT_ID = v_flight_id
    AND SEAT_NUMBER = p_seat_number
    AND TICKET_ID != p_ticket_id
    AND TICKET_STATUS != 'CANCELLED';
    
    IF v_seat_exists > 0 THEN
        RAISE_APPLICATION_ERROR(-20007, 
            'Seat ' || p_seat_number || ' is already occupied');
    END IF;
    
    -- Update ticket with seat assignment and check-in status
    UPDATE TICKETS
    SET SEAT_NUMBER = p_seat_number,
        TICKET_STATUS = 'CHECKED_IN',
        UPDATED_AT = SYSTIMESTAMP
    WHERE TICKET_ID = p_ticket_id;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- 8. Procedure to get user booking history
CREATE OR REPLACE PROCEDURE get_user_booking_history(
    p_user_id IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
        SELECT b.BOOKING_ID, b.BOOKING_REFERENCE, b.BOOKING_DATE,
               b.TOTAL_AMOUNT, b.BOOKING_STATUS, b.PAYMENT_STATUS,
               COUNT(DISTINCT t.TICKET_ID) AS TOTAL_TICKETS,
               COUNT(DISTINCT t.FLIGHT_ID) AS TOTAL_FLIGHTS,
               MIN(f.DEPARTURE_TIME) AS FIRST_FLIGHT_DATE
        FROM BOOKINGS b
        LEFT JOIN TICKETS t ON b.BOOKING_ID = t.BOOKING_ID
        LEFT JOIN FLIGHTS f ON t.FLIGHT_ID = f.FLIGHT_ID
        WHERE b.USER_ID = p_user_id
        GROUP BY b.BOOKING_ID, b.BOOKING_REFERENCE, b.BOOKING_DATE,
                 b.TOTAL_AMOUNT, b.BOOKING_STATUS, b.PAYMENT_STATUS
        ORDER BY b.BOOKING_DATE DESC;
END;
/

-- 9. Procedure to update flight status
CREATE OR REPLACE PROCEDURE update_flight_status(
    p_flight_id IN NUMBER,
    p_new_status IN VARCHAR2,
    p_new_departure IN TIMESTAMP DEFAULT NULL,
    p_new_arrival IN TIMESTAMP DEFAULT NULL
) AS
BEGIN
    IF p_new_departure IS NOT NULL AND p_new_arrival IS NOT NULL THEN
        UPDATE FLIGHTS
        SET STATUS = p_new_status,
            DEPARTURE_TIME = p_new_departure,
            ARRIVAL_TIME = p_new_arrival,
            UPDATED_AT = SYSTIMESTAMP
        WHERE FLIGHT_ID = p_flight_id;
    ELSE
        UPDATE FLIGHTS
        SET STATUS = p_new_status,
            UPDATED_AT = SYSTIMESTAMP
        WHERE FLIGHT_ID = p_flight_id;
    END IF;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- 10. Procedure to generate sales report
CREATE OR REPLACE PROCEDURE generate_sales_report(
    p_start_date IN DATE,
    p_end_date IN DATE,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
        SELECT a.AIRLINE_NAME,
               COUNT(DISTINCT b.BOOKING_ID) AS TOTAL_BOOKINGS,
               COUNT(t.TICKET_ID) AS TOTAL_TICKETS,
               SUM(t.PRICE) AS TOTAL_REVENUE,
               AVG(t.PRICE) AS AVG_TICKET_PRICE,
               COUNT(CASE WHEN t.CLASS = 'ECONOMY' THEN 1 END) AS ECONOMY_TICKETS,
               COUNT(CASE WHEN t.CLASS = 'BUSINESS' THEN 1 END) AS BUSINESS_TICKETS,
               COUNT(CASE WHEN t.CLASS = 'FIRST' THEN 1 END) AS FIRST_CLASS_TICKETS
        FROM BOOKINGS b
        JOIN TICKETS t ON b.BOOKING_ID = t.BOOKING_ID
        JOIN FLIGHTS f ON t.FLIGHT_ID = f.FLIGHT_ID
        JOIN AIRLINES a ON f.AIRLINE_ID = a.AIRLINE_ID
        WHERE b.BOOKING_DATE BETWEEN p_start_date AND p_end_date
        AND b.PAYMENT_STATUS = 'PAID'
        GROUP BY a.AIRLINE_ID, a.AIRLINE_NAME
        ORDER BY TOTAL_REVENUE DESC;
END;
/

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- 1. View for available flights with details
CREATE OR REPLACE VIEW v_available_flights AS
SELECT f.FLIGHT_ID, 
       a.AIRLINE_CODE, a.AIRLINE_NAME,
       f.FLIGHT_NUMBER,
       o.AIRPORT_CODE AS ORIGIN_CODE, 
       o.CITY AS ORIGIN_CITY,
       o.COUNTRY AS ORIGIN_COUNTRY,
       d.AIRPORT_CODE AS DEST_CODE,
       d.CITY AS DEST_CITY,
       d.COUNTRY AS DEST_COUNTRY,
       f.DEPARTURE_TIME, f.ARRIVAL_TIME,
       f.DURATION_MINUTES,
       f.TOTAL_SEATS, f.AVAILABLE_SEATS,
       (f.TOTAL_SEATS - f.AVAILABLE_SEATS) AS BOOKED_SEATS,
       ROUND((f.TOTAL_SEATS - f.AVAILABLE_SEATS) * 100.0 / f.TOTAL_SEATS, 2) AS OCCUPANCY_RATE,
       f.BASE_PRICE, f.STATUS, f.AIRCRAFT_TYPE
FROM FLIGHTS f
JOIN AIRLINES a ON f.AIRLINE_ID = a.AIRLINE_ID
JOIN AIRPORTS o ON f.ORIGIN_AIRPORT_ID = o.AIRPORT_ID
JOIN AIRPORTS d ON f.DESTINATION_AIRPORT_ID = d.AIRPORT_ID
WHERE f.STATUS = 'SCHEDULED'
AND f.AVAILABLE_SEATS > 0
AND a.IS_ACTIVE = 'Y';

-- 2. View for booking summary
CREATE OR REPLACE VIEW v_booking_summary AS
SELECT b.BOOKING_ID, b.BOOKING_REFERENCE, b.BOOKING_DATE,
       u.USER_ID, u.FIRST_NAME || ' ' || u.LAST_NAME AS USER_NAME,
       u.EMAIL AS USER_EMAIL,
       b.TOTAL_AMOUNT, b.BOOKING_STATUS, b.PAYMENT_STATUS,
       COUNT(t.TICKET_ID) AS TOTAL_TICKETS,
       COUNT(DISTINCT t.PASSENGER_ID) AS TOTAL_PASSENGERS,
       COUNT(DISTINCT t.FLIGHT_ID) AS TOTAL_FLIGHTS,
       MIN(f.DEPARTURE_TIME) AS FIRST_DEPARTURE,
       MAX(f.ARRIVAL_TIME) AS LAST_ARRIVAL
FROM BOOKINGS b
JOIN USERS u ON b.USER_ID = u.USER_ID
LEFT JOIN TICKETS t ON b.BOOKING_ID = t.BOOKING_ID
LEFT JOIN FLIGHTS f ON t.FLIGHT_ID = f.FLIGHT_ID
GROUP BY b.BOOKING_ID, b.BOOKING_REFERENCE, b.BOOKING_DATE,
         u.USER_ID, u.FIRST_NAME, u.LAST_NAME, u.EMAIL,
         b.TOTAL_AMOUNT, b.BOOKING_STATUS, b.PAYMENT_STATUS;

-- 3. View for ticket details
CREATE OR REPLACE VIEW v_ticket_details AS
SELECT t.TICKET_ID, t.TICKET_NUMBER, t.SEAT_NUMBER,
       t.CLASS, t.PRICE, t.TICKET_STATUS,
       b.BOOKING_REFERENCE,
       p.PASSENGER_ID,
       p.FIRST_NAME || ' ' || p.LAST_NAME AS PASSENGER_NAME,
       p.PASSPORT_NUMBER, p.NATIONALITY,
       f.FLIGHT_ID, f.FLIGHT_NUMBER,
       a.AIRLINE_CODE, a.AIRLINE_NAME,
       o.AIRPORT_CODE AS ORIGIN_CODE, o.CITY AS ORIGIN_CITY,
       d.AIRPORT_CODE AS DEST_CODE, d.CITY AS DEST_CITY,
       f.DEPARTURE_TIME, f.ARRIVAL_TIME,
       f.STATUS AS FLIGHT_STATUS
FROM TICKETS t
JOIN BOOKINGS b ON t.BOOKING_ID = b.BOOKING_ID
JOIN PASSENGERS p ON t.PASSENGER_ID = p.PASSENGER_ID
JOIN FLIGHTS f ON t.FLIGHT_ID = f.FLIGHT_ID
JOIN AIRLINES a ON f.AIRLINE_ID = a.AIRLINE_ID
JOIN AIRPORTS o ON f.ORIGIN_AIRPORT_ID = o.AIRPORT_ID
JOIN AIRPORTS d ON f.DESTINATION_AIRPORT_ID = d.AIRPORT_ID;

-- 4. View for flight statistics
CREATE OR REPLACE VIEW v_flight_statistics AS
SELECT f.FLIGHT_ID, f.FLIGHT_NUMBER,
       a.AIRLINE_NAME,
       o.CITY AS ORIGIN, d.CITY AS DESTINATION,
       f.TOTAL_SEATS, f.AVAILABLE_SEATS,
       (f.TOTAL_SEATS - f.AVAILABLE_SEATS) AS BOOKED_SEATS,
       ROUND((f.TOTAL_SEATS - f.AVAILABLE_SEATS) * 100.0 / f.TOTAL_SEATS, 2) AS OCCUPANCY_PERCENT,
       COUNT(t.TICKET_ID) AS TOTAL_TICKETS_SOLD,
       SUM(CASE WHEN t.TICKET_STATUS = 'CONFIRMED' THEN 1 ELSE 0 END) AS CONFIRMED_TICKETS,
       SUM(CASE WHEN t.TICKET_STATUS = 'CHECKED_IN' THEN 1 ELSE 0 END) AS CHECKED_IN_TICKETS,
       SUM(t.PRICE) AS TOTAL_REVENUE,
       AVG(t.PRICE) AS AVG_TICKET_PRICE,
       f.BASE_PRICE,
       f.DEPARTURE_TIME, f.STATUS
FROM FLIGHTS f
JOIN AIRLINES a ON f.AIRLINE_ID = a.AIRLINE_ID
JOIN AIRPORTS o ON f.ORIGIN_AIRPORT_ID = o.AIRPORT_ID
JOIN AIRPORTS d ON f.DESTINATION_AIRPORT_ID = d.AIRPORT_ID
LEFT JOIN TICKETS t ON f.FLIGHT_ID = t.FLIGHT_ID
GROUP BY f.FLIGHT_ID, f.FLIGHT_NUMBER, a.AIRLINE_NAME,
         o.CITY, d.CITY, f.TOTAL_SEATS, f.AVAILABLE_SEATS,
         f.BASE_PRICE, f.DEPARTURE_TIME, f.STATUS;

-- 5. View for payment history
CREATE OR REPLACE VIEW v_payment_history AS
SELECT p.PAYMENT_ID, p.TRANSACTION_ID,
       p.PAYMENT_DATE, p.PAYMENT_AMOUNT,
       p.PAYMENT_METHOD, p.PAYMENT_STATUS,
       p.PAYMENT_GATEWAY, p.CURRENCY,
       b.BOOKING_REFERENCE,
       u.FIRST_NAME || ' ' || u.LAST_NAME AS USER_NAME,
       u.EMAIL AS USER_EMAIL
FROM PAYMENTS p
JOIN BOOKINGS b ON p.BOOKING_ID = b.BOOKING_ID
JOIN USERS u ON b.USER_ID = u.USER_ID;

-- =============================================
-- SAMPLE DATA INSERTION
-- =============================================

-- Insert sample airlines
INSERT INTO AIRLINES (AIRLINE_ID, AIRLINE_CODE, AIRLINE_NAME, COUNTRY, IS_ACTIVE)
VALUES (seq_airlines.NEXTVAL, 'AA', 'American Airlines', 'USA', 'Y');

INSERT INTO AIRLINES (AIRLINE_ID, AIRLINE_CODE, AIRLINE_NAME, COUNTRY, IS_ACTIVE)
VALUES (seq_airlines.NEXTVAL, 'BA', 'British Airways', 'UK', 'Y');

INSERT INTO AIRLINES (AIRLINE_ID, AIRLINE_CODE, AIRLINE_NAME, COUNTRY, IS_ACTIVE)
VALUES (seq_airlines.NEXTVAL, 'AI', 'Air India', 'India', 'Y');

INSERT INTO AIRLINES (AIRLINE_ID, AIRLINE_CODE, AIRLINE_NAME, COUNTRY, IS_ACTIVE)
VALUES (seq_airlines.NEXTVAL, 'EK', 'Emirates', 'UAE', 'Y');

-- Insert sample airports
INSERT INTO AIRPORTS (AIRPORT_ID, AIRPORT_CODE, AIRPORT_NAME, CITY, COUNTRY, TIMEZONE, IS_ACTIVE)
VALUES (seq_airports.NEXTVAL, 'JFK', 'John F. Kennedy International Airport', 'New York', 'USA', 'America/New_York', 'Y');

INSERT INTO AIRPORTS (AIRPORT_ID, AIRPORT_CODE, AIRPORT_NAME, CITY, COUNTRY, TIMEZONE, IS_ACTIVE)
VALUES (seq_airports.NEXTVAL, 'LAX', 'Los Angeles International Airport', 'Los Angeles', 'USA', 'America/Los_Angeles', 'Y');

INSERT INTO AIRPORTS (AIRPORT_ID, AIRPORT_CODE, AIRPORT_NAME, CITY, COUNTRY, TIMEZONE, IS_ACTIVE)
VALUES (seq_airports.NEXTVAL, 'LHR', 'London Heathrow Airport', 'London', 'UK', 'Europe/London', 'Y');

INSERT INTO AIRPORTS (AIRPORT_ID, AIRPORT_CODE, AIRPORT_NAME, CITY, COUNTRY, TIMEZONE, IS_ACTIVE)
VALUES (seq_airports.NEXTVAL, 'DEL', 'Indira Gandhi International Airport', 'Delhi', 'India', 'Asia/Kolkata', 'Y');

INSERT INTO AIRPORTS (AIRPORT_ID, AIRPORT_CODE, AIRPORT_NAME, CITY, COUNTRY, TIMEZONE, IS_ACTIVE)
VALUES (seq_airports.NEXTVAL, 'DXB', 'Dubai International Airport', 'Dubai', 'UAE', 'Asia/Dubai', 'Y');

-- Insert sample user
INSERT INTO USERS (USER_ID, EMAIL, PASSWORD_HASH, FIRST_NAME, LAST_NAME, PHONE, DATE_OF_BIRTH, IS_ACTIVE)
VALUES (seq_users.NEXTVAL, 'john.doe@example.com', 
        'hash_placeholder', 'John', 'Doe', '+1-555-0123', 
        TO_DATE('1990-05-15', 'YYYY-MM-DD'), 'Y');

-- Insert sample flights
INSERT INTO FLIGHTS (FLIGHT_ID, AIRLINE_ID, FLIGHT_NUMBER, ORIGIN_AIRPORT_ID, 
                     DESTINATION_AIRPORT_ID, DEPARTURE_TIME, ARRIVAL_TIME, 
                     DURATION_MINUTES, AIRCRAFT_TYPE, TOTAL_SEATS, 
                     AVAILABLE_SEATS, BASE_PRICE, STATUS)
VALUES (seq_flights.NEXTVAL, 1, 'AA100', 1, 2,
        TO_TIMESTAMP('2025-12-25 08:00:00', 'YYYY-MM-DD HH24:MI:SS'),
        TO_TIMESTAMP('2025-12-25 11:30:00', 'YYYY-MM-DD HH24:MI:SS'),
        330, 'Boeing 777', 250, 250, 450.00, 'SCHEDULED');

INSERT INTO FLIGHTS (FLIGHT_ID, AIRLINE_ID, FLIGHT_NUMBER, ORIGIN_AIRPORT_ID, 
                     DESTINATION_AIRPORT_ID, DEPARTURE_TIME, ARRIVAL_TIME, 
                     DURATION_MINUTES, AIRCRAFT_TYPE, TOTAL_SEATS, 
                     AVAILABLE_SEATS, BASE_PRICE, STATUS)
VALUES (seq_flights.NEXTVAL, 3, 'AI202', 4, 5,
        TO_TIMESTAMP('2025-12-26 14:00:00', 'YYYY-MM-DD HH24:MI:SS'),
        TO_TIMESTAMP('2025-12-26 18:30:00', 'YYYY-MM-DD HH24:MI:SS'),
        270, 'Airbus A380', 400, 400, 750.00, 'SCHEDULED');

COMMIT;

-- =============================================
-- GRANT STATEMENTS (Optional - adjust as needed)
-- =============================================

-- Grant execute permissions on procedures
-- GRANT EXECUTE ON create_booking TO app_user;
-- GRANT EXECUTE ON add_ticket_to_booking TO app_user;
-- GRANT EXECUTE ON cancel_booking TO app_user;
-- GRANT EXECUTE ON process_payment TO app_user;
-- GRANT EXECUTE ON search_flights TO app_user;
-- GRANT EXECUTE ON get_booking_details TO app_user;
-- GRANT EXECUTE ON check_in_passenger TO app_user;
-- GRANT EXECUTE ON get_user_booking_history TO app_user;

-- Grant select permissions on views
-- GRANT SELECT ON v_available_flights TO app_user;
-- GRANT SELECT ON v_booking_summary TO app_user;
-- GRANT SELECT ON v_ticket_details TO app_user;

```

---

## **Complete Business Process Flows**

### **1. Flight Booking Process Flow**

```
┌─────────────────────────────────────────────────────────────┐
│                    FLIGHT BOOKING WORKFLOW                   │
└─────────────────────────────────────────────────────────────┘

Step 1: SEARCH FLIGHTS
├─ User searches for flights (origin, destination, date)
├─ System queries FLIGHTS table with JOIN to AIRLINES & AIRPORTS
├─ Returns available flights with AVAILABLE_SEATS > 0
└─ Display results with pricing and schedule

Step 2: SELECT FLIGHT & PASSENGERS
├─ User selects flight(s)
├─ User enters passenger details (can be multiple)
├─ System creates or retrieves PASSENGER records
└─ Validates passport information for international flights

Step 3: CREATE BOOKING
├─ Call: create_booking() procedure
├─ Generate unique BOOKING_REFERENCE
├─ Insert BOOKINGS record (status: PENDING)
├─ Set PAYMENT_STATUS to 'PENDING'
└─ Return BOOKING_ID to user

Step 4: ADD TICKETS
├─ For each passenger and flight combination:
│   ├─ Call: add_ticket_to_booking() procedure
│   ├─ Check seat availability (FOR UPDATE lock)
│   ├─ Generate unique TICKET_NUMBER
│   ├─ Insert TICKETS record (status: BOOKED)
│   ├─ TRIGGER: trg_update_seat_availability fires
│   │   └─ Decrements FLIGHTS.AVAILABLE_SEATS atomically
│   └─ Update BOOKINGS.TOTAL_AMOUNT
└─ All operations within transaction (COMMIT or ROLLBACK)

Step 5: PAYMENT PROCESSING
├─ User provides payment details
├─ Call: process_payment() procedure
├─ Validate payment amount matches BOOKINGS.TOTAL_AMOUNT
├─ Insert PAYMENTS record with TRANSACTION_ID
├─ Set PAYMENT_STATUS to 'PROCESSING'
├─ Integrate with payment gateway
└─ On success:
    ├─ Update PAYMENTS.PAYMENT_STATUS to 'SUCCESS'
    ├─ TRIGGER: trg_update_booking_on_payment fires
    │   ├─ Updates BOOKINGS.PAYMENT_STATUS to 'PAID'
    │   ├─ Updates BOOKINGS.BOOKING_STATUS to 'CONFIRMED'
    │   └─ Updates all TICKETS.TICKET_STATUS to 'CONFIRMED'
    └─ Set TICKETS.ISSUED_AT timestamp

Step 6: CONFIRMATION
├─ Generate e-tickets (PDF/Email)
├─ Send confirmation email with:
│   ├─ BOOKING_REFERENCE
│   ├─ TICKET_NUMBERS
│   ├─ Flight details
│   └─ Passenger information
└─ Booking complete!
```

### **2. Seat Availability Management (Atomic Operations)**

```
┌─────────────────────────────────────────────────────────────┐
│              ATOMIC SEAT AVAILABILITY MANAGEMENT             │
└─────────────────────────────────────────────────────────────┘

SCENARIO: Multiple users booking same flight simultaneously

USER A                          USER B
   │                               │
   ├─ SELECT flight                ├─ SELECT flight
   ├─ AVAILABLE_SEATS = 2          ├─ AVAILABLE_SEATS = 2
   │                               │
   ├─ INSERT TICKET (1 seat)       ├─ INSERT TICKET (1 seat)
   │    │                          │    │
   │    ├─ TRIGGER fires           │    ├─ TRIGGER fires
   │    │  (FOR UPDATE lock)       │    │  (waits for lock)
   │    │                          │    │
   │    ├─ UPDATE FLIGHTS          │    │
   │    │  SET AVAILABLE_SEATS     │    │
   │    │    = AVAILABLE_SEATS - 1 │    │
   │    │  WHERE FLIGHT_ID = X     │    │
   │    │  AND AVAILABLE_SEATS > 0 │    │
   │    │                          │    │
   │    ├─ AVAILABLE_SEATS = 1     │    │
   │    └─ COMMIT                  │    │
   │                               │    │
   │                               │    ├─ Lock released
   │                               │    ├─ UPDATE FLIGHTS
   │                               │    │  SET AVAILABLE_SEATS
   │                               │    │    = AVAILABLE_SEATS - 1
   │                               │    │  WHERE FLIGHT_ID = X
   │                               │    │  AND AVAILABLE_SEATS > 0
   │                               │    │
   │                               │    ├─ AVAILABLE_SEATS = 0
   │                               │    └─ COMMIT
   │                               │
   └─ Success                      └─ Success

USER C (trying to book after seats are full)
   │
   ├─ INSERT TICKET (1 seat)
   │    │
   │    ├─ TRIGGER fires
   │    ├─ UPDATE FLIGHTS returns 0 rows
   │    │  (AVAILABLE_SEATS already 0)
   │    └─ RAISE_APPLICATION_ERROR
   │       'No seats available'
   │
   └─ Booking fails gracefully
```

### **3. Payment Validation Flow**

```
┌─────────────────────────────────────────────────────────────┐
│                   PAYMENT VALIDATION FLOW                    │
└─────────────────────────────────────────────────────────────┘

BOOKING created (PAYMENT_STATUS = 'PENDING')
      │
      ├─ TICKETS created (TICKET_STATUS = 'BOOKED')
      ├─ SEATS decremented
      │
      ├─ User initiates PAYMENT
      │     │
      │     ├─ PAYMENT record created (STATUS = 'PROCESSING')
      │     ├─ Call payment gateway API
      │     │
      │     ├─ Payment SUCCESSFUL?
      │     │     │
      │     │     ├─ YES:
      │     │     │   ├─ UPDATE PAYMENTS.PAYMENT_STATUS = 'SUCCESS'
      │     │     │   ├─ TRIGGER: trg_update_booking_on_payment
      │     │     │   │     ├─ BOOKINGS.PAYMENT_STATUS = 'PAID'
      │     │     │   │     ├─ BOOKINGS.BOOKING_STATUS = 'CONFIRMED'
      │     │     │   │     └─ TICKETS.TICKET_STATUS = 'CONFIRMED'
      │     │     │   └─ Send confirmation
      │     │     │
      │     │     └─ NO:
      │     │           ├─ UPDATE PAYMENTS.PAYMENT_STATUS = 'FAILED'
      │     │           ├─ BOOKINGS remains 'PENDING'
      │     │           ├─ User can retry payment
      │     │           └─ Timeout after 30 mins:
      │     │                 ├─ Cancel BOOKING
      │     │                 ├─ Restore SEATS
      │     │                 └─ Send cancellation notice
      │     │
      │     └─ TRIGGER: trg_validate_payment_before_confirm
      │           │
      │           ├─ User tries to confirm ticket
      │           ├─ Check BOOKINGS.PAYMENT_STATUS
      │           ├─ IF != 'PAID' THEN
      │           │   └─ RAISE_APPLICATION_ERROR
      │           │       'Cannot confirm without payment'
      │           └─ Prevents manual status manipulation
      │
      └─ Payment validation complete
```

---

## **Performance Optimization Recommendations**

### **1. Partitioning Strategy**
```sql
-- Partition FLIGHTS table by departure date (monthly)
ALTER TABLE FLIGHTS
PARTITION BY RANGE (DEPARTURE_TIME)
INTERVAL (NUMTOYMINTERVAL(1, 'MONTH'))
(
  PARTITION flights_initial VALUES LESS THAN (TO_DATE('2025-01-01', 'YYYY-MM-DD'))
);

-- Partition BOOKINGS table by booking date (monthly)
ALTER TABLE BOOKINGS
PARTITION BY RANGE (BOOKING_DATE)
INTERVAL (NUMTOYMINTERVAL(1, 'MONTH'))
(
  PARTITION bookings_initial VALUES LESS THAN (TO_DATE('2025-01-01', 'YYYY-MM-DD'))
);
```

### **2. Additional Indexes for Performance**
```sql
-- Composite index for flight search
CREATE INDEX idx_flights_search_composite 
ON FLIGHTS(ORIGIN_AIRPORT_ID, DESTINATION_AIRPORT_ID, DEPARTURE_TIME, STATUS, AVAILABLE_SEATS);

-- Index for booking reference lookups
CREATE INDEX idx_bookings_ref_upper 
ON BOOKINGS(UPPER(BOOKING_REFERENCE));

-- Index for passenger passport search
CREATE INDEX idx_passengers_passport_upper 
ON PASSENGERS(UPPER(PASSPORT_NUMBER));
```

### **3. Materialized Views for Reporting**
```sql
-- Materialized view for daily statistics
CREATE MATERIALIZED VIEW mv_daily_flight_stats
BUILD IMMEDIATE
REFRESH FAST ON COMMIT
AS
SELECT TRUNC(f.DEPARTURE_TIME) AS FLIGHT_DATE,
       a.AIRLINE_ID, a.AIRLINE_NAME,
       COUNT(f.FLIGHT_ID) AS TOTAL_FLIGHTS,
       SUM(f.TOTAL_SEATS) AS TOTAL_CAPACITY,
       SUM(f.AVAILABLE_SEATS) AS AVAILABLE_CAPACITY,
       SUM(f.TOTAL_SEATS - f.AVAILABLE_SEATS) AS BOOKED_SEATS
FROM FLIGHTS f
JOIN AIRLINES a ON f.AIRLINE_ID = a.AIRLINE_ID
GROUP BY TRUNC(f.DEPARTURE_TIME), a.AIRLINE_ID, a.AIRLINE_NAME;
```

---

This completes the comprehensive Oracle database design for your Airline Ticket Booking System. The design includes all entities, relationships, constraints, triggers, procedures, and business logic to handle the specified scenarios with proper atomicity and data integrity.