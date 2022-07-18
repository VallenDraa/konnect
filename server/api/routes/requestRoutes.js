import express from 'express';
import {
  contactRequestRespondRecipient,
  contactRequestRespondSender,
  deleteContactRequest,
  queueRequestToSender,
  respondToContactRequest,
  sendContactRequest,
  sendRequestToRecipient,
} from '../controller/requests/contactRequestController/ContactRequestController.js';
import verifyToken from '../controller/auth/tokenController.js';
import createError from '../../utils/createError.js';
import User from '../../model/User.js';
const router = express.Router();

// check if users with the ids that were sent exists middleware
const verifySentIDs = async (req, res, next) => {
  const { recipientId, senderId } = req.body;

  try {
    if (!(await User.exists({ _id: recipientId })))
      return createError(
        next,
        404,
        "The recipient for the contact request doesn't exist"
      );
    if (!(await User.exists({ _id: senderId })))
      return createError(
        next,
        404,
        "The sender for the contact request doesn't exist"
      );

    next();
  } catch (error) {
    next(error);
  }
};

// check if the oppositeId is already the contact of targetid
const isUserAlreadyInContact = async (req, res, next) => {
  const { recipientId, senderId } = req.body;

  try {
    const query = {
      $and: [{ _id: senderId }, { 'contacts.user': recipientId }],
    };

    if (await User.exists(query)) {
      return createError(next, 409, 'This user is already in your contact !');
    }

    next();
  } catch (error) {
    next(error);
  }
};

// send request to recipient
router.put(
  '/send_contact_request',
  verifyToken,
  verifySentIDs,
  sendRequestToRecipient
);

// queue the sender's request
router.put(
  '/queue_contact_request',
  verifyToken,
  verifySentIDs,
  queueRequestToSender
);

// handling user response to ther contact request for sender
router.put(
  '/handle_contact_request_sender',
  verifyToken,
  verifySentIDs,
  isUserAlreadyInContact,
  contactRequestRespondSender
);

// handling user response to ther contact request for recipient
router.put(
  '/handle_contact_request_recipient',
  verifyToken,
  verifySentIDs,
  isUserAlreadyInContact,
  contactRequestRespondRecipient
);

router.put('/send_contact_request_new', verifyToken, sendContactRequest);
router.put('/respond_to_contact_request', verifyToken, respondToContactRequest);
router.put('/delete_contact_request', verifyToken, deleteContactRequest);

export default router;
