export class Users {
    constructor() {
      this.users = [];
    }
  
    addUser(id, name, room, roomsOwner) {
      let existingUser = this.users.find(user => user.name === name && user.room === room);
      if (existingUser) {
        return { error: 'Username is already taken in this room.' };
      }
  
      let user = { id, name, room, roomsOwner };
      this.users.push(user);
      return { user };
    }
  
    getUserList (room) {
      return this.users.filter((user) => user.room === room);
    }
  
    getUser(id) {
      return this.users.filter((user) => user.id === id)[0];
    }

    getUserByName(name) {
      return this.users.filter(user => user.name === name)
    }
  
    removeUser(id) {
      let user = this.getUser(id);
  
      if(user){
        this.users = this.users.filter((user) => user.id !== id);
      }
  
      return user;
    }

    isRoomOwner(id, room) {
      let user = this.getUser(id);
      return user && user.roomsOwner && user.room === room;
    }
  
  }
  
