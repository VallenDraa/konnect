import express from "express";
import verifyToken from "../controller/auth/tokenController.js";
import {
  findUsers,
  getAllGroupId,
  getUserDetail,
  getUsersPreview,
} from "../controller/query/userQuery/userQueryController.js";
const router = express.Router();

// to find all user that matches the query
router.get("/find_users", verifyToken, findUsers);
router.get("/get_user_detail", verifyToken, getUserDetail);
router.get("/get_users_preview", verifyToken, getUsersPreview);
router.get("/get_all_group_id", verifyToken, getAllGroupId);

export default router;
