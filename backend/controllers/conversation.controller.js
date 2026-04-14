import { db } from "../db/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const conversation = asyncHandler(async(req, res)=>{
    try {
        const myId = req.user.id
        const {userId} = req.params
    

        console.log("my id",myId)
        console.log("user id",userId)

        const [rows] =await db.query(`SELECT * FROM conversations WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)`, [myId, userId, userId, myId])
    
        let conversation
    
        if(rows.length > 0){
            conversation = rows[0]
        }else{
            const [result] = await db.query(`INSERT INTO conversations (user1_id, user2_id) VALUES(?,?)`, [myId, userId])
    
            const [newConv] = await db.query(`SELECT * FROM conversations WHERE id=?`,[result.insertId])
    
           conversation = newConv[0]
    
           res.status(201).json(
            {
                success:true,
                conversation
            }
           )
        }
    } catch (error) {
        console.log("Conversation error:", error.message)
    res.status(500).json({ error: "Internal Server Error" })
    }
})


export {conversation}


























// const user1_id = Math.min(myId, otherUserId)
// const user2_id = Math.max(myId, otherUserId)

// const [conversation] = await db.query(
//   "SELECT * FROM conversations WHERE user1_id = ? AND user2_id = ?",
//   [user1_id, user2_id]
// )