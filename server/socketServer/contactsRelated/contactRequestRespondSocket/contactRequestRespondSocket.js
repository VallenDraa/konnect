import axios from 'axios';

export default function contactRequestRespond(socket) {
  socket.on('contact-requests-response', async (payload) => {
    const { senderId, recipientId } = payload;
    const isSenderOnline = senderId in global.onlineUsers;

    // updating the recipients data
    try {
      const { data } = await axios.put(
        `${process.env.API_URL}/request/handle_contact_request_recipient`,
        payload
      );

      socket.emit('receive-contact-request-response', data);
      socket.emit('refresh-msg-log');
    } catch (error) {
      console.log(error.response.data);
      socket.emit('receive-contact-request-response', error.response.data);
    }

    // updating the sender data
    try {
      const { data } = await axios.put(
        `${process.env.API_URL}/request/handle_contact_request_sender`,
        payload
      );

      // check if sender is online
      if (isSenderOnline) {
        socket
          .to(global.onlineUsers[senderId])
          .emit('receive-contact-request-response', data);

        socket.to(global.onlineUsers[senderId]).emit('refresh-msg-log');
      }
    } catch (error) {
      console.log(error.response.data);
      if (isSenderOnline) {
        socket
          .to(global.onlineUsers[senderId])
          .emit('receive-contact-request-response', error.response.data);
      }
    }
  });
}
