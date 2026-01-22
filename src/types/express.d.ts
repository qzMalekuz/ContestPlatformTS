interface JwtPayload {
    id: number;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string,
                username: string,
                role: string
            }
        }
    }
}

export { }