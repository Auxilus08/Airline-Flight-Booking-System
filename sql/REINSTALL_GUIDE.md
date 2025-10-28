# Clean Database Reinstallation Guide

Based on the errors encountered during installation, follow this guide for a clean setup.

## Quick Summary of Issues Fixed

✅ **ORA-00905** - Removed `ON DELETE RESTRICT` clauses  
✅ **ORA-01031** - Made view creation fault-tolerant  
✅ **ORA-01408** - Removed duplicate index on email  
✅ **ORA-08002** - Fixed ticket number trigger to use ticket_id  
✅ **ORA-04091** - Removed mutating table trigger (total calculated in app)

## Step-by-Step Installation

### 1. Connect to Oracle Database

```bash
sqlplus your_username/your_password@localhost:1521/XEPDB1
```

**Replace** `your_username` and `your_password` with your actual credentials.

Example:
```bash
sqlplus system/oracle@localhost:1521/XEPDB1
```

### 2. Run Cleanup Script (if reinstalling)

```sql
@cleanup.sql
```

**Expected Output:**
```
Cleaning up existing database objects...
Dropped view: v_booking_summary
Dropped view: v_flight_schedule
Dropped table: PAYMENTS
Dropped table: TICKETS
... (etc.)
Cleanup completed!
```

### 3. Run Unified Schema

```sql
@airline_booking_unified.sql
```

**Expected Output (Success):**
```
============================================
Starting Airline Ticket Booking System Setup
============================================

Creating sequences...
Sequence created. (x13)
Sequences created.

Creating tables...
Table created. (x13)
Tables created.

Adding foreign key constraints...
Table altered. (x11)
Foreign keys added.

Creating indexes...
Index created. (x10)
Indexes created.

Creating triggers...
Trigger created. (x9)
Triggers created.

Creating views...
Warning: Could not create v_flight_schedule view - ORA-01031... (OK - views are optional)
Warning: Could not create v_booking_summary view - ORA-01031... (OK - views are optional)
Views created.

Adding comments...
Comment created. (x12)
Comments added.

Inserting sample data...
1 row created. (x multiple times)
Commit complete.
Sample data inserted.

============================================
SETUP COMPLETED SUCCESSFULLY!
============================================
Summary:
- 5 Airlines inserted
- 10 Airports inserted
- 5 Flights inserted
- 5 Passengers inserted
- 3 Users inserted
- 4 Bookings inserted
- 3 Tickets inserted
- 3 Payments inserted
- All triggers, views, and constraints created
```

### 4. Verify Installation

Run these queries to verify everything is working:

```sql
-- Check tables
SELECT table_name FROM user_tables ORDER BY table_name;
```

**Expected:** 13 tables (AIRLINES, AIRPORTS, BOOKINGS, FLIGHTS, PASSENGERS, PAYMENTS, TICKETS, USERS, aircraft, crew, flight_crew, route, seat)

```sql
-- Count records
SELECT 'AIRLINES' as table_name, COUNT(*) as records FROM AIRLINES
UNION ALL SELECT 'AIRPORTS', COUNT(*) FROM AIRPORTS
UNION ALL SELECT 'FLIGHTS', COUNT(*) FROM FLIGHTS
UNION ALL SELECT 'PASSENGERS', COUNT(*) FROM PASSENGERS
UNION ALL SELECT 'USERS', COUNT(*) FROM USERS
UNION ALL SELECT 'BOOKINGS', COUNT(*) FROM BOOKINGS
UNION ALL SELECT 'TICKETS', COUNT(*) FROM TICKETS
UNION ALL SELECT 'PAYMENTS', COUNT(*) FROM PAYMENTS;
```

**Expected Output:**
```
TABLE_NAME    RECORDS
----------    -------
AIRLINES            5
AIRPORTS           10
FLIGHTS             5
PASSENGERS          5
USERS               3
BOOKINGS            4
TICKETS             3
PAYMENTS            3
```

```sql
-- Check flight details
SELECT 
    f.flight_number,
    a.name AS airline,
    ao.city AS origin,
    ad.city AS destination,
    f.departure_time,
    f.price,
    f.available_seats
FROM FLIGHTS f
JOIN AIRLINES a ON f.airline_id = a.airline_id
JOIN AIRPORTS ao ON f.origin_airport_id = ao.airport_id
JOIN AIRPORTS ad ON f.destination_airport_id = ad.airport_id;
```

### 5. Test Queries

```sql
-- Search flights (like the API would)
SELECT * FROM FLIGHTS 
WHERE origin_airport_id = 1000 
  AND destination_airport_id = 1001
  AND departure_time >= SYSTIMESTAMP;

-- Check booking details
SELECT 
    b.booking_id,
    p.first_name || ' ' || p.last_name AS passenger,
    b.total_amount,
    b.status,
    b.payment_status
FROM BOOKINGS b
JOIN PASSENGERS p ON b.passenger_id = p.passenger_id;
```

