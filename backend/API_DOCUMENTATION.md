# Airline Ticket Booking System - API Documentation

Complete RESTful API endpoints with ACID transaction support for Oracle Database.

## Table of Contents
- [Authentication](#authentication)
- [Flight Management](#flight-management)
- [Booking Management](#booking-management)
- [Payment Processing](#payment-processing)
- [User Management](#user-management)
- [Passenger Management](#passenger-management)
- [Airport Management](#airport-management)
- [ACID Transaction Examples](#acid-transaction-examples)

## Base URL
```
http://localhost:3000/api
```

## Response Format
All responses follow this structure:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "count": 10  // For list endpoints
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]  // Validation errors if any
}
```

---

## Flight Management

### Search Flights
Search flights by origin, destination, and optional date.

```http
GET /api/flights/search?from=DEL&to=BOM&date=2025-11-15
```

**Query Parameters:**
- `from` or `origin` (required): Origin city
- `to` or `destination` (required): Destination city
- `date` (optional): Departure date (YYYY-MM-DD format)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "FLIGHT_ID": 10000,
      "FLIGHT_NUMBER": "AI101",
      "DEPARTURE_TIME": "2025-11-15T06:00:00.000Z",
      "ARRIVAL_TIME": "2025-11-15T08:30:00.000Z",
      "ORIGIN_CODE": "DEL",
      "ORIGIN_CITY": "New Delhi",
      "DESTINATION_CODE": "BOM",
      "DESTINATION_CITY": "Mumbai",
      "DURATION_MINUTES": 150,
      "BASE_PRICE": 5500.00,
      "AVAILABLE_SEATS": 180,
      "STATUS": "scheduled",
      "AIRCRAFT_MODEL": "Boeing 737-800"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/api/flights/search?from=DEL&to=BOM&date=2025-11-15"
```

### Get Flight Details
Get detailed information about a specific flight.

```http
GET /api/flights/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "FLIGHT_ID": 10000,
    "FLIGHT_NUMBER": "AI101",
    "DEPARTURE_TIME": "2025-11-15T06:00:00.000Z",
    "ARRIVAL_TIME": "2025-11-15T08:30:00.000Z",
    "PRICE": 5500.00,
    "AVAILABLE_SEATS": 180,
    "STATUS": "scheduled",
    "ORIGIN_AIRPORT": "Indira Gandhi International Airport",
    "ORIGIN_CITY": "New Delhi",
    "DESTINATION_AIRPORT": "Chhatrapati Shivaji Maharaj International Airport",
    "DESTINATION_CITY": "Mumbai",
    "AIRCRAFT_MODEL": "Boeing 737-800",
    "TOTAL_SEATS": 180,
    "ECONOMY_SEATS": 150,
    "BUSINESS_SEATS": 24,
    "FIRST_CLASS_SEATS": 6
  }
}
```

### Create Flight (Admin)
Create a new flight.

```http
POST /api/flights
Content-Type: application/json
```

**Request Body:**
```json
{
  "airline_id": 1000,
  "flight_number": "AI105",
  "route_id": 1,
  "aircraft_id": 1,
  "origin_airport_id": 1000,
  "destination_airport_id": 1001,
  "departure_time": "2025-11-20 10:00:00",
  "arrival_time": "2025-11-20 12:30:00",
  "duration_minutes": 150,
  "price": 6000.00,
  "available_seats": 180,
  "status": "scheduled"
}
```

**Validation Rules:**
- All fields are required except `route_id`, `aircraft_id`, and `status`
- `price` must be positive
- `available_seats` must be non-negative
- `status` must be one of: scheduled, on-time, delayed, cancelled

### Update Flight (Admin)
Update flight details.

```http
PUT /api/flights/:id
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "flight_number": "AI105",
  "departure_time": "2025-11-20 11:00:00",
  "arrival_time": "2025-11-20 13:30:00",
  "price": 6500.00,
  "available_seats": 175,
  "status": "delayed"
}
```

### Delete Flight (Admin)
Delete a flight.

```http
DELETE /api/flights/:id
```

---

## Booking Management

### Create Booking (ACID Transaction)
Create a new booking with tickets. This demonstrates ACID properties:
- **Atomicity**: All operations succeed or all fail
- **Consistency**: Maintains seat availability integrity
- **Isolation**: Prevents double-booking
- **Durability**: Changes are permanent once committed

```http
POST /api/bookings
Content-Type: application/json
```

**Request Body:**
```json
{
  "passenger_id": 50000,
  "user_id": 2000,
  "tickets": [
    {
      "flight_id": 10000,
      "seat_number": "12A",
      "fare_class": "Economy",
      "class_type": "ECONOMY",
      "price": 5500.00
    },
    {
      "flight_id": 10001,
      "seat_number": "15B",
      "fare_class": "Economy",
      "class_type": "ECONOMY",
      "price": 6200.00
    }
  ]
}
```

**Transaction Steps:**
1. Verify seat availability for all flights (with FOR UPDATE lock)
2. Check for seat conflicts
3. Create booking record
4. Create ticket records for each flight
5. Update flight available_seats
6. Auto-commit on success or auto-rollback on any error

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking_id": 300005,
    "ticket_ids": [700010, 700011],
    "booking": {
      "BOOKING_ID": 300005,
      "BOOKING_DATE": "2025-10-28T00:00:00.000Z",
      "TOTAL_AMOUNT": 11700.00,
      "STATUS": "pending",
      "PAYMENT_STATUS": "PENDING",
      "PASSENGER_ID": 50000,
      "FIRST_NAME": "Rahul",
      "LAST_NAME": "Verma",
      "EMAIL": "rahul.verma@gmail.com",
      "tickets": [...]
    }
  }
}
```

**Validation Rules:**
- `passenger_id` (required): Must be a valid passenger ID
- `user_id` (optional): Associated user ID
- `tickets` (required): Array with at least one ticket
- Each ticket must have `flight_id` and `price`

**Error Scenarios:**
- Seat not available: "Flight 10000 has no available seats"
- Seat already booked: "Seat already booked on flight 10000"
- Invalid flight: Foreign key constraint violation
- Database error: Transaction automatically rolled back

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "passenger_id": 50000,
    "user_id": 2000,
    "tickets": [
      {
        "flight_id": 10000,
        "seat_number": "12A",
        "fare_class": "Economy",
        "class_type": "ECONOMY",
        "price": 5500.00
      }
    ]
  }'
```

### Get Booking Details
Get detailed booking information including all tickets.

```http
GET /api/bookings/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "BOOKING_ID": 300000,
    "BOOKING_DATE": "2025-10-15T00:00:00.000Z",
    "TOTAL_AMOUNT": 5500.00,
    "STATUS": "confirmed",
    "PAYMENT_STATUS": "COMPLETED",
    "PASSENGER_ID": 50000,
    "FIRST_NAME": "Rahul",
    "LAST_NAME": "Verma",
    "EMAIL": "rahul.verma@gmail.com",
    "PHONE": "+91-9876543210",
    "PASSPORT_NUMBER": "M1234567",
    "tickets": [
      {
        "TICKET_ID": 700000,
        "TICKET_NUMBER": "TKT0000700000",
        "FLIGHT_ID": 10000,
        "FLIGHT_NUMBER": "AI101",
        "SEAT_NUMBER": "12A",
        "FARE_CLASS": "Economy",
        "CLASS_TYPE": "ECONOMY",
        "PRICE": 5500.00,
        "STATUS": "confirmed",
        "DEPARTURE_TIME": "2025-11-01T06:00:00.000Z",
        "ARRIVAL_TIME": "2025-11-01T08:30:00.000Z",
        "ORIGIN_CITY": "New Delhi",
        "ORIGIN_CODE": "DEL",
        "DESTINATION_CITY": "Mumbai",
        "DESTINATION_CODE": "BOM"
      }
    ]
  }
}
```

### Get User's Bookings
Get all bookings for a specific user.

```http
GET /api/bookings/user/:userId
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "BOOKING_ID": 300000,
      "BOOKING_DATE": "2025-10-15T00:00:00.000Z",
      "TOTAL_AMOUNT": 5500.00,
      "STATUS": "confirmed",
      "PAYMENT_STATUS": "COMPLETED",
      "PASSENGER_NAME": "Rahul Verma",
      "PASSENGER_EMAIL": "rahul.verma@gmail.com",
      "TICKET_COUNT": 1
    }
  ]
}
```

### Cancel Booking (ACID Transaction)
Cancel a booking and restore seat availability.

```http
PUT /api/bookings/:id/cancel
```

**Transaction Steps:**
1. Retrieve all tickets for the booking
2. Update booking status to 'cancelled'
3. Update all ticket statuses to 'cancelled'
4. Restore available_seats for each flight
5. Auto-commit on success

**Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "BOOKING_ID": 300000,
    "STATUS": "cancelled",
    "PAYMENT_STATUS": "COMPLETED"
  }
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:3000/api/bookings/300000/cancel
```

---

## Payment Processing

### Process Payment (ACID Transaction)
Process payment and update booking status atomically.

```http
POST /api/payments
Content-Type: application/json
```

**Request Body:**
```json
{
  "booking_id": 300000,
  "amount": 5500.00,
  "payment_method": "CREDIT_CARD",
  "transaction_reference": "TXN20251028001"
}
```

**Transaction Steps:**
1. Verify booking exists and is pending (with FOR UPDATE lock)
2. Check booking is not already paid
3. Verify amount matches booking total
4. Create payment record
5. Update booking status to 'confirmed'
6. Update payment_status to 'COMPLETED'
7. Auto-commit on success

**Validation Rules:**
- `booking_id` (required): Valid booking ID
- `amount` (required): Must be positive and match booking total
- `payment_method` (required): One of CREDIT_CARD, DEBIT_CARD, UPI, NET_BANKING, WALLET
- `transaction_reference` (optional): External transaction reference

**Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "payment": {
      "PAYMENT_ID": 900000,
      "BOOKING_ID": 300000,
      "AMOUNT": 5500.00,
      "PAYMENT_DATE": "2025-10-28T12:00:00.000Z",
      "METHOD": "CREDIT_CARD",
      "PAYMENT_METHOD": "CREDIT_CARD",
      "STATUS": "completed",
      "TRANSACTION_ID": "TXN1730116800001",
      "TRANSACTION_REFERENCE": "TXN20251028001"
    },
    "booking": {
      "BOOKING_ID": 300000,
      "STATUS": "confirmed",
      "PAYMENT_STATUS": "COMPLETED"
    }
  }
}
```

**Error Scenarios:**
- Booking not found
- Booking already paid
- Amount mismatch
- Invalid payment method

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": 300000,
    "amount": 5500.00,
    "payment_method": "CREDIT_CARD"
  }'
```

### Get Payment Details
Get payments for a specific booking.

```http
GET /api/payments/:bookingId
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "PAYMENT_ID": 900000,
      "BOOKING_ID": 300000,
      "AMOUNT": 5500.00,
      "PAYMENT_DATE": "2025-10-15T00:00:00.000Z",
      "METHOD": "Credit Card",
      "PAYMENT_METHOD": "CREDIT_CARD",
      "STATUS": "completed",
      "TRANSACTION_ID": "TXN20251015001",
      "TRANSACTION_REFERENCE": "TXN20251015001"
    }
  ]
}
```

---

## User Management

### Register User
Create a new user account.

```http
POST /api/users/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "role": "customer"
}
```

**Validation Rules:**
- `username` (required): 3-50 characters, unique
- `email` (required): Valid email format, unique
- `password` (required): Minimum 6 characters (hashed with SHA-256)
- `full_name` (optional): Maximum 200 characters
- `role` (optional): customer (default), agent, or admin

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "USER_ID": 2003,
    "USERNAME": "john_doe",
    "EMAIL": "john.doe@example.com",
    "FULL_NAME": "John Doe",
    "ROLE": "customer",
    "ACTIVE": 1,
    "CREATED_AT": "2025-10-28T12:00:00.000Z"
  }
}
```

