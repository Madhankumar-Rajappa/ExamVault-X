# ExamVault-X – Secure Cloud-Based Question Paper Management System

![ExamVault-X System Architecture](https://img.shields.io/badge/Security-Production--Grade-blue) ![Stack](https://img.shields.io/badge/Stack-MERN--Vite-brightgreen) ![Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20Bcrypt-purple) ![License](https://img.shields.io/badge/License-Institutional-orange)

## 1. Project Overview & Problem Statement

In educational institutions, managing examination question papers requires rigorous secrecy, strict multi-level approvals, scheduled release controls, and comprehensive auditing. Traditional physical paper distribution or unencrypted email workflows expose institutions to question paper leaks, unauthorized access, and lack of accountability.

**ExamVault-X** is a secure, cloud-based question paper management platform designed to automate the entire question paper lifecycle. It provides end-to-end security, role-based authorization across four distinct institutional roles (**Admin**, **Question Setter**, **Reviewer**, **Student**), automated workflow state enforcement (**draft -> under_review -> approved/rejected -> scheduled -> released**), PDF file validation, secure stream downloading, and immutable security audit logs.

---

## 2. Key Objectives

- **Role-Based Security**: Restrict platform features and database APIs based on verified JWT identity and role claims.
- **Workflow State Management**: Enforce strict status transitions (`draft`, `under_review`, `approved`, `rejected`, `scheduled`, `released`).
- **PDF Upload & Validation**: Securely accept multipart PDF file uploads up to 5 MB with server-side unique filename generation and mime-type verification.
- **Controlled Publication**: Schedule future publication release dates and restrict student download access strictly to released papers.
- **Audit Traceability**: Log every critical system operation (registration, login, workflow state changes, role updates, account activation/deactivation, and file downloads) with IP address and user-agent metadata.
- **Responsive Dashboard**: Deliver role-tailored dashboards and analytics for administrators, question setters, reviewers, and students.

---

## 3. Technology Stack

### Backend
- **Core Runtime**: Node.js & Express.js
- **Database**: MongoDB Atlas via Mongoose ORM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs` (salt rounds: 12)
- **File Upload**: Multer (PDF validation, 5MB limit, server-side filename hashing)
- **Security Middleware**: Helmet, CORS, Express Rate Limiting (`express-rate-limit`)
- **Error Handling**: Centralized error middleware handling Multer errors, CastErrors, and ValidationErrors.

### Frontend
- **Framework**: React 19 + Vite 8
- **Routing**: React Router 7 (`react-router-dom`)
- **API Client**: Axios with request token injection interceptors and 401 unauthenticated session handlers
- **Icons**: Lucide React
- **Styling**: Vanilla CSS Design System with dark glassmorphism, responsive sidebar layout, stat cards, status badges, and modal dialogs.

---

## 4. Role-Permission Matrix

| Permission / Action | Admin | Question Setter | Reviewer | Student |
| :--- | :---: | :---: | :---: | :---: |
| Access Public Registration & Login | Yes | Yes | Yes | Yes |
| View Role-Tailored Dashboard | Yes | Yes | Yes | Yes |
| Upload New Question Paper (Draft) | Yes | Yes | No | No |
| Edit Own Draft / Rejected Paper | Yes | Yes | No | No |
| Submit Draft Paper for Review | Yes | Yes | No | No |
| Review & Approve / Reject Paper | Yes | No | Yes | No |
| Provide Review Comments / Feedback | Yes | No | Yes | No |
| Schedule Approved Paper Release Date | Yes | No | No | No |
| Manually Release Scheduled Paper | Yes | No | No | No |
| Search & Download Released PDFs | Yes | Yes | Yes | Yes |
| Download Non-Released Draft/Review PDFs | Yes | Yes (Own) | Yes (Assigned) | **NO (403 Blocked)** |
| Manage User Roles & Account Status | Yes | No | No | No |
| View System Audit Logs | Yes | No | No | No |

---

## 5. Question Paper Workflow

```
[ Upload PDF ] ---> status: "draft"
                         |
                         v (Setter / Admin submits for review)
                   status: "under_review"
                         |
             +-----------+-----------+
             |                       |
             v (Reviewer Approve)    v (Reviewer Reject + Feedback)
       status: "approved"      status: "rejected"
             |                       |
             v                       +---> (Setter re-edits & resubmits)
(Admin sets Release Date)
       status: "scheduled"
             |
             v (Release date arrives or Admin triggers release)
       status: "released"
             |
             +---> (Students search & download PDF)
```

---

## 6. Database Schema Explanation

### User Schema (`User.js`)
- `name`: String (required, min 2 chars)
- `email`: String (required, unique, lowercase, indexed)
- `password`: String (required, hashed via bcrypt, hidden by default `select: false`)
- `role`: Enum (`"admin"`, `"question_setter"`, `"reviewer"`, `"student"`, default: `"student"`)
- `isActive`: Boolean (default: `true`, indexed)
- `timestamps`: `createdAt`, `updatedAt`

### Question Paper Schema (`QuestionPaper.js`)
- `title`: String (required, max 200 chars)
- `subject`: String (required, indexed)
- `examName`: String (required, indexed)
- `examDate`: Date (required)
- `description`: String
- `fileName`: String (server generated unique filename)
- `filePath`: String (relative secure filesystem path)
- `status`: Enum (`"draft"`, `"under_review"`, `"approved"`, `"scheduled"`, `"released"`, `"rejected"`, indexed)
- `uploadedBy`: ObjectId ref `User` (required, indexed)
- `reviewedBy`: ObjectId ref `User` (default: null)
- `reviewComment`: String (reviewer feedback on approve/reject)
- `releaseDate`: Date (default: null)
- `isDeleted`: Boolean (default: false, soft deletion, indexed)
- `timestamps`: `createdAt`, `updatedAt`

### Audit Log Schema (`AuditLog.js`)
- `user`: ObjectId ref `User` (required, indexed)
- `action`: String (e.g. `USER_LOGIN`, `QUESTION_PAPER_CREATED`, `QUESTION_PAPER_APPROVED`, `QUESTION_PAPER_RELEASED`, `QUESTION_PAPER_DOWNLOADED`)
- `resourceType`: Enum (`"User"`, `"QuestionPaper"`, `"System"`)
- `resourceId`: ObjectId (default: null)
- `ipAddress`: String
- `userAgent`: String
- `details`: String
- `timestamps`: `createdAt` (indexed descending)

---

## 7. REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new student account.
- `POST /api/auth/login` - Authenticate user and return JWT token.
- `GET  /api/auth/me` - Get current authenticated user profile (`protect` required).

### Question Papers (`/api/question-papers`)
- `POST   /api/question-papers` - Upload new paper as PDF (`admin`, `question_setter`).
- `GET    /api/question-papers` - Get paper list with pagination & filters (`status`, `subject`, `examName`, `search`).
- `GET    /api/question-papers/:id` - Get single paper details.
- `PATCH  /api/question-papers/:id` - Edit draft/rejected paper details & replace file (`admin`, `question_setter`).
- `DELETE /api/question-papers/:id` - Soft delete question paper (`admin`, `question_setter`).
- `PATCH  /api/question-papers/:id/submit-review` - Submit draft paper for review (`admin`, `question_setter`).
- `PATCH  /api/question-papers/:id/approve` - Approve paper under review with feedback (`admin`, `reviewer`).
- `PATCH  /api/question-papers/:id/reject` - Reject paper under review with reason (`admin`, `reviewer`).
- `PATCH  /api/question-papers/:id/schedule` - Schedule release time for approved paper (`admin`).
- `PATCH  /api/question-papers/:id/release` - Publish scheduled paper immediately (`admin`).
- `GET    /api/question-papers/:id/download` - Stream PDF paper download (Students restricted to `released` papers only).

### User Management (`/api/users`)
- `GET   /api/users` - List all users with pagination, role filter, and search (`admin`).
- `GET   /api/users/:id` - Get user details (`admin`).
- `PATCH /api/users/:id/status` - Activate or deactivate user account (`admin`).
- `PATCH /api/users/:id/role` - Update user role (`admin`).

### Audit Logs (`/api/audit-logs`)
- `GET /api/audit-logs` - Query security audit trail with pagination and event filters (`admin`).
- `GET /api/audit-logs/:id` - Inspect single audit log entry (`admin`).

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard/summary` - Role-tailored summary stats (`admin`, `question_setter`, `reviewer`, `student`).
- `GET /api/dashboard/question-paper-statistics` - Aggregate workflow & subject breakdown (`admin`).
- `GET /api/dashboard/user-statistics` - User role & account status breakdown (`admin`).

---

## 8. Installation & Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- MongoDB Atlas cluster or local MongoDB instance

### Step 1: Clone Repository & Install Dependencies

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### Step 2: Environment Configuration

Create `.env` file in the `server` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/examvault?retryWrites=true&w=majority
JWT_SECRET=your_long_secure_random_jwt_secret_key_2026
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
```

Create `.env` file in the `client` directory (optional):

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Run Development Servers

```bash
# Terminal 1: Run Backend Express Server
cd server
npm run dev

# Terminal 2: Run Frontend Vite Dev Server
cd client
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 9. Verification & Testing

### Automated E2E Verification
To execute the automated end-to-end test suite verifying database connection, user seeding, paper creation, state transitions, audit logging, and student access enforcement:

```bash
cd server
node test_runner.js
```

### Production Build Verification
To verify the frontend React bundle compilation:

```bash
cd client
npm run build
```

---

## 10. Future Enhancements

1. **Digital Signatures & Watermarking**: Embed dynamic student watermark (student email & timestamp) onto downloaded PDFs to prevent unauthorized copying.
2. **AI Syllabus Alignment Checker**: Use LLM analysis to score uploaded draft question papers against institutional syllabus rubrics before reviewer submission.
3. **Multi-Factor Authentication (MFA)**: Integrate TOTP multi-factor authentication for Admin and Reviewer accounts.
