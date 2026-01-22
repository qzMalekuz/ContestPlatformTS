🏆 Contest Platform Backend

A Node.js + Express + PostgreSQL backend for a competitive programming contest platform.
This project is designed to strictly follow API contracts and pass automated test suites.

🚀 Tech Stack

Node.js

Express

TypeScript

PostgreSQL

Prisma v7.2

JWT (Authentication)

bcrypt (Password hashing)

Zod (Request validation)

📁 Project Structure
contest-platform/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── index.ts
│   ├── middleware/
│   │   └── auth.ts
│   ├── validators/
│   │   └── schemas.ts
│   └── routes/
│       ├── auth.ts
│       ├── contests.ts
│       └── problems.ts
├── .env
├── package.json
└── tsconfig.json

👥 User Roles

creator – Creates contests, MCQs, and DSA problems

contestee – Participates and submits solutions

If no role is provided during signup, the default role is contestee.

🔐 Authentication

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