import dotenv from 'dotenv'
dotenv.config()

import jwt from "jsonwebtoken"
import { db } from '../db/db.js'


const verifyJwt = async(req, res, next)=>{
    try {
        const userToken = req.cookies?.accessToken ||
  req.header("Authorization")?.replace("Bearer ", "")

        if(!userToken){
            return res.status(401).json({
                message:"Unauthorized request"
            })
        }

        const decodedToken = jwt.verify(userToken, process.env.ACCESS_TOKEN_SECRET)

        const[rows] = await db.query("SELECT * FROM users WHERE id=?", [decodedToken?.id])
       const user = rows[0]
        if(!user){
            return res.status(401).json({message:"invalid jwt token"})
        }

        req.user = user;


        next()

    } catch (error) {
        res.status(404).json(error?.message || "invalid access token")
    }
}

export {verifyJwt}