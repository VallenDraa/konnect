import api from '../apiAxios/apiAxios';

export default async function getUsersPreview(token, userIds) {
  try {
    const { data } = await api.post(
      '/query/user/get_users_preview',

      { userIds },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return data;
  } catch (error) {
    throw error;
  }
}
