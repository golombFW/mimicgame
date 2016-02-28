var GameUtils = {
    getOpponent: function (user, match) {
        var p1 = match.get("player1");
        var p2 = match.get("player2");
        return p1.id !== user.id ? p1 : p2;
    }
};

module.exports = GameUtils;