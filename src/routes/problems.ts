import { Router, type Request, type Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { prisma } from "../lib/prisma";
import { schemas } from "../validators/schemas";

const router = Router();


export default router;