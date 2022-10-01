import express from "express";
import verifyToken from "../controller/auth/tokenController.js";
import {
  makeGroup,
  editGroup,
  quitGroup,
  joinGroup,
  deleteGroup,
  removeGroup,
} from "../controller/group/groupEditController.js";
const router = express.Router();

router.post("/make_group", verifyToken, makeGroup);
router.put("/edit_group", verifyToken, editGroup);
router.put("/quit_group", verifyToken, quitGroup);
router.put("/kick_from_group", verifyToken, quitGroup);
router.put("/add_to_group", verifyToken, joinGroup);
router.delete("/delete_group", verifyToken, deleteGroup);
router.put("/remove_group", verifyToken, removeGroup);

export default router;
