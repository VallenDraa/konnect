import express from 'express';
import verifyToken from '../controller/auth/tokenController.js';
import {
  findUsers,
  getUserDetail,
  getUsersPreview,
} from '../controller/query/userQuery/userQueryController.js';
const router = express.Router();

// to find all user that matches the query
router.get('/find_users', findUsers);
router.get('/get_user_detail', getUserDetail);
router.post('/get_users_preview', verifyToken, getUsersPreview);

export default router;
