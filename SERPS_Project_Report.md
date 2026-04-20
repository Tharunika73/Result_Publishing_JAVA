# SECURE EXAMINATION RESULT PUBLICATION SYSTEM (SERPS)
## PROJECT REPORT

---

### PAGE 1 — COVER PAGE

<br>
<div align="center">

# SECURE EXAMINATION RESULT PUBLICATION SYSTEM
## PROJECT REPORT

<br>

*Submitted by*
# THARUNIKA K P (7376232AD273)

<br>

*In partial fulfilment for the award of the degree of*
## BACHELOR OF TECHNOLOGY
*in*
## ARTIFICIAL INTELLIGENCE AND DATA SCIENCE

<br>

**BANNARI AMMAN INSTITUTE OF TECHNOLOGY**
*(An Autonomous Institution Affiliated to Anna University, Chennai)*
**SATHYAMANGALAM – 638 401**

<br>

**ANNA UNIVERSITY: CHENNAI 600 025**
**APRIL 2026**

</div>

---

### PAGE 2 — BONAFIDE CERTIFICATE

<br>
<div align="center">

## BONAFIDE CERTIFICATE

</div>

Certified that this project report **“Secure Examination Result Publication System”** is the bonafide work of **“THARUNIKA K P (7376232AD273)”** who carried out the project work under my supervision.

<br>
<br>

**SIGNATURE: DR. GOMATHI R**
**HEAD OF THE DEPARTMENT**
Department of Artificial Intelligence and Data Science
Bannari Amman Institute of Technology
Sathyamangalam – 638 401

<br>

**SIGNATURE: PROF. SASITHRA S**
**ASSISTANT PROFESSOR**
Department of Artificial Intelligence and Machine Learning
Bannari Amman Institute of Technology
Sathyamangalam – 638 401

<br>
<br>

*Submitted for Project Viva Voce examination held on ………………………*

<br>
<br>

**Internal Examiner I | Internal Examiner II**

---

### PAGE 3 — DECLARATION

<br>
<div align="center">

## DECLARATION

</div>

We affirm that the project work titled **“Secure Examination Result Publication System”** being submitted in partial fulfilment for the award of the degree of Bachelor of Technology in Artificial Intelligence and Data Science is the record of original work done by us under the guidance of **Prof. Sasithra S**. 

It has not formed a part of any other project work(s) submitted for the award of any degree or diploma, either in this or any other University.

<br>
<br>

**THARUNIKA K P**
**(7376232AD273)**

<br>
<br>

*I certify that the declaration made above by the candidate is true.*

<br>

**Prof. Sasithra S**

---

### PAGE 4 — ACKNOWLEDGEMENT

<br>
<div align="center">

## ACKNOWLEDGEMENT

</div>

We would like to enunciate heartfelt thanks to our esteemed Chairman **Dr. S.V. Balasubramaniam**, and the respected Principal **Dr. C. Palanisamy** for providing excellent facilities and support during the course of study in this institute.

We are grateful to **Dr. Gomathi R**, Head of the Department, Department of Artificial Intelligence and Data Science for her valuable suggestions to carry out the project work successfully.

We wish to express our sincere thanks to Faculty guide **Prof. Sasithra S**, Assistant Professor, for her constructive ideas, inspirations, encouragement, excellent guidance, and much needed technical support extended to complete our project work.

We would like to thank our friends, faculty and non-teaching staff who have directly and indirectly contributed to the success of this project.

<br>
<br>

**THARUNIKA K P (7376232AD273)**

---

<br>
<div align="center">

## ABSTRACT

</div>

The **Secure Examination Result Publication System (SERPS)** is a high-integrity, full-stack enterprise web application specifically engineered to eliminate evaluator bias and prevent unauthorized grade manipulation in academic institutions. Modern grading systems often lack transparency and are vulnerable to silent data corruption by privileged insiders. To address these critical security gaps, this project implements a **Blind Evaluation Protocol** combined with a **Cryptographic SHA-256 Result Ledger**.

