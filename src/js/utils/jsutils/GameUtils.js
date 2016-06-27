var moment = require('moment');

var GameUtils = {
    getOpponent: function (user, match) {
        var p1 = match.get("player1");
        var p2 = match.get("player2");
        return p1.id !== user.id ? p1 : p2;
    },
    getPlayer: function (user, match) {
        var p1 = match.get("player1");
        var p2 = match.get("player2");
        return p1.id === user.id ? p1 : p2;
    },
    compareByModifiedDate: function (a, b) {
        var dateA = moment(a.updatedAt);
        var dateB = moment(b.updatedAt);
        return dateB - dateA;
    }
};

module.exports = GameUtils;