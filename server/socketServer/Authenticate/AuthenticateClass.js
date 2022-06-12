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
   * @returns the user that is to be added
   */
  addUserToOnline(onlineList) {
    const isUserOnline = onlineList.some((item) => item.userId === this.userId);
    const user = { userId: this.userId, socketId: this.socketId };

    return !isUserOnline
      ? { success: true, user, message: null }
      : { success: false, user: null, message: 'User is already logged in' };
  }

  /**
   *
   * @param {Array} onlineList
   *
   * @returns the user that is to be removed
   *
   */
  removeOnlineUser(onlineList) {
    const isUserOnline = onlineList.some((item) => {
      console.log(item.userId, this.userId);
      return item.userId === this.userId;
    });

    const user = { userId: this.userId, socketId: this.socketId };

    console.log(onlineList);
    console.log(isUserOnline);

    return isUserOnline
      ? { success: true, user, message: null }
      : { success: false, user: null, message: 'Invalid user' };
  }

  /**
   *
   * @param {Array} onlineList
   * @param {String} userId
   * @returns data regarding the target user id
   */
  static findOnlineUser(onlineList, userId) {
    const user = onlineList.find((item) => item.userId === userId);

    return user;
  }
}
