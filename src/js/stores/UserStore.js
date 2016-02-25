var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin');
var Parse = require('parse').Parse;
var ParsePatches = require('../hacks/ParsePatches.js');
var $ = require('../utils/Utils.js').$;


var UserActions = require('../actions/UserActions.js');

var UserStore = Reflux.createStore({
    mixins: [StateMixin.store],
    listenables: [UserActions],

    getInitialState: function () {
        return {
            user: Parse.User.current()
        }
    },
    setUser: function (user) {
        this.setState({
            user: user
        });
    },
    updateUser: function () {
        var user = Parse.User.current();
        if (user && user instanceof Parse.Object) {
            user = user.clone();
        }
        this.setUser(user);
    }
});

ParsePatches.applyPatches();

module.exports = UserStore;