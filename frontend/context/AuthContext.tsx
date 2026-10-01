"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "User" | "Admin";
  is_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  loginWithPassword: (email: string, pass: string) => Promise<User>;
  requestOTP: (email: string, purpose?: string) => Promise<any>;
  verifyOTP: (email: string, otp: string, purpose?: string, profile?: Record<string, string>) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persistent session
    const savedUser = localStorage.getItem("neuroscan_user");
    const savedToken = localStorage.getItem("neuroscan_token");
    if (savedToken?.startsWith("demo")) {
      localStorage.removeItem("neuroscan_user");
      localStorage.removeItem("neuroscan_token");
      setIsLoading(false);
      return;
    }
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        localStorage.removeItem("neuroscan_user");
      }
    }
    setIsLoading(false);
  }, []);

  const loginWithPassword = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.login(email, pass);
      setUser(res.user);
      setToken(res.access_token);
      localStorage.setItem("neuroscan_user", JSON.stringify(res.user));
      localStorage.setItem("neuroscan_token", res.access_token);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const requestOTP = async (email: string, purpose = "LOGIN") => {
    return await apiClient.sendOTP(email, purpose);
  };

  const verifyOTP = async (email: string, otp: string, purpose = "LOGIN", profile: Record<string, string> = {}) => {
    setIsLoading(true);
    try {
      const res = await apiClient.verifyOTP(email, otp, purpose, profile);
      setUser(res.user);
      setToken(res.access_token);
      localStorage.setItem("neuroscan_user", JSON.stringify(res.user));
      localStorage.setItem("neuroscan_token", res.access_token);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("neuroscan_user");
    localStorage.removeItem("neuroscan_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        loginWithPassword,
        requestOTP,
        verifyOTP,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
