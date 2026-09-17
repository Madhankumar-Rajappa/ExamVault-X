# ExamVault-X

## Secure Cloud-Based Question Paper Management System

## 1. Project Overview

ExamVault-X is a secure, cloud-ready question paper management system developed using the MERN stack.

The system manages the complete lifecycle of examination question papers, including:

- Question paper upload
- Question paper review
- Approval and rejection
- Question paper scheduling
- Question paper release
- Secure question paper downloading
- User authentication
- Role-based access control
- Audit logging

The application supports four user roles:

- Administrator
- Question Setter
- Reviewer
- Student

ExamVault-X uses MongoDB Atlas as its cloud database service. The application follows a cloud-ready architecture and can be deployed using platforms such as AWS EC2, Render, Railway, Vercel, Netlify, or AWS Amplify.

---

## 2. Problem Statement

Traditional question paper management systems may involve manual file sharing, physical storage, and disconnected communication between question setters, reviewers, administrators, and students.

These methods may cause:

- Unauthorized access to question papers
- Difficulty in tracking question paper status
- Manual approval delays
- Duplicate files
- Lack of activity tracking
- Difficulty in managing question papers remotely

ExamVault-X provides a centralized application for managing question papers securely through authentication, role-based permissions, cloud database storage, and a controlled review workflow.

---

## 3. Objectives

The objectives of ExamVault-X are:

1. To provide a centralized question paper management system.
2. To use cloud-based database storage through MongoDB Atlas.
3. To provide separate access for different user roles.
4. To implement secure authentication using JWT.
5. To allow question setters to upload question papers.
6. To allow reviewers to approve or reject question papers.
7. To allow administrators to schedule and release question papers.
8. To allow students to access only released question papers.
9. To maintain audit logs for important activities.
10. To provide a cloud-ready application architecture.

---

## 4. Technologies and Tools Used

### Frontend Technologies

- React.js
- Vite
- JavaScript
- HTML5
- CSS3

### Backend Technologies

- Node.js
- Express.js
- REST API

### Database Technologies

- MongoDB
- MongoDB Atlas
- Mongoose

### Authentication and Security

- JSON Web Token
- bcrypt.js
- Role-Based Access Control
- Helmet
- CORS
- Express Rate Limiter
- Multer
- Environment Variables

### Development and Testing Tools

- Visual Studio Code
- Git
- GitHub
- Postman
- MongoDB Compass
- npm

---

## 5. Cloud Services Used

### MongoDB Atlas

MongoDB Atlas is used as the cloud-hosted database service for ExamVault-X.

The database stores:

- User information
- User roles
- Question paper details
- Question paper status
- Review information
- Scheduling information
- Release information
- Audit log records

The backend connects to MongoDB Atlas using the `MONGO_URI` environment variable.

Example:

```env
MONGO_URI=mongodb+srv://<username>:<password>@examvault-cluster.jcwdozp.mongodb.net/examvault


### MongoDB Atlas Configuration

The MongoDB Atlas setup includes:

- Creating a MongoDB Atlas account.
- Creating the `examvault-cluster` cluster.
- Creating a database user.
- Configuring network access.
- Creating the `examvault` database.
- Copying the MongoDB connection string.
- Adding the connection string to the backend `.env` file.

### File Upload and Validation

The uploaded files use uniquely generated server-side filenames based on:

- Current timestamp.
- Randomly generated characters.

This reduces the possibility of filename conflicts.

The application validates uploaded files using:

- PDF file extension.
- `application/pdf` MIME type.
- Maximum file size restriction.

Question paper metadata is stored in MongoDB Atlas. This includes:

- Original file name.
- Stored file path.
- Question paper title.
- Subject.
- Exam name.
- Question paper status.
- Uploader details.

### Cloud Storage Readiness

The file storage design is prepared for integration with cloud storage services such as:

- Amazon S3.
- Google Cloud Storage.
- Cloudinary.

### User Roles and Permissions

#### Administrator

The administrator can:

- Manage users.
- View question papers.
- Approve question papers.
- Schedule question papers.
- Release question papers.
- View audit logs.

#### Question Setter

The question setter can:

- Upload question papers.
- View uploaded question papers.
- Submit question papers for review.

#### Reviewer

The reviewer can:

- View question papers submitted for review.
- Approve question papers.
- Reject question papers.

#### Student

The student can:

- View released question papers.
- Download released question papers.

## 8. Main Features

- Role selection before login.
- Separate login pages for each role.
- JWT-based authentication.
- Backend role verification.
- Role-based dashboard redirection.
- Secure PDF upload.
- PDF file validation.
- Question paper status management.
- Review and approval workflow.
- Question paper rejection.
- Question paper scheduling.
- Question paper release.
- Secure question paper download.
- Audit logging.
- MongoDB Atlas database integration.
- Local MongoDB fallback.
- Cloud deployment readiness.

### 11. Installation Requirements

Install the following software before running the project:

- Node.js.
- npm.
- Git.
- Visual Studio Code.
- MongoDB Atlas account.
- MongoDB Compass.
- Postman.