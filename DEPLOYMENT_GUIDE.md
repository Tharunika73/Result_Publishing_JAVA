# SERPP Deployment Guide

## Pre-Deployment Checklist

- [ ] Java 17+ installed
- [ ] Node.js 16+ installed
- [ ] MySQL 5.7+ installed
- [ ] Git installed
- [ ] Environment variables configured
- [ ] SSL certificates obtained
- [ ] Email service configured
- [ ] CDN configured (optional)
- [ ] Backup strategy defined
- [ ] Monitoring setup completed

## Local Development Deployment

### 1. Clone Repository
```bash
git clone <repository-url>
cd miniproject
```

### 2. Backend Setup
```bash
cd backend

# Copy local properties
cp src/main/resources/application-local.properties.example \
   src/main/resources/application-local.properties

# Update database credentials
# Edit application-local.properties with your MySQL credentials

# Build
mvn clean package -DskipTests

# Run
java -Dspring.profiles.active=local -jar target/saerp-backend-1.0.0.jar
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Application available at http://localhost:5173
```

---

## Docker Deployment

### 1. Build Docker Images
```bash
# Build backend image
docker build -t serpp-backend:1.0.0 ./backend

# Build frontend image
docker build -t serpp-frontend:1.0.0 ./frontend
```

### 2. Update docker-compose.yml
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: serpp_mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/src/main/resources/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    networks:
      - serpp_net

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: serpp_backend
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_USERNAME=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_HOST=mysql
      - JWT_SECRET=${JWT_SECRET}
      - AES_SECRET=${AES_SECRET}
      - AES_IV=${AES_IV}
      - FRONTEND_URL=${FRONTEND_URL}
    ports:
      - "8080:8080"
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - serpp_net

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: serpp_frontend
    environment:
      - VITE_API_URL=http://backend:8080/api
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - serpp_net

  nginx:
    image: nginx:alpine
    container_name: serpp_nginx
    ports:
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - frontend
      - backend
    networks:
      - serpp_net

volumes:
  mysql_data:

networks:
  serpp_net:
    driver: bridge
```

### 3. Create .env File
```env
# Database Configuration
DB_ROOT_PASSWORD=secure_root_password
DB_NAME=serpp_db
DB_USER=serpp_user
DB_PASSWORD=secure_db_password

# JWT Configuration
JWT_SECRET=your-256-bit-secret-key-min-64-chars

# AES Encryption
AES_SECRET=your-32-char-secret-key
AES_IV=your-16-char-iv

# Application URLs
FRONTEND_URL=https://serpp.yourdomain.com
BACKEND_URL=https://serpp.yourdomain.com/api

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENABLED=true
```

### 4. Deploy with Docker Compose
```bash
# Create volumes and networks
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## Production Deployment (AWS)

### 1. Setup EC2 Instance
```bash
# Launch Ubuntu 22.04 LTS instance
# Configure security groups (allow 80, 443, 3306 if needed)

# Connect to instance
ssh -i key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y docker.io docker-compose mysql-client-core
sudo usermod -aG docker ubuntu
```

### 2. Setup RDS MySQL Database
```bash
# Create RDS instance
# Configure security group to allow EC2 access
# Get endpoint: your-db.xxx.rds.amazonaws.com

# Test connection
mysql -h your-db.xxx.rds.amazonaws.com -u serpp_user -p
```

### 3. Deploy Application
```bash
# Clone repository
git clone <repo-url>
cd miniproject

# Create .env with AWS RDS connection
cat > .env << EOF
DB_ROOT_PASSWORD=...
DB_HOST=your-db.xxx.rds.amazonaws.com
...
EOF

# Deploy
docker-compose up -d
```

### 4. Setup HTTPS with Let's Encrypt
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Create certificate
sudo certbot certonly --standalone \
  -d serpp.yourdomain.com \
  -d www.serpp.yourdomain.com

