import api from "../apiAxios/apiAxios";

export default async function findUsersFromContact(query, token) {
  try {
    const { data } = await api.get(
      `/contact/find_users_from_contact?query=${query}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // console.log(data);
    return data;
  } catch (error) {
    throw error;
  }
}
