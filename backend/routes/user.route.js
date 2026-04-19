import { Router } from "express";
import { loginUser, logout, registerUser, updateUser, checkAuth } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const userRouter = Router()

userRouter.route('/register').post(registerUser)
userRouter.route('/login').post(loginUser)

userRouter.route('/check').get(verifyJwt, checkAuth)
userRouter.route('/update').put(verifyJwt, upload.single('profile_pic'), updateUser)
userRouter.route('/logout').post(logout)

export {userRouter}