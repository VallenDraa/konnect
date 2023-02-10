import express from 'express';
import verifyToken from '../controller/auth/tokenController.js';
import {
  contactRequestDetails,
  getAllNotifications,
  setNotifToSeen,
} from '../controller/notificationController/notificationController.js';

const router = express.Router();

router.get('/get_all_notifications', verifyToken, getAllNotifications);
router.put('/notif_contacts_detail', verifyToken, contactRequestDetails);
router.put('/set_notif_to_seen', verifyToken, setNotifToSeen);

export default router;
