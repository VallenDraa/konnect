import express from 'express';
import verifyToken from '../controller/auth/tokenController.js';
import {
  findUsersFromContact,
  getUserContactsPreview,
} from '../controller/contacts/contactsController.js';
const router = express.Router();

router.get('/get_user_contacts_preview', verifyToken, getUserContactsPreview);
router.get('/find_users_from_contact', verifyToken, findUsersFromContact);

export default router;
