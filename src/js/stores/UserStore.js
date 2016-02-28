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
    updateUser: function (useQuery) {
        var parseUser = Parse.User.current();
        if ('undefined' === typeof useQuery) {
            useQuery = true;
        }
        if (parseUser && useQuery) {
            var userId = parseUser.id;
            var query = new Parse.Query(Parse.User);
            query.include("FacebookUser");
            query.include("settings");
            query.get(userId).then(function (user) {
                console.log("User update successful: " + JSON.stringify(user));
                this.setUser(user);
            }, function (error) {
                console.error("Cannot update user: " + error.message);
            });
        } else {
            this.setUser(parseUser);
        }

    }
});

ParsePatches.applyPatches();

module.exports = UserStore;