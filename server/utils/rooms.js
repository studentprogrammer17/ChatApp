export class Rooms {
    constructor() {
      this.rooms = [];
    }
  
    addRoom(id, room) {
        let existingRoom = this.rooms.find(r => r.room === room);
        if (!existingRoom) {
          let newRoom = { id, room };
          this.rooms.push(newRoom);
          return newRoom;
        }
        return existingRoom;
      }
  
    getRoomsList() {
      return this.rooms;
    }
  
    getRoom(id) {
      return this.rooms.filter((room) => room.id === id)[0];
    }
  
    removeRoom(id) {
      let theRoom = this.getRoom(id);
  
      if(theRoom){
        this.rooms = this.rooms.filter((room) => room.id !== id);
      }
  
      return theRoom;
    }
}
