-- CreateEnum
CREATE TYPE "Role" AS ENUM ('creator', 'contestee');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creator_id" TEXT NOT NULL,

    CONSTRAINT "Contest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "McqQuestions" (
    "id" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "options" JSONB,
    "correct_option_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contest_id" TEXT NOT NULL,

    CONSTRAINT "McqQuestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DsaProblems" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" JSONB,
    "points" INTEGER NOT NULL DEFAULT 100,
    "time_limit" INTEGER NOT NULL DEFAULT 2000,
    "memory_limit" INTEGER NOT NULL DEFAULT 256,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contest_id" TEXT NOT NULL,

    CONSTRAINT "DsaProblems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCases" (
    "id" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "expected_output" TEXT NOT NULL,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "problem_id" TEXT NOT NULL,

    CONSTRAINT "TestCases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "McqSubmission" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "selected_option_index" INTEGER NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "points_earned" INTEGER NOT NULL DEFAULT 0,
    "submitted_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "McqSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DsaSubmission" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "points_earned" INTEGER NOT NULL DEFAULT 0,
    "test_cases_passed" INTEGER NOT NULL DEFAULT 0,
    "total_test_cases" INTEGER NOT NULL DEFAULT 0,
    "execution_time" INTEGER NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "DsaSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "McqSubmission_user_id_question_id_key" ON "McqSubmission"("user_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "DsaSubmission_problem_id_user_id_key" ON "DsaSubmission"("problem_id", "user_id");

-- AddForeignKey
ALTER TABLE "Contest" ADD CONSTRAINT "Contest_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "McqQuestions" ADD CONSTRAINT "McqQuestions_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DsaProblems" ADD CONSTRAINT "DsaProblems_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCases" ADD CONSTRAINT "TestCases_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "DsaProblems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "McqSubmission" ADD CONSTRAINT "McqSubmission_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "McqQuestions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "McqSubmission" ADD CONSTRAINT "McqSubmission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DsaSubmission" ADD CONSTRAINT "DsaSubmission_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "DsaProblems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DsaSubmission" ADD CONSTRAINT "DsaSubmission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
