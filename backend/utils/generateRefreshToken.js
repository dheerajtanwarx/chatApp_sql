import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()


export const generateRefreshToken = (user) =>{
    return jwt.sign(
        {
            id:user.id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
