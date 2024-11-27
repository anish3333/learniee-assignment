import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContextType, User } from "../types/auth";
import axios from "axios";
import { toast } from "sonner";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/auth/login`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        toast.success("Successfully logged in!");
        return response.data.user;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to login";
      toast.error(errorMessage);
      throw error;
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/auth/register`,
        { username, email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        toast.success("Account created successfully!");
      }
    } catch (error: any) {
      // console.log(error.response.data.error);
      const errorMessage = error.response?.data?.error || "Failed to create account";
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/auth/logout`,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setUser(null);
        setIsAuthenticated(false);
        toast.success("Successfully logged out");
      } else {
        toast.error("Failed to logout");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to logout";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/auth/isauth`,
        {
          withCredentials: true,
        }
      );
      if (response.status === 200 && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        toast.success("Session restored", {
          duration: 2000,
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Session verification failed";
      toast.error(errorMessage, {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verify();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, signup, logout, isAuthenticated, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};