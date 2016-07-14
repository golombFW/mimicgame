var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin');
var Parse = require('parse').Parse;
var Utils = require('../Utils/Utils.js');
var hash = require('object-hash');
var _ = require('underscore');
var $ = Utils.$;

var FacebookUserActions = require('../actions/FacebookUserActions.js');
var UserActions = require('../actions/UserActions.js');

var _facebookUserClassName = "FacebookUser";

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
    fetchUser: function (isUpdateNeeded) {
        FB.api(
            '/me',
            {fields: 'name, first_name, last_name, email, gender, link, locale, location, age_range, test_group'},
            function (response) {
                if (response && !response.error) {
                    console.log('Successful login for: ' + response.name);
                    this.setUser(response, isUpdateNeeded);
                }
            }.bind(this)
        );
    },
    setUser: function (user, isUpdateNeeded) {
        console.log("user set to: " + user.name);

        var facebookUser = Object.assign($.clone(this.state.facebookUser), user);
        if (isUpdateNeeded) {
            this.updateParseUser(user);
        }
        this.setState({facebookUser: facebookUser});
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

    //Helpers
    setFriendsList: function (friends) {
        this.facebookUserFriends = friends;
        var user = $.clone(this.state.facebookUser);
        user.friends = this.facebookUserFriends;
        this.updateFriendsList(friends);
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
    },
    updateFriendsList: function (fbFriendsList) {
        var self = this;
        var friendsIds = _.map(fbFriendsList, function (friend) {
            return friend.id;
        });

        var friendsListHash = hash(friendsIds, {unorderedArrays: true});

        Parse.User.current().fetch().then(function (fetchedUser) {
            console.log("User fetch successful before friends list update");
            var fbUser = fetchedUser.get("FacebookUser");
            var serverFriendsListHash = fbUser.get("friendsListHash");
            if (serverFriendsListHash !== friendsListHash) {
                self.prepareServerFriendsList(friendsIds).then(function (friendsList) {
                    fbUser.set("friendsList", friendsList);
                    fbUser.set("friendsListHash", friendsListHash);

                    fbUser.save().then(function (newFbUser) {
                        console.log("Friends list for user saved");
                    }, function (error) {
                        console.error("Error while saving friends list to user: " + error.message);
                    });
                }, function (error) {
                    console.error(error.message);
                });
            } else {
                console.log("Friends list on server doesn't require update.");
            }
        }, function (error) {
            console.error("Something goes wrong while fetching user in updateFriendsList: " + error.message);
        });
    },
    prepareServerFriendsList: function (friendsIds) {
        var promise = new Parse.Promise();
        var fbUserQuery = new Parse.Query(_facebookUserClassName);
        fbUserQuery.containedIn("facebookId", friendsIds);
        fbUserQuery.find().then(function (facebookUsers) {
            var friendsList = _.map(facebookUsers, function (fbUser) {
                var user = fbUser.get("User");
                return user.id;
            });
            promise.resolve(friendsList);
        }, function (error) {
            console.error("Problem with getting facebookUsers from facebook ids: " + error.message);
            promise.reject(error);
        });
        return promise;
    }
});

module.exports = FacebookUserStore;