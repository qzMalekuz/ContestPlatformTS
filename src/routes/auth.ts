import { Router, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { loginSchema, signUpSchema  } from "../validators/schemas";
import { prisma } from "../lib/prisma"

const jwtSecret = process.env.JWT_SECRET;
const saltRounds = Number(process.env.SALT_ROUNDS)

const router = Router();

router.post('/signup', async(req: Request, res: Response) => {
    try{
        const validation = signUpSchema.safeParse(req.body);
        if(!validation.success) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST"
            });
        }

        const { name, email, password, role } = validation.data;

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if(existingUser) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "EMAIL_ALREADY_EXISTS"
            });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role
            }
        });

        return res.status(201).json({
            success: true,
            data: {
                id: user.id,
                name,
                email,
                role
            },
            error: null
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: "INTERNAL_SERVER_ERROR"
        });
    }
});

router.post('/signin', async(req: Request, res: Response) => {
    try{
        const validation = loginSchema.safeParse(req.body);
        if(!validation.success) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST"
            });
        }

        const { email, password } = validation.data;
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if(!user) {
            return res.status(401).json({
                success: false,
                data: null,
                error: "INVALID_CREDENTIALS"
            });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if(!validPassword) {
            return res.status(401).json({
                success: false,
                data: null,
                error: "INVALID_CREDENTIALS"
            });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret as string, { expiresIn: '7d' });

        return res.status(200).json({
            success: true,
            data: {
                token
            },
            error: null
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: "INTERNAL_SERVER_ERROR"
        });
    }
});

export default router;