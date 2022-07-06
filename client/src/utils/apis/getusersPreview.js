import api from '../apiAxios/apiAxios';

export default async function getUsersPreview(token, userIds) {
  const { data } = await api.post('/query/user/get_users_preview', {
    token,
    userIds,
  });
  return data;
}
