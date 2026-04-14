import { Router } from "express";
import { loginUser, logout, registerUser, updateUser } from "../controllers/user.controller.js";

const userRouter = Router()

userRouter.route('/register').post(registerUser)
userRouter.route('/login').get(loginUser)
userRouter.route('/update/:userId').put(updateUser)
userRouter.route('/logout').post(logout)

export {userRouter}