var React = require('react');
var Parse = require('parse').Parse;

var GameUtils = require('../../utils/Utils.js').Game;
var GamesPanelHelpers = require('./GamesPanelHelpers.js');
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
            content = games.map(function (match) {
                var matchInfo, gameResult;
                var gameResultObj = match.get("result");
                gameResult = GamesPanelHelpers.formattedResultElem(gameResultObj, match.get("player1"), user);

                matchInfo = GamesPanelHelpers.matchInfo(user, match);

                var turnNumber = (<div className="turn-number">Runda {match.get("round")}</div>);

                return (
                    <div key={match.id}
                         className="match-info">
                        <div className="summary">
                            {turnNumber}
                            {gameResult}
                        </div>
                        {matchInfo}
                        <button className="btn btn-default btn-xs" onClick={this.startGame.bind(this, match)}>Graj
                        </button>
                    </div>
                );
            }.bind(this));
        }
        return (
            <BasicMenuPanel id="actual-games-panel" title="Aktualne rozgrywki">
                {content}
            </BasicMenuPanel>
        );
    },
    startGame: function (match) {
        GameManagerActions.startGame(match);
    }
});

module.exports = ActualGamesPanel;