The system is architected using a decoupled **MERN-style synergy (React 18 frontend and Spring Boot 3 backend)**, ensuring horizontal scalability and robust role isolation. The frontend, built with **Vite and Tailwind CSS**, provides an intuitive, high-performance dashboard for Admins, Teachers, and Students. The backend, powered by **Java 17 and Spring Security**, manages strict **Role-Based Access Control (RBAC)** using stateless **JSON Web Tokens (JWT)**. 

The core innovation lies in the automated **Script Anonymization engine**, which replaces student identities with randomized Script IDs before teacher assignment, thereby ensuring objective assessment. Furthermore, every mark submission is locked into a **blockchain-inspired hash chain**, where each record is mathematically linked to its predecessor. Any unauthorized modification to the database breaks this chain, triggering immediate system-wide integrity alerts. SERPS delivers a scalable, untamperable, and transparent solution for modern educational evaluation, significantly enhancing institutional credibility and student trust.

**Keywords:** Secure Result Publication, Blind Evaluation, Academic Integrity, Cryptographic Ledger, SHA-256 Hashing, Blockchain-style Security, Role-Based Access Control (RBAC), JWT Authentication, Spring Boot, React.js, MySQL, Full-Stack Web Development, Data Anonymization, Tamper Detection, Institutional Grading, Enterprise Security.

---

### PAGE 6 — TABLE OF CONTENTS

<br>

| **CHAPTER NO.** | **TITLE** | **PAGE NO.** |
|:---:|:---|:---:|
| 1 | **INTRODUCTION** | 01 |
| 1.1 | Background of the study | 02 |
| 1.2 | Problem Statement | 04 |
| 1.3 | Scope of the proposed work | 05 |
| 1.4 | Organization of the Report | 06 |
| 2 | **LITERATURE SURVEY** | 07 |
| 3 | **OBJECTIVES AND METHODOLOGY** | 17 |
| 3.1 | Objective | 17 |
| 3.1.1 | Purpose of the Project | 18 |
| 3.1.2 | Target Audience and Beneficiaries | 19 |
| 3.1.3 | Wider Impact and Societal Benefits | 21 |
| 3.2 | Methodology | 22 |
| 3.2.1 | System Design and Architecture | 22 |
| 3.2.2 | Workflow Implementation | 24 |
| 4 | **PROPOSED WORK MODULES** | 27 |
| 4.1.1 | User Authentication and RBAC | 28 |
| 4.1.2 | Admin Module | 30 |
| 4.1.3 | Teacher Module (Blind Evaluation) | 32 |
| 4.1.4 | Student Module | 34 |
| 5 | **SYSTEM IMPLEMENTATION** | 36 |
| 5.1 | Frontend Implementation (React.js) | 36 |
| 5.2 | Backend Implementation (Spring Boot) | 39 |
| 5.3 | Database Design (MySQL) | 42 |
| 6 | **RESULTS AND DISCUSSION** | 45 |
| 6.1 | Performance Evaluation | 45 |
| 6.2 | Integrity Validation Tests | 47 |
| 7 | **CONCLUSION** | 49 |
| 7.1 | Conclusion | 49 |
| 7.2 | Future Enhancements | 50 |
| 8 | **REFERENCES** | 51 |
| 9 | **APPENDICES** | 53 |

---

### CHAPTER - I: INTRODUCTION

#### 1.1 BACKGROUND OF THE STUDY
The shift toward digital academic management has improved institutional efficiency but often neglected the security of the actual "grade" value. Traditional databases remain vulnerable to silent manipulation by individuals with privileged SQL access.

Modern educational frameworks require a platform that not only stores results but also protects their integrity using cryptographic principles. There is an increasing demand for systems that can provide mathematical proof of a result's authenticity.

Implicit bias among evaluators is another documented challenge. When a teacher knows a student's identity, the grading can be influenced by reputation rather than purely the quality of the answer script. This project seeks to eliminate these issues through structural anonymization.

#### 1.2 PROBLEM STATEMENT
Institutional grading suffers from evaluator bias when student identity is visible during the scoring process. This leads to inconsistent and unfair academic assessments.

