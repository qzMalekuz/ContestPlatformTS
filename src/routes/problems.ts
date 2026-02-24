import { Router, type Request, type Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { prisma } from "../lib/prisma";
import { schemas } from "../validators/schemas";

const router = Router();

// QUESTION - 8

router.get('/:problemId', authMiddleware, async (req: Request, res: Response) => {
    try {
        const problemId = req.params.problemId as string;

        const problem = await prisma.dsaProblems.findUnique({
            where: { id: problemId },
            include: {
                testCases: {
                    where: { is_hidden: false }
                }
            }
        });

        if (!problem) {
            return res.status(404).json({
                success: false,
                data: null,
                error: "PROBLEM_NOT_FOUND"
            });
        }

        const visibleTestCases = problem.testCases.map(tc => ({
            input: tc.input,
            expectedOutput: tc.expected_output
        }));

        return res.status(200).json({
            success: true,
            data: {
                id: problem.id,
                contestId: problem.contest_id,
                title: problem.title,
                description: problem.description,
                tags: problem.tags,
                points: problem.points,
                timeLimit: problem.time_limit,
                memoryLimit: problem.memory_limit,
                visibleTestCases
            },
            error: null
        });

    } catch (err) {
        console.error('Get problem error:', err);
        return res.status(500).json({
            success: false,
            data: null,
            error: "INTERNAL_SERVER_ERROR"
        });
    }
});

// QUESTION - 9

router.post('/:problemId/submit', authMiddleware, async (req: Request, res: Response) => {
    try {
        const problemId = req.params.problemId as string;

        const validation = schemas.SubmitDSASchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST"
            });
        }

        const problem = await prisma.dsaProblems.findUnique({
            where: { id: problemId },
            include: { testCases: true, contest: true }
        });

        if (!problem) {
            return res.status(404).json({
                success: false,
                data: null,
                error: "PROBLEM_NOT_FOUND"
            });
        }

        const contest = problem.contest;
        const now = new Date();

        if (now < contest.start_time || now > contest.end_time) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "CONTEST_NOT_ACTIVE"
            });
        }

        if (contest.creator_id === req.user?.userId) {
            return res.status(403).json({
                success: false,
                data: null,
                error: "FORBIDDEN"
            });
        }

        const { code, language } = validation.data;

        const testCases = problem.testCases;
        const totalTestCases = testCases.length;

        let testCasesPassed = 0;
        let status = "accepted";


        // Real evaluation via Judge0 API
        const LANGUAGE_MAP: Record<string, number> = {
            'javascript': 93,
            'python': 92,
            'python3': 92,
            'java': 91,
            'c++': 54,
            'cpp': 54,
            'c': 50
        };

        const languageId = LANGUAGE_MAP[language.toLowerCase()] || 93;

        const judge0Requests = testCases.map(tc => {
            return fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    source_code: code,
                    language_id: languageId,
                    stdin: tc.input || "",
                    expected_output: tc.expected_output || "",
                    cpu_time_limit: (problem.time_limit / 1000.0) || 2.0,
                    memory_limit: (problem.memory_limit * 1024) || 128000
                })
            }).then(res => res.json()).catch(err => {
                console.error("Judge0 API Error:", err);
                return { status: { id: 13, description: "Internal Error" } };
            });
        });

        const results = await Promise.all(judge0Requests);

        for (const result of results as any[]) {
            const statusId = result.status?.id;

            if (statusId === 3) {
                testCasesPassed++;
            } else {
                if (status === 'accepted') {
                    if (statusId === 4) status = 'wrong_answer';
                    else if (statusId === 5) status = 'time_limit_exceeded';
                    else status = 'runtime_error'; // covers 6, 7-12, 13, 14
                }
            }
        }

        if (totalTestCases === 0) {
            testCasesPassed = 0;
            status = "accepted";
        }

        const pointsEarned = totalTestCases > 0 ? Math.floor((testCasesPassed / totalTestCases) * problem.points) : 0;

        // Upsert: update if exists, create if not
        const existingSubmission = await prisma.dsaSubmission.findUnique({
            where: {
                problem_id_user_id: {
                    problem_id: problemId,
                    user_id: req.user!.userId
                }
            }
        });

        if (existingSubmission) {
            await prisma.dsaSubmission.update({
                where: { id: existingSubmission.id },
                data: {
                    code,
                    language,
                    status,
                    points_earned: Math.max(pointsEarned, existingSubmission.points_earned),
                    test_cases_passed: testCasesPassed,
                    total_test_cases: totalTestCases,
                    execution_time: 50,
                    submitted_at: new Date()
                }
            });
        } else {
            await prisma.dsaSubmission.create({
                data: {
                    problem_id: problemId,
                    user_id: req.user!.userId,
                    code,
                    language,
                    status,
                    points_earned: pointsEarned,
                    test_cases_passed: testCasesPassed,
                    total_test_cases: totalTestCases,
                    execution_time: 50
                }
            });
        }

        return res.status(201).json({
            success: true,
            data: {
                status,
                pointsEarned,
                testCasesPassed,
                totalTestCases
            },
            error: null
        });

    } catch (err) {
        console.error('Submit DSA problem error:', err);
        return res.status(500).json({
            success: false,
            data: null,
            error: "INTERNAL_SERVER_ERROR"
        });
    }
});


export default router;