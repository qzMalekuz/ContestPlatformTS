import { Router, type Request, type Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { prisma } from "../lib/prisma";
import { schemas } from "../validators/schemas";

const router = Router();

// QUESTION - 3

router.post('/', authMiddleware, async(req: Request, res: Response) => {
    try {

        const validation = schemas.CreateContestSchema.safeParse(req.body);
        if(!validation.success) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST"
            });
        }

        if (req.user?.role !== 'creator') {
            return res.status(403).json({
                success: false,
                data: null,
                error: "FORBIDDEN"
            });
        }

        const { title, description, startTime, endTime } = validation.data;

        const contest = await prisma.contest.create({
            data: {
                title,
                description,
                creator_id: req.user!.userId,
                start_time: new Date(startTime),
                end_time: new Date(endTime)
            }
        });

        return res.status(201).json({
            success: true,
            data: {
                id: contest.id,
                title: contest.title,
                description: contest.description,
                creatorId: contest.creator_id,
                startTime: contest.start_time.toISOString(),
                endTime: contest.end_time.toISOString()
            },
            error: null
        });

    } catch (err) {
        console.error('Create contest error:', err);
        return res.status(500).json({
            success: false,
            data: null,
            error: "INTERNAL_SERVER_ERROR"
        });
    }
});

// QUESTION - 4

router.get('/:contestId', authMiddleware, async(req: Request, res: Response) => {
    try {
        const contestId = req.params.contestId as string;

        const contest = await prisma.contest.findUnique({
            where: { id: contestId },
            include: {
                mcqQuestions: true,
                dsaProblems: true
            }
        });

        if(!contest) {
            return res.status(404).json({
                success: false,
                data: null,
                error: "CONTEST_NOT_FOUND"
            });
        }

        const isCreator = req.user?.userId === contest.creator_id;

        const mcqs = contest.mcqQuestions.map(mcq => {
            const mcqData: any = {
                id: mcq.id,
                questionText: mcq.question_text,
                options: mcq.options,
                points: mcq.points
            };

            if (isCreator) {
                mcqData.correctOptionIndex = mcq.correct_option_index;
            }
            return mcqData;
        });

        const dsaProblems = contest.dsaProblems.map(problem => ({
            id: problem.id,
            title: problem.title,
            description: problem.description,
            tags: problem.tags,
            points: problem.points,
            timeLimit: problem.time_limit,
            memoryLimit: problem.memory_limit
        }));

        return res.status(200).json({
            success: true,
            data: {
                id: contest.id,
                title: contest.title,
                description: contest.description,
                startTime: contest.start_time.toISOString(),
                endTime: contest.end_time.toISOString(),
                creatorId: contest.creator_id,
                mcqs,
                dsaProblems
            },
            error: null
        });

    } catch (err) {
        console.error('Get contest error:', err);
        return res.status(500).json({
            success: false,
            data: null,
            error: "INTERNAL_SERVER_ERROR"
        });
    }
});

// QUESTION - 5

router.post('/:contestId/mcq', authMiddleware, async(req:Request, res: Response) => {
    try {

        const contestId = req.params.contestId as string;

        const validation = schemas.CreateMCQSchema.safeParse(req.body);
        if(!validation.success) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST"
            });
        }

        if (req.user?.role !== 'creator') {
            return res.status(403).json({
                success: false,
                data: null,
                error: "FORBIDDEN"
            });
        }

        const contest = await prisma.contest.findUnique({
            where: { id: contestId }
        });

        if(!contest) {
            return res.status(404).json({
                success: false,
                data: null,
                error: "CONTEST_NOT_FOUND"
            });
        }

        if(contest.creator_id !== req.user?.userId) {
            return res.status(403).json({
                success: false,
                data: null,
                error: "FORBIDDEN"
            });
        }

        const { questionText, options, correctOptionIndex, points } = validation.data;

        const mcq = await prisma.mcqQuestions.create({
            data: {
                question_text: questionText,
                points: points || 1,
                options: options,
                correct_option_index: correctOptionIndex,
                contest_id: contestId
            }
        });

        return res.status(201).json({
            success: true,
            data: {
                id: mcq.id,
                contestId: mcq.contest_id
            },
            error: null
        });

    } catch (err) {
        console.error('Create MCQ error:', err);
        return res.status(500).json({
            success: false,
            data: null,
            error: "INTERNAL_SERVER_ERROR"
        });
    }
});

// QUESTION - 6

router.post('/:contestId/mcq/:questionId/submit', authMiddleware, async(req: Request, res: Response) => {
    try {
        const { contestId, questionId } = req.params;

        const validation = schemas.SubmitMCQSchema.safeParse(req.body);
        if(!validation.success) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST"
            });
        }


        const contest = await prisma.contest.findUnique({
            where: { id: contestId as string }
        });

        if(!contest) {
            return res.status(404).json({
                success: false,
                data: null,
                error: "CONTEST_NOT_FOUND"
            });
        }


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


        const question = await prisma.mcqQuestions.findUnique({
            where: { id: questionId as string}
        });

        if(!question || question.contest_id !== contestId) {
            return res.status(404).json({
                success: false,
                data: null,
                error: "QUESTION_NOT_FOUND"
            });
        }

        const { selectedOptionIndex } = validation.data;

        const existingSubmission = await prisma.mcqSubmission.findUnique({
            where: {
                user_id_question_id: {
                    user_id: req.user!.userId,
                    question_id: questionId as string
                }
            }
        });

        if (existingSubmission) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "ALREADY_SUBMITTED"
            });
        }


        const isCorrect = selectedOptionIndex === question.correct_option_index;
        let pointsEarned = 0;
        if (isCorrect) {
        pointsEarned = question.points;
        }


        const submission = await prisma.mcqSubmission.create({
            data: {
                user_id: req.user!.userId,
                question_id: questionId as string,
                selected_option_index: selectedOptionIndex,
                is_correct: isCorrect,
                points_earned: pointsEarned,
                submitted_at: new Date()
            }
        });

        return res.status(201).json({
            success: true,
            data: {
                isCorrect,
                pointsEarned
            },
            error: null
        });

    } catch (err) {
        console.error('Submit MCQ error:', err);
        return res.status(500).json({
            success: false,
            data: null,
            error: "INTERNAL_SERVER_ERROR"
        });
    }
});

export default router;
