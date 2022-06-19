import express from 'express';
import {
  queueRequestToSender,
  sendRequestToRecipient,
} from '../controller/contactRequestController/ContactRequestController.js';
import verifyToken from '../controller/auth/tokenController.js';
const router = express.Router();

// send request to recipient
router.put('/send_contact_request', verifyToken, sendRequestToRecipient);

// queue the sender's request
router.put('/queue_contact_request', verifyToken, queueRequestToSender);

export default router;