### Login
Authenticate a user.

```http
POST /api/users/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "SecurePass123"
}
```

**Note:** Username can be either username or email address.

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "USER_ID": 2003,
    "USERNAME": "john_doe",
    "EMAIL": "john.doe@example.com",
    "FULL_NAME": "John Doe",
    "ROLE": "customer",
    "ACTIVE": 1
  }
}
```

### Get User Profile
Get user profile information.

```http
GET /api/users/profile/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "USER_ID": 2003,
    "USERNAME": "john_doe",
    "EMAIL": "john.doe@example.com",
    "FULL_NAME": "John Doe",
    "ROLE": "customer",
    "ACTIVE": 1,
    "CREATED_AT": "2025-10-28T12:00:00.000Z"
  }
}
```

### Update Profile
Update user profile information.

```http
PUT /api/users/profile/:id
Content-Type: application/json
```

**Request Body:**
```json
{
  "full_name": "John Michael Doe",
  "email": "john.m.doe@example.com"
}
```

---

## ACID Transaction Examples

### Example 1: Complete Booking Flow

```bash
# Step 1: Create Booking (ACID Transaction)
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "passenger_id": 50000,
    "user_id": 2000,
    "tickets": [{
      "flight_id": 10000,
      "seat_number": "12A",
      "class_type": "ECONOMY",
      "price": 5500.00
    }]
  }'

