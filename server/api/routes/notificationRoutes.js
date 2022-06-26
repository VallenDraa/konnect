import express from 'express';
import verifyToken from '../controller/auth/tokenController.js';
import {
  contactRequestDetails,
  setNotifToSeen,
} from '../controller/notificationController/notificationController.js';

const router = express.Router();

router.post('/notif_contacts_detail', verifyToken, contactRequestDetails);
router.put('/set_notif_to_seen', verifyToken, setNotifToSeen);

export default router;
