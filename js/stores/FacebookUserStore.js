var Reflux = require('reflux');
var Parse = require('parse').Parse;

var FacebookUserActions = require('../actions/FacebookUserActions.js');

var FacebookUserStore = Reflux.createStore({
    listenables: [FacebookUserActions],
    facebookUser: null,
    facebookUserFriends: null,
    avatar: null,

    getInitialState: function () {
        return this.facebookUser;
    },
    setUser: function (user) {
        console.log("user set to: " + user.name);
        var promise = new Parse.Promise();

        this.facebookUser = user;
        if (null != this.facebookUserFriends && null != this.facebookUser) {
            this.facebookUser.friends = this.facebookUserFriends;
        }
        if (null != this.avatar && null != this.facebookUser) {
            this.facebookUser.avatar = this.avatar;
        }
        this.trigger(this.facebookUser);

        promise.resolve(user);
        return promise;
    },
    setFriendsList: function (friends) {
        this.facebookUserFriends = friends;
        if (null != this.facebookUser) {
            this.facebookUser.friends = this.facebookUserFriends;
            this.trigger(this.facebookUser);
        }
    },
    setPicture: function (picture) {
        this.avatar = picture;
        if (null != this.facebookUser) {
            this.facebookUser.avatar = this.avatar;
            this.trigger(this.facebookUser);
        }
    },
    fetchUser: function () {
        FB.api(
            '/me',
            {fields: 'name, first_name, last_name, email, gender, link, locale, test_group'},
            function (response) {
                if (response && !response.error) {
                    console.log('Successful login for: ' + response.name);
                    this.setUser(response).then(function (user) {
                        FacebookUserActions.fetchUser.completed(user);
                    }, function (err) {
                        return FacebookUserActions.fetchUser.failed(err);
                    });
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
    fetchAvatar: function () {
        FB.api(
            "/me/picture",
            function (response) {
                if (response && !response.error) {
                    console.log('Fetch user picture');
                    this.setPicture(response.data);
                }
            }.bind(this)
        );
    }
});

module.exports = FacebookUserStore;