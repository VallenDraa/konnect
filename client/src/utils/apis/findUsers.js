import api from '../apiAxios/apiAxios';

export default async function findUsers(query) {
  try {
    const { data } = await api.get(`/query/user/find_user?query=${query}`);
    return data.map((i) => ({ user: { ...i } }));
  } catch (error) {
    throw error;
  }
}
