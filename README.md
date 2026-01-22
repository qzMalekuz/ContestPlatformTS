# 🏆 Contest Platform

A robust full-featured backend for hosting competitive programming contests with MCQ and DSA challenges. Built with modern technologies for reliability, performance, and scalability.

## ✨ Features

- **Dual Challenge Types**: Support for MCQ (Multiple Choice) and DSA (Data Structures & Algorithms) problems
- **Secure Authentication**: JWT-based stateless authentication with role-based access control
- **Contest Management**: Create, manage, and track contests with multiple problems
- **Submission Tracking**: Monitor user submissions, scores, and test case results
- **Test Case Validation**: Custom test cases with hidden/visible options for DSA problems
- **Password Security**: Industry-standard bcrypt password hashing

## 🚀 Tech Stack

### Runtime & Framework
- **Bun** - High-performance JavaScript runtime with built-in support for TypeScript
- **Express.js** - Fast, minimal web framework for Node.js
- **TypeScript** - Type-safe JavaScript for robust development

### Database & ORM
- **PostgreSQL** - Powerful relational database
- **Prisma v7.2** - Modern ORM with type-safe database access
- **Prisma Adapter for PostgreSQL** - Optimized PostgreSQL connection adapter

### Authentication & Security
- **JWT (JSON Web Tokens)** - Secure stateless authentication mechanism
- **bcrypt** - Password hashing with salt rounds for enhanced security
- **Custom Auth Middleware** - Request-level authentication validation

### Validation & Type Safety
- **Zod** - TypeScript-first schema validation for all API inputs
- **TypeScript Types** - Strict type definitions for Express requests/responses

### Configuration
- **Dotenv** - Secure environment variable management

## 📁 Project Structure

```
src/
├── index.ts                 # Application entry point
├── routes/
│   ├── auth.ts             # Authentication endpoints
│   ├── contests.ts         # Contest management
│   └── problems.ts         # Problem & submission handling
├── middleware/
│   └── authMiddleware.ts    # JWT authentication
├── validators/
│   └── schemas.ts          # Zod validation schemas
├── lib/
│   └── prisma.ts           # Prisma client setup
└── generated/prisma/       # Auto-generated Prisma types

prisma/
├── schema.prisma           # Database schema
└── migrations/             # Migration history
```

## 👥 User Roles

- **creator** – Creates and manages contests, MCQs, and DSA problems
- **contestee** – Participates in contests and submits solutions
- **Default Role**: contestee (assigned if no role specified during signup)

## 🔐 Authentication

JWT-based authentication

Authorization: Bearer <JWT_TOKEN> required for all APIs except signup/login

Invalid, missing, or malformed tokens return UNAUTHORIZED

🧠 Core Features

Create contests with start/end time validation

Add MCQ and DSA problems to contests

MCQ submissions allowed once per user

DSA allows multiple submissions (best score counted)

Submissions allowed only during contest time

Creators cannot submit to their own contests

Hidden test cases are never exposed

Leaderboard with correct ranking and tie handling

📦 Response Format (Strict)
Success
{
  "success": true,
  "data": {},
  "error": null
}

Error
{
  "success": false,
  "data": null,
  "error": "ERROR_CODE"
}


❗ No extra keys, nested errors, or objects are allowed.

⚙️ Setup Instructions

Install dependencies

npm install


Create .env

DATABASE_URL=postgresql://user:password@localhost:5432/contestdb
JWT_SECRET=your_secret_key


Run Prisma

npx prisma migrate dev
npx prisma generate


Start server

npm run dev


Server runs on http://localhost:3000

🧪 Testing

This backend is built to pass automated HTTP test cases with:

Exact status codes

Exact error strings

ISO-8601 timestamps

Deterministic DSA evaluation (mocked)

✅ Notes

DSA code execution is mocked for deterministic testing

Leaderboard uses MCQ sum + best DSA scores

Designed for clarity, correctness, and test compliance

Happy Coding 🚀