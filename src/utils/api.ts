import { baseUrl } from "@/constants/config";
import axios from "axios";

const api = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
