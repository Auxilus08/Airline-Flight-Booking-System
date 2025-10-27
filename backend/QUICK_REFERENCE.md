# 🚀 Quick API Reference

## Base URL
```
http://localhost:3000/api
```

## 📋 Quick Test Commands

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

### 2. Search Flights
```bash
curl "http://localhost:3000/api/flights/search?from=New%20Delhi&to=Mumbai&date=2025-11-01"
```

### 3. Register User
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'
```

### 4. Login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### 5. Create Booking (ACID Transaction)
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "passenger_id": 50000,
    "user_id": 2001,
    "tickets": [{
      "flight_id": 10000,
      "seat_number": "12A",
      "class_type": "ECONOMY",
      "price": 5500.00
    }]
  }'
```

### 6. Process Payment (ACID Transaction)
```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": 300000,
    "amount": 5500.00,
    "payment_method": "UPI"
  }'
```

### 7. Get Booking Details
```bash
curl http://localhost:3000/api/bookings/300000
```

### 8. Cancel Booking
```bash
curl -X PUT http://localhost:3000/api/bookings/300000/cancel
```

## 📊 All Endpoints

### ✈️ Flights
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/flights/search?from=DEL&to=BOM&date=2025-11-15` | Search flights |
| GET | `/api/flights/:id` | Get flight details |
| POST | `/api/flights` | Create flight (Admin) |
| PUT | `/api/flights/:id` | Update flight (Admin) |
| DELETE | `/api/flights/:id` | Delete flight (Admin) |

### 📝 Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking (ACID) |
| GET | `/api/bookings/:id` | Get booking details |
| GET | `/api/bookings/user/:userId` | Get user's bookings |
| PUT | `/api/bookings/:id/cancel` | Cancel booking (ACID) |
| PATCH | `/api/bookings/:id/status` | Update booking status |

### 💳 Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments` | Process payment (ACID) |
| GET | `/api/payments/:bookingId` | Get payment details |
| POST | `/api/payments/:id/refund` | Process refund |

### 👤 Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | Authenticate user |
| GET | `/api/users/profile/:id` | Get user profile |
| PUT | `/api/users/profile/:id` | Update profile |
| PUT | `/api/users/password/:id` | Change password |

### 👥 Passengers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/passengers` | Get all passengers |
| GET | `/api/passengers/:id` | Get passenger details |
| POST | `/api/passengers` | Create passenger |
| PUT | `/api/passengers/:id` | Update passenger |
| DELETE | `/api/passengers/:id` | Delete passenger |

### 🏢 Airports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/airports` | Get all airports |

## 🔐 Security Features

✅ Parameterized queries (SQL injection prevention)  
✅ Password hashing (SHA-256)  
✅ Input validation (express-validator)  
✅ CORS & Helmet.js security headers  
✅ Error handling middleware  

## 💾 ACID Transactions

### Create Booking
- ✅ Atomicity: All or nothing
- ✅ Consistency: Maintains data integrity
- ✅ Isolation: FOR UPDATE locks
- ✅ Durability: Changes persisted

### Process Payment
- ✅ Verifies booking status
- ✅ Updates booking atomically
- ✅ Prevents double payment

### Cancel Booking
- ✅ Cancels all tickets
- ✅ Restores seat availability
- ✅ Atomic rollback on error

## 📚 Documentation

- **Complete API Docs**: `backend/API_DOCUMENTATION.md`
- **Implementation Guide**: `backend/IMPLEMENTATION_COMPLETE.md`
- **Setup Instructions**: `backend/README.md`

## 🧪 Testing Workflow

```bash
# 1. Start Oracle Database
# 2. Run the unified schema
sqlplus system/password@localhost:1521/XEPDB1 @sql/airline_booking_unified.sql

# 3. Start backend server
cd backend
npm start

# 4. Test endpoints
curl http://localhost:3000/api/health
curl "http://localhost:3000/api/flights/search?from=New%20Delhi&to=Mumbai"
```

## ⚡ Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Server Error |

## 🎯 Common Use Cases

### Book a Flight
1. Search flights → GET `/api/flights/search`
2. Create booking → POST `/api/bookings`
3. Process payment → POST `/api/payments`
4. View booking → GET `/api/bookings/:id`

### Manage Booking
1. View bookings → GET `/api/bookings/user/:userId`
2. Cancel booking → PUT `/api/bookings/:id/cancel`
3. Request refund → POST `/api/payments/:id/refund`

### User Operations
1. Register → POST `/api/users/register`
2. Login → POST `/api/users/login`
3. Update profile → PUT `/api/users/profile/:id`

---

**Ready to fly! ✈️**
