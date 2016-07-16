var Reflux = require('reflux');
var Parse = require('parse').Parse;
var StateMixin = require('reflux-state-mixin');
var _ = require('underscore');
var $ = require('../utils/Utils.js').$;

var cloudModel = require('../../cloud/model.js');
var AppDataActions = require('../actions/AppDataActions.js');

var _COMPLETED_GAMES_LIMIT = 3;

var appData = {
    gamesInfo: {
        actualGames: null,
        completedGames: null
    },
    challengeRequestsInfo: null,
    friendsGameList: []
};

var AppDataStore = Reflux.createStore({
    mixins: [StateMixin.store],
    listenables: [AppDataActions],

    getInitialState: function () {
        return {
            gamesInfo: {
                actualGames: null,
                completedGames: null
            },
            challengeRequests: null,
            friendsGameList: []
        };
    },
    fetchGamesInfo: function () {
        console.log("Fetching info about finished and in-progress games");
        var user = Parse.User.current();

        var player1Matches = new Parse.Query("Match");
        player1Matches.equalTo("player1", user);

        var player2Matches = new Parse.Query("Match");
        player2Matches.equalTo("player2", user);

        var actualMatches = Parse.Query.or(player1Matches, player2Matches);
        actualMatches.equalTo("gameStatus", "in_progress");

        var completedMatches = Parse.Query.or(player1Matches, player2Matches);
        completedMatches.equalTo("gameStatus", "finished");
        completedMatches.descending("updatedAt");
        completedMatches.limit(_COMPLETED_GAMES_LIMIT);

        var matches = Parse.Query.or(actualMatches, completedMatches);
        matches.include("player1");
        matches.include("player1.FacebookUser");
        matches.include("player2");
        matches.include("player2.FacebookUser");

        var self = this;

        matches.find({
            success: function (results) {
                console.log("Fetching info about actual and finished games completed.");
                self.updateGamesInfo(results);
            },
            error: function (error) {
                console.error(error);
            }
        });
    },
    fetchChallengeRequests: function () {
        var user = Parse.User.current();

        var playerRequestsQuery = new Parse.Query("ChallengeRequest");
        playerRequestsQuery.equalTo("player", user);

        var opponentRequestsQuery = new Parse.Query("ChallengeRequest");
        opponentRequestsQuery.equalTo("opponent", user);

        var challengeRequestsQuery = Parse.Query.or(playerRequestsQuery, opponentRequestsQuery);
        challengeRequestsQuery.equalTo("status", cloudModel.challengeStatus.INITIAL);
        challengeRequestsQuery.descending("updatedAt");
        challengeRequestsQuery.include("player");
        challengeRequestsQuery.include("opponent");

        challengeRequestsQuery.find().then(function (challengeRequests) {
            console.log("Found " + challengeRequests.length + " challenge requests");
            this.setState({
                challengeRequests: challengeRequests
            })
        }.bind(this), function (error) {
            console.error("Can't fetch challenge requests\n" + error.message);
        })
    },
    fetchFriendsGameList: function () {
        Parse.User.current().fetch().then(function (fetchedUser) {
            var friendsList = fetchedUser.get("FacebookUser").get("friendsList");
            var friendsQuery = new Parse.Query(Parse.User);
            friendsQuery.include("FacebookUser");
            friendsQuery.include("score");
            friendsQuery.containedIn("objectId", friendsList);

            return friendsQuery.find();
        }).then(function (friends) {
            console.log("Found " + friends.length + " friend players");
            this.setState({friendsGameList: friends});
        }.bind(this), function (error) {
            console.error("Something wrong: " + error.message);
        });
    },

    //Helpers
    updateGamesInfo: function (newGamesInfo) {
        var actual = [];
        var completed = [];
        for (var c = 0; c < newGamesInfo.length; c += 1) {
            if ("finished" === newGamesInfo[c].get("gameStatus")) {
                completed.push(newGamesInfo[c]);
            } else {
                actual.push(newGamesInfo[c]);
            }
        }
        console.log("actual games: " + actual.length + " finished: " + completed.length);
        var newGamesInfo = $.clone(appData.gamesInfo);
        newGamesInfo.actualGames = actual;
        newGamesInfo.completedGames = _.first(completed, _COMPLETED_GAMES_LIMIT);

        this.setState({gamesInfo: newGamesInfo});
    }
});

module.exports = AppDataStore;