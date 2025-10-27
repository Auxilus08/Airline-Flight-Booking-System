# Airline Ticket Booking System

A comprehensive airline ticket booking system built with Oracle Database, Node.js, Express, and React.

## 🚀 Features

- **Flight Management**: Search, view, and manage flight schedules
- **Passenger Management**: Create and manage passenger profiles
- **Booking System**: Complete booking workflow with ticket generation
- **Payment Processing**: Secure payment handling with multiple methods
- **User Authentication**: Role-based access control (Admin, Agent, Customer)
- **Real-time Updates**: Flight status and availability tracking
- **Comprehensive Reports**: Views for flight schedules and booking summaries

## 📁 Project Structure

```
Airline-Ticket-Booking-System/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── models/         # Data models
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   └── server.js       # Express app entry point
│   ├── package.json
│   └── README.md
├── frontend/               # React frontend (if applicable)
├── sql/                    # Database scripts
│   └── airline_booking_unified.sql
└── ER-Relationship.md      # Entity-Relationship documentation
```

## 🗄️ Database Schema

The system uses Oracle Database with the following main tables:

- **AIRLINES**: Airline information
- **AIRPORTS**: Airport details with geolocation
- **AIRCRAFT**: Aircraft fleet management
- **FLIGHTS**: Flight schedules and pricing
- **PASSENGERS**: Passenger profiles
- **USERS**: System users (Admin/Agent/Customer)
- **BOOKINGS**: Booking records
- **TICKETS**: Issued tickets
- **PAYMENTS**: Payment transactions
- **CREW**: Flight crew members
- **FLIGHT_CREW**: Crew assignments

## 🛠️ Technology Stack

### Backend
- **Node.js** 18+
- **Express.js** 4.18.2
- **oracledb** 6.3.0 (Oracle Database driver)
- **dotenv** - Environment configuration
- **cors** - Cross-origin resource sharing
- **helmet** - Security headers
- **morgan** - HTTP request logger
- **express-validator** - Input validation

### Database
- **Oracle Database 21c Express Edition**
- Advanced features: Triggers, Sequences, Views, Stored Procedures

## 📦 Installation

### Prerequisites
- Node.js 18 or higher
- Oracle Database 21c Express Edition
- Git

### Database Setup

1. Install Oracle Database 21c XE
2. Start the Oracle listener
3. Run the unified schema script:

```bash
sqlplus system/your_password@localhost:1521/XEPDB1 @sql/airline_booking_unified.sql
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure your database credentials in `.env`:
```env
DB_USER=system
DB_PASSWORD=your_password
DB_CONNECTION_STRING=localhost:1521/XEPDB1
PORT=3000
NODE_ENV=development
```

5. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## 🔌 API Endpoints

### Health Check
- `GET /api/health` - System health status

### Flights
- `GET /api/flights` - List all flights with filters
- `GET /api/flights/:id` - Get flight details
- `POST /api/flights/search` - Search flights by criteria

### Passengers
- `GET /api/passengers` - List all passengers
- `GET /api/passengers/:id` - Get passenger details
- `POST /api/passengers` - Create new passenger
- `PUT /api/passengers/:id` - Update passenger
- `DELETE /api/passengers/:id` - Delete passenger

### Bookings
- `GET /api/bookings` - List all bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id/status` - Update booking status
- `DELETE /api/bookings/:id` - Cancel booking

### Airports
- `GET /api/airports` - List all airports

## 📊 Database Features

### Triggers
- Auto-increment primary keys
- Automatic ticket number generation
- Booking total calculation
- Double-booking prevention

### Views
- `v_flight_schedule` - Complete flight schedule with airline/airport details
- `v_booking_summary` - Comprehensive booking information

### Sample Data
The schema includes realistic sample data:
- 5 Indian airlines
- 10 major Indian airports
- Multiple flight routes
- Sample passengers and bookings

## 🔒 Security Features

- Helmet.js for security headers
- CORS configuration
- Input validation and sanitization
- Parameterized SQL queries (SQL injection prevention)
- Connection pooling with limits
- Error handling middleware

## 📝 Documentation

- [Backend API Documentation](backend/README.md)
- [Database Schema Documentation](ER-Relationship.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is created for educational purposes.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Oracle Database documentation
- Node.js and Express.js communities
- Indian aviation industry for realistic data references

## 📞 Support

For support, please open an issue in the GitHub repository.

---

**Happy Flying! ✈️**
