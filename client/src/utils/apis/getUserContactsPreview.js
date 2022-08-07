import api from "../apiAxios/apiAxios";

export default async function getUsersContactsPreview(token) {
  try {
    const { data } = await api.get("/contact/get_user_contacts_preview", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return data;
  } catch (error) {
    throw error;
  }
}
