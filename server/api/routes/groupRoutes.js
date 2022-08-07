import express from "express";
import verifyToken from "../controller/auth/tokenController.js";
import { makeGroup } from "../controller/group/groupEditController.js";
const router = express.Router();

router.post("/make_group", verifyToken, makeGroup);
router.put("/edit_group", verifyToken);
router.put("/quit_group", verifyToken);
router.put("/kick_from_group", verifyToken);
router.put("/add_to_group", verifyToken);
router.delete("/delete_group", verifyToken);

export default router;
