import axios from 'axios'
//Frontend → Backend se baat karne ke liye axios use hota hai
export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:4000/api" : "/api",
    withCredentials: true,
      headers: {
    "Content-Type": "application/json"
  }
})