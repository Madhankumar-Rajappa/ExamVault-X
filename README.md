# ExamVault-X

## 1. Project Title

**ExamVault-X – Secure Cloud-Based Question Paper Management System**

## 2. Project Description

ExamVault-X is a secure question paper management system designed to manage the complete lifecycle of examination question papers.

The system allows administrators, question setters, reviewers, and students to perform different activities based on their assigned roles. Question setters can upload question papers, reviewers can verify and approve or reject them, administrators can manage and schedule question papers, and students can view and download released question papers.

The application provides secure authentication, role-based access control, PDF validation, question paper status management, review and approval workflows, scheduling, release management, and audit logging.

## 3. Technologies and Tools Used

### Backend Technologies

* Node.js
* Express.js
* MongoDB
* Mongoose
* JSON Web Token (JWT)
* Multer
* CORS
* Express Rate Limiter
* Environment Variables

### Database and Cloud Services

* MongoDB Atlas
* MongoDB Compass
* Local MongoDB fallback

### Development and Testing Tools

* Visual Studio Code
* Git
* GitHub
* Postman
* npm

## 4. Technologies and Tools Explanation

### Node.js

Node.js is used to execute JavaScript code on the server side. It provides the runtime environment for the backend application.

### Express.js

Express.js is used to create the backend server, API routes, middleware, authentication logic, and request-response handling.

### MongoDB

MongoDB is a NoSQL database used to store question paper metadata, user details, roles, statuses, and other application information.

### Mongoose

Mongoose is used to define MongoDB schemas and interact with the database using models.

### JWT Authentication

JSON Web Tokens are used to authenticate users and maintain secure user sessions.

### Multer

Multer is used to handle PDF file uploads from users.

### CORS

CORS allows the frontend and backend applications to communicate securely when they run on different origins.

### Express Rate Limiter

Express Rate Limiter restricts the number of requests from a user within a specific time period. This helps reduce excessive requests and improves application security.

### Environment Variables

Environment variables are used to store sensitive configuration values such as database connection strings, JWT secrets, and port numbers.

## 5. Installation and Running the Project

### 5.1 Prerequisites

Install the following software before running the project:

* Node.js
* npm
* Git
* Visual Studio Code
* MongoDB Atlas account
* MongoDB Compass
* Postman

