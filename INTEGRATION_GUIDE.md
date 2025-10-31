# Full Stack Integration Guide

This guide explains how the frontend, backend, and database are connected in the Airline Ticket Booking System.

## Architecture Overview

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│             │  HTTP   │             │  SQL    │              │
│  Frontend   │────────▶│   Backend   │────────▶│   Oracle DB  │
│  (Next.js)  │  API    │  (Express)  │ Queries │   (21c XE)   │
│             │◀────────│             │◀────────│              │
│ Port: 3001  │  JSON   │ Port: 3000  │ Results │ Port: 1521   │
└─────────────┘         └─────────────┘         └──────────────┘
```

## Components

### 1. Database (Oracle 21c XE)
- **Location**: `sql/airline_booking_unified.sql`
- **Tables**: AIRLINES, AIRPORTS, FLIGHTS, BOOKINGS, TICKETS, PAYMENTS, PASSENGERS, USERS
- **Port**: 1521
- **Database**: XEPDB1

### 2. Backend (Node.js + Express)
- **Location**: `backend/`
- **Port**: 3000
- **API Base**: `http://localhost:3000/api`
- **Technologies**: Express.js, oracledb, express-validator

### 3. Frontend (Next.js + React)
- **Location**: `frontend/`
- **Port**: 3001
- **Technologies**: Next.js 16, React 19, TypeScript, Tailwind CSS

## Data Flow

### Example: Flight Search

1. **User Action** (Frontend)
   - User fills search form in `frontend/components/search-form.tsx`
   - Submits with origin="New Delhi", destination="Mumbai", date="2025-11-01"

2. **Navigation** (Frontend)
   ```typescript
   // frontend/components/search-form.tsx
   router.push(`/search-results?from=New Delhi&to=Mumbai&date=2025-11-01`)
   ```

3. **API Call** (Frontend)
   ```typescript
   // frontend/hooks/use-flight-search.ts
   const response = await api.flights.search({
     from: "New Delhi",
     to: "Mumbai",
     date: "2025-11-01"
   })
   ```

4. **HTTP Request** (Frontend → Backend)
   ```
   GET http://localhost:3000/api/flights/search?from=New Delhi&to=Mumbai&date=2025-11-01
   ```

5. **Route Handler** (Backend)
   ```javascript
   // backend/src/routes/flight.routes.js
   router.get('/search', FlightController.search)
   ```

6. **Controller** (Backend)
   ```javascript
   // backend/src/controllers/flight.controller.js
   const flights = await FlightModel.search(originCity, destinationCity, date)
   ```

7. **Database Query** (Backend)
   ```sql
   -- backend/src/models/flight.model.js
   SELECT 
     f.flight_id, f.flight_number, f.departure_time, f.arrival_time,
     f.duration_minutes, f.price, f.available_seats,
     a.name AS airline_name,
     ao.city AS origin_city, ad.city AS destination_city
   FROM FLIGHTS f
   JOIN AIRLINES a ON f.airline_id = a.airline_id
   JOIN AIRPORTS ao ON f.origin_airport_id = ao.airport_id
   JOIN AIRPORTS ad ON f.destination_airport_id = ad.airport_id
   WHERE UPPER(ao.city) = UPPER('New Delhi')
     AND UPPER(ad.city) = UPPER('Mumbai')
     AND TRUNC(f.departure_time) = TO_DATE('2025-11-01', 'YYYY-MM-DD')
   ```

8. **Response** (Backend → Frontend)
   ```json
   {
     "success": true,
     "count": 2,
     "data": [
       {
         "FLIGHT_ID": 10000,
         "FLIGHT_NUMBER": "AI101",
         "AIRLINE_NAME": "Air India",
         "ORIGIN_CITY": "New Delhi",
         "DESTINATION_CITY": "Mumbai",
         "DEPARTURE_TIME": "2025-11-01T06:00:00.000Z",
         "ARRIVAL_TIME": "2025-11-01T08:30:00.000Z",
         "DURATION_MINUTES": 150,
         "PRICE": 5500,
         "AVAILABLE_SEATS": 180
       }
     ]
   }
   ```

