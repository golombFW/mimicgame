var React = require('react');
var Parse = require('parse').Parse;
var moment = require('moment');

var GameUtils = require('../../utils/Utils.js').Game;
var GamesPanelHelpers = require('./GamesPanelHelpers.js');
var BasicMenuPanel = require('./BasicMenuPanel.react.js');
var Emoticon = require('../../components/Emoticon.react.js');

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

        if (games && 0 < games.length) {
            games.sort(GameUtils.compareByModifiedDate);
            content = games.map(function (match) {
                var matchInfo, endTime, resultElem, winnerIcon;

                var updateTime = match.get("updatedAt") ? moment(match.get("updatedAt")) : null;
                endTime = updateTime ? (<div className="end-time">{updateTime.fromNow()}</div>) : null;

                matchInfo = GamesPanelHelpers.matchInfo(user, match);

                var player1 = match.get("player1");
                var result = GamesPanelHelpers.formattedResultObj(match.get("result"), player1, user);
                resultElem = GamesPanelHelpers.formattedResultElem(match.get("result"), player1, user);
                if (result.p1 > result.p2) {
                    winnerIcon = (
                        <Emoticon emotion="trophy"/>
                    );
                }


                return (
                    <div key={match.id}
                         className="match-info">
                        <div className="summary">
                            {endTime}
                            {resultElem}

                        </div>
                        {winnerIcon}
                        {matchInfo}
                        <button className="btn btn-default btn-xs" onClick={this.startGame.bind(this, match)}>Zobacz
                        </button>
                    </div>
                );
            }.bind(this));
        }

        return (
            <BasicMenuPanel id="completed-games-panel" title="Zakonczone rozgrywki" classes="fixed-height">
                {content}
            </BasicMenuPanel>
        );
    },
    startGame: function (match) {
        GameManagerActions.startGame(match);
    }
});

module.exports = CompletedGamesPanel;