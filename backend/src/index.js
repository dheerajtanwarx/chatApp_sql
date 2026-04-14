import express from "express"
import dotenv from 'dotenv'
dotenv.config()
import { db } from "../db/db.js"
import { userRouter } from "../routes/user.route.js"
import cookieParser from "cookie-parser"
import { messageRouter } from "../routes/message.route.js"
import { conversationRouter } from "../routes/conversation.route.js"

const app = express()


app.use(express.json())
app.use(cookieParser())

async function connectDB() {
  try {
    const connection = await db.getConnection()
    console.log("Database connected successfully")
    connection.release()
  } catch (err) {
    console.error("Database connection failed:", err)
  }
}
connectDB()

app.listen(process.env.PORT, (req, res)=>{
    console.log(`app is listen on port ${process.env.PORT}`)
})


//user route
app.use('/api/u', userRouter)

//conversation route
app.use('/api/c', conversationRouter)

//message routes
app.use('/api/m', messageRouter)