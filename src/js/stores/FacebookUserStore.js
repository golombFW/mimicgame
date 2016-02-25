var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin');
var Parse = require('parse').Parse;
var Utils = require('../Utils/Utils.js');
var $ = Utils.$;
var FacebookUserActions = require('../actions/FacebookUserActions.js');
var UserActions = require('../actions/UserActions.js');

var FacebookUserStore = Reflux.createStore({
    mixins: [StateMixin.store],
    listenables: [FacebookUserActions],

    facebookUserFriends: null,
    facebookAvatar: null,

    getInitialState: function () {
        return {
            facebookUser: {}
        }
    },
    setUser: function (user, isUpdateNeeded) {
        console.log("user set to: " + user.name);

        var facebookUser = Object.assign($.clone(this.state.facebookUser), user);
        if (isUpdateNeeded) {
            this.updateParseUser(user);
        }
        this.setState({facebookUser: facebookUser});
    },
    setFriendsList: function (friends) {
        this.facebookUserFriends = friends;
        var user = $.clone(this.state.facebookUser);
        user.friends = this.facebookUserFriends;
        this.setState({facebookUser: user});
    },
    setPicture: function (picture, isUpdateNeeded) {
        this.facebookAvatar = picture;
        var user = $.clone(this.state.facebookUser);
        user.avatar = this.facebookAvatar;
        if (isUpdateNeeded) {
            this.updateParseUserAvatar(picture);
        }
        this.setState({facebookUser: user});
    },
    fetchUser: function (isUpdateNeeded) {
        FB.api(
            '/me',
            {fields: 'name, first_name, last_name, email, gender, link, locale, test_group'},
            function (response) {
                if (response && !response.error) {
                    console.log('Successful login for: ' + response.name);
                    this.setUser(response, isUpdateNeeded);
                }
            }.bind(this)
        );
    },
    fetchFriendsList: function () {
        FB.api(
            '/me/friends',
            function (response) {
                if (response && !response.error) {
                    console.log('Fetch friends list, size: ' + response.data.length);
                    this.setFriendsList(response.data);
                }
            }.bind(this)
        );
    },
    fetchAvatar: function (isUpdateNeeded) {
        FB.api(
            "/me/picture",
            function (response) {
                if (response && !response.error) {
                    console.log('Fetch user picture');
                    this.setPicture(response.data, isUpdateNeeded);
                }
            }.bind(this)
        );
    },
    updateParseUser: function (user) {
        //set facebook user first name as user nick
        var parseUser = Parse.User.current();
        if (!parseUser.get("nick")) {
            var nick = Utils.User.getUserName(user.first_name, parseUser.get("nick"), true);
            Parse.User.current().save({
                nick: nick
            }).then(function (result) {
                console.log("Username saved, new username: " + Parse.User.current().get("nick"));
                UserActions.updateUser();
            }, function (error) {
                console.error("Something going wrong while updating user, error code: " + error.message);
            });
        }
    },
    updateParseUserAvatar: function (picture) {
        Parse.User.current().fetch().then(function (fetchedUser) {
            console.log("User fetch successful before avatar update");
            var fbUser = fetchedUser.get("FacebookUser");
            fbUser.set("avatar", picture);
            fbUser.save().then(function (newFbUser) {
                console.log("Avatar for user saved");
                UserActions.updateUser();
            }, function (error) {
                console.error("Error while setting avatar to user: " + error.message);
            });
        }, function (error) {
            console.error("Something goes wrong while fetching user in updateParseUserAvatar: " + error.message);
        });
    }
});

module.exports = FacebookUserStore;