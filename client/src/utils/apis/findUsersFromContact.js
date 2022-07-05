import api from '../apiAxios/apiAxios';

export default async function findUsersFromContact(query) {
  try {
    const { data } = await api.post(`/query/user/find_users_from_contact`, {
      query,
      token: sessionStorage.getItem('token'),
    });

    // console.log(data);
    return data;
  } catch (error) {
    throw error;
  }
}
