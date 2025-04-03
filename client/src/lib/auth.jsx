import React, { createContext, useContext } from "react";
import {
  useQuery,
  useMutation,
} from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "./queryClient";
import { useToast } from "@/hooks/use-toast";

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} username
 * @property {number} isAdmin
 */

/**
 * @typedef {Object} LoginData
 * @property {string} username
 * @property {string} password
 */

export const AuthContext = createContext(null);

/**
 * Auth provider component for managing authentication state
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function AuthProvider({ children }) {
  const { toast } = useToast();
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome, ${user.username}!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const contextValue = {
    user: user ?? null,
    isLoading,
    error,
    loginMutation,
    logoutMutation,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook for accessing authentication context
 * @returns {Object} Authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}