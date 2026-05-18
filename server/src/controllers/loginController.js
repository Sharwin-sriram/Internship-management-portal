import express from "express";

export const login = (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Login successful",
      user: { email }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error during login" 
    });
  }
};

export const register = (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }
    
    res.status(201).json({ 
      success: true, 
      message: "Registration successful",
      user: { email, name }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error during registration" 
    });
  }
};

