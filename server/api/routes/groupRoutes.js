import express from "express";
import verifyToken from "../controller/auth/tokenController.js";
import {
  makeGroup,
  editGroup,
  quitGroup,
  removeGroup,
  kickGroup,
  giveAdminStatus,
  revokeAdminStatus,
  inviteToGroup,
} from "../controller/group/groupEditController.js";
const router = express.Router();

router.post("/make_group", verifyToken, makeGroup); //✅
router.put("/edit_group", verifyToken, editGroup); //✅
router.put("/quit_group", verifyToken, quitGroup); //✅
router.put("/kick_from_group", verifyToken, kickGroup); //✅
router.put("/remove_group", verifyToken, removeGroup); //✅
router.put("/give_admin_status", verifyToken, giveAdminStatus); //✅
router.put("/revoke_admin_status", verifyToken, revokeAdminStatus); //✅
router.put("/invite_to_group", verifyToken, inviteToGroup);
// replace with .delete when you figure out how to send a json response with the delete method

export default router;
