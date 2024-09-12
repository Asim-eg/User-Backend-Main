//userControllers.js
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const registerUser = asyncHandler(async (req, res) => {
  const { email, password, pic } = req.body;

  if (!email || !password) {
    res.status(400).json({ msg: "Please Enter all the fields" });
  }
  const userExists = await User.findOne({ email: email });
  if (userExists) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const username = email.split("@")[0];
  const user = await User.create({
    username: username,
    email: email,
    password: hashedPassword,
    pic: pic,
  });
  req.session.user = {
    _id: user._id,
    username: user.username,
    email: user.email,
    token: generateToken(user._id),
    lastAccessed: user.lastAccessed,
    createdAt: user.createdAt,
  };

  return res.redirect("/");
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    res.status(400).json({ msg: "Please Enter all the fields" });
  const user = await User.findOne({ email: email });

  if (!user) {
    res.status(400).json({ msg: "User Does Not exist" });
  }
  if (user.isSuspend) {
    throw new Error("User is Suspended: " + user.SuspendReason);
  }
  if (user.isBlocked) {
    throw new Error("User is Blocked: " + user.BlockReason);
  }
  const pwdMatch = await bcrypt.compare(password, user.password);
  await User.findOneAndUpdate({ email: email }, { lastAccessed: Date.now() });
  if (!pwdMatch) res.status(400).json({ msg: "Password Incorrect" });
  req.session.user = {
    _id: user._id,
    username: user.username,
    email: user.email,
    token: generateToken(user._id),
    lastAccessed: user.lastAccessed,
    createdAt: user.createdAt,
    isAdmin: user.isAdmin,
  };
  return res.redirect("/");
});
const updateAuth = asyncHandler(async (req, res) => {
  const { username, email, } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    res.status(400).json({ msg: "User Does Not exist" });
  }
  if (username) {
    await User.findByIdAndUpdate(user._id, { username: username });
  }
  const u = await User.findOne({ email: email });
  req.session.user = {
    _id: u._id,
    username: u.username,
    email: u.email,
    token: generateToken(u._id),
    lastAccessed: u.lastAccessed,
    createdAt: u.createdAt,
  };

  return res.redirect("/");
});
const updatePassAuth = asyncHandler(async (req, res) => {
  const { email, oldPassword,newPassword} = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    res.status(400).json({ msg: "User Does Not exist" });
  }
  if (newPassword) {
    const pwdMatch = await bcrypt.compare(oldPassword, user.password);

    if (!pwdMatch) res.status(400).json({ msg: "Password Incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(user._id, { password: hashedPassword });
  }
  const u = await User.findOne({ email: email });
  req.session.user = {
    _id: u._id,
    username: u.username,
    email: u.email,
    token: generateToken(u._id),
    lastAccessed: u.lastAccessed,
    createdAt: u.createdAt,
  };

  return res.redirect("/");
});


const deleteAuth = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email });
  console.log(user);
  if (!user) {
    res.status(400).json({ msg: "User Does Not exist" });
  }
  await User.findByIdAndDelete(user._id);

  req.session.user = null;
  res.status(200).json({
    msg: "Successfully Deleted",
  });
});

const resetlink = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });

  if (!user) {
    throw new Error("User does not exist");
  }
  if (user.isSuspend) {
    throw new Error("User is Suspend: " + user.SuspendReason);
  }
  if (user.isBlocked) {
    throw new Error("User is Blocked: " + user.BlockReason);
  }
  var resetToken = crypto.randomBytes(64).toString("hex");

  await User.findByIdAndUpdate(user._id, { resetToken: resetToken });
  res.status(200).json({
    resetToken: resetToken,
  });
});
const changePassword = asyncHandler(async (req, res) => {
  console.log(req.body);

  const { userid, password } = req.body;
  const { resetToken } = req.params;
  const user = await User.findById(userid);
  console.log(user);
  if (resetToken != user.resetToken) {
    throw new Error("Reset Token does not match");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const u = await User.findByIdAndUpdate(user._id, {
    password: hashedPassword,
    resetToken: "",
  });
  if (u) {
    res.redirect("/login");
  } else {
    res.status(400);
    const u = await User.findByIdAndUpdate(user._id, { resetToken: "" });
    throw new Error("Failed to change password");
  }
});
const logout = asyncHandler(async (req, res) => {
  req.session.user = null;
  return res.redirect("/login");
});

module.exports = {
  registerUser,
  loginUser,
  updateAuth,
  deleteAuth,
  changePassword,
  logout,
  resetlink,
  updatePassAuth
};