9. **Data Transformation** (Frontend)
   ```typescript
   // frontend/hooks/use-flight-search.ts
   const transformedFlights = response.data.map(flight => ({
     id: flight.FLIGHT_ID.toString(),
     airline: flight.AIRLINE_NAME,
     flightNumber: flight.FLIGHT_NUMBER,
     departureCity: flight.ORIGIN_CITY,
     arrivalCity: flight.DESTINATION_CITY,
     departureTime: formatTime(flight.DEPARTURE_TIME),
     arrivalTime: formatTime(flight.ARRIVAL_TIME),
     duration: formatDuration(flight.DURATION_MINUTES),
     price: parseFloat(flight.PRICE),
     seatsAvailable: parseInt(flight.AVAILABLE_SEATS)
   }))
   ```

10. **Display** (Frontend)
    ```tsx
    // frontend/app/search-results/page.tsx
    {filteredFlights.map((flight) => (
      <FlightCard key={flight.id} flight={flight} />
    ))}
    ```

## Configuration Files

### Backend Configuration

**`backend/.env`**
```env
# Database
DB_USER=system
DB_PASSWORD=your_password
DB_CONNECT_STRING=localhost:1521/XEPDB1

# Server
PORT=3000
NODE_ENV=development

# CORS (Frontend URL)
CORS_ORIGIN=http://localhost:3001
```

**`backend/src/config/db.config.js`**
```javascript
export default {
  user: process.env.DB_USER || 'system',
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING,
  poolMin: 2,
  poolMax: 10,
}
```

### Frontend Configuration

**`frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**`frontend/lib/api.ts`**
```typescript
const API_BASE_URL = 'http://localhost:3000/api'

export const api = {
  flights: {
    search: (params) => fetchAPI(`/flights/search?${params}`),
  },
  // ... other endpoints
}
```

## API Endpoints

### Flight Endpoints

| Method | Endpoint | Description | Frontend Hook |
|--------|----------|-------------|---------------|
| GET | `/api/flights/search?from=X&to=Y&date=Z` | Search flights | `useFlightSearch` |
| GET | `/api/flights` | Get all flights | - |
| GET | `/api/flights/:id` | Get flight by ID | - |
| POST | `/api/flights` | Create flight (Admin) | - |

### Booking Endpoints

| Method | Endpoint | Description | Frontend Hook |
|--------|----------|-------------|---------------|
| POST | `/api/bookings` | Create booking | `useBookingState` |
| GET | `/api/bookings/:id` | Get booking details | - |
| GET | `/api/bookings/user/:userId` | Get user bookings | `useDashboardData` |
| PUT | `/api/bookings/:id/cancel` | Cancel booking | - |

### Other Endpoints

- **Airports**: `/api/airports`, `/api/airports/search?q=query`
- **Passengers**: `/api/passengers` (POST), `/api/passengers/:id` (GET, PUT)
- **Users**: `/api/users/register`, `/api/users/login`
- **Payments**: `/api/payments` (POST), `/api/payments/:bookingId` (GET)
- **Health**: `/api/health` (Database status check)

## Database Schema Mapping

### Frontend Types → Database Tables

**Flight Interface**
```typescript
// frontend/types/flight.ts
interface Flight {
  id: string              // FLIGHTS.flight_id
  airline: string         // AIRLINES.name
  flightNumber: string    // FLIGHTS.flight_number
  departureCity: string   // AIRPORTS.city (origin)
  arrivalCity: string     // AIRPORTS.city (destination)
  departureTime: string   // FLIGHTS.departure_time
  arrivalTime: string     // FLIGHTS.arrival_time
  duration: string        // FLIGHTS.duration_minutes
  price: number           // FLIGHTS.price
  seatsAvailable: number  // FLIGHTS.available_seats
}
```

**Database Schema**
```sql
FLIGHTS (
  flight_id NUMBER,
  airline_id NUMBER,        → AIRLINES.airline_id
  flight_number VARCHAR2(10),
  origin_airport_id NUMBER, → AIRPORTS.airport_id
  destination_airport_id,   → AIRPORTS.airport_id
  departure_time TIMESTAMP,
  arrival_time TIMESTAMP,
  duration_minutes NUMBER,
  price NUMBER(12,2),
  available_seats NUMBER
)
```

## Setup & Running

### Quick Start

```bash
# Run the automated setup script
chmod +x setup.sh
./setup.sh
```

### Manual Setup

**1. Database Setup**
```bash
sqlplus system/password@localhost:1521/XEPDB1
SQL> @sql/cleanup.sql
SQL> @sql/airline_booking_unified.sql
SQL> EXIT;
```

**2. Backend Setup**
```bash
cd backend
npm install
# Configure backend/.env with your database credentials
npm start  # Runs on http://localhost:3000
```

**3. Frontend Setup**
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:3001
```

