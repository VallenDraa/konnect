import express from 'express';
import { findUser } from '../userQuery/userQueryController.js';
const router = express.Router();

// to find all user that matches the query
router.get('/find_user', findUser);
router.get('/get_user_detail');

export default router;
