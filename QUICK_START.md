# ⚡ Quick Start Guide

Get up and running in 5 minutes!

## 🚀 Fastest Way: Docker

### 1. Prerequisites
- Docker & Docker Compose installed
- Git installed

### 2. Setup (3 commands)

```bash
# Clone
git clone https://github.com/Subhadeep-kumbhakar/dashboard_expense_tracker.git
cd dashboard_expense_tracker

# Configure
cp backend/.env.example backend/.env
# Edit backend/.env - set JWT_SECRET and DB_PASSWORD

# Start
docker-compose up -d
docker-compose exec backend npm run migrate
```

### 3. Access

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### 4. First Steps

1. Open http://localhost/register.html
2. Create your account
3. Start tracking expenses!

---

## 🔧 Manual Setup (No Docker)

### Prerequisites
- Node.js 18+
- PostgreSQL 15+

### Steps

```bash
# 1. Clone
git clone https://github.com/Subhadeep-kumbhakar/dashboard_expense_tracker.git
cd dashboard_expense_tracker

# 2. Database
createdb financeai_db

# 3. Backend
cd backend
npm install
cp .env.example .env
# Edit .env
npm run migrate
npm run dev

# 4. Frontend (new terminal)
cd frontend
npx http-server -p 3000
```

### Access
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## 🎯 Essential Environment Variables

Edit `backend/.env`:

```env
# Required
JWT_SECRET=your_secret_here          # Generate: openssl rand -base64 32
DB_PASSWORD=your_db_password         # Your PostgreSQL password

# Optional (defaults provided)
PORT=5000
DB_HOST=localhost
DB_NAME=financeai_db
DB_USER=postgres
```

---

## 🧪 Test It Works

```bash
# Health check
curl http://localhost:5000/health

# Should return: {"success":true,"message":"FinanceAI API is running",...}
```

---

## 📚 Next Steps

- Read [README.md](README.md) for full documentation
- Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment

---

## 🆘 Common Issues

### Port already in use
```bash
# Change PORT in backend/.env
PORT=5001
```

### Database connection error
```bash
# Verify PostgreSQL is running
# macOS:
brew services list

# Linux:
sudo systemctl status postgresql
```

### Migration fails
```bash
# Ensure database exists
createdb financeai_db

# Run migration again
docker-compose exec backend npm run migrate
```

---

## 🎉 You're Ready!

Your production-ready expense tracker is now running!

**Features:**
- ✅ User authentication
- ✅ Secure data storage
- ✅ Beautiful dashboard
- ✅ Charts and analytics
- ✅ AI insights
- ✅ Mobile responsive

Happy tracking! 💰
