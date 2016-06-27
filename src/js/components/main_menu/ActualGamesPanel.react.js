var React = require('react');
var Parse = require('parse').Parse;
var GameUtils = require('../../utils/Utils.js').Game;
var BasicMenuPanel = require('./BasicMenuPanel.react.js');

var GameManagerActions = require('../../actions/GameManagerActions.js');

var ActualGamesPanel = React.createClass({
    propTypes: {
        games: React.PropTypes.array
    },
    getDefaultProps: function () {
        return {
            games: null
        };
    },
    render: function () {
        var games = this.props.games;
        var user = Parse.User.current();

        var content = (
            <span className="">
                Aktualnie nie toczysz żadnej rozgrywki.
            </span>
        );
        if (games && 0 !== games.length) {
            games.sort(GameUtils.compareByModifiedDate);
            content = games.map(function (game) {
                var matchInfo, gameResult;
                var gameResultObj = game.get("result");
                if (gameResultObj) {
                    var p1, p2;
                    if (game.get("player1").id === user.id) {
                        p1 = gameResultObj.player1;
                        p2 = gameResultObj.player2;
                    } else {
                        p1 = gameResultObj.player2;
                        p2 = gameResultObj.player1;
                    }
                    gameResult = (
                        <div className="game-result">
                            {p1} - {p2}
                        </div>
                    );
                } else {
                    gameResult = (
                        <div className="game-result">
                            0 - 0
                        </div>
                    );
                }
                var opponent = GameUtils.getOpponent(user, game);
                if (opponent) {
                    var opponentAvatar = opponent.get("FacebookUser").get("avatar");
                    var opponentAvatarUrl = opponentAvatar ? opponentAvatar.url : "";


                    matchInfo = (
                        <div className="opponent-info">Przeciwko {opponent.get("nick")}
                            <div className="opponent-avatar-container">
                                <img className="opponent-avatar" src={opponentAvatarUrl}/>
                            </div>
                            {gameResult}
                        </div>);
                } else {
                    matchInfo = (<div className="opponent-info">Bez przeciwnika {gameResult}</div>);
                }

                return (
                    //todo aktualny wynik
                    <div key={game.id}
                         className="match-info">
                        {matchInfo}
                        <button className="btn btn-default btn-xs" onClick={this.startGame.bind(this, game)}>Graj
                        </button>
                    </div>
                );
            }.bind(this));
        }
        return (
            <BasicMenuPanel id="actual-games-panel">
                <div className="">
                    {content}
                </div>
            </BasicMenuPanel>
        );
    },
    startGame: function (match) {
        GameManagerActions.startGame(match);
    }
});

module.exports = ActualGamesPanel;