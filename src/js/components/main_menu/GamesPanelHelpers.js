var React = require('react');
var GameUtils = require('../../utils/Utils.js').Game;

var GamesPanelHelpers = {
    formattedResultElem: function (gameResultObj, player1, user) {
        if (gameResultObj) {
            var result = this.formattedResultObj(gameResultObj, player1, user);
            return (
                <div className="game-result">
                    {result.p1} - {result.p2}
                </div>
            );
        } else {
            return (
                <div className="game-result">
                    0 - 0
                </div>
            );
        }
    },
    formattedResultObj: function (gameResultObj, player1, user) {
        if (gameResultObj) {
            var p1, p2;
            if (player1.id === user.id) {
                p1 = gameResultObj.player1;
                p2 = gameResultObj.player2;
            } else {
                p1 = gameResultObj.player2;
                p2 = gameResultObj.player1;
            }
            return {
                p1: p1,
                p2: p2
            };
        }

    },
    matchInfo: function (user, match) {
        var opponent = GameUtils.getOpponent(user, match);
        if (opponent) {
            var opponentAvatar = opponent.get("FacebookUser").get("avatar");
            var opponentAvatarUrl = opponentAvatar ? opponentAvatar.url : "";
            return (
                <div className="opponent-info">
                    <div>Przeciwko {opponent.get("nick")}</div>
                    <div className="opponent-avatar-container">
                        <img className="opponent-avatar" src={opponentAvatarUrl}/>
                    </div>
                </div>);
        } else {
            return (<div className="opponent-info">Bez przeciwnika </div>);
        }
    }
};

module.exports = GamesPanelHelpers;