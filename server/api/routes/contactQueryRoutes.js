import express from 'express';

import { getUserContactsPreview } from '../controller/query/contactQuery/contactQueryController.js';
const router = express.Router();

router.post('/get_user_contacts_preview', getUserContactsPreview);

export default router;
