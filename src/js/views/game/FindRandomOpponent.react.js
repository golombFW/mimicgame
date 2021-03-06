var React = require('react');
var Parse = require('parse').Parse;
var MenuButton = require('../../components/MenuButton.react.js');
var Utils = require('../../utils/Utils.js');
var LoadingBar = Utils.Components.LoadingBar1;
var DefaultAppViewContainer = require('../../components/DefaultAppViewContainer.react.js');

var GameManagerActions = require('../../actions/GameManagerActions.js');
var AppStateActions = require('../../actions/AppStateActions.js');
var AppState = require('../../states/AppState.js');

var _matchStatusKey = "gameStatus";
var _matchStatusKeyWaiting = "waiting";
var _matchStatusKeyInProgress = "in_progress";

var FindRandomOpponent = React.createClass({
    matchUpdateHandle: undefined,
    getInitialState: function () {
        return {
            match: null
        }
    },
    componentDidMount: function () {
        Parse.Cloud.run('joinNewAnonymousGame').then(function (match) {
            this.setState({match: match});
            this.matchUpdateHandle = setInterval(this.updateMatchInformation, 2000);
        }.bind(this), function (error) {
            console.log(error);
        });
    },
    componentWillUnmount: function () {
        clearInterval(this.matchUpdateHandle);
        if (!this.state.match || _matchStatusKeyWaiting === this.state.match.get(_matchStatusKey)) {
            this.cancelMatch();
        }
    },
    render: function () {
        var loadingText = "Wyszukiwanie przeciwnika";
        var match = this.state.match;
        if (match && match.get(_matchStatusKey) === _matchStatusKeyWaiting) {
            loadingText = "Brak aktywnych graczy. Oczekiwanie na przeciwnika..."
        }
        var content = (
            <div id="find-opponent-loading-tab">
                <LoadingBar customText={loadingText} color="dark"/>
            </div>
        );

        if (match && match.get(_matchStatusKey) === _matchStatusKeyInProgress) {
            content = (
                <div id="find-opponent-match">
                    <h1>Znaleziono przeciwnika!</h1>
                    <div className="opponent-info">
                        Pojedynek <b>{match.get("player1").get("nick")}</b> vs <b>{match.get("player2").get("nick")}</b><br/>
                        <MenuButton classes="btn-lg" onClick={this.startGame} icon="fa fa-gamepad">Zagraj</MenuButton>
                    </div>
                </div>
            );
        }

        return (
            <DefaultAppViewContainer>
                <div id="app-find-random-opponent">
                    {content}
                    <div className="options">
                        <MenuButton onClick={this.backToMenu} icon="fa fa-arrow-left">Powrót</MenuButton>
                    </div>
                </div>
            </DefaultAppViewContainer>
        );
    },
    updateMatchInformation: function () {
        var match = this.state.match;
        if (match.get(_matchStatusKey) === _matchStatusKeyWaiting) {
            match.fetch().then(function (newMatch) {
                if (newMatch.get(_matchStatusKey) !== _matchStatusKeyWaiting) {
                    console.log("New state of match: " + newMatch.get(_matchStatusKey));
                    var matchQuery = new Parse.Query(newMatch);
                    matchQuery.include("player1");
                    matchQuery.include("player2");
                    matchQuery.include("player1.FacebookUser");
                    matchQuery.include("player2.FacebookUser");
                    matchQuery.get(match.id, {
                        success: function (queriedMatch) {
                            this.setState({match: queriedMatch});
                        }.bind(this),
                        error: function (error) {
                            console.log(error);
                        }
                    });
                }
                console.log("Match fetched");
            }.bind(this), function (obj, error) {
                console.log(error);
            })
        } else {
            clearInterval(this.matchUpdateHandle);
        }
    },
    startGame: function () {
        GameManagerActions.startGame(this.state.match);
    },
    backToMenu: function () {
        this.cancelMatch();
        AppStateActions.changeState(AppState.NEW_GAME_MENU);
    },
    cancelMatch: function () {
        var match = this.state.match;
        Parse.Cloud.run('cancelAnonymousGame', {
            matchId: match.id
        }).then(null, function (error) {
            console.error(error.message);
        });
    }
});

module.exports = FindRandomOpponent;