# SERPP API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication
All endpoints (except login) require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

## Error Handling
```json
{
  "success": false,
  "error": "Error message",
  "status": 400
}
```

---

## Authentication Endpoints

### 1. Login
```
POST /auth/login
Content-Type: application/json

Request:
{
  "email": "admin@university.edu",
  "password": "password"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@university.edu",
      "role": "ADMIN"
    }
  }
}
```

### 2. Validate Token
```
GET /auth/validate
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@university.edu",
    "role": "ADMIN"
  }
}
```

---

## Admin Endpoints

### 1. Get Dashboard Statistics
```
GET /admin/dashboard
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "totalStudents": 150,
    "totalTeachers": 25,
    "papersAssigned": 450,
    "papersEvaluated": 380,
    "pendingEvaluations": 70,
    "completionPercentage": 84.44
  }
}
```

### 2. Add Student
```
POST /admin/students
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "name": "John Doe",
  "email": "john@student.edu",
  "registerNumber": "REG001",
  "department": "Computer Science",
  "year": 3
}

Response:
{
  "success": true,
  "data": {
    "studentId": 101,
    "name": "John Doe",
    "registerNumber": "REG001",
    "department": "Computer Science",
    "year": 3
  }
}
```

### 3. Update Student
```
PUT /admin/students/{studentId}
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "department": "Information Technology",
  "year": 4
}

Response:
{
  "success": true,
  "message": "Student updated"
}
```

### 4. Delete Student
```
DELETE /admin/students/{studentId}
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Student deleted"
}
```

### 5. Assign Scripts to Teachers
```
POST /admin/scripts/assign
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "examId": 5,
  "assignments": {}
}

Response:
{
  "success": true,
  "data": [
    {
      "sheetId": 1,
      "randomCode": "S12345678",
      "subjectName": "Data Structures",
      "assignedTeacherId": 10,
      "teacherName": "Dr. Smith",
      "status": "PENDING"
    }
  ]
}
```

### 6. Publish Results
```
POST /admin/results/publish
Authorization: Bearer <token>
Parameters:
  examId: 5

Response:
{
  "success": true,
  "message": "Results published successfully"
}
```

### 7. Get Security Ledger
```
GET /admin/security-ledger
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "blockId": 1,
      "scriptId": "S12345678",
      "teacherId": 10,
      "marks": 85,
      "previousHash": "abc123...",
      "currentHash": "def456...",
      "timestamp": "2024-03-07T10:30:00",
      "isTampered": false
    }
  ]
}
```

---

## Teacher Endpoints

### 1. Get Dashboard Statistics
```
GET /teacher/dashboard
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "assignedScripts": 20,
    "evaluatedScripts": 15,
    "pendingScripts": 5,
    "evaluationPercentage": 75.0
  }
}
```

### 2. Get Assigned Scripts
```
GET /teacher/scripts
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "sheetId": 1,
      "randomCode": "S12345678",
      "subjectName": "Data Structures",
      "examId": 5,
      "status": "PENDING"
    }
  ]
}
```

### 3. Submit Marks
```
POST /teacher/marks/submit
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "sheetId": 1,
  "marks": 85,
  "maxMarks": 100
}

Response:
{
  "success": true,
  "data": {
    "markId": 101,
    "sheetId": 1,
    "marks": 85,
    "hash": "xyz789...",
    "timestamp": "2024-03-07T10:35:00"
  }
}
```

---

## Student Endpoints

### 1. Get Dashboard
```
GET /student/dashboard
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "name": "John Doe",
    "registerNumber": "REG001",
    "department": "Computer Science",
    "year": 3,
    "resultsPublished": true,
    "totalSubjects": 6
  }
}
```

### 2. Get Results
```
GET /student/results
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "resultId": 1,
      "subjectName": "Data Structures",
      "marks": 85,
      "maxMarks": 100,
      "grade": "A",
      "status": "PASS",
      "verificationCode": "XH92KJ8Q"
    }
  ]
}
```

### 3. Get Result with Verification
```
GET /student/results/{verificationCode}
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "resultId": 1,
    "studentName": "John Doe",
    "registerNumber": "REG001",
    "subjectName": "Data Structures",
    "marks": 85,
    "maxMarks": 100,
    "grade": "A",
    "status": "PASS",
    "verificationCode": "XH92KJ8Q"
  }
}
```

### 4. Get Profile
```
GET /student/profile
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "studentId": 101,
    "name": "John Doe",
    "email": "john@student.edu",
    "registerNumber": "REG001",
    "department": "Computer Science",
    "year": 3
  }
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Server Error - Internal error |

---

## Rate Limiting

- Login endpoint: 5 attempts per 15 minutes per IP
- Other endpoints: 100 requests per minute per user

---

## Pagination (where applicable)

```
Parameters:
  page: 0 (default)
  size: 20 (default)
  sort: field:asc|desc

Example:
GET /admin/students?page=0&size=20&sort=name:asc
```

---

## Filtering (where applicable)

```
Example:
GET /teacher/scripts?status=PENDING
GET /admin/security-ledger?teacherId=5
```

---

## Error Response Examples

### Invalid Credentials
```json
{
  "success": false,
  "error": "Invalid email or password",
  "status": 401
}
```

### Unauthorized Role
```json
{
  "success": false,
  "error": "Insufficient permissions for this action",
  "status": 403
}
```

### Validation Error
```json
{
  "success": false,
  "error": "Email is required",
  "status": 400,
  "field": "email"
}
```

---

## Token Format

JWT Token Structure:
```
Header.Payload.Signature
```

Token contains:
- User ID
- Email
- Role
- Expiration time (24 hours)

---

Last Updated: March 2024
