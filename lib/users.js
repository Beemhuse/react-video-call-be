


class UserManager {
  constructor() {
      this.userSockets = {}; // This will store user sockets indexed by their ID
  }

  /**
   * Creates a new user or updates an existing one.
   * @param {SocketIO.Socket} socket - The socket instance associated with the user.
   * @param {string} id - The unique ID of the user.
   * @param {string} name - The name of the user.
   * @returns {Object} The user object.
   */

  
  createOrUpdate(socket, id, name) {
      if (!id) return null; // Ensure the user ID is valid

      if (this.userSockets[id]) {
          // Update existing user
          this.userSockets[id].socket = socket; // Update the socket instance
          this.userSockets[id].name = name; // Update the user's name
      } else {
          // Create new user
          this.userSockets[id] = {
              socket: socket,
              name: name,
              id: id
          };
      }

      return this.userSockets[id];
  }

  /**
   * Retrieves a user's socket by their ID.
   * @param {string} id - The ID of the user to retrieve.
   * @return {SocketIO.Socket | undefined} The socket of the user, or undefined if not found.
   */
  get(id) {
      return this.userSockets[id] ? this.userSockets[id].socket : undefined;
  }

  /**
   * Removes a user session.
   * @param {string} id - The ID of the user to remove.
   */
  remove(id) {
      delete this.userSockets[id];
  }
}

module.exports = UserManager;
