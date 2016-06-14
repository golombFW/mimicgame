var React = require('react');
var Parse = require('parse').Parse;
var moment = require('moment');
var GameUtils = require('../../utils/Utils.js').Game;
var BasicMenuPanel = require('./BasicMenuPanel.react.js');

var GameManagerActions = require('../../actions/GameManagerActions.js');

var ActualGamesPanel = React.createClass({
    render: function () {
        var games = this.props.games;
        var user = Parse.User.current();

        var content = (
            <span className="">
                Aktualnie nie toczysz żadnej rozgrywki.
            </span>
        );
        if (games && 0 !== games.length) {
            games.sort(this.compareGames);
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
                            </div> (aktualny wynik)
                        </span>);
                } else {
                    matchInfo = (<span className="opponent-info">Bez przecwinika (aktualny wynik pkt)</span>);
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
    compareGames: function (a, b) {
        //sort by modifiedDate
        var dateA = moment(a.updatedAt);
        var dateB = moment(b.updatedAt);
        return dateB - dateA;
    },
    startGame: function (match) {
        GameManagerActions.startGame(match);
    }
});

module.exports = ActualGamesPanel;