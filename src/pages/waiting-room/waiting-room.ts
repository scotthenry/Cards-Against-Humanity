import {Component, ViewChild} from '@angular/core';
import {
  AlertController,
  App,
  FabContainer,
  ItemSliding,
  List,
  ModalController,
  NavController,
  NavParams,
  LoadingController
} from 'ionic-angular';
import {RoomFacade} from '../../providers/facades/room-facade';
import {GamePage} from '../../pages/game/game.ts';
import {User} from "../../data-classes/user"; //Remove when removing updateUserList()
import {UserFacade} from "../../providers/facades/user-facade";


@Component({
  selector: 'page-waiting-room',
  templateUrl: 'waiting-room.html'
})
export class WaitingRoomPage {

  @ViewChild('userList', {read: List}) userList: List;
  room: any;
  shownUsers: any = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public roomCtrl: RoomFacade, public userCtrl: UserFacade) {
    this.room = navParams.data;
    console.log(this.room);
  }

  //Runs everytime a user joins the room
  ionViewDidEnter() {
    console.log('ionViewDidLoad WaitingRoomPage');
    this.updateUserList();
  }

  //Updates the list of users in the room
  updateUserList() {
    var that = this;

    this.roomCtrl.getRoom(this.room.id, function (r) {
      var tempArray: Array<User> = [];

      for (var user of r.users) {
        var tempUser = new User(user.username, user.id, user.email);
        tempArray.push(tempUser);
      }
      console.log('Original list of users: ', that.shownUsers);
      that.shownUsers = tempArray;
      that.room = r;

      if (that.room.isRoomReady() == false) {
        setTimeout(that.updateUserList(), 5000);
      }
      else {
        that.joinGame();
      }
      console.log('List of users updated: ', that.shownUsers);
    });
  }


  // sets the appropriate params and navigates to the GamePage
  joinGame() {
    var loggedInUser = this.userCtrl.getLoggedInUser();
    var userName = loggedInUser.username;

    this.navCtrl.push(GamePage, {
      username: userName,
      room: this.room
    });
  }


  updateUserListNew() {
    var that = this;
    this.roomCtrl.getUsersInRoom(this.room.id, function (result) {
      that.shownUsers = result;
      if (result.size == that.room.size) {
        that.roomCtrl.getRoom(that.room.id, function (result) {
          that.room = result;
          that.joinGame();
        });
      } else {
        setTimeout(that.updateUserListNew(), 5000);
      }
    });
  }

}

