import { Router } from "express";
import Topic from "../controller/Topic";

const router = Router();

router.get("/list", Topic.list);

export default router;