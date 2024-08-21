import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoute from './routes/User';
import verificationTokenRoute from './routes/VerificationToken';
import cookieParser from 'cookie-parser';

dotenv.config();

const app: Express = express();
const HTTP_PORT = process.env.PORT || 8080;
app.use(express.json());
app.use(cors({origin: "http://localhost:3000", credentials: true}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/v1/user", userRoute);
app.use("/v1/verificationToken", verificationTokenRoute);

app.get("/", (req, res) => {
    res.send("Hello, World");
});

app.listen(HTTP_PORT, () => console.log(`Express server listening on port ${HTTP_PORT}`));
