import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import User from './User';
import cloud from 'cloudinary';
import streamifier from 'streamifier';

const prisma = new PrismaClient();
const cloudinary = cloud.v2;

class Post {

    public static async list(req: Request, res: Response) {
        try {
            const posts = await prisma.post.findMany({
                include: {
                    author: {
                        include: {
                            user: {
                                select: {
                                    username: true
                                }
                            },
                        },
                    },
                }
            });

            res.status(200).json({status: true, data: posts});
        } catch (err) {
            res.status(400).json({status: false, error: err});
        }
    }

    //Needs authenticated user
    public static async create(req: Request, res: Response) {
        const {title, description} = req.body;
        try {
            if (!title) throw "Title is required";
            const user: any = User.authenticate(req.headers.authorization?.split(' ')[1]);
            if (!user) throw "Invalid request";

            if (req.file) {
                const upload = async (req: Request) => {
                    try {
                        const result = await Post.streamUpload(req.file);
                        return result;
                    } catch (err) {
                        throw err;
                    }
                }

                upload(req).then((uploaded: any) => {
                    if (!uploaded) {
                        return res.status(400).json({
                          status: false,
                          error: "Something went wrong while uploading",
                        });
                    } 

                    try {
                        processPost(uploaded.url);
                    } catch (err) {
                        throw err;
                    }
                });

                const processPost = async (mediaUrl: string) => {
                    const newPost = await prisma.post.create({
                        data: {
                            title,
                            description,
                            media: mediaUrl,
                            author: {
                                connect: {
                                    id: +user.id
                                }
                            }
                        }
                    });

                    return res.status(200).json({status: true, data: newPost, message: "New Post added"});
                }
            } else {
                const newPost = await prisma.post.create({
                    data: {
                        title,
                        description,
                        author: {
                            connect: {
                                id: +user.id
                            }
                        }
                    }
                });

                return res.status(200).json({status: true, data: newPost, message: "New Post added"});
            }
        } catch (err) {
            res.status(400).json({status: false, error: err});
        }
    }

    public static async streamUpload(file: any) {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({resource_type: 'auto'}, (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            });

            streamifier.createReadStream(file.buffer).pipe(stream);
        })
    }
}

export default Post;