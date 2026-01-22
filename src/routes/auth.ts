import { Router, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { schemas } from "../validators/schemas";
import { prisma } from "../lib/prisma"

const jwtSecret = process.env.JWT_SECRET;
const saltRounds = Number(process.env.SALT_ROUNDS) || 10;

const router = Router();

router.post('/signup', async(req: Request, res: Response) => {
    try{
        const validation = schemas.SignupSchema.safeParse(req.body);
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
                role: role || 'contestee'
            }
        });

        return res.status(201).json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            error: null
        })
    } catch (err) {
        console.error('Signup error:', err);
        return res.status(500).json({
            success: false,
            data: null,
            error: "INTERNAL_SERVER_ERROR"
        });
    }
});

router.post('/login', async(req: Request, res: Response) => {
    try{
        const validation = schemas.LoginSchema.safeParse(req.body);
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

        const token = jwt.sign({ userId: user.id, role: user.role }, jwtSecret as string, { expiresIn: '7d' });

        return res.status(200).json({
            success: true,
            data: {
                token
            },
            error: null
        });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({
            success: false,
            data: null,
            error: "INTERNAL_SERVER_ERROR"
        });
    }
});

export default router;