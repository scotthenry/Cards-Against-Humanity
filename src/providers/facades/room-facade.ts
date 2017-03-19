import {RoomWebService} from "../web-services/room-web-service";
import {Room} from "../../data-classes/room";
import {DeckWebService} from "../web-services/deck-web-service";
import {User} from "../../data-classes/user";
import {Injectable} from "@angular/core";
import {UserWebService} from "../web-services/user-web-service";
/**
 * Created by Sonalee Shah on 3/4/2017.
 */

// ======================================================================
// This Class outlines the methods of RoomFacade
// ======================================================================

@Injectable()

export class RoomFacade {

  roomWebService;
  userWebService;
  private currentRoom: Room;

  constructor() {
    this.roomWebService = new RoomWebService();
    this.userWebService = new UserWebService();
  }

  // Calls callback with Room
  getRoom(roomID: string, callback) {
    this.roomWebService.getRoom(roomID, function (room) {
      callback(room)
    })
  }

  // Calls callback with Array<Room>
  getRooms(callback) {
    console.log('getRooms()');
    this.roomWebService.getAllRooms(function (rooms) {
      callback(rooms)
    });
  }

  getUsersInRoom(roomID: string, callback) {
    var that = this;
    this.roomWebService.getUsersInRoom(roomID, function (ids) {
      that.userWebService.getUsersByIDList(ids, function (listOfUsers) {
        callback(listOfUsers.sort(function (a, b) {
          var keyA = a.username;
          var keyB = b.username;
          if(keyA < keyB) return -1;
          if(keyA > keyB) return 1;
          return 0;
        }));
      });
    });
  }

  // TODO: Extend functionality for 1+ deck
  // Calls callback with Room
  createRoom(name: string, user: User, isLocked: boolean, callback, password?: string) {
    var facade = this;
    if (password) {
      this.roomWebService.createRoom(name, ['-KdfzixNq1S7IF_LGlCj'], user.id, function (roomID) {
        callback(facade.createRoomObject(roomID, name, user, isLocked, password))
      }, password);
    } else {
      this.roomWebService.createRoom(name, ['-KdfzixNq1S7IF_LGlCj'], user.id, function (roomID) {
        callback(facade.createRoomObject(roomID, name, user, isLocked))
      });
    }
  }

  // Calls callback with updated Room after user is added
  joinRoom(room: Room, userID: string, callback: any) {
    room.addUser(userID, callback);
  }

  // Calls callback with updated Room after user leaves
  removeUser(room: Room, userID: string, callback) {
    room.removeUser(userID, callback);
  }

  // Returns true if supplied password is correct
  attemptRoomPassword(room: Room, password: string) {
    return room.password == password;
  }

  // Calls get Room and returns true if the room is at capacity
  isRoomReady(roomID, callback) {
    this.getRoom(roomID, function (room: Room) {
      callback(room.isRoomReady());
    });
  }

  private createRoomObject(roomID: string, name: string, user: User, isLocked: boolean, password?: string): Room {
    var ds = new DeckWebService();
    var decks = [];
    var deckID = '-KdfzixNq1S7IF_LGlCj';
    var deckPromise: Promise<void>;
    var deck = ds.getDeckFromCache(deckID); // TODO: extend functionality for 1+ deck

    if (deck == undefined) {
      deckPromise = new Promise(function (resolve, reject) {
        ds.getDeck(deckID, d => {
          resolve(d)
        });
      }).then(function (result) {
        decks.push(result);
      })
    } else {
      decks.push(deck);
    }

    var users = [];
    users.push(user);
    return new Room(decks, isLocked, name, 3, roomID, users, password);
  }

  private hasUser(userID: string): boolean {
    for (var i=0; i < this.currentRoom.users.length; i++) {
      if (this.currentRoom.users[i].id === userID) {
        return true;
      }
    }
    return false;
  }

}
