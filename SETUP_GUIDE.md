# 📘 Setup Guide - FinanceAI Expense Tracker

Step-by-step guide to get the application running locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v15 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)
- **Docker & Docker Compose** (Optional but recommended) - [Download](https://www.docker.com/)

---

## Method 1: Docker Setup (Recommended)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Subhadeep-kumbhakar/dashboard_expense_tracker.git
cd dashboard_expense_tracker
```

### Step 2: Configure Environment Variables

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set your values:

```env
PORT=5000
NODE_ENV=development
DB_HOST=postgres
DB_PORT=5432
DB_NAME=financeai_db
DB_USER=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key_optional
```

### Step 3: Start the Application

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 5000
- Frontend on port 80

### Step 4: Run Database Migrations

```bash
docker-compose exec backend npm run migrate
```

### Step 5: Access the Application

- Frontend: http://localhost
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

### Step 6: Create Your First Account

1. Navigate to http://localhost/register.html
2. Fill in your details
3. Click "Create Account"
4. You'll be automatically logged in and redirected to the dashboard

---

## Method 2: Manual Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/Subhadeep-kumbhakar/dashboard_expense_tracker.git
cd dashboard_expense_tracker
```

### Step 2: Setup PostgreSQL Database

#### macOS (using Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
createdb financeai_db
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb financeai_db
```

#### Windows
1. Download PostgreSQL installer
2. Install and start PostgreSQL service
3. Open pgAdmin or psql
4. Create database: `CREATE DATABASE financeai_db;`

### Step 3: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Run migrations
npm run migrate

# Start backend server
npm run dev
```

The backend will start on http://localhost:5000

### Step 4: Setup Frontend

Open a new terminal:

```bash
cd frontend

# Install a simple HTTP server
npm install -g http-server

# Start frontend
http-server -p 3000
```

The frontend will start on http://localhost:3000

### Step 5: Verify Installation

1. Check backend health: http://localhost:5000/health
2. Open frontend: http://localhost:3000
3. Register a new account
4. Start using the application!

---

## Troubleshooting

### Issue: Database connection error

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
1. Check if PostgreSQL is running:
```bash
# macOS
brew services list

# Linux
sudo systemctl status postgresql

# Windows
# Check Services app for PostgreSQL
```

2. Verify database credentials in `.env`
3. Ensure database exists:
```bash
psql -U postgres -l
```

### Issue: Port already in use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
1. Find process using the port:
```bash
# macOS/Linux
lsof -i :5000

# Windows
netstat -ano | findstr :5000
```

2. Kill the process or change PORT in `.env`

### Issue: npm install fails

**Error:** Various npm errors

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Migration fails

**Error:** `Migration failed`

**Solution:**
1. Ensure database exists and is accessible
2. Check database credentials
3. Drop and recreate database (⚠️ destroys data):
```bash
dropdb financeai_db
createdb financeai_db
npm run migrate
```

### Issue: JWT token invalid

**Error:** `Invalid token. Please login again.`

**Solution:**
1. Clear browser localStorage
2. Login again
3. Ensure JWT_SECRET is consistent across restarts

---

## Development Workflow

### Running in Development Mode

#### Backend
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

#### Frontend
Make changes to HTML/JS/CSS files and refresh browser

### Database Management

#### View all users
```bash
docker-compose exec postgres psql -U postgres -d financeai_db -c "SELECT * FROM users;"
```

#### View all transactions
```bash
docker-compose exec postgres psql -U postgres -d financeai_db -c "SELECT * FROM transactions;"
```

#### Reset database
```bash
docker-compose exec postgres psql -U postgres -d financeai_db -c "DROP TABLE transactions, users CASCADE;"
docker-compose exec backend npm run migrate
```

### Viewing Logs

#### Docker
```bash
# All logs
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Database only
docker-compose logs -f postgres
```

#### Manual setup
Backend logs appear in terminal where `npm run dev` is running

---

## Testing the API

### Using cURL

#### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Create Transaction
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "type": "expense",
    "amount": 50.00,
    "date": "2024-01-15",
    "description": "Lunch",
    "category": "Food",
    "notes": "Business lunch"
  }'
```

### Using Postman

1. Import the API collection (if provided)
2. Set environment variables:
   - `base_url`: http://localhost:5000/api
   - `token`: (set after login)
3. Test each endpoint

---

## Next Steps

1. **Customize the application**
   - Modify frontend styles
   - Add new categories
   - Customize charts

2. **Deploy to production**
   - Follow [DEPLOYMENT.md](DEPLOYMENT.md)
   - Set up SSL
   - Configure domain

3. **Add features**
   - Budget limits
   - Recurring transactions
   - Export to PDF/CSV
   - Mobile app

---

## Getting Help

- **Documentation**: Read [README.md](README.md)
- **Deployment**: Check [DEPLOYMENT.md](DEPLOYMENT.md)
- **Issues**: https://github.com/Subhadeep-kumbhakar/dashboard_expense_tracker/issues
- **Email**: [your-email]

---

## Development Tips

### Hot Reload
- Backend: nodemon automatically restarts on file changes
- Frontend: Refresh browser to see changes

### Debugging
```javascript
// Add to backend code
console.log('Debug:', variable);

// Check backend logs
docker-compose logs -f backend
```

### Database Queries
```javascript
// In backend code
const result = await pool.query('SELECT * FROM transactions WHERE user_id = $1', [userId]);
console.log(result.rows);
```

---

Happy coding! 🚀
