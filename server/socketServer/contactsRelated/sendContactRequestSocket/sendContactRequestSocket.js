import axios from 'axios';
import { createErrorNonExpress } from '../../../utils/createError.js';

export default function sendContactRequest(socket) {
  socket.on(
    'send-add-contact',
    async (senderId, recipientId, senderToken, cancel) => {
      const isRecipientOnline = recipientId in global.onlineUsers;
      const recipientSocketId = isRecipientOnline
        ? global.onlineUsers[recipientId]
        : null;

      try {
        // add sender id to recipients requests parameter in the DB and returns an updated recipient data
        const send = await axios.put(
          `${process.env.API_URL}/request/send_contact_request`,
          { recipientId, senderId, token: senderToken, cancel }
        );
        const sendResponse = send.data || null;

        // add recipient id to senders requests parameter in the DB and returns an updated sender data
        const queue = await axios.put(
          `${process.env.API_URL}/request/queue_contact_request`,
          { recipientId, senderId, token: senderToken, cancel }
        );
        const queueResponse = queue.data || null;

        // send the updated sender data to the client
        if (queueResponse.success) {
          socket.emit('update-client-data', queueResponse);
        } else {
          const { message, status } = queueResponse;
          socket.emit('error', createErrorNonExpress(null, status, message));
        }

        // send notification to the recipient if recipient is online
        if (
          isRecipientOnline &&
          queueResponse.success &&
          sendResponse.success
        ) {
          const { username, _id } = queueResponse.user;
          const senderDetail = { username, _id };

          socket
            .to(recipientSocketId)
            .emit('receive-add-contact', sendResponse, senderDetail);
        } else {
          if (!queueResponse.success) {
            socket
              .to(recipientSocketId)
              .emit(
                'error',
                createErrorNonExpress(
                  queueResponse.status,
                  queueResponse.message
                )
              );
          } else if (!sendResponse.success) {
            socket
              .to(recipientSocketId)
              .emit(
                'error',
                createErrorNonExpress(sendResponse.status, sendResponse.message)
              );
          }
        }
      } catch (error) {
        socket.emit('error', error);
      }
    }
  );
}
