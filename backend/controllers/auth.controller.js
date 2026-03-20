import User from "../models/User.model.js";
import { generateToken } from "../utils/generateToken.js";

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  const { name, email, phone, password, role, state, district } = req.body;

  if (!name || !email || !phone || !password)
    return res.status(400).json({ success: false, message: "All fields required" });

  const exists = await User.findOne({ email });
  if (exists)
    return res.status(400).json({ success: false, message: "Email already registered" });

  const user = await User.create({ name, email, phone, password, role, state, district });

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: {
      _id: user._id, name: user.name, email: user.email,
      phone: user.phone, role: user.role,
      state: user.state, district: user.district,
    },
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ success: false, message: "Email and password required" });

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ success: false, message: "Invalid credentials" });

  res.json({
    success: true,
    token: generateToken(user._id),
    user: {
      _id: user._id, name: user.name, email: user.email,
      phone: user.phone, role: user.role,
      state: user.state, district: user.district,
    },
  });
};

// @desc    Get logged-in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};