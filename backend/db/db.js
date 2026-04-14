import mysql from 'mysql2/promise'

const db = mysql.createPool({
    host:"localhost",
    user:"root",
    password:"dheeraj123",
    database:"chat_app"

})

export {db}