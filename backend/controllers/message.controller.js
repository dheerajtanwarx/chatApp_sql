import { use } from "react";
import { db } from "../db/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getAllContacts = asyncHandler(async (req, res) => {
    try {
        const loggedInUser = req.user.id;

        const [data] = await db.query("SELECT id, username, email, profile_pic, is_online FROM users WHERE id != ?", [loggedInUser])

        return res.status(201).json(
            new ApiResponse(200, data, "all users fetched successfully")
        )

    } catch (error) {
        throw new ApiError(404, error?.message, "error while fetching all contacts")
    }
})


export const sendMessage = asyncHandler(async (req, res) => {
    try {
        const { message_text } = req.body
        // console.log(text)
        const { id: receiverId } = req.params
        console.log("reciver id", receiverId)
        const senderId = req.user.id
        // console.log("SEnder id",senderId)

        if (!message_text) {
            return res.status(400).json({ message: "Text or image is required" })
        }

        if (senderId === receiverId) {
            return res.status(400).json({ message: "cannot send message to yourself" })
        }

        const [receiverExist] = await db.query("SELECT * FROM users WHERE id = ?", [receiverId])

        if (!receiverExist) {
            return res.status(400).json({ message: "Reciever not found" })
        }

        const [conversation] = await db.query(
            "SELECT id FROM conversations WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)", [senderId, receiverId, receiverId, senderId]
        )
        let conversationId
        if (conversation > 0) {
            conversationId = conversation[0].id
        } else {
            const [data] = await db.query("INSERT INTO conversations (user1_id, user2_id) VALUES(?,?)", [receiverId, senderId])
            conversationId = data.insertId
        }

        console.log("conversation id: ", conversationId)

        const [result] = await db.query("INSERT into messages (conversation_id, sender_id, message_text) VALUES(?,?,?)", [conversationId, senderId, message_text])

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("result", result);
    }

        return res.status(200).json(
            new ApiResponse(200, result, "message sent successfuly")
        )


    } catch (error) {
        console.log("message sent error:", error.message)
        res.status(500).json({ error: "Internal Server Error" })
    }


})

export const getMessagesByConversationId = asyncHandler(async (req, res) => {
    try {
        const { id: conversation_id } = req.params

        const [rows] = await db.query("SELECT * FROM messages WHERE conversation_id = ?", [conversation_id])

        const result = rows[0]
        if (!result) {
            return res.status(400).json(
                new ApiResponse(400, "conversation does not exist")
            )
        } else {
            return res.status(200).json(
                new ApiResponse(200, result, "messages successfully fetched")
            )
        }
    } catch (error) {
        console.log("message fetching error:", error.message)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

//
export const getUserConversations = asyncHandler(async (req, res) => {
    try {
        console.log("get conversations route hit")
        const userId = req.user.id
        console.log("user id:", userId)

        //  const [result] = await db.query(
        //    "SELECT * FROM conversations WHERE (user1_id = ? OR user2_id = ?)",
        //    [userId, userId]
        //  )

        const [result] = await db.query(
            `SELECT 
        c.id as conversation_id,
        u.id,
        u.username,
        u.profile_pic,

        m.message_text,
        m.created_at

        FROM conversations c

        JOIN users u
        ON(u.id = c.user1_id OR u.id = c.user2_id)

        LEFT JOIN messages m
        ON m.id = (
        SELECT id FROM messages
        WHERE conversation_id = c.id
        ORDER BY created_at DESC LIMIT 1
        )
        WHERE (c.user1_id = ? OR c.user2_id = ? )
        AND u.id != ?
`, [userId, userId, userId])
        if (result.length === 0) {
            return res.status(404).json(
                new ApiResponse(404, null, "No conversations found")
            )
        }

        return res.status(200).json(
            new ApiResponse(200, result, "all chats fetched successfully")
        )

    } catch (error) {
        console.log("conversations fetching error:", error.message)
        res.status(500).json({ error: "Internal Server Error" })
    }
})



