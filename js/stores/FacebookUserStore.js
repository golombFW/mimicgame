var Reflux = require('reflux');
var FacebookUserActions = require('../actions/FacebookUserActions.js');

var FacebookUserStore = Reflux.createStore({
    listenables: [FacebookUserActions],
    facebookUser: null,
    facebookUserFriends: null,

    getInitialState: function () {
        return this.facebookUser;
    },
    setUser: function (user) {
        this.facebookUser = user;
        if (this.facebookUserFriends != null && this.facebookUser != null) {
            this.facebookUser.friends = this.facebookUserFriends;
        }
        this.trigger(this.facebookUser);
    },
    setFriendsList: function (friends) {
        this.facebookUserFriends = friends;
        if (this.facebookUser != null) {
            this.facebookUser.friends = this.facebookUserFriends;
            this.trigger(this.facebookUser);
        }
    },
    fetchUser: function () {
        FB.api('/me', {fields: 'name, first_name, last_name, email, gender, link, locale, test_group, cover'}, function (response) {
            console.log('Successful login for: ' + response.name);
            this.setUser(response);
        }.bind(this));
    },
    fetchFriendsList: function () {
        FB.api('/me/friends', function (response) {
            if (response && !response.error) {
                console.log('Fetch friends list, size: ' + response.data.length);
                this.setFriendsList(response.data);
            }
        }.bind(this));
    }
});

module.exports = FacebookUserStore;