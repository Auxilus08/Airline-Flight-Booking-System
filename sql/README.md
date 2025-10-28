# SQL Setup Guide

## Prerequisites
- Oracle Database 21c Express Edition installed and running
- Access credentials to your database

## Quick Setup

### Step 1: Connect to Oracle Database
```bash
sqlplus username/password@localhost:1521/XEPDB1
```

Replace `username` and `password` with your Oracle credentials (e.g., `system/your_password`).

### Step 2: Clean Up Existing Objects (if re-installing)
```sql
@cleanup.sql
```

### Step 3: Run the Unified Schema
```sql
@airline_booking_unified.sql
```

## What Gets Created

### Tables (13 total)
- **AIRLINES** - Airline information
- **AIRPORTS** - Airport details with coordinates
- **aircraft** - Aircraft fleet data
- **seat** - Seat inventory per aircraft
- **route** - Flight routes between airports
- **FLIGHTS** - Flight schedules and availability
- **PASSENGERS** - Passenger profiles
- **USERS** - System users (admin, agents, customers)
- **BOOKINGS** - Booking records
- **TICKETS** - Individual tickets per booking
- **PAYMENTS** - Payment transactions
- **crew** - Crew member information
- **flight_crew** - Crew assignments to flights

### Sequences
All tables use auto-increment sequences starting from specific values

### Triggers
- Auto-increment triggers for all primary keys
- Automatic ticket number generation
- Booking total calculation on ticket insert
- Double booking prevention

### Views (if privileges allow)
- **v_flight_schedule** - Comprehensive flight information
- **v_booking_summary** - Detailed booking information

### Sample Data Included
- 5 Airlines (Air India, IndiGo, SpiceJet, Vistara, Go First)
- 10 Airports (major Indian cities)
- 5 Flights
- 5 Passengers
- 3 Users
- 4 Bookings
- 3 Tickets
- 3 Payments

## Known Issues & Solutions

### Issue 1: View Creation Fails (ORA-01031)
**Problem:** User doesn't have CREATE VIEW privilege

**Solution:** The script now handles this gracefully with a warning message. Views are optional - the API will still work without them.

To grant privileges (run as SYSDBA):
```sql
GRANT CREATE VIEW TO your_username;
```

### Issue 2: Foreign Key Constraints Fail
**Problem:** Oracle syntax for DELETE RESTRICT not supported

**Solution:** Fixed in updated script - removed ON DELETE RESTRICT clauses

### Issue 3: Duplicate Index Error
**Problem:** Unique constraint already creates an index

**Solution:** Removed duplicate index on PASSENGERS(email)

### Issue 4: Sequence CURRVAL Error
**Problem:** CURRVAL accessed before NEXTVAL in session

**Solution:** Fixed trigger to use :NEW.ticket_id instead of sequence

### Issue 5: Mutating Table Error (ORA-04091)
**Problem:** Trigger `trg_update_booking_total` tried to SELECT from TICKETS while inserting into TICKETS

**Solution:** Removed the trigger - booking total is now calculated in the application layer (backend) before insertion. This is actually better practice as it:
- Avoids Oracle mutating table restrictions
- Gives application control over business logic
- Prevents unexpected total recalculations

## Verification Queries

After installation, verify with these queries:

```sql
-- Check all tables
SELECT table_name FROM user_tables ORDER BY table_name;

-- Count records
SELECT 'AIRLINES' as table_name, COUNT(*) as records FROM AIRLINES
UNION ALL
SELECT 'AIRPORTS', COUNT(*) FROM AIRPORTS
UNION ALL
SELECT 'FLIGHTS', COUNT(*) FROM FLIGHTS
UNION ALL
SELECT 'PASSENGERS', COUNT(*) FROM PASSENGERS
UNION ALL
SELECT 'USERS', COUNT(*) FROM USERS
UNION ALL
SELECT 'BOOKINGS', COUNT(*) FROM BOOKINGS
UNION ALL
SELECT 'TICKETS', COUNT(*) FROM TICKETS
UNION ALL
SELECT 'PAYMENTS', COUNT(*) FROM PAYMENTS;

-- Check flight schedule
SELECT 
    flight_number,
    airline_name,
    origin_city,
    destination_city,
    departure_time,
    available_seats
FROM v_flight_schedule;

-- Check bookings
SELECT * FROM v_booking_summary;
```

## Troubleshooting

### Connection Issues
If you can't connect:
```bash
# Check if Oracle is running
sudo systemctl status oracle-xe-21c

# Start Oracle if stopped
sudo systemctl start oracle-xe-21c
```

### Permission Issues
If you get permission errors, you may need to run as SYSDBA:
```bash
sqlplus sys/password@localhost:1521/XEPDB1 as sysdba
```

Then grant necessary privileges to your user:
```sql
GRANT CREATE TABLE, CREATE SEQUENCE, CREATE TRIGGER, CREATE VIEW TO your_username;
GRANT UNLIMITED TABLESPACE TO your_username;
```

## Next Steps

After successful schema setup:
1. Navigate to backend directory: `cd ../backend`
2. Update `src/config/db.config.js` with your database credentials
3. Install dependencies: `npm install`
4. Start the server: `npm start`

The API will be available at `http://localhost:3000`

## File Descriptions

- **cleanup.sql** - Drops all objects for clean reinstallation
- **airline_booking_unified.sql** - Complete schema with sample data
- **README.md** - This file

## Support

For issues or questions about:
- Database setup: Check Oracle 21c XE documentation
- API endpoints: See `../backend/API_DOCUMENTATION.md`
- Quick testing: See `../backend/QUICK_REFERENCE.md`
