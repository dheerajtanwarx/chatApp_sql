import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { db } from '../db/db.js';
dotenv.config()



export const socketAuthMiddleware = async (socket, next) => {
  try {
    // extract token from http-only cookies
    const token = socket.handshake.headers.cookie
      ?.split("; ")
      .find((row) => row.startsWith("jwt="))
      ?.split("=")[1];

    if (!token) {
      console.log("Socket connection rejected: No token provided");
      return next(new Error("Unauthorized - No Token Provided"));
    }

    // verify the token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded) {
      console.log("Socket connection rejected: Invalid token");
      return next(new Error("Unauthorized - Invalid Token"));
    }

    // find the user fromdb
    // const user = await User.findById(decoded.userId).select("-password");
    // if (!user) {
    //   console.log("Socket connection rejected: User not found");
    //   return next(new Error("User not found"));
    // }

    const [user] = await db.query("SELECT * FROM users where  id = ?", [decoded.id])

    // attach user info to socket
    socket.user = user;
    socket.id = user.id.toString();

    console.log(`Socket authenticated for user: ${user.username} (${user.id})`);

    next();
  } catch (error) {
    console.log("Error in socket authentication:", error.message);
    next(new Error("Unauthorized - Authentication failed"));
  }
};