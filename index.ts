import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoute from './routes/User';
import verificationTokenRoute from './routes/VerificationToken';
import postRoute from './routes/Post';
import cookieParser from 'cookie-parser';
import cloud from 'cloudinary';
import topicRoute from './routes/Topic';

const cloudinary = cloud.v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
    secure: true
});

dotenv.config();

const app: Express = express();
const HTTP_PORT = process.env.PORT || 8080;
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/v1/user", userRoute);
app.use("/v1/verificationToken", verificationTokenRoute);
app.use("/v1/post", postRoute);
app.use("/v1/topic", topicRoute);

app.get("/", (req, res) => {
    res.send("Hello, World");
});

app.listen(HTTP_PORT, () => console.log(`Express server listening on port ${HTTP_PORT}`));
