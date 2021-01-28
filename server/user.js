class User {
    /**
     * Creates a User Object to store user data
     * @param {string} socketID 
     * @param {string} name 
     * @param {string} room 
     * @param {string} role 
     */
    constructor(socketID, name, room, role) {
        this.socketID = socketID;
        this.name = name;
        this.room = room;
        this.role = role;
        this.type = "Human"
    }
}


module.exports = User;