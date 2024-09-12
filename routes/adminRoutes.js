//adminRoutes.js
const express = require("express");
const { Adminaccess } = require("../middleware/adminMiddleware");
const {
  getAllUsers,
  adminDeleteAuth,
  adminUpdateAccess,
} = require("../controllers/adminControllers");
const router = express.Router();

router.route("/getallusers").get(Adminaccess, getAllUsers);
router.route("/update/:id").post(Adminaccess, adminUpdateAccess);
router.route("/delete/:id").post(Adminaccess, adminDeleteAuth);

module.exports = router;
