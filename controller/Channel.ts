import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import User from './User';

const prisma = new PrismaClient();

class Channel {
    public static async getChannelById(req: Request, res: Response) {
        try {
            const user: any = User.authenticate(req.headers.authorization?.split(' ')[1]);

            if (!user) throw "Invalid"

            const channels = await prisma.channel.findMany({
                where: {
                    moderators: {
                        some: {
                            user: {
                                user: {
                                    email: user.email,
                                    username: user.username
                                }
                            }
                        }
                    }
                }
            });

            res.status(200).json({status: true, data: channels});
        } catch (err) {
            res.status(400).json({status: false, error: err});
        }
    }
}

export default Channel;