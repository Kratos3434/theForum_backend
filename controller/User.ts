import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Email from './Email';

const prisma = new PrismaClient();

class User {
    public static async list(req: Request, res: Response) {
        try {
            const users = await prisma.userProfile.findMany({
                include: {
                    user: {
                        select: {
                            email: true,
                            username: true
                        }
                    }
                }
            });

            res.status(200).json({status: true, data: users});
        } catch (err) {
            res.status(400).json({status: false, error: "Error while getting the users"});
        }
    }

    public static async signup(req: Request, res: Response) {
        try {
            const { email, username, password, password2 } = req.body;

            if (!email) throw "Email is required";
            if (!username) throw "Username is required";
            if (!password) throw "Password is requried";
            if (!password2) throw "Please confirm your password";
            if (password !== password2) throw "Passwords do not match";

            const user = await prisma.user.findFirst({
                where: {
                    OR: [
                        {
                            email
                        },
                        {
                            username
                        }
                    ]
                }
            });

            if (user && user.email) throw "This email have already been taken";
            if (user && user.username) throw "This username have already been taken";

            //encrypt the password
            const hashedPassword = await bcrypt.hash(password, 10);

            //Create the user and set verified to false;
            const newUser = await prisma.user.create({
                data: {
                    email,
                    username,
                    password: hashedPassword,
                    verified: false
                }
            });

            //Create the userProfile for the user
            await prisma.userProfile.create({
                data: {
                    userId: newUser.id
                }
            });

            //Create the verification token based on the email
            const token = await bcrypt.hash(email, 5);
            //Remove all of the / so that the email will not break

            const verificationToken = await prisma.verificationToken.create({
                data: {
                    token: token.replace(/[./]/g, ''),
                    userId: newUser.id
                }
            });

            //Send the token with link to the user's email
            Email.sendLink(email, `http://localhost:3000/verify?token=${verificationToken.token}`)

            res.status(200).json({status: true, message: "New user created"});

        } catch (err) {
            res.status(400).json({status: false, error: err});
        }
    }

    //Please use this exclusively after the VerificationToken.verify middleware
    public static async verify(req: Request, res: Response) {
        try {
            //Assuming that the token have already been verified
            const { token } = req.params;

            if (!token) throw "Token is missing";

            const verificationToken = await prisma.verificationToken.findFirst({
                where: {
                    token
                }
            });

            const user = await prisma.user.update({
                where: {
                    id: verificationToken?.userId
                },
                data: {
                    verified: true,
                    updatedAt: new Date()
                }
            });

            if (!user) throw "Error while verifying user";

            res.status(200).json({status: true, message: "User verified"});
        } catch (err) {
            res.status(400).json({status: false, error: err});
        }
    }

    public static async login(req: Request, res: Response) {
        try {
            const { usernameOrEmail, password } = req.body;

            if (!usernameOrEmail) throw "Username or email is required";
            if (!password) throw "Password is required";

            const user = await prisma.user.findFirst({
                where: {
                    OR: [
                        {
                            email: usernameOrEmail
                        },
                        {
                            username: usernameOrEmail
                        }
                    ]
                }
            });

            if (!user) throw "Incorrect username/email or password";

            const result = await bcrypt.compare(password, user.password);

            if (!result) throw "Incorrect username/email or password";

            const privateKey = fs.readFileSync(`privateKey.key`);
            const token = jwt.sign(user, privateKey, {
              expiresIn: '1d',
              algorithm: 'RS256'
            });

            res.cookie("token", token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
                secure: true
            });

            const userProfile = await prisma.userProfile.findUnique({
                where: {
                    userId: user.id
                },
                include: {
                    user: {
                        select: {
                            email: true,
                            username: true
                        }
                    }
                }
            });

            res.status(200).json({status: true, data: userProfile});
        } catch (err) {
            res.status(400).json({status: false, error: err});
        }
    }
}

export default User;