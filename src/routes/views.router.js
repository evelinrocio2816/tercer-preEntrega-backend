const express = require("express");
const router = express.Router();
const ViewsController = require("../controllers/views.controllers.js");
const viewsController = new ViewsController();
const checkUserRole = require("../middleware/checkrole.js");
const passport = require("passport");

router.get("/products", checkUserRole(['user']),passport.authenticate('jwt', { session: false }), viewsController.renderProducts);
router.get("/carts/:cid", viewsController.renderCart);
router.get("/login", viewsController.renderLogin);
router.get("/register", viewsController.renderRegister);
router.get("/realtimeproducts", checkUserRole(['admin']), viewsController.renderRealTimeProducts);
router.get("/chat", checkUserRole(['user']) ,viewsController.renderChat);
router.get("/", viewsController.renderHome);

module.exports = router;

