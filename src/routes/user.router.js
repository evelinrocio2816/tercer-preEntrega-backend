const express = require("express");
const router = express.Router();
const passport = require("passport");
const UserController = require("../controllers/user.controllers.js");

const userController = new UserController();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", passport.authenticate("jwt", { session: false }), userController.profile);
router.post("/logout", userController.logout);
router.get("/admin", passport.authenticate("jwt", { session: false }), userController.admin);


router.get("/auth/github", passport.authenticate("github"));
router.get("/auth/github/callback", passport.authenticate("github", {failureRedirect: "/login"}), userController.githubAuthCallback);

module.exports = router;