### 5.2 Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ExamVault-X.git
```

Move into the project directory:

```bash
cd ExamVault-X
```

### 5.3 Install Dependencies

Install the required Node.js packages:

```bash
npm install
```

### 5.4 Configure Environment Variables

Create a `.env` file in the backend or project root directory and add the required configuration values.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Use the actual environment variable names required by the project.

### 5.5 Start the Application

Run the backend server using:

```bash
npm start
```

If the project uses a development script, run:

```bash
npm run dev
```

The application will be available at the URL shown in the terminal, such as:

```text
http://localhost:5000
```

### 5.6 Test the APIs

The APIs can be tested using Postman.

The testing process includes:

* User registration
* User login
* JWT token generation
* Role-based access verification
* PDF upload
* Question paper approval
* Question paper rejection
* Question paper scheduling
* Question paper release
* Question paper download

## 6. Cloud Services Used

### 6.1 MongoDB Atlas

MongoDB Atlas is the cloud database service used by ExamVault-X.

The MongoDB Atlas setup includes:

* Creating a MongoDB Atlas account.
* Creating the `examvault-cluster` cluster.
* Creating a database user.
* Configuring network access.
* Creating the `examvault` database.
* Copying the MongoDB connection string.
* Adding the connection string to the backend `.env` file.

MongoDB Atlas stores question paper metadata such as:

* Original file name
* Stored file path
* Question paper title
* Subject
* Exam name
* Question paper status
* Uploader details

### 6.2 Local MongoDB Fallback

The application can also use a local MongoDB database for development and testing when MongoDB Atlas is not available.

### 6.3 Cloud Storage Readiness

The file storage design is prepared for future integration with cloud storage services such as:

* Amazon S3
* Google Cloud Storage
* Cloudinary

These services are considered for future file-storage expansion. They are not currently used as the primary file-storage service.

## 7. How the Project Works and Is Implemented

### Step 1: User Registration and Login

Users register or log in by selecting their assigned role.

The system verifies the login credentials and generates a JWT token after successful authentication.

### Step 2: Role Verification

The backend verifies the JWT token and checks the role of the logged-in user.

Only authorized users can access role-specific routes and operations.

### Step 3: Role-Based Dashboard

After login, the user is redirected to a dashboard based on their role.

The available roles are:

* Administrator
* Question Setter
* Reviewer
* Student

### Step 4: Question Paper Upload

The question setter uploads a question paper in PDF format.

The application validates the uploaded file using:

* PDF file extension
* `application/pdf` MIME type
* Maximum file size restriction

### Step 5: File Naming and Storage

The uploaded files use uniquely generated server-side filenames based on:

* Current timestamp
* Randomly generated characters

This reduces the possibility of filename conflicts.

### Step 6: Metadata Storage

The question paper metadata is stored in MongoDB Atlas.

The metadata includes the title, subject, exam name, file name, file path, uploader details, and current status.

### Step 7: Review and Approval

The reviewer views question papers submitted for review.

The reviewer can:

* Approve a question paper
* Reject a question paper

Rejected question papers can be reviewed and corrected by the question setter.

### Step 8: Scheduling and Release

The administrator can schedule approved question papers for a particular examination.

The question paper is released according to the configured schedule.

### Step 9: Student Access

Students can view and download question papers that have been officially released.

Students cannot access question papers that are still under review, rejected, or not yet released.

### Step 10: Audit Logging

Important activities such as uploads, approvals, rejections, scheduling, releases, and downloads can be recorded through audit logs.

These logs help administrators track important actions performed in the system.

## 8. Project Structure and Modules

```text
ExamVault-X/
│
├── backend/
│   ├── config/
│   │   └── database configuration
│   │
│   ├── controllers/
│   │   └── request-handling logic
│   │
│   ├── middleware/
│   │   ├── authentication middleware
│   │   ├── role verification middleware
│   │   └── file validation middleware
│   │
│   ├── models/
│   │   ├── user model
│   │   ├── question paper model
│   │   └── audit log model
│   │
│   ├── routes/
│   │   ├── authentication routes
│   │   ├── user routes
│   │   ├── question paper routes
│   │   └── administration routes
│   │
│   ├── uploads/
│   │   └── uploaded PDF files
│   │
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── package.json
│
├── .gitignore
├── README.md
└── package.json
```

### Module Purposes

#### Authentication Module

* User registration
* User login
* Password verification
* JWT token generation
* Authentication validation

#### User and Role Management Module

* Manage users
* Assign user roles
* Verify user permissions
* Redirect users to role-specific dashboards

#### Question Paper Management Module

* Upload question papers
* Validate PDF files
* Store question paper metadata
* View uploaded question papers
* Download question papers

#### Review and Approval Module

* Display question papers submitted for review
* Approve question papers
* Reject question papers
* Update question paper status

#### Scheduling and Release Module

* Schedule approved question papers
* Release question papers
* Control student access based on release status

#### Audit Logging Module

* Record important user activities
* Track uploads, approvals, rejections, scheduling, releases, and downloads
* Support administrative monitoring

## 9. User Roles and Permissions

### Administrator

The administrator can:

* Manage users
* View question papers
* Approve question papers
* Schedule question papers
* Release question papers
* View audit logs

### Question Setter

The question setter can:

* Upload question papers
* View uploaded question papers
* Submit question papers for review

### Reviewer

The reviewer can:

* View question papers submitted for review
* Approve question papers
* Reject question papers

### Student

The student can:

* View released question papers
* Download released question papers

## 10. Sample Input and Output

### 10.1 Sample Login Input

```json
{
  "email": "student@example.com",
  "password": "Student@123",
  "role": "student"
}
```

### Sample Login Output

```json
{
  "message": "Login successful",
  "token": "generated_jwt_token",
  "role": "student"
}
```

### 10.2 Sample Question Paper Upload Input

```text
Title: Data Structures and Algorithms
Subject: Data Structures
Exam Name: Internal Assessment 1
File: dsa_question_paper.pdf
```

### Sample Upload Output

```json
{
  "message": "Question paper uploaded successfully",
  "status": "Pending Review",
  "fileName": "generated_unique_file_name.pdf"
}
```

### 10.3 Sample Approval Output

```json
{
  "message": "Question paper approved successfully",
  "status": "Approved"
}
```

### 10.4 Sample Rejection Output

```json
{
  "message": "Question paper rejected",
  "status": "Rejected",
  "reason": "Incorrect question paper format"
}
```

### 10.5 Sample Student Output

```json
{
  "title": "Data Structures and Algorithms",
  "subject": "Data Structures",
  "examName": "Internal Assessment 1",
  "status": "Released",
  "downloadAvailable": true
}
```

## 11. Main Features

* Role selection before login
* Separate login pages for each role
* JWT-based authentication
* Backend role verification
* Role-based dashboard redirection
* Secure PDF upload
* PDF file validation
* Unique server-side file naming
* Question paper metadata management
* Question paper status management
* Review and approval workflow
* Question paper rejection
* Question paper scheduling
* Question paper release
* Secure question paper download
* Audit logging
* MongoDB Atlas database integration
* Local MongoDB fallback
* Cloud deployment readiness

## 12. Security Features

* JWT-based authentication
* Role-based authorization
* Protected backend routes
* PDF file validation
* Maximum file size restriction
* Environment variable protection
* Request rate limiting
* CORS configuration
* Controlled question paper access
* Audit logging for important activities
