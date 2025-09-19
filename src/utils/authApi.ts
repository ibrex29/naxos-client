"use client";

import { baseUrl } from "@/constants/config";
import axios from "axios";
import { getSession, signIn } from "next-auth/react";

const authApi = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token before each request
authApi.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

// Handle 401 errors globally
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Redirect user to signin page
      await signIn(); // next-auth's built-in redirect
    }
    return Promise.reject(error);
  }
);

export default authApi;