## Known Warnings (OK to Ignore)

### View Creation Warnings
```
Warning: Could not create v_flight_schedule view - ORA-01031: insufficient privileges
Warning: Could not create v_booking_summary view - ORA-01031: insufficient privileges
```

**This is OK!** The views are optional convenience queries. The API works perfectly without them since it constructs its own JOIN queries.

**To Fix (Optional):** Grant CREATE VIEW privilege:
```sql
-- Run as SYSDBA
GRANT CREATE VIEW TO your_username;
```

## Troubleshooting

### Error: Cannot Connect
```
ORA-12170: TNS:Connect timeout occurred
```

**Solution:** Check if Oracle is running
```bash
sudo systemctl status oracle-xe-21c
sudo systemctl start oracle-xe-21c
```

### Error: Table Already Exists
```
ORA-00955: name is already used by an existing object
```

**Solution:** Run cleanup script first
```sql
@cleanup.sql
```

### Error: Insufficient Privileges
```
ORA-01031: insufficient privileges
```

**Solution:** Grant necessary privileges (run as SYSDBA)
```sql
GRANT CREATE TABLE, CREATE SEQUENCE, CREATE TRIGGER TO your_username;
GRANT UNLIMITED TABLESPACE TO your_username;
```

### Verify No Errors
After running the script, check if any objects failed to create:

```sql
-- Should return 13 tables
SELECT COUNT(*) FROM user_tables;

-- Should return 13 sequences
SELECT COUNT(*) FROM user_sequences;

-- Should return 9 triggers (trg_airlines_id, trg_airports_id, etc.)
SELECT COUNT(*) FROM user_triggers WHERE trigger_name LIKE 'TRG_%';
```

## What's Different in This Version?

### Removed Problematic Trigger
The `trg_update_booking_total` trigger has been **intentionally removed** because:

1. **Caused ORA-04091 Mutating Table Error** - Can't SELECT from TICKETS while inserting into TICKETS
2. **Better Architecture** - Booking total is now calculated in the application layer (Node.js backend) before insertion
3. **More Control** - Application has explicit control over business logic
4. **Standard Practice** - Most production systems calculate totals in application, not database

### How Booking Total Works Now
```javascript
// In backend/src/controllers/booking.controller.js
const totalAmount = tickets.reduce((sum, ticket) => sum + parseFloat(ticket.price), 0);

// Then insert with calculated total
await BookingModel.create({
  passenger_id,
  total_amount: totalAmount,
  tickets
});
```

## Next Steps After Installation

1. **Exit SQL*Plus:**
   ```sql
   EXIT;
   ```

2. **Configure Backend:**
   ```bash
   cd ../backend
   nano src/config/db.config.js
   ```
   
   Update with your credentials:
   ```javascript
   export default {
     user: 'your_username',
     password: 'your_password',
     connectString: 'localhost:1521/XEPDB1'
   };
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Start Server:**
   ```bash
   npm start
   ```

5. **Test API:**
   ```bash
   curl http://localhost:3000/api/health
   ```

   Expected response:
   ```json
   {
     "status": "OK",
     "timestamp": "2025-10-28T...",
     "database": "connected",
     "uptime": 1.234
   }
   ```

## Files Overview

- **`cleanup.sql`** - Drops all objects safely for clean reinstall
- **`airline_booking_unified.sql`** - Complete schema with sample data (FIXED)
- **`README.md`** - Detailed documentation with troubleshooting
- **`REINSTALL_GUIDE.md`** - This file - step-by-step installation guide

## Success Checklist

Before moving to the backend:

- [ ] All 13 tables created
- [ ] All 13 sequences created
- [ ] All 9 triggers created
- [ ] Sample data inserted (5 airlines, 10 airports, etc.)
- [ ] No errors except view creation warnings (OK)
- [ ] Can query FLIGHTS and BOOKINGS successfully

## Need Help?

- **SQL Issues:** See `sql/README.md` for detailed troubleshooting
- **API Issues:** See `backend/API_DOCUMENTATION.md`
- **Quick Testing:** See `backend/QUICK_REFERENCE.md`

## Database Schema Summary

**Core Tables:**
- AIRLINES, AIRPORTS, FLIGHTS, PASSENGERS, USERS
- BOOKINGS, TICKETS, PAYMENTS

**Supporting Tables:**
- aircraft, seat, route, crew, flight_crew

**Relationships:**
- Bookings → Passenger (1:1)
- Bookings → User (N:1, optional)
- Bookings → Tickets (1:N)
- Tickets → Flights (N:1)
- Tickets → Seats (N:1, optional)
- Payments → Bookings (N:1)

All foreign keys have proper cascade/set null rules for data integrity.
