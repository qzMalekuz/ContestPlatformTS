import express, { Router, type Request, type Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { prisma } from "../lib/prisma"
import { createContestSchema,  createMcqSchema, submitMcqSchema } from "../validators/schemas";
import { Role } from "../generated/prisma/enums";

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

        // if(Role === "creator") {
        //     return res.status()
        // }

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
            })
        }
    } catch (err) {

    }
});

export default router;