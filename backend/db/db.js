import mysql from 'mysql2/promise'
import dotenv from "dotenv";
dotenv.config()


const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
});

const connectDB = async () => {
  try {
    const connection = await db.getConnection();
    console.log("Connected to Aiven MySQL");
    connection.release();
  } catch (err) {
    console.log("DB connection failed:", err);
  }
};

connectDB();

export {db}