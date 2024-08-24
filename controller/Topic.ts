import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class Topic {
    public static async list(req: Request, res: Response) {
        try {
            const topics = await prisma.topic.findMany({});

            res.status(200).json({status: true, data: topics});
        } catch (err) {
            res.status(400).json({status: false, error: err});
        }
    }
}

export default Topic;