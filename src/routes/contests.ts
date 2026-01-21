import express, { Router, type Request, type Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { prisma } from "../lib/prisma"
import { createContestSchema,  createMcqSchema, submitMcqSchema } from "../validators/schemas";
import { Role } from "../generated/prisma/enums";
import { McqQuestionsScalarFieldEnum } from "../generated/prisma/internal/prismaNamespace";
import { success } from "zod";

const router = Router();

router.post('/', authMiddleware, async(req: Request, res: Response) => {
    try{
        const validation = createContestSchema.safeParse(req.body);
        if(!validation.success) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST"
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

        if(contest.creator_id !== req.user?.userId){
            return res.status(403).json({
                success: false,
                data: null,
                error: "FORBIDDEN"
            })
        }


        return res.status(201).json({
            success: false,
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
        return res.status(401).json({
            success: false,
            data: null,
            error: "UNAUTHORIZED"
        })
    }
});

router.post('/:contestId', authMiddleware, async(req: Request, res: Response) => {
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
            }

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
            memoryLimit: problem.time_limit
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
        return res.status(401).json({
            success: false,
            data: null,
            error: "UNAUTHORIZED"
        });
    }
});

router.post('/:contestId/mcq', authMiddleware, async(req:Request, res: Response) => {
    try {
        const contestId = req.params.contestId as string;

        const validation = createMcqSchema.safeParse(req.body);
        if(!validation.success) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST"
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
                points,
                options,
                correct_option_index: correctOptionIndex,
                contest_id: contest.id
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
        return res.status(401).json({
            success: false,
            data: null,
            error: "UNAUTHORIZED"
        })
    }
});

export default router;