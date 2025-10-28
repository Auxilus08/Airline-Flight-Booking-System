-- ============================================
-- CLEANUP SCRIPT FOR AIRLINE BOOKING SYSTEM
-- Drops all objects to allow clean reinstallation
-- ============================================

SET SERVEROUTPUT ON;

PROMPT '============================================';
PROMPT 'Cleaning up existing database objects...';
PROMPT '============================================';
PROMPT '';

-- Drop views first
BEGIN
    EXECUTE IMMEDIATE 'DROP VIEW v_booking_summary';
    DBMS_OUTPUT.PUT_LINE('Dropped view: v_booking_summary');
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('View v_booking_summary does not exist or cannot be dropped');
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP VIEW v_flight_schedule';
    DBMS_OUTPUT.PUT_LINE('Dropped view: v_flight_schedule');
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('View v_flight_schedule does not exist or cannot be dropped');
END;
/

-- Drop tables in reverse dependency order
DECLARE
    v_table_exists NUMBER;
    TYPE table_list IS TABLE OF VARCHAR2(30);
    v_tables table_list := table_list(
        'PAYMENTS',
        'TICKETS',
        'BOOKINGS',
        'flight_crew',
        'crew',
        'FLIGHTS',
        'route',
        'seat',
        'aircraft',
        'USERS',
        'PASSENGERS',
        'AIRPORTS',
        'AIRLINES'
    );
BEGIN
    FOR i IN 1..v_tables.COUNT LOOP
        BEGIN
            SELECT COUNT(*) INTO v_table_exists
            FROM user_tables
            WHERE table_name = UPPER(v_tables(i));
            
            IF v_table_exists > 0 THEN
                EXECUTE IMMEDIATE 'DROP TABLE ' || v_tables(i) || ' CASCADE CONSTRAINTS';
                DBMS_OUTPUT.PUT_LINE('Dropped table: ' || v_tables(i));
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE('Error dropping table ' || v_tables(i) || ': ' || SQLERRM);
        END;
    END LOOP;
END;
/

-- Drop sequences
DECLARE
    v_seq_exists NUMBER;
    TYPE seq_list IS TABLE OF VARCHAR2(30);
    v_sequences seq_list := seq_list(
        'airline_seq',
        'airport_seq',
        'aircraft_seq',
        'route_seq',
        'flight_seq',
        'passenger_seq',
        'user_seq',
        'booking_seq',
        'ticket_seq',
        'payment_seq',
        'seat_seq',
        'crew_seq',
        'flight_crew_seq'
    );
BEGIN
    FOR i IN 1..v_sequences.COUNT LOOP
        BEGIN
            SELECT COUNT(*) INTO v_seq_exists
            FROM user_sequences
            WHERE sequence_name = UPPER(v_sequences(i));
            
            IF v_seq_exists > 0 THEN
                EXECUTE IMMEDIATE 'DROP SEQUENCE ' || v_sequences(i);
                DBMS_OUTPUT.PUT_LINE('Dropped sequence: ' || v_sequences(i));
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE('Error dropping sequence ' || v_sequences(i) || ': ' || SQLERRM);
        END;
    END LOOP;
END;
/

PROMPT '';
PROMPT '============================================';
PROMPT 'Cleanup completed!';
PROMPT 'You can now run airline_booking_unified.sql';
PROMPT '============================================';
PROMPT '';
