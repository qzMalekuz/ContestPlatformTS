import { z } from "zod";

export const signUpSchema = z.object({
    name: z.string(),
    password: z.string(),
    email: z.email(),
    role: z.enum(["creator", "contestee"])
});

export const loginSchema = z.object({
    email: z.email(),
    password: z.string()
});

export const createContestSchema = z.object({
    title: z.string(),
    description: z.string(),
    startTime: z.date(),
    endTime: z.date()
});

export const createMcqSchema = z.object({
    questionText: z.string(),
    options: z.array(z.string()),
    correctOptionIndex: z.number(),
    points: z.number()
});

export const submitMcqSchema = z.object({
    selectOptionIndex: z.number(),
});

export const createDsaProblemSchema = z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    points: z.number(),
    timeLimit: z.number(),
    memoryLimit: z.number(),
    testCases: z.array(z.object({
        input: z.string(),
        expectedOutput: z.string(),
        isHidden: z.boolean()
    }))
});

export const submitDsaSchema = z.object({
    code: z.string(),
    language: z.string()
});