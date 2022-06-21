import express from 'express';
import verifyToken from '../controller/auth/tokenController.js';
import { contactRequestDetails } from '../controller/notificationController/notificationController.js';

const router = express.Router();

router.post('/notif_contacts_detail', verifyToken, contactRequestDetails);

export default router;
