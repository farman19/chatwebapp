import express from "express";
import { getOtherUsers, login, logout, register } from "../controllers/usercontroller.js";
import isAuthenticated from "../middleware/authenticate.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/").get(isAuthenticated,getOtherUsers);

export default router;