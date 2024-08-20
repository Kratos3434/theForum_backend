import { Router } from "express";
import User from "../controller/User";
import VerificationToken from "../controller/VerificationToken";

const router = Router();

router.get("/list", User.list);
router.post("/signup", User.signup);
router.post("/verify/:token", VerificationToken.verifyToken, User.verify);

export default router;