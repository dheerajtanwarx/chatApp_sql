import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export const generateAccessToken = (user) =>{
    return jwt.sign(
        {
            id: user.id,
            email:user.email,
            username: user.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}