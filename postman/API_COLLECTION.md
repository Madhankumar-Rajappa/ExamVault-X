# ExamVault-X API Documentation & Postman Guide

This directory contains the Postman Collection JSON (`ExamVault-X.postman_collection.json`) for testing the ExamVault-X REST APIs.

## How to Import into Postman

1. Open Postman.
2. Click **Import** in the top left.
3. Select `postman/ExamVault-X.postman_collection.json`.
4. Set the Postman Environment variable `base_url` to `http://localhost:5000`.
5. Upon logging in via `POST /api/auth/login`, copy the returned JWT `token` into the `auth_token` environment variable.

---

## Endpoint Reference Summary

### 1. Authentication
- `POST /api/auth/register` - Public student registration.
- `POST /api/auth/login` - Authenticate user & return JWT token.
- `GET  /api/auth/me` - Fetch profile of current logged-in user.

### 2. Question Papers Workflow
- `POST   /api/question-papers` - Upload PDF question paper (`draft` status).
- `GET    /api/question-papers` - Query question papers with pagination & filters.
- `GET    /api/question-papers/:id` - Fetch single paper metadata.
- `PATCH  /api/question-papers/:id` - Update draft or re-edit rejected paper details.
- `DELETE /api/question-papers/:id` - Soft delete paper.
- `PATCH  /api/question-papers/:id/submit-review` - Transition `draft` -> `under_review`.
- `PATCH  /api/question-papers/:id/approve` - Transition `under_review` -> `approved` with feedback.
- `PATCH  /api/question-papers/:id/reject` - Transition `under_review` -> `rejected` with reason.
- `PATCH  /api/question-papers/:id/schedule` - Transition `approved` -> `scheduled` with future `releaseDate`.
- `PATCH  /api/question-papers/:id/release` - Transition `scheduled` -> `released`.
- `GET    /api/question-papers/:id/download` - Stream PDF download (Students blocked if not `released`).

### 3. User & Role Management
- `GET   /api/users` - Admin list all users.
- `PATCH /api/users/:id/status` - Admin toggle user `isActive` status.
- `PATCH /api/users/:id/role` - Admin update user role.

### 4. Audit Logs & Dashboard
- `GET /api/audit-logs` - Query security audit trail.
- `GET /api/audit-logs/:id` - Inspect single audit log entry.
- `GET /api/dashboard/summary` - Role-tailored summary stats.
- `GET /api/dashboard/question-paper-statistics` - Aggregate workflow & subject metrics.
- `GET /api/dashboard/user-statistics` - Aggregate user role & status metrics.
