# SERPP Quick Start Guide

Get SERPP running in 5 minutes!

## 1. Prerequisites Check

```bash
# Check Java version
java -version
# Should be 17 or higher

# Check Node version
node -v
# Should be 16 or higher

# Check MySQL
mysql --version
# Should be 5.7 or higher
```

## 2. Quick Setup (Fastest Path)

### Option A: Using Existing Project

If you already have the miniproject running:

```bash
# Terminal 1: Backend
cd backend
java -Dspring.profiles.active=local -jar target/saerp-backend-1.0.0.jar

# Terminal 2: Frontend
cd frontend
npm run dev
```

🎉 **Done!** Visit `http://localhost:5173`

### Option B: Fresh Setup (5 minutes)

```bash
# 1. Create MySQL Database
mysql -u root -p1978 -e "CREATE DATABASE IF NOT EXISTS saerp_db;"

# 2. Build Backend
cd backend
mvn clean package -DskipTests

# 3. Start Backend (Terminal 1)
java -Dspring.profiles.active=local -jar target/saerp-backend-1.0.0.jar

# 4. Start Frontend (Terminal 2)
cd frontend
npm install
npm run dev
```

## 3. Test Login

Open `http://localhost:5173` in your browser

**Admin Login:**
- Email: `admin@university.edu`
- Password: `password`

**Teacher Login:**
- Email: `teacher@university.edu`
- Password: `password`

**Student Login:**
- Email: `student@university.edu`
- Password: `password`

## 4. Common Issues & Fixes

### MySQL Connection Failed
```bash
# Check if MySQL is running on port 3307
netstat -ano | findstr ":3307"

# Verify credentials in application-local.properties
# Should be:
# spring.datasource.username=root
# spring.datasource.password=1978
```

### Port Already in Use
```bash
# Backend (8080)
netstat -ano | findstr ":8080"
# Kill process: taskkill /PID <pid> /F

# Frontend (5173)
# Kill process: taskkill /PID <pid> /F
```

### Node Modules Issue
```bash
# Clear and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 5. First Time Setup Steps

1. **Login as Admin**
   - Navigate to Admin Dashboard
   - See overview statistics

2. **Create Students** (Optional)
   - Click "Add Student" in Admin panel
   - Fill in details and save

3. **Create Teachers** (Optional)
   - Add teacher records
   - Assign subjects

4. **View as Teacher**
   - Logout and login as teacher
   - See assigned scripts
   - Submit marks

5. **View Results as Student**
   - Logout and login as student
   - View published results
   - Check grades

## 6. Database Management

### View Database
```bash
# Connect to MySQL
mysql -u root -p1978

# Use database
USE saerp_db;

# View tables
SHOW TABLES;

# Backup database
mysqldump -u root -p1978 saerp_db > backup.sql

# Restore database
mysql -u root -p1978 saerp_db < backup.sql
```

## 7. Common Workflows

### As Admin
1. Dashboard → View statistics
2. Students → Add/Edit/Delete students
3. Scripts → Assign scripts to teachers
4. Results → Map results to students
5. Ledger → Monitor security

### As Teacher
1. Dashboard → Check assignments
2. Scripts → View assigned scripts
3. Evaluate → Enter marks for each script
4. Done → Marks automatically saved and hashed

### As Student
1. Dashboard → View profile
2. Results → View grades after publication
3. Verify → Use verification code if needed

## 8. Environment Variables

For local development, these are pre-configured. For production, update:

```env
# application-local.properties
spring.datasource.url=jdbc:mysql://localhost:3307/saerp_db
spring.datasource.username=root
spring.datasource.password=1978
jwt.secret=your-secret-key
```

## 9. Useful Commands

```bash
# Build everything
mvn clean package -DskipTests

# Run all tests
mvn test

# Start only backend
java -jar target/saerp-backend-1.0.0.jar

# Frontend dev with hot reload
npm run dev

# Build frontend for production
npm run build

# View logs
# Backend: Check console output
# Frontend: Check browser console (F12)

# Clear cache
# Browser: Ctrl+Shift+Delete
# Terminal: npm cache clean --force
```

## 10. Features to Try

### Authentication
- ✅ Login with different roles
- ✅ Automatic redirects
- ✅ Logout functionality

### Admin Features
- ✅ Dashboard analytics
- ✅ Student management
- ✅ Teacher assignments
- ✅ Script allocation
- ✅ Result publication
- ✅ Security ledger

### Teacher Features
- ✅ View assigned scripts (anonymous)
- ✅ Submit marks
- ✅ Track completion

### Student Features
- ✅ View results
- ✅ Check grades
- ✅ Verification codes

## 11. Next Steps

### Learn More
- Read [README_SERPP.md](README_SERPP.md) for full documentation
- Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API details
- See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for production deployment

### Customize
- Update colors in Tailwind config
- Add your university logo
- Customize email templates
- Configure your domain

### Deploy
- Follow deployment guide for production
- Set up HTTPS/SSL
- Configure database backups
- Set up monitoring

## 12. Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Blank login page | Clear browser cache (Ctrl+Shift+Delete) |
| 404 errors on API calls | Check backend is running on 8080 |
| Dashboard not loading | Check browser console for errors (F12) |
| Marks not submitting | Verify JWT token in localStorage |
| Results not visible | Check Publish Results in Admin panel |

## 13. Support

**Still stuck?**
1. Check the [README_SERPP.md](README_SERPP.md)
2. Review the [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
3. Check browser console for errors (F12)
4. Check backend logs in terminal

## 14. One-Liner Startup

```bash
# If everything is already built:
cd backend && java -Dspring.profiles.active=local -jar target/saerp-backend-1.0.0.jar & cd ../frontend && npm run dev
```

---

## Welcome to SERPP! 🎓

You're officially set up and ready to manage exam results securely!

For questions, check the documentation or contact the development team.

**Happy evaluating!**

---

**SERPP v1.0.0**
Secure Examination Result Publication Portal
