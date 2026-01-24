import { z } from 'zod';

const SignupSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string(),
  role: z.enum(['creator', 'contestee']).optional().default('contestee'),
});

const LoginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

const CreateContestSchema = z.object({
  title: z.string(),
  description: z.string(),
  startTime: z.date(),
  endTime: z.date(),
});

const CreateMCQSchema = z.object({
  questionText: z.string(),
  options: z.array(z.string()),
  correctOptionIndex: z.number(),
  points: z.number(),
});

const SubmitMCQSchema = z.object({
  selectedOptionIndex: z.number(),
});

const TestCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  isHidden: z.boolean(),
});

const CreateDSAProblemSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  points: z.number(),
  timeLimit: z.number(),
  memoryLimit: z.number(),
  testCases: z.array(TestCaseSchema),
});

const SubmitDSASchema = z.object({
  code: z.string().min(1),
  language: z.string().min(1),
});

export const schemas = {
  SignupSchema,
  LoginSchema,
  CreateContestSchema,
  CreateMCQSchema,
  SubmitMCQSchema,
  CreateDSAProblemSchema,
  SubmitDSASchema,
};
