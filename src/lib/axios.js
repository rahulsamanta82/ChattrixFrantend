import axios from "axios";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api"
    : "https://chattrixbackend.onrender.com/api";

export const axiosInstance = axios.create({
  baseURL: "https://chattrixbackend.onrender.com/api",
  withCredentials: true,
});