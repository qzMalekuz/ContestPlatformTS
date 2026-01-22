// import { z } from 'zod';


// export const SignupSchema = z.object({
//   name: z.string(),
//   email: z.email(),
//   password: z.string(),
//   role: z.enum(['creator', 'contestee']).optional().default('contestee'),
// });

// export const LoginSchema = z.object({
//   email: z.string(),
//   password: z.string()
// });


// export const CreateContestSchema = z.object({
//   title: z.string(),
//   description: z.string(),
//   startTime: z.date(),
//   endTime: z.date(),
// });


// export const CreateMCQSchema = z.object({
//   questionText: z.string(),
//   options: z.array(z.string()),
//   correctOptionIndex: z.number(),
//   points: z.number(),
// });

// export const SubmitMCQSchema = z.object({
//   selectedOptionIndex: z.number(),
// });


// export const TestCaseSchema = z.object({
//   input: z.string(),
//   expectedOutput: z.string(),
//   isHidden: z.boolean(),
// });

// export const CreateDSAProblemSchema = z.object({
//   title: z.string(),
//   description: z.string(),
//   tags: z.array(z.string()),
//   points: z.number(),
//   timeLimit: z.number(),
//   memoryLimit: z.number(),
//   testCases: z.array(TestCaseSchema),
// });

// export const SubmitDSASchema = z.object({
//   code: z.string(),
//   language: z.string()
// });

// export type SignupInput = z.infer<typeof SignupSchema>;
// export type LoginInput = z.infer<typeof LoginSchema>;
// export type CreateContestInput = z.infer<typeof CreateContestSchema>;
// export type CreateMCQInput = z.infer<typeof CreateMCQSchema>;
// export type SubmitMCQInput = z.infer<typeof SubmitMCQSchema>;
// export type CreateDSAProblemInput = z.infer<typeof CreateDSAProblemSchema>;
// export type SubmitDSAInput = z.infer<typeof SubmitDSASchema>;




import { z } from 'zod';

const SignupSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  role: z.enum(['creator', 'contestee']).optional().default('contestee'),
});

const LoginSchema = z.object({
  email: z.string().email(),
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
