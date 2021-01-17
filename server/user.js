class User {

    constructor(socketID, name, room, role) {
        this.socketID = socketID;
        this.name = name;
        this.room = room;
        this.role = role;
    }
}


module.exports = User;