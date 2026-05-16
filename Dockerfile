# Multi-stage build for optimized production image

# Backend Stage
FROM node:18-alpine AS backend
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ ./

# Frontend Stage
FROM nginx:alpine AS frontend
COPY frontend/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf

# Final stage - combine backend and frontend
FROM node:18-alpine
WORKDIR /app

# Install nginx
RUN apk add --no-cache nginx

# Copy backend
COPY --from=backend /app/backend ./backend
WORKDIR /app/backend

# Copy frontend to nginx directory
COPY --from=frontend /usr/share/nginx/html /usr/share/nginx/html
COPY --from=frontend /etc/nginx/nginx.conf /etc/nginx/nginx.conf

# Expose ports
EXPOSE 5000 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start script
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
