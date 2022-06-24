import express from 'express';

import {
  findUser,
  getOtherUserDetail,
} from '../controller/query/userQuery/userQueryController.js';
const router = express.Router();

// to find all user that matches the query
router.get('/find_user', findUser);
router.get('/get_other_user_detail', getOtherUserDetail);

export default router;