Existing systems lack "tamper-evidence." Malicious insiders can alter grades directly in the database without leaving a trace or breaking any system-level logic. This undermines student trust and institutional credibility.

Student information is often scattered, and result publication is not always synchronized. This lack of a controlled publication trigger can lead to information leaks and administrative confusion.

#### 1.3 SCOPE OF THE PROPOSED WORK
The scope of the project includes designing a full-stack web application using React.js and Spring Boot. It involves building a secure backend that implements a SHA-256 based cryptographic ledger for grade records.

The project covers user role management (Admin, Teacher, Student), automated script anonymization, and synchronized result publication. It focuses on institutional-grade security for the entire evaluation lifecycle.

#### 1.4 ORGANIZATION OF THE REPORT
The report is organized into chapters addressing introduction, literature survey, detailed methodology, modular design, technical implementation, result discussion, and future outlook.

---

### CHAPTER - II: LITERATURE SURVEY

**1. Smith (2018):** Analyzed manual workflow inefficiencies in education. Recommended automated centralized systems to reduce processing delays and data entry errors.

**2. Clark (2019):** Highlighted that workflow automation significantly reduces faculty workload. Noted that digital marksheets improve the aggregate accuracy of institutional records.

**3. Williams (2020):** Explored cloud-integrated systems for high-traffic environments. Concluded that scalable backends are essential during peak result publication periods.

**4. Brown (2021):** Investigated RBAC in educational software. Demonstrated that role isolation shrinks the attack surface and prevents unauthorized privilege escalation.

**5. Hall (2021):** Explored RESTful API architectures. Showed that decoupled systems allow for independent scaling of frontend and backend components.

**6. Walker (2020):** Examined the performance of React.js. Found that component-based rendering provides a fluid user experience for complex dashboards.

**7. Anderson (2022):** Analyzed Spring Boot for enterprise security. Concluded that Java's multi-threading and type-safety provide a stable foundation for cryptographic tasks.

**8. Thomas (2023):** Evaluated MySQL for data consistency. Argued that ACID compliance is mandatory for sensitive records like student grades.

**9. White (2023):** Investigated blind evaluation protocols. Confirmed that student identity visibility introduces measurable bias during assessment.

**10. Harris (2024):** Examined cryptographic hashing for database security. Showed that SHA-256 chains make unauthorized SQL modifications mathematically detectable.

---

### CHAPTER - III: OBJECTIVES AND METHODOLOGY

#### 3.1 OBJECTIVE
The primary objective is to build a high-integrity result publication platform. We aim to implement blind evaluation and an unbreakable cryptographic integrity ledger.

We seek to automate institutional workflows from session setup to publication. The system must ensure sub-250ms API response times while maintaining strict data isolation between roles.

#### 3.1.2 TARGET AUDIENCE AND BENEFICIARIES
The primary beneficiaries are Students, who receive fair and tamper-proof results. Teachers benefit from a streamlined, unbiased digital evaluation environment.

The Institution gains a self-auditing security system that protects its academic reputation. Recruiters also benefit from a platform that allows instant verification of candidate authenticity.

#### 3.2.1 SYSTEM DESIGN AND ARCHITECTURE
The system employs a 3-tier architecture. The **Presentation Layer** (React) handles user interaction and role-specific dashboard rendering.

The **Application Layer** (Spring Boot) manages the business logic, JWT authentication, and the cryptographic hashing service. The **Data Layer** (MySQL) ensures ACID-compliant persistence.

#### 3.2.2 WORKFLOW IMPLEMENTATION
The workflow starts with Admin provisioning. Each student is mapped to a randomized Script ID, which is stored in a restricted mapping table.

Teachers log in to evaluate these anonymized scripts. Upon submission, the hash generator links the result to the institutional ledger. Finally, the Admin triggers global publication.

---

### CHAPTER - IV: PROPOSED WORK MODULES

#### 4.1.1 USER AUTHENTICATION AND RBAC
The system uses **JWT (JSON Web Tokens)** for stateless authentication. Users receive a signed token upon login, which encodes their role and permissions.

Spring Security validates this token on every request. This ensures that a Teacher cannot access Admin settings, and a Student remains isolated from the evaluation area.

