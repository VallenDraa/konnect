import express from "express";
import verifyToken from "../controller/auth/tokenController.js";
import {
  editAccount,
  editProfile,
  editSettings,
  getSettings,
  setLastSeen,
  unfriend,
} from "../controller/user/userEditController.js";
const router = express.Router();

// to find all user that matches the query
router.get("/get_settings", verifyToken, getSettings);
router.put("/edit_profile", verifyToken, editProfile);
router.put("/edit_account", verifyToken, editAccount);
router.put("/edit_settings", verifyToken, editSettings);
router.put("/unfriend", verifyToken, unfriend);
router.put("/set_last_seen", setLastSeen);

export default router;
