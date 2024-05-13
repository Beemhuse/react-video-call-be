


class UserManager {
  constructor() {
      this.userSockets = {}; // This will store user sockets indexed by their ID
  }

  /**
   * Creates a new user or updates an existing one.
   * @param {SocketIO.Socket} socket - The socket instance associated with the user.
   * @param {string} id - The unique ID of the user.
   * @returns {Object} The user object.
   */

  
  createOrUpdate(socket, id) {
    console.log()
      if (!id) return null; // Ensure the user ID is valid
      if (this.userSockets[id]) {
          console.log("create with id ==> ===", id)
          // Update existing user
          this.userSockets[id].socket = socket; // Update the socket instance
          this.userSockets[id].id = id; // Update the user's name
      } else {
          // Create new user
          this.userSockets[id] = {
              socket: socket,
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
//   get(id) {
//       return this.userSockets[id] ? this.userSockets[id].socket : undefined;
//   }
get(id) {
    // Ensure the user ID is valid and exists in the userSockets object
    if (id && this.userSockets[id]) {
        return this.userSockets[id].socket;
    } else {
        return undefined;
    }
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
