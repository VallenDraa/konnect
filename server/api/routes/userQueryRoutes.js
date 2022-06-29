import express from 'express';

import {
  findUser,
  getUserDetail,
  getUsersPreview,
} from '../controller/query/userQuery/userQueryController.js';
const router = express.Router();

// to find all user that matches the query
router.get('/find_user', findUser);
router.get('/get_user_detail', getUserDetail);
router.post('/get_users_preview', getUsersPreview);

export default router;
