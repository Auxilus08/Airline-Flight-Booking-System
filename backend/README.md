# Airline Ticket Booking System - Backend API

Node.js Express backend with Oracle Database integration for the Airline Ticket Booking System.

## 🚀 Features

- **Oracle Database Integration** with connection pooling
- **RESTful API** with Express.js
- **Transaction Support** for complex operations
- **Error Handling** with custom middleware
- **Request Validation** using express-validator
- **CORS** enabled for frontend integration
- **Health Check** endpoints for monitoring
- **ES6 Modules** for modern JavaScript
- **Environment Configuration** via .env files

## 📋 Prerequisites

- Node.js >= 18.0.0
- Oracle Database 21c Express Edition (or compatible)
- Oracle Instant Client (for oracledb package)

## 🛠️ Installation

### 1. Clone and Navigate

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and update with your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
NODE_ENV=development

# Oracle Database Configuration
DB_USER=system
DB_PASSWORD=your_password
DB_CONNECT_STRING=localhost:1521/XEPDB1

# Connection Pool Settings
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_INCREMENT=2
DB_POOL_TIMEOUT=60

# CORS Settings
CORS_ORIGIN=http://localhost:3000
```

### 4. Setup Oracle Database

Run the SQL script to create tables and sample data:

```bash
sqlplus system/password@//localhost:1521/XEPDB1 @../sql/airline_reservation_fixed.sql
```

### 5. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will start on `http://localhost:3000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.config.js       # Database configuration
│   │   └── db.js              # Database connection module
│   ├── controllers/
│   │   ├── flight.controller.js
│   │   ├── passenger.controller.js
│   │   └── booking.controller.js
│   ├── models/
│   │   ├── flight.model.js
│   │   ├── passenger.model.js
│   │   └── booking.model.js
│   ├── routes/
│   │   ├── flight.routes.js
│   │   ├── passenger.routes.js
│   │   ├── booking.routes.js
│   │   ├── airport.routes.js
│   │   └── health.routes.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validator.js
│   └── server.js              # Express server entry point
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## 🌐 API Endpoints

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/health/db` | Database connection status |

### Flights

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/flights` | Get all flights |
| GET | `/api/flights/search?origin=Mumbai&destination=Delhi&date=2025-11-01` | Search flights |
| GET | `/api/flights/:id` | Get flight by ID |

### Passengers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/passengers` | Get all passengers |
| GET | `/api/passengers/:id` | Get passenger by ID |
| POST | `/api/passengers` | Create new passenger |
| PUT | `/api/passengers/:id` | Update passenger |
| DELETE | `/api/passengers/:id` | Delete passenger |

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | Get all bookings |
| GET | `/api/bookings/:id` | Get booking by ID |
| GET | `/api/bookings/passenger/:passengerId` | Get passenger bookings |
| POST | `/api/bookings` | Create new booking |
| PATCH | `/api/bookings/:id/status` | Update booking status |
| POST | `/api/bookings/:id/cancel` | Cancel booking |

### Airports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/airports` | Get all airports |
| GET | `/api/airports/:id` | Get airport by ID |

## 📝 API Request Examples

### Create a Passenger

```bash
curl -X POST http://localhost:3000/api/passengers \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+919876543210",
    "passport_number": "P9876543",
    "date_of_birth": "1990-01-15",
    "nationality": "Indian"
  }'
```

### Search Flights

```bash
curl "http://localhost:3000/api/flights/search?origin=Mumbai&destination=Delhi&date=2025-11-01"
```

### Create a Booking

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "passenger_id": 1,
    "total_amount": 5000.00,
    "booking_status": "CONFIRMED",
    "payment_status": "COMPLETED",
    "tickets": [
      {
        "flight_id": 1,
        "seat_id": 1,
        "class_type": "ECONOMY",
        "price": 5000.00,
        "status": "BOOKED"
      }
    ]
  }'
```

### Get Booking Details

```bash
curl http://localhost:3000/api/bookings/1
```

## 🔧 Database Connection Module Features

The `db.js` module provides:

- **Connection Pooling**: Efficient connection reuse
- **Query Execution**: Simple and parameterized queries
- **Transactions**: ACID-compliant operations
- **Batch Operations**: Execute multiple statements efficiently
- **Error Handling**: Graceful error recovery
- **Health Monitoring**: Pool statistics and connection status

### Usage Examples

```javascript
import db from './config/db.js';

// Simple query
const rows = await db.query('SELECT * FROM passenger');

// Query with binds
const passenger = await db.queryOne(
  'SELECT * FROM passenger WHERE passenger_id = :id',
  [123]
);

// Transaction
await db.transaction(async (connection) => {
  await connection.execute('INSERT INTO booking ...');
  await connection.execute('INSERT INTO ticket ...');
  // Auto-commits if successful, rolls back on error
});

// Batch insert
await db.executeMany(
  'INSERT INTO seat VALUES (:1, :2, :3)',
  [[1, 'A1', 'ECONOMY'], [2, 'A2', 'ECONOMY']]
);
```

## 🔒 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `DB_USER` | Oracle username | system |
| `DB_PASSWORD` | Oracle password | - |
| `DB_CONNECT_STRING` | Connection string | localhost:1521/XEPDB1 |
| `DB_POOL_MIN` | Min pool connections | 2 |
| `DB_POOL_MAX` | Max pool connections | 10 |
| `DB_POOL_INCREMENT` | Pool increment | 2 |
| `DB_POOL_TIMEOUT` | Pool timeout (seconds) | 60 |
| `CORS_ORIGIN` | Allowed CORS origin | * |

## 🧪 Testing the API

### Check Server Health

```bash
curl http://localhost:3000/api/health
```

### Check Database Connection

```bash
curl http://localhost:3000/api/health/db
```

### Get All Airports

```bash
curl http://localhost:3000/api/airports
```

## 🐛 Troubleshooting

### ORA-12154: TNS:could not resolve the connect identifier

- Verify `DB_CONNECT_STRING` in `.env`
- Check Oracle listener is running: `lsnrctl status`
- Test connection: `sqlplus system/password@//localhost:1521/XEPDB1`

### Error: Cannot find module 'oracledb'

- Install Oracle Instant Client
- Set environment variables:
  ```bash
  export LD_LIBRARY_PATH=/path/to/instantclient
  ```

### Connection Pool Error

- Check database is running
- Verify credentials in `.env`
- Increase pool timeout: `DB_POOL_TIMEOUT=120`

## 📚 Dependencies

- **express**: Web framework
- **oracledb**: Oracle Database driver
- **dotenv**: Environment configuration
- **cors**: Cross-origin resource sharing
- **helmet**: Security headers
- **morgan**: HTTP request logger
- **express-validator**: Request validation
- **nodemon**: Development auto-reload (dev only)

## 🚦 Development

```bash
# Install dependencies
npm install

# Run in development mode with auto-reload
npm run dev

# Run in production mode
npm start
```

## 📄 License

ISC

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Built with ❤️ using Node.js, Express, and Oracle Database**
