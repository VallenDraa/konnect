import axios from 'axios';

export default function sendContactRequest(socket) {
  socket.on('send-add-contact', async (senderId, recipientId) => {
    const isRecipientOnline = recipientId in global.onlineUsers;
    const senderSocketId = global.onlineUsers[senderId];
    const recipientSocketId = isRecipientOnline
      ? global.onlineUsers[recipientId]
      : null;

    // add sender id to recipients requests parameter in the DB
    const send = await axios.get(
      `http://localhost:3001/api/request/send_contact_request?recipientId=${recipientId}&senderId=${senderId}`
    );
    const sendRespond = send.data || null;

    // add recipient id to senders requests parameter in the DB
    const queue = await axios.get(
      `http://localhost:3001/api/request/queue_contact_request?recipientId=${recipientId}&senderId=${senderId}`
    );
    const queueRespond = queue.data || null;

    // send the updated sender data to the client
    socket.emit('update-client-data', queueRespond);

    // send notification to the recipient if recipient is online
    if (isRecipientOnline) {
      const { username, _id } = queueRespond.newUserData;

      socket
        .to(recipientSocketId)
        .emit('receive-add-contact', sendRespond, { username, _id });
    }
  });
}