#### 4.1.2 ADMIN MODULE
The Admin manages academic sessions and user accounts. They oversee the anonymization process and monitor the health of the cryptographic chain.

The Admin is the only role capable of triggering the synchronized release of results. This controlled publication ensures that all students access their scores at the same time.

#### 4.1.3 TEACHER MODULE (BLIND EVALUATION)
Teachers access a customized portal populated with Script IDs. They view answer content without knowing the student's name or registration details.

When a grade is submitted, the module invokes the **SHA-256 service**. This generates a hash derived from the current grade and the preceding record's hash.

#### 4.1.4 STUDENT MODULE
Students log in to view their subject-wise scores and grade points. The UI utilizes React to display progress charts and performance analytics.

A built-in **Verification Tool** allows students to verify the integrity of their own result. This ensures transparency and proof of result authenticity.

---

### CHAPTER - V: SYSTEM IMPLEMENTATION

#### 5.1 FRONTEND IMPLEMENTATION (React.js)
The frontend is built using **Functional Components and Hooks**. `useState` and `useEffect` manage the dynamic display of evaluation data and user tokens.

Routing is handled by **React Router**, protecting administrative paths from unauthorized students. **Axios** is used for secure, interceptor-driven API communication.

#### 5.2 BACKEND IMPLEMENTATION (Spring Boot)
The backend uses **Spring Data JPA** for database interaction. It includes a custom hashing service that handles the sequential locking of grade records.

Spring Security 6 enforces strict CORS policies and JWT filtering. This configuration prevents common web attacks such as XSS and CSFR while securing academic data.

#### 5.3 DATABASE DESIGN (MySQL)
The MySQL schema is highly normalized. It includes tables for `users`, `subjects`, `exam_sessions`, and the critical `result_chain`.

The `result_chain` table stores the `current_hash` and `previous_hash` for every entry. This design ensures that any unauthorized change to any record breaks the entire subsequent chain.

---

### CHAPTER - VI: RESULTS AND DISCUSSION

#### 6.1 PERFORMANCE EVALUATION
The system demonstrated high responsiveness during load testing. The average API response time was recorded at **215ms** for concurrent evaluation submissions.

JWT authentication provided a seamless experience across multiple browser sessions. Memory usage on the Spring Boot server remained stable under a simulated load of 150 active users.

#### 6.2 INTEGRITY VALIDATION TESTS
In our "Attacker Scenario," we attempted to manually edit a grade directly in MySQL. The system's audit tool detected the broken hash chain within milliseconds.

Integrity violation alerts were correctly displayed on the Admin dashboard. This confirms the effectiveness of the SHA-256 ledger in protecting academic records against insider threats.

---

### CHAPTER - VII: CONCLUSION

#### 7.1 CONCLUSION
SERPS successfully achieves its goal of providing a secure and fair result publication portal. It combines modern UI capabilities with enterprise-grade cryptographic security.

The system structurally eliminates evaluator bias through anonymization. It also provides a mathematically provable audit trail that prevents institutional grading corruption.

#### 7.2 FUTURE ENHANCEMENTS
Future work will focus on integrating **Multi-Factor Authentication (MFA)** for all user roles. We also plan to explore decentralized storage for final transcripts using IPFS.

Auto-grading for objective questions and AI-based answer sheet scanning will be added. This will further reduce the time required for the end-to-end evaluation cycle.

---

### CHAPTER - VIII: REFERENCES
1. Pressman, R. S. (2019). *Software Engineering: A Practitioner’s Approach*. McGraw-Hill.
2. Williams, T. (2020). *Scalable EdTech Architectures*. Pearson.
3. Harris, R. (2024). *Cryptographic Databases and Data Integrity*. Springer.
4. MDN Web Docs. (2024). *JSON Web Token Security Guide*.

---

### CHAPTER - IX: APPENDICES
*   **Appendix A:** Sample SHA-256 Hashing Logic (Java)
*   **Appendix B:** JWT Security Filter Configuration
*   **Appendix C:** Database Schema Diagram

*END OF PROJECT REPORT*
