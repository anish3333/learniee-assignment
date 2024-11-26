import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContextType, User } from "../types/auth";
import axios from "axios";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const login = async (email: string, password: string) => {
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
    }
    return response.data.user;
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

      if (response.status === 200) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Signup failed:", error);
      throw error; // Rethrow the error for the calling function to handle.
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/auth/logout`, {
      withCredentials: true,
    });

    if (response.status === 200) setUser(null);
    else console.log("Logout failed");
    setIsAuthenticated(false);
    setLoading(false);
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
      }
    } catch (error) {
      console.error("Verification failed:", error);
    } finally {
      setLoading(false); // Set loading to false after verification
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
