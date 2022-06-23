import axios from 'axios';
import { createErrorNonExpress } from '../../utils/createError.js';

export default function contactRequestRespond(socket) {
  socket.on('contact-requests-response', async (res) => {
    const { data } = await axios.put(
      `${process.env.API_URL}/request/handle_contact_request_recipient`
    );
  });
}
