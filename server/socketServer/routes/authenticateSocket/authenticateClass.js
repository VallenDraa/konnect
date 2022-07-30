export default class Authenticate {
  /**
   *
   * @param {String} userId
   * @param {String} socketId
   */
  constructor(userId, socketId) {
    this.userId = userId;
    this.socketId = socketId;
  }

  /**
   *
   * @param {Array} onlineList
   *
   * @returns the user that's going to be added
   */
  addUserToOnline(onlineList) {
    const isUserOnline = this.userId in onlineList;

    if (!isUserOnline) {
      const user = { [this.userId]: this.socketId };
      return { success: true, user, message: null };
    } else {
      return { success: false, user: null, message: "User is already online" };
    }
  }

  /**
   *
   * @param {Array} onlineList
   *
   * @returns the user that's going to be removed
   *
   */
  removeOnlineUser(onlineList) {
    const isUserOnline = this.userId in onlineList;

    if (isUserOnline) {
      const user = { [this.userId]: this.socketId };
      return { success: true, user, message: null };
    } else {
      return { success: false, user: null, message: "Invalid user" };
    }
  }
}
