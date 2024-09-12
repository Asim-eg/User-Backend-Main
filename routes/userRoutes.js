//userRoutes.js
const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  updateAuth,
  deleteAuth,
  changePassword,
  logout,
  resetlink,
  updatePassAuth,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

// Route for users
router.post("/signup", registerUser);
router.post("/login", loginUser);
router.route("/update").post(protect, updateAuth);
router.route("/updatePassword").post(protect, updatePassAuth);

router.route("/delete").post(protect, deleteAuth);
router.route("/logout").post(protect, logout);

router.post("/changepassword", resetlink);
router.post("/changepassword/:resetToken", changePassword);

// Route for admin

module.exports = router;
