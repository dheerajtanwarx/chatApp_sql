import {GoogleGenerativeAI} from "@google/generative-ai"
import dotenv from 'dotenv'
import { asyncHandler } from "../utils/asyncHandler.js"
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({model: "gemini-2.5-flash"})

// export const generativeAI = asyncHandler(async(req, res) =>{
 
//     try {
//         const message_text = req.body("meesage_text")
//         console.log("message_text:", message_text)

//         if(!message_text){
//             return res.status(400).json({ error: "Message is required" });
//         }

//         const result = await model.generateContent(message_text)
//         const reply = result.response.text()

//        return res.status(201).json(
//             new ApiResponse(200, reply, "respond successfully")
//         )

//     } catch (error) {
//         console.error("Gemini error:", error);
//     res.status(500).json({ error: "AI failed to respond" });
//     }

// })


export const generativeAI = asyncHandler(async (req, res) => {
    try {
        const message_text = req.body["message_text"];
        console.log("message_text:", message_text);
       const user = req.user

        if (!message_text || typeof message_text !== "string") {
            return res.status(400).json({ error: "Valid message is required" });
        }

        const result = await model.generateContent(message_text);
        const reply = result.response.text();

        return res.status(200).json({
            success: true,
            message: "respond successfully",
            data: reply
        });

    } catch (error) {
        console.error("Gemini error:", error);
        res.status(500).json({ error: "AI failed to respond" });
    }
});