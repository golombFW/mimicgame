var React = require('react');
var Parse = require('parse').Parse;
var cloudModel = require('../../../cloud/model.js');

var GameUtils = require('../../utils/Utils.js').Game;
var GamesPanelHelpers = require('./GamesPanelHelpers.js');
var BasicMenuPanel = require('./BasicMenuPanel.react.js');
var MenuButton = require('../MenuButton.react.js');

var UserActions = require('../../actions/UserActions.js');
var GameManagerActions = require('../../actions/GameManagerActions.js');

var AppStateActions = require('../../actions/AppStateActions.js');
var AppState = require('../../states/AppState.js');

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

        var survey = this.surveyElement(user);

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
                        <MenuButton classes="btn-xs" onClick={this.startGame.bind(this, match)}>Graj</MenuButton>
                    </div>
                );
            }.bind(this));
            content.push(survey);
        } else if (survey) {
            content = survey;
        }

        return (
            <BasicMenuPanel id="actual-games-panel" title="Aktualne rozgrywki">
                {content}
            </BasicMenuPanel>
        );
    },
    surveyElement: function (user) {
        var survey = user.get("survey");
        if (!survey || cloudModel.surveyStatus.FILLED !== survey.get("status")) {
            return (
                <div key="survey" className="match-info survey">
                    <div className="opponent-info">
                        Ankieta <b>+1000 punktów</b>
                    </div>
                    <MenuButton classes="btn-xs" onClick={this.fillSurvey.bind(this, user)}>Wypełnij</MenuButton>
                </div>
            );
        }
        return null;
    },
    fillSurvey: function (user) {
        console.log("fill survey func");
        var survey = user.get("survey");
        var surveyPromise;

        if (!survey) {
            surveyPromise = Parse.Cloud.run('prepareSurvey');
        } else {
            surveyPromise = Parse.Promise.as(survey);
        }

        surveyPromise.then(function (playerSurvey) {
            if (!survey) {
                console.log("Survey for player " + playerSurvey.get("player").id + " prepared");
                UserActions.updateUser();
            }
            AppStateActions.changeState(AppState.SURVEY);
        }.bind(this), function (error) {
            console.log(error);
        });
    },
    startGame: function (match) {
        GameManagerActions.startGame(match);
    }
});

module.exports = ActualGamesPanel;