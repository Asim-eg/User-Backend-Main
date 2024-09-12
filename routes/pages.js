//pages.js
const express = require("express");
const User = require("../models/userModel");
const router = express.Router();

router.get("/", (req, res) => {
  if (req.session.user) {
    var user = [req.session.user];
    if (user.isAdmin) {
      return res.redirect("dashboard",{ users: user});
    }
    else{
    res.render("dashboard", { users: user, admin: null });
    }
  } else {
    res.redirect("/login");
  }
});
router.get("/login", (req, res) => {
 
  return res.render("login", { error: null });
});
router.get("/signup", (req, res) => {

  return res.render("signup", { error: null });
});
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

router.get("/dashboard", async (req, res) => {
  try {
    var admin = req.session.user;
    if (!admin) {
      return res.redirect("/login");
    }
    var token = admin.token;

    var admin = await User.findById(admin._id);
    admin.token = token;
    if (!admin && !admin.isAdmin) {
      return res.redirect("/login");
    }

    const users = await User.find({ isAdmin: false });

    return res.render("admindashboard", { users: users, admin: admin });
  } catch (err) {
    console.log(err.message);
  }
});

router.get("/forgetpassword", (req, res) => {
  res.render("forgetpassword", { users: null, resetToken: null });
});

router.get("/forgetpassword/:resetToken/:email", async (req, res) => {
  try {
    console.log(req.params);
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.redirect("/login");
    }
    return res.render("forgetpassword", {
      user: user,
      resetToken: req.params.resetToken,
    });
  } catch (err) {
    console.log(err.message);
    return res.redirect("/login");
  }
});

module.exports = router;
