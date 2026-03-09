# Secure Anonymous Examination Result Portal (SAERP)

SAERP is a fully secure, role-based examination result management system designed to eliminate bias through anonymous evaluation and preserve integrity using a blockchain-style hash chain.

## 🚀 Features

- **Anonymous Evaluation**: Teachers see only a random 8-character code, never the student's name or register number.
- **AES-256 Encryption**: The mapping between a student's true identity and their answer sheet code is strictly encrypted.
- **Tamper-Proof Results**: Every mark entry generates a SHA-256 hash block chained to the previous one (`result_chain` table). Any tampering instantly invalidates the chain.
- **4 Distinct Roles**: ADMIN, COE (Controller of Examinations), TEACHER, STUDENT.
- **Audit Logging**: Every single action in the system is logged with IP, timestamp, and user ID.
- **Rate Limiting**: Configured bucket4j login rate-limiting.
- **PDF Downloads**: Students can download beautifully formatted result cards.

## 🛠️ Technology Stack

- **Backend**: Java 17, Spring Boot 3.2, Spring Security (JWT), Spring Data JPA
- **Frontend**: React.js 18, Vite, Tailwind CSS, React Router v6, Axios
- **Database**: MySQL 8.0
- **Deployment**: Docker, Docker Compose, Nginx

---

## 🏗️ How to Run Locally

### Option 1: Docker (Recommended)

Make sure you have Docker and Docker Compose installed.

1. Clone the repository and navigate to the project root.
2. Run the deployment:
   ```bash
   docker-compose up --build -d
   ```
3. Wait about 30-60 seconds for MySQL to initialize and the Spring Boot backend to fully start.
4. Open the application in your browser: [http://localhost](http://localhost)

### Option 2: Manual Development Mode

You need: Java 17, Node.js 20+, MySQL.

**1. Database**
- Create a MySQL database named `saerp_db` with `root`/`root` credentials.
- The schema will auto-initialize on the first Spring Boot run.

**2. Backend**
```bash
cd backend
mvn spring-boot:run -Dspring.profiles.active=local
```
The backend will run on `http://localhost:8080/api/`.

**3. Frontend**
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5173/`.

---

## 🔐 Default Credentials

The system seeds the database automatically with these demo accounts. All passwords are `Admin@123`.

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@saerp.com | Admin@123 |
| **COE** | coe@saerp.com | Admin@123 |
| **Teacher** | teacher@saerp.com | Admin@123 |
| **Student** | student@saerp.com | Admin@123 |

## 🧪 Quick Test Flow

1. **Login as COE** (`coe@saerp.com`)
2. Navigate to **Exam Sessions**, create an exam session.
3. Click "Generate IDs" to generate anonymous AES-encrypted sheet IDs for all students.
4. Navigate to **Assign Teachers**, select the exam, and assign "Dr. John Teacher" to the sheets.
5. **Logout**, then **Login as Teacher** (`teacher@saerp.com`)
6. Navigate to **My Sheets**, observe you only see random codes.
7. Enter marks (e.g. 85) and submit. (This creates a SHA-256 hash block).
8. **Logout**, then **Login as COE** again.
9. Navigate to **Publish Results** and hit "Publish".
10. Navigate to **Result Chain** and click "Verify" to see the blockchain integrity status.
11. **Logout**, then **Login as Student** (`student@saerp.com`)
12. View the published results and download the PDF card.
