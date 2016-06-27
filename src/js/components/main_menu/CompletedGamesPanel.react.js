var React = require('react');
var Parse = require('parse').Parse;
var GameUtils = require('../../utils/Utils.js').Game;
var BasicMenuPanel = require('./BasicMenuPanel.react.js');

var GameManagerActions = require('../../actions/GameManagerActions.js');

var CompletedGamesPanel = React.createClass({
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
                Nie zakończono jeszcze żadnej gry!
            </span>
        );
        if (games && 0 !== games.length) {
            games.sort(GameUtils.compareByModifiedDate);
            content = games.map(function (game) {
                var matchInfo;
                var opponent = GameUtils.getOpponent(user, game);
                if (opponent) {
                    var opponentAvatar = opponent.get("FacebookUser").get("avatar");
                    var opponentAvatarUrl = opponentAvatar ? opponentAvatar.url : "";
                    matchInfo = (
                        <span className="opponent-info">Przeciwko {opponent.get("nick")}
                            <div className="opponent-avatar-container">
                                <img className="opponent-avatar" src={opponentAvatarUrl}/>
                            </div>
                        </span>);
                } else {
                    matchInfo = (<span className="opponent-info">Bez przeciwnika </span>);
                }

                return (
                    //todo
                    <div key={game.id}
                         className="match-info">
                        {matchInfo}
                        <button className="btn btn-default btn-xs" onClick={this.startGame.bind(this, game)}>Zobacz
                            szczegóły
                        </button>
                    </div>
                );
            }.bind(this));
        }

        return (
            <BasicMenuPanel id="completed-games-panel">
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

module.exports = CompletedGamesPanel;