import express from "express";
import { getOtherUsers, login, logout, register } from "../controllers/usercontroller.js";
import isAuthenticated from "../middleware/authenticate.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/", isAuthenticated, getOtherUsers);

export default router;
