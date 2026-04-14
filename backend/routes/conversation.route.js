import { Router } from "express";
import { conversation } from "../controllers/conversation.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

export const conversationRouter = Router()

conversationRouter.route('/:userId').post(verifyJwt,conversation)