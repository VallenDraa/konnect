import api from "../apiAxios/apiAxios";

export default async function findUsersFromContact(query, token) {
  try {
    const { data } = await api.get(
      `/contact/find_users_from_contact?query=${query}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return data;
  } catch (error) {
    throw error;
  }
}