# Step 2: Process Payment (ACID Transaction)
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": 300005,
    "amount": 5500.00,
    "payment_method": "UPI"
  }'

# Step 3: View Booking Details
curl http://localhost:3000/api/bookings/300005
```

### Example 2: Rollback Scenario

When seat is not available:
```json
// Request
POST /api/bookings
{
  "passenger_id": 50000,
  "tickets": [{
    "flight_id": 10000,
    "price": 5500.00
  }]
}

// Response (if no seats available)
{
  "success": false,
  "message": "Booking failed: Flight 10000 has no available seats"
}
// Database automatically rolled back - no partial booking created
```

### Example 3: Concurrent Booking Prevention

When two users try to book the same seat simultaneously:
```
User A: POST /api/bookings (seat 12A)
User B: POST /api/bookings (seat 12A)

Result:
- User A: Success (got the lock first)
- User B: Error "Seat already booked on flight 10000"
- Transaction isolation prevents double-booking
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Testing the API

### Using Postman
Import the collection: [Download Postman Collection](#)

### Using cURL
All examples are provided in cURL format above.

### Health Check
```bash
curl http://localhost:3000/api/health
```

---

## Notes

- All dates should be in ISO 8601 format
- Parameterized queries are used throughout to prevent SQL injection
- Transactions ensure data integrity
- Seat availability is managed atomically
- Passwords are hashed with SHA-256 before storage