**4. Access Application**
```
Open browser: http://localhost:3001
```

## Testing the Integration

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "database": "connected",
  "timestamp": "2025-10-31T..."
}
```

### 2. Search Flights
```bash
curl "http://localhost:3000/api/flights/search?from=New Delhi&to=Mumbai&date=2025-11-01"
```

### 3. Frontend Search
1. Go to `http://localhost:3001`
2. Fill in the search form:
   - From: "New Delhi" (DEL)
   - To: "Mumbai" (BOM)
   - Date: Select a date
3. Click "Search Flights"
4. View results on `/search-results` page

## Troubleshooting

### Frontend can't connect to backend

**Symptom**: "Failed to load flights" error

**Solutions**:
1. Check backend is running: `curl http://localhost:3000/api/health`
2. Verify CORS settings in `backend/.env`: `CORS_ORIGIN=http://localhost:3001`
3. Check frontend API URL in `frontend/lib/api.ts`

### Backend can't connect to database

**Symptom**: "ORA-12541: TNS:no listener"

**Solutions**:
1. Check Oracle is running: `sudo systemctl status oracle-xe-21c`
2. Start Oracle: `sudo systemctl start oracle-xe-21c`
3. Verify credentials in `backend/.env`

### No flights returned

**Symptom**: Empty results array

**Solutions**:
1. Check database has sample data:
   ```sql
   SELECT COUNT(*) FROM FLIGHTS;
   ```
2. Verify city names match: Check `AIRPORTS` table for exact city names
3. Check date format: Must be YYYY-MM-DD
4. Ensure flights have `available_seats > 0`

### Type errors in frontend

**Symptom**: TypeScript compilation errors

**Solutions**:
- These are compile-time warnings and won't affect runtime
- Run `npm run build` to verify production build works
- If needed: `npm install --save-dev @types/react @types/node`

## Key Files to Know

### Frontend
- `frontend/lib/api.ts` - API client configuration
- `frontend/hooks/use-flight-search.ts` - Flight search hook
- `frontend/components/search-form.tsx` - Search form with Indian airports
- `frontend/app/search-results/page.tsx` - Results display

### Backend
- `backend/src/server.js` - Express server setup
- `backend/src/models/flight.model.js` - Database queries
- `backend/src/controllers/flight.controller.js` - Request handlers
- `backend/src/routes/flight.routes.js` - API routes

### Database
- `sql/airline_booking_unified.sql` - Complete schema with sample data
- `sql/cleanup.sql` - Clean database reinstallation
- `sql/README.md` - Database documentation

## Sample Data

The database includes:
- **5 Airlines**: Air India, IndiGo, SpiceJet, Vistara, Go First
- **10 Airports**: DEL, BOM, BLR, HYD, CCU, MAA, AMD, COK, GOI, PNQ
- **5 Sample Flights**: Between major Indian cities
- **4 Bookings**: Sample bookings with tickets and payments

## Next Steps

1. ✅ Run database setup scripts
2. ✅ Configure backend `.env` file
3. ✅ Install backend dependencies
4. ✅ Start backend server
5. ✅ Install frontend dependencies  
6. ✅ Start frontend development server
7. ✅ Test flight search functionality
8. 🔄 Implement booking flow
9. 🔄 Add user authentication
10. 🔄 Deploy to production

## Support

- Backend API Docs: `backend/API_DOCUMENTATION.md`
- SQL Setup Guide: `sql/REINSTALL_GUIDE.md`
- Quick Testing: `backend/QUICK_REFERENCE.md`
