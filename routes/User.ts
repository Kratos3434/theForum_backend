import { Router } from "express";
import User from "../controller/User";
import VerificationToken from "../controller/VerificationToken";

const router = Router();

router.get("/list", User.list);
router.post("/signup", User.signup);
router.post("/verify/:token", VerificationToken.verifyToken, User.verify);
router.post("/login", User.login);
router.get("/validate", User.validateToken, (req, res) => res.status(200).json({status: true, message: "authorized"}));
router.get("/current", User.validateToken, User.getCurrent);

export default router;