# Update nginx configuration
# Point to certificate files
```

---

## Kubernetes Deployment

### 1. Create Kubernetes Manifests

**backend-deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: serpp-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: serpp-backend
  template:
    metadata:
      labels:
        app: serpp-backend
    spec:
      containers:
      - name: backend
        image: serpp-backend:1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: DB_HOST
          value: mysql-service
        - name: SPRING_PROFILES_ACTIVE
          value: prod
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

**frontend-deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: serpp-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: serpp-frontend
  template:
    metadata:
      labels:
        app: serpp-frontend
    spec:
      containers:
      - name: frontend
        image: serpp-frontend:1.0.0
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "200m"
```

### 2. Deploy to Kubernetes
```bash
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml

# Create services
kubectl expose deployment serpp-backend --type=LoadBalancer
kubectl expose deployment serpp-frontend --type=LoadBalancer

# Check deployment
kubectl get pods
kubectl get services
```

---

## Environment Variables (Production)

| Variable | Description | Example |
|----------|-------------|---------|
| SPRING_PROFILES_ACTIVE | Active profile | prod |
| DB_HOST | Database host | db.example.com |
| DB_USER | Database user | serpp_user |
| DB_PASSWORD | Database password | secure_password |
| JWT_SECRET | JWT signing key | your-256-bit-key |
| AES_SECRET | AES encryption key | your-32-char-key |
| FRONTEND_URL | Frontend URL | https://serpp.com |
| MAIL_ENABLED | Enable email | true |
| MAIL_HOST | SMTP host | smtp.gmail.com |
| MAIL_USERNAME | Email address | noreply@example.com |
| MAIL_PASSWORD | Email password | app-password |

---

## Database Backup Strategy

### Automated Backup (MySQL)
```bash
# Create backup script
#!/bin/bash
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME | \
  gzip > /backups/serpp_$(date +%Y%m%d_%H%M%S).sql.gz

# Schedule with cron
0 2 * * * /path/to/backup.sh
```

### Backup to S3 (AWS)
```bash
# Upload to S3
aws s3 cp serpp_backup.sql.gz s3://serpp-backups/
```

---

## Monitoring & Logging

### Application Monitoring
```properties
# application.properties
logging.level.com.saerp=INFO
logging.file.name=/var/log/serpp/application.log
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %logger{36} - %msg%n
```

### System Monitoring
```bash
# Install monitoring tools
docker run -d -p 9090:9090 prometheus
docker run -d -p 3000:3000 grafana/grafana
```

---

## Performance Tuning

### MySQL Optimization
```sql
-- Add indexes
ALTER TABLE answer_sheet_ids ADD INDEX idx_status (status);
ALTER TABLE result_chain ADD INDEX idx_sheet_id (sheet_id);
ALTER TABLE results ADD INDEX idx_published_at (published_at);

-- Optimize queries
ANALYZE TABLE users;
ANALYZE TABLE results;
```

### Java Heap Optimization
```bash
# Set heap size
-Xmx2g -Xms1g

# Garbage collection
-XX:+UseG1GC -XX:MaxGCPauseMillis=200
```

---

## Security Hardening

### Update Secrets
- Change JWT secret to 256+ character random string
- Use strong database passwords
- Enable SSL/TLS
- Configure firewall rules
- Enable rate limiting
- Implement DDoS protection

### CORS Configuration
```properties
# Only allow trusted origins
cors.allowed-origins=https://serpp.yourdomain.com
```

---

## Rollback Procedure

### If Deployment Fails
```bash
# Docker
docker-compose down
docker system prune

# Kubernetes
kubectl rollout undo deployment/serpp-backend
kubectl rollout undo deployment/serpp-frontend
```

---

## Health Checks

### Verify Deployment
```bash
# Backend health
curl http://localhost:8080/api/health

# Frontend
curl http://localhost:80/

# Database
mysql -h localhost -u serpp_user -p -e "SELECT 1"
```

---

## Support

For deployment issues, consult the main README or contact the development team.

---

**Last Updated:** March 2024
