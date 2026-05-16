# 🚀 Deployment Guide

This guide covers different deployment options for the FinanceAI Expense Tracker application.

## Table of Contents
1. [Docker Deployment](#docker-deployment)
2. [AWS Deployment](#aws-deployment)
3. [Google Cloud Platform](#google-cloud-platform)
4. [Heroku Deployment](#heroku-deployment)
5. [DigitalOcean Deployment](#digitalocean-deployment)
6. [Production Checklist](#production-checklist)

---

## Docker Deployment

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Quick Start

1. **Configure environment**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with production values
```

2. **Start services**
```bash
docker-compose up -d
```

3. **Run migrations**
```bash
docker-compose exec backend npm run migrate
```

4. **Check status**
```bash
docker-compose ps
docker-compose logs -f
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
DB_HOST=postgres
DB_PORT=5432
DB_NAME=financeai_db
DB_USER=financeai_user
DB_PASSWORD=<STRONG_PASSWORD>
JWT_SECRET=<GENERATED_SECRET>
JWT_EXPIRE=7d
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Generate JWT Secret:**
```bash
openssl rand -base64 32
```

---

## AWS Deployment

### Option 1: EC2 + RDS

#### 1. Setup RDS PostgreSQL
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier financeai-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password <PASSWORD> \
  --allocated-storage 20
```

#### 2. Launch EC2 Instance
```bash
# Amazon Linux 2
sudo yum update -y
sudo yum install docker git -y
sudo systemctl start docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 3. Deploy Application
```bash
git clone https://github.com/Subhadeep-kumbhakar/dashboard_expense_tracker.git
cd dashboard_expense_tracker

# Configure .env with RDS endpoint
vim backend/.env

docker-compose up -d
```

#### 4. Configure Security Groups
- Inbound: 80 (HTTP), 443 (HTTPS), 22 (SSH)
- Outbound: All traffic

#### 5. Setup SSL with Let's Encrypt
```bash
sudo yum install certbot -y
sudo certbot certonly --standalone -d yourdomain.com
```

### Option 2: ECS Fargate

```bash
# Push images to ECR
aws ecr create-repository --repository-name financeai-backend
aws ecr create-repository --repository-name financeai-frontend

docker build -t financeai-backend ./backend
docker tag financeai-backend:latest <ECR_URI>/financeai-backend:latest
docker push <ECR_URI>/financeai-backend:latest

# Create ECS cluster and services via AWS Console or CloudFormation
```

---

## Google Cloud Platform

### Deploy with Cloud Run

1. **Build and push images**
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/financeai-backend ./backend
gcloud builds submit --tag gcr.io/PROJECT_ID/financeai-frontend ./frontend
```

2. **Create Cloud SQL instance**
```bash
gcloud sql instances create financeai-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1
```

3. **Deploy to Cloud Run**
```bash
gcloud run deploy financeai-backend \
  --image gcr.io/PROJECT_ID/financeai-backend \
  --platform managed \
  --region us-central1 \
  --add-cloudsql-instances PROJECT_ID:us-central1:financeai-db \
  --set-env-vars DB_HOST=/cloudsql/PROJECT_ID:us-central1:financeai-db

gcloud run deploy financeai-frontend \
  --image gcr.io/PROJECT_ID/financeai-frontend \
  --platform managed \
  --region us-central1
```

---

## Heroku Deployment

### Quick Deploy

1. **Create Heroku app**
```bash
heroku create financeai-app
heroku addons:create heroku-postgresql:hobby-dev
```

2. **Add Procfile**
Create `Procfile` in root:
```
web: cd backend && npm start
```

3. **Set environment variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set CORS_ORIGIN=https://financeai-app.herokuapp.com
```

4. **Deploy**
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

5. **Run migrations**
```bash
heroku run npm run migrate --app financeai-app
```

---

## DigitalOcean Deployment

### Option 1: App Platform

1. **Create app from GitHub**
- Connect your repository
- DigitalOcean auto-detects Dockerfile

2. **Add PostgreSQL database**
- Create managed PostgreSQL cluster
- Connect to your app

3. **Configure environment variables**
- Set all required variables in dashboard

4. **Deploy**
- Automatic deployment on git push

### Option 2: Droplet + Docker

1. **Create Droplet**
```bash
# SSH into droplet
ssh root@your-droplet-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

2. **Deploy application**
```bash
git clone https://github.com/Subhadeep-kumbhakar/dashboard_expense_tracker.git
cd dashboard_expense_tracker

# Configure .env
vim backend/.env

# Start services
docker-compose up -d
```

3. **Setup firewall**
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

## Production Checklist

### Security
- [ ] Use strong, unique JWT_SECRET
- [ ] Enable HTTPS/SSL certificates
- [ ] Set specific CORS_ORIGIN (not *)
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Use non-root database user
- [ ] Implement database backups

### Performance
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Configure database connection pooling
- [ ] Add Redis for caching (optional)
- [ ] Monitor application performance
- [ ] Set up log aggregation

### Monitoring
- [ ] Health check endpoints
- [ ] Error tracking (e.g., Sentry)
- [ ] Performance monitoring (e.g., New Relic)
- [ ] Database monitoring
- [ ] Set up alerts for downtime

### Database
- [ ] Run migrations
- [ ] Set up automated backups
- [ ] Configure backup retention
- [ ] Test restore procedures
- [ ] Enable point-in-time recovery

### Testing
- [ ] Test authentication flow
- [ ] Verify API endpoints
- [ ] Check CORS configuration
- [ ] Test on different devices
- [ ] Load testing
- [ ] Security testing

### Documentation
- [ ] Update README with deployment URL
- [ ] Document environment variables
- [ ] Create runbook for common issues
- [ ] Document backup/restore procedures

---

## Troubleshooting

### Database Connection Issues
```bash
# Check database connectivity
docker-compose exec backend node -e "require('./config/database').query('SELECT NOW()')"

# View logs
docker-compose logs postgres
```

### Application Not Starting
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Restart services
docker-compose restart
```

### Migration Failures
```bash
# Drop and recreate database (⚠️ DESTROYS DATA)
docker-compose exec postgres psql -U postgres -c "DROP DATABASE financeai_db;"
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE financeai_db;"
docker-compose exec backend npm run migrate
```

---

## Scaling

### Horizontal Scaling
- Use load balancer (Nginx, AWS ALB)
- Deploy multiple backend instances
- Use managed database with read replicas
- Implement session storage (Redis)

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Add indexes
- Implement caching

---

## Support

For deployment issues:
- Check logs: `docker-compose logs -f`
- GitHub Issues: https://github.com/Subhadeep-kumbhakar/dashboard_expense_tracker/issues
- Email support: [your-email]
