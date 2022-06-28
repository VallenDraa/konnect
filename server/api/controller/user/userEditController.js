import express from 'express';
import {
  editAccount,
  editProfile,
  editSettings,
} from '../../routes/userEditRoutes.js';
const router = express.Router();

// to find all user that matches the query
router.put('/edit_profile', editProfile);
router.put('/edit_account', editAccount);
router.put('/edit_settings', editSettings);

export default router;
