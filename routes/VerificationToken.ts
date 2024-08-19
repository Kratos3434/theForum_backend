import { Router } from "express";
import VerificationToken from "../controller/VerificationToken";

const router = Router();

router.post("/verify/:token", VerificationToken.verifyToken, (req, res) => res.status(200).json({status: true, message: "Token is valid"}));

export default router;