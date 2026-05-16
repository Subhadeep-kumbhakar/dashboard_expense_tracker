# 💰 FinanceAI - Expense Tracker Dashboard

A production-ready, full-stack expense tracking application with AI-powered insights, user authentication, and real-time analytics.

## 🚀 Features

### Core Features
- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Transaction Management**: Full CRUD operations for income and expenses
- **Real-time Dashboard**: Live KPIs, charts, and analytics
- **AI Insights**: Integration with Google Gemini for financial advice
- **Multi-user Support**: Each user has isolated data
- **Responsive Design**: Works seamlessly on desktop and mobile

### Security Features
- JWT token-based authentication
- Password hashing with bcrypt
- SQL injection protection
- XSS prevention
- CORS configuration
- Rate limiting
- Helmet.js security headers
- Input validation and sanitization

### Analytics & Visualizations
- **KPI Cards**: Net balance, total income, expenses, savings rate
- **Charts**:
  - Spending by category (Doughnut chart)
  - Income vs expenses (Bar chart)
  - Monthly trends (Line chart)
  - Category breakdown (Horizontal bar chart)

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Node.js v18+
- Express.js (REST API)
- PostgreSQL (Database)
- JWT (Authentication)
- bcryptjs (Password hashing)
- express-validator (Input validation)
- helmet (Security headers)
- cors (Cross-origin resource sharing)

**Frontend:**
- Vanilla JavaScript (ES6+)
- Chart.js (Data visualization)
- HTML5/CSS3
- Fetch API

**DevOps:**
- Docker & Docker Compose
- Nginx (Reverse proxy)
- PostgreSQL (Persistent storage)

### Project Structure

```
dashboard_expense_tracker/
├── backend/
│   ├── config/
│   │   └── database.js           # Database connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   └── transactionController.js
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   └── validator.js          # Input validation
│   ├── models/
│   │   ├── User.js               # User model
│   │   └── Transaction.js        # Transaction model
│   ├── routes/
│   │   ├── auth.js               # Auth routes
│   │   └── transactions.js       # Transaction routes
│   ├── utils/
│   │   └── migrate.js            # Database migrations
│   ├── .env.example              # Environment template
│   ├── package.json
│   └── server.js                 # Entry point
├── frontend/
│   ├── js/
│   │   ├── api.js                # API service layer
│   │   └── app.js                # Main application logic
│   ├── css/
│   ├── index.html                # Dashboard
│   ├── login.html                # Login page
│   └── register.html             # Registration page
├── docker-compose.yml
├── Dockerfile
├── nginx.conf
└── README.md
```

## 📦 Installation & Setup

### Prerequisites
- Node.js v18 or higher
- PostgreSQL 15+
- npm or yarn
- Docker & Docker Compose (optional)

### Option 1: Docker Deployment (Recommended)

1. **Clone the repository**
```bash
git clone https://github.com/Subhadeep-kumbhakar/dashboard_expense_tracker.git
cd dashboard_expense_tracker
```

2. **Create environment file**
```bash
cp backend/.env.example backend/.env
```

3. **Configure environment variables**
Edit `backend/.env` with your settings:
```env
PORT=5000
NODE_ENV=production
DB_HOST=postgres
DB_PORT=5432
DB_NAME=financeai_db
DB_USER=postgres
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
CORS_ORIGIN=*
```

4. **Start with Docker Compose**
```bash
docker-compose up -d
```

5. **Run database migrations**
```bash
docker-compose exec backend npm run migrate
```

6. **Access the application**
- Frontend: http://localhost:80
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/health

### Option 2: Manual Installation

1. **Clone the repository**
```bash
git clone https://github.com/Subhadeep-kumbhakar/dashboard_expense_tracker.git
cd dashboard_expense_tracker
```

2. **Install PostgreSQL and create database**
```bash
createdb financeai_db
```

3. **Backend setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run migrate
npm start
```

4. **Frontend setup**
```bash
cd frontend
# Serve with any static file server
npx http-server -p 3000
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🔑 API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Transaction Endpoints

All transaction endpoints require authentication.

#### Get All Transactions
```http
GET /api/transactions
Authorization: Bearer <token>

Query Parameters:
- type: income | expense
- category: string
- startDate: YYYY-MM-DD
- endDate: YYYY-MM-DD
- limit: number
```

#### Create Transaction
```http
POST /api/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "expense",
  "amount": 50.00,
  "date": "2024-01-15",
  "description": "Grocery shopping",
  "category": "Food",
  "notes": "Weekly groceries"
}
```

#### Update Transaction
```http
PUT /api/transactions/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "expense",
  "amount": 55.00,
  "date": "2024-01-15",
  "description": "Grocery shopping",
  "category": "Food",
  "notes": "Weekly groceries - updated"
}
```

#### Delete Transaction
```http
DELETE /api/transactions/:id
Authorization: Bearer <token>
```

#### Get Statistics
```http
GET /api/transactions/stats?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

#### Get Category Breakdown
```http
GET /api/transactions/category-breakdown?type=expense&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

#### Get Monthly Trend
```http
GET /api/transactions/monthly-trend?months=6
Authorization: Bearer <token>
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔒 Security Best Practices

1. **Never commit `.env` file** - Contains sensitive credentials
2. **Use strong JWT secrets** - Generate with: `openssl rand -base64 32`
3. **Enable HTTPS in production** - Use Let's Encrypt or cloud SSL
4. **Regularly update dependencies** - Run `npm audit` and fix vulnerabilities
5. **Set secure CORS origins** - Don't use `*` in production
6. **Implement rate limiting** - Already configured in the backend
7. **Use environment variables** - Never hardcode credentials

## 🚀 Deployment

### Deploy to Production

1. **Set production environment variables**
```env
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
CORS_ORIGIN=https://yourdomain.com
```

2. **Use Docker Compose**
```bash
docker-compose up -d --build
```

3. **Set up SSL with Let's Encrypt** (if not using cloud provider)
```bash
# Install certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Update nginx.conf with SSL configuration
```

### Deploy to Cloud Platforms

**AWS:**
- Use EC2 + RDS (PostgreSQL)
- Or use Elastic Beanstalk with Docker
- Store secrets in AWS Secrets Manager

**Google Cloud:**
- Use Cloud Run for containers
- Cloud SQL for PostgreSQL
- Secret Manager for credentials

**Heroku:**
```bash
heroku create financeai-app
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

**DigitalOcean:**
- Use App Platform or Droplets
- Managed PostgreSQL database
- Set environment variables in dashboard

## 📊 Usage

1. **Register an account** at `/register.html`
2. **Login** at `/login.html`
3. **Add transactions** from the dashboard
4. **View analytics** on the Analytics page
5. **Get AI insights** on the AI Insights page
6. **Filter and search** transactions by type, category, or date

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

**Subhadeep Kumbhakar**
- GitHub: [@Subhadeep-kumbhakar](https://github.com/Subhadeep-kumbhakar)

## 🙏 Acknowledgments

- Chart.js for beautiful visualizations
- Google Gemini for AI capabilities
- Express.js community
- PostgreSQL team

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Email: [your-email@example.com]

---

**Built with ❤️ using Node.js, PostgreSQL, and modern web technologies**
