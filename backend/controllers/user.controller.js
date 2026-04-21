
import bcrypt from "bcrypt"
import dotenv from 'dotenv'
import { db } from "../db/db.js"
import { ApiError } from "../utils/ApiError.js"
import { generateAccessToken } from "../utils/generateAccessToken.js"
import { generateRefreshToken } from "../utils/generateRefreshToken.js"
import { asyncHandler } from "../utils/asyncHandler.js"

import { ApiResponse } from "../utils/ApiResponse.js"
import cloudinary from "../lib/cloudinary.js"
dotenv.config()

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const [data] = await db.query(
            "SELECT * FROM users WHERE id = ?",
            [userId]
        )
        const user = data[0]

        const accessToken = generateAccessToken(user)
        const refreshToken = generateRefreshToken(user)

        await db.query(
            "UPDATE users SET refreshtoken = ? WHERE id = ?",
            [refreshToken, userId]
        )

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(
            500,
            error.message,
            "Something went wrong while generating access and refresh token"
        )
    }

}


const registerUser = asyncHandler(async(req, res)=>{
   try {
       
    console.log("sign up route hit")
       const { email , password, username, profile_pic} = req.body
       console.log(req.body)
//empty field check
     if (!username || !email || !password) {
      throw new ApiError(400, "username, email and password are required")
    }
 //check for existing user
    const [existingUser] = await db.query("SELECT * FROM users WHERE email = ? OR username = ?", [email, username])
    console.log(existingUser)

    if(existingUser.length > 0){
        throw new ApiError(409, "user allready exist")
    }

    //hashing the password
    const hashedPassword = await bcrypt.hash(password, 10)

    const [user] = await db.query("INSERT INTO users (username, email, password,  profile_pic ) VALUES(?,?,?,?)", [username, email, hashedPassword, profile_pic || null])

    const userId = user.insertId

    //fetch created user
    const [createdUser] = await db.query("SELECT id, email, username, profile_pic, is_online, created_at FROM users WHERE id=?", [userId])
    console.log("created user",createdUser)

    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(userId)

    res.cookie("jwt", accessToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development",
    })

    return res.status(201).json(new ApiResponse(
        200, createdUser[0], "User registered successfully"
    ))
    
    
   } catch (error) {
    res.status(error.statusCode || 500).json(
    { success: false,
      message: error.message
    }
    )
   }
})

const loginUser = asyncHandler(async(req, res)=>{
    try {
        const {email,   password} = req.body
    
        if ( !email || !password) {
          throw new ApiError(400, "username, email and password are required")
        }
    
       const [rows] = await db.query("SELECT * FROM users WHERE email=? ", [email])
       
       const user = rows[0]

        if (rows.length === 0) {
            throw new ApiError(404, "Invalid credentials")
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (!isPasswordCorrect) {
            throw new ApiError(401, "Invalid credentials")
        }

        const userId = user.id
        const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(userId)

        res.cookie("jwt", accessToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
        })

        const [loggedInUserRow] = await db.query("SELECT id, username, email, profile_pic, created_at FROM users WHERE id = ?", [userId])
        const loggedInUser = loggedInUserRow[0]
        return res.status(200).json(new ApiResponse(
            200, loggedInUser, `Welcome back ${loggedInUser.username}`
        ))
        
    

    
       
    } catch (error) {
        res.status(error.statusCode || 500).json(
    { success: false,
      message: error.message
    }
    )
    }
})

const updateUser = asyncHandler(async(req, res)=>{
  try {
  const { email, username } = req.body
  const profile_pic = req.file?.path
  const  userId  = req.user.id

  // Fetch the existing user to fallback if fields are missing
  const [existingUserRow] = await db.query("SELECT * FROM users WHERE id = ?", [userId])
  const existingUser = existingUserRow[0]
  if (!existingUser) {
    throw new ApiError(404, "User not found")
  }

  let imageUrl = existingUser.profile_pic

  if(profile_pic){
     try {
       const uploadResponse = await cloudinary.uploader.upload(profile_pic)
       console.log("Cloudinary success:", uploadResponse)
       // Update imageUrl with the newly uploaded image
       imageUrl = uploadResponse.secure_url
     } catch (err) {
       console.log("Cloudinary error:", err)
     }
  }

  const finalEmail = email || existingUser.email;
  const finalUsername = username || existingUser.username;

  await db.query(
    "UPDATE users SET email = ?, username = ?, profile_pic = ? WHERE id = ?",
    [finalEmail, finalUsername, imageUrl, userId]
  )

  const [rows] = await db.query(
    "SELECT id, email, username, profile_pic, is_online, created_at FROM users WHERE id = ?",
    [userId]
  )

  const updatedUser = rows[0]

  res.status(200).json(
    new ApiResponse(200, updatedUser, "user updated successfully")
  )

} catch (error) {
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message
  })
}
})


const logout = (_, res)=>{
    res.cookie("jwt", "", {maxAge:0})
    res.status(200).json({
        message:"logout successfully"
    })
}

const checkAuth = asyncHandler(async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, email, username, profile_pic, is_online, created_at FROM users WHERE id = ?",
      [req.user.id]
    );
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    res.status(200).json(new ApiResponse(200, user, "Authenticated"));
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
});

// const updateProfile = asyncHandler(async(req, res)=>{
//   try {
//     const profile_pic = req.file?.path
//     console.log(profile_pic)

//     if(!profile_pic){
//       return res.status(400).json({message:"Profile pic is required"})
//     }

//     const userId = req.user.id

//     const uploadResponse = await cloudinary.uploader.upload(profile_pic)

//     const [updatedUser] = await db.query("UPDATE users SET profile_pic = ? WHERE id=? VALUES(?, ?)", [uploadResponse, userId])

//     res.status(200).json(updatedUser)
//   } catch (error) {
//     console.log("Error in update profile",error)
//         res.status(500).json({message:"internal server error"}) 
//   }
// })

export { registerUser, loginUser, updateUser, logout, checkAuth}