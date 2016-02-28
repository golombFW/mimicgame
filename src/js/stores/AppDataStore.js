var Reflux = require('reflux');
var Parse = require('parse').Parse;

var AppDataActions = require('../actions/AppDataActions.js');

var _COMPLETED_GAMES_LIMIT = 5;

var AppDataStore = Reflux.createStore({
    listenables: [AppDataActions],
    appData: {
        gamesInfo: {
            actualGames: null,
            completedGames: null
        }
    },

    getInitialState: function () {
        return this.appData;
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
        this.appData.gamesInfo.actualGames = actual;
        this.appData.gamesInfo.completedGames = completed;

        this.trigger(this.appData);
    }
});

module.exports = AppDataStore;