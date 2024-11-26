import { Request, Response } from "express";
import { User } from "../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { COOKIE_OPTIONS } from "../config/cookies";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Set HTTP-only cookie
    res.cookie("auth_token", token, COOKIE_OPTIONS);

    // Return success response without sensitive data
    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Error creating user" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    user.isOnline = true;
    await user.save();

    res.cookie("auth_token", token, COOKIE_OPTIONS);

    // Return success response without sensitive data
    return res.json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isOnline: user.isOnline,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Error logging in" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // Clear auth cookie
    res.clearCookie("auth_token", {
      ...COOKIE_OPTIONS,
      maxAge: 0,
    });

    const authToken = req.cookies.auth_token;
    if (authToken) {
      try {
        const decoded = jwt.verify(
          authToken,
          process.env.JWT_SECRET || "your-secret-key"
        ) as { userId: string };
        const user = await User.findById(decoded.userId);
        if (user) {
          user.isOnline = false;
          await user.save();
        }
      } catch (error) {
        // Token verification failed, but we still want to clear the cookie
        console.error("Token verification failed during logout:", error);
      }
    }

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: "An unexpected error occurred during logout",
    });
  }
};

export const isAuthenticated = async (req: Request, res: Response) => {
  try {
    if ((req as any).user) {
      const userId = (req as any).user.userId;
      const user = await User.findById(userId);
      if (userId && user)
        return res.json({
          isAuthenticated: true,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            isOnline: user.isOnline,
          },
        });
      else return res.json({ isAuthenticated: false });
    } else {
      return res.json({ isAuthenticated: false });
    }
  } catch (error) {
    console.error("token verification error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details:
        "An unexpected error occurred during checking if user is authenticated or n",
    });
  }
};


export const searchUser = async (req: Request, res: Response) => {
  try {
    const { username } = req.query;
    console.log(username)
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(400).json({ error: 'Error searching user' });
  }
};