import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class VerificationToken {
    private static isOneDayOld(date: Date) {
        const currentDate = new Date();
        const oneDayInMilliseconds = 24 * 60 *60 * 1000;

        const differenceInMilliseconds = currentDate.getTime() - date.getTime();

        return Math.floor(differenceInMilliseconds / oneDayInMilliseconds) === 1;
    }

    //Middleware to defined token
    public static async verifyToken(req: Request, res: Response, next: NextFunction) {
        try {
            const { token } = req.params;

            if (!token) throw {error: "Token is missing"};

            const verificationToken = await prisma.verificationToken.findFirst({
                where: {
                    token
                },
                include: {
                    user: {
                        select: {
                            verified: true
                        }
                    }
                }
            });

            if (!verificationToken) throw {expired: false, error: "Verification Token token is invalid!", verified: false};

            if (verificationToken.user.verified) throw { expired: false, error: "Already verified", verified: true };

            if (VerificationToken.isOneDayOld(verificationToken.createdAt)) throw {expired: true, error: "This link expired: You waited too long to verify. Please resend to get a new link", verified: false};

            next();
        } catch (err: any) {
            console.log(err);
            let Httpstatus = 400;
            if (err.expired) {
                Httpstatus = 403;
            }

            res.status(Httpstatus).json({status: false, expired: err.expired, error: err.error, verified: err.verified});
        }
    }
}

export default VerificationToken;