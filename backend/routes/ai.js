import { Router } from "express";
import { generativeAI } from "../controllers/ai.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

export const aiRouter = Router()

aiRouter.route('/chat').post(verifyJwt, upload.single("file"), generativeAI)