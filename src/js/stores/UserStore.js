var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin');
var Parse = require('parse').Parse;
var ParsePatches = require('../hacks/ParsePatches.js');
var $ = require('../utils/Utils.js').$;
var moment = require('moment');

var UserActions = require('../actions/UserActions.js');

var _updateMinSeconds = 15;

var UserStore = Reflux.createStore({
    mixins: [StateMixin.store],
    listenables: [UserActions],
    lastStatsUpdate: null,

    getInitialState: function () {
        return {
            user: Parse.User.current(),
            playerRank: 0
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
            query.include("score");
            query.get(userId).then(function (user) {
                console.log("User update successful: " + JSON.stringify(user));
                this.setUser(user);
            }.bind(this), function (error) {
                console.error("Cannot update user: " + error.message);
            });
        } else {
            this.setUser(parseUser);
        }
    },
    setPlayerRank: function (rank) {
        this.setState({
            playerRank: rank
        });
    },
    updatePlayerRank: function () {
        if (this.state.user && this.state.user.get("score") && $.isNullOrEmpty(this.state.user.get("score").get("score"))) {
            var rankQuery = new Parse.Query("GameScore");
            rankQuery.greaterThan("score", this.state.user.get("score").get("score"));
            rankQuery.notEqualTo("player", this.state.user);
            rankQuery.count().then(function (playerRank) {
                console.log("Player score: " + this.state.user.get("score").get("score") + " Player rank: " + (playerRank + 1));
                this.lastStatsUpdate = moment();
                this.setPlayerRank(playerRank + 1);
            }.bind(this), function (error) {
                console.error(error.message);
            });
        }
    },
    updatePlayerStats: function () {
        var isUpdateTimeLimitNotReached = (!this.lastStatsUpdate || moment().subtract(_updateMinSeconds, 'seconds').isAfter(this.lastStatsUpdate));
        if (isUpdateTimeLimitNotReached) {
            this.updatePlayerRank();
            this.updateUser();
        }
    }
});

ParsePatches.applyPatches();

module.exports = UserStore;