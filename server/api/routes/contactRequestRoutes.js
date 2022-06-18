import express from 'express';
import {
  queueRequestToSender,
  sendRequestToRecipient,
} from '../controller/contactRequestController/ContactRequestController.js';
const router = express.Router();

// send request to recipient
router.get('/send_contact_request', sendRequestToRecipient);

// queue the sender's request
router.get('/queue_contact_request', queueRequestToSender);

export default router;
