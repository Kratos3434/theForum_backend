import { Router } from "express";
import Post from "../controller/Post";
import User from "../controller/User";
import multer from 'multer';

const upload = multer();
const router = Router();

router.get("/list", Post.list);
router.post("/add/post", User.validateToken, upload.single("media"), Post.create);

export default router;