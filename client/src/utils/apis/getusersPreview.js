import api from "../apiAxios/apiAxios";

/**
 *
 * @param {String} token
 * @param {Array} userIds
 * @returns
 */

export default async function getUsersPreview(token, userIds) {
  try {
    const { data } = await api.get(
      `/query/user/get_users_preview?userIds=${userIds.join(",")}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return data;
  } catch (error) {
    throw error;
  }
}
