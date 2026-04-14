import { Router } from "express";
import { getAllContacts, getMessagesByConversationId, getUserConversations, sendMessage } from "../controllers/message.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";


export const messageRouter = Router()

messageRouter.route('/getAllContacts').get( verifyJwt ,getAllContacts)

messageRouter.route('/send/:id').post(verifyJwt, sendMessage)

messageRouter.route('/getConversations').get(verifyJwt, getUserConversations)

messageRouter.route('/:id').get(verifyJwt, getMessagesByConversationId)
