import express, { type Request, type Response, type NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET;

export function authMiddleware(req: Request, res: Response, next: NextFunction) {

    try {
        const header = req.headers.authorization;
        if (!header) {
            return res.status(401).json({
                success: false,
                data: null,
                error: "UNAUTHORIZED"
            });
        }

        const parts = header.split(' ');

        if(parts.length !== 2 || parts[0] !== 'Bearer' ||parts[1] == undefined) {
            return res.status(401).json({
                success: false,
                data: null,
                error: 'unauthorized'
            });
        }

        // token port added

        const token = parts[1];
        const decoded = jwt.verify(token, jwtSecret as string) as JwtPayload;

        req.user = {
            userId: decoded.userId,
            username: decoded.username,
            role: decoded.role as string
        }
        next();
        
    } catch (err) {
        return res.status(401).json({
            success: false,
            data: null,
            error: "UNAUTHORIZED"
        })
    }
}