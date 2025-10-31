#!/bin/bash

# ============================================
# Airline Ticket Booking System - Setup Script
# ============================================

echo "============================================"
echo "Airline Ticket Booking System - Full Setup"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the project root
if [ ! -d "backend" ] || [ ! -d "frontend" ] || [ ! -d "sql" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Database Setup${NC}"
echo "----------------------------------------"
echo "Please ensure Oracle Database 21c XE is running"
echo ""
read -p "Have you already run the SQL setup scripts? (y/n): " sql_done

if [ "$sql_done" != "y" ]; then
    echo ""
    echo "Please run these commands in SQL*Plus:"
    echo "  sqlplus your_username/your_password@localhost:1521/XEPDB1"
    echo "  SQL> @sql/cleanup.sql"
    echo "  SQL> @sql/airline_booking_unified.sql"
    echo ""
    echo "Then run this script again."
    exit 0
fi

echo -e "${GREEN}✓ Database setup complete${NC}"
echo ""

echo -e "${YELLOW}Step 2: Backend Setup${NC}"
echo "----------------------------------------"
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to install backend dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Backend dependencies already installed${NC}"
fi

# Check .env file
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: backend/.env file not found${NC}"
    echo "Please create it with your database credentials"
    exit 1
fi

echo -e "${GREEN}✓ Backend configuration verified${NC}"
cd ..
echo ""

echo -e "${YELLOW}Step 3: Frontend Setup${NC}"
echo "----------------------------------------"
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to install frontend dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
fi

# Check .env.local file
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local
    echo -e "${GREEN}✓ Frontend .env.local created${NC}"
else
    echo -e "${GREEN}✓ Frontend .env.local exists${NC}"
fi

cd ..
echo ""

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "To start the application:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend"
echo "  npm start"
echo "  (Server will run on http://localhost:3000)"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo "  (App will run on http://localhost:3001)"
echo ""
echo "Then open http://localhost:3001 in your browser"
echo ""
echo -e "${YELLOW}Note: Make sure Oracle Database is running before starting the backend!${NC}"
echo ""
