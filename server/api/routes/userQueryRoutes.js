import express from 'express';
import verifyToken from '../controller/auth/tokenController.js';
import {
  findUsers,
  findUsersFromContact,
  getUserDetail,
  getUsersPreview,
} from '../controller/query/userQuery/userQueryController.js';
const router = express.Router();

// to find all user that matches the query
router.get('/find_users', findUsers);
router.post('/find_users_from_contact', verifyToken, findUsersFromContact);
router.get('/get_user_detail', getUserDetail);
router.post('/get_users_preview', getUsersPreview);

export default router;
