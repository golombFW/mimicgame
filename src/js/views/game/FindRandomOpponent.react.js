var React = require('react');
var Parse = require('parse').Parse;
var MenuButton = require('../../components/MenuButton.react.js');
var Utils = require('../../utils/Utils.js');
var LoadingBar = Utils.Components.LoadingBar1;


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
    render: function () {

        var loadingText = "Wyszukiwanie przeciwnika";
        var match = this.state.match;
        if (null != match && match.get(_matchStatusKey) === _matchStatusKeyWaiting) {
            loadingText = "Brak aktywnych graczy. Oczekiwanie na przeciwnika..."
        }
        var content = (
            <div id="find-opponent-loading-tab">
                <LoadingBar customText={loadingText}/>
            </div>
        );

        if (null != match && match.get(_matchStatusKey) === _matchStatusKeyInProgress) {
            content = (
                <div id="find-opponent-match">
                    <span>Znaleziono przeciwnika!</span>
                    <div className="opponent-info">
                        Pojedynek <b>{match.get("player1").get("nick")}</b> vs <b>{match.get("player2").get("nick")}</b><br/>
                        <MenuButton onClick={this.startGame}>Zagraj</MenuButton>
                    </div>
                </div>
            );
        }

        return (
            <div id="app-find-random-opponent" className="app-view-default">
                {content}
            </div>
        );
    },
    updateMatchInformation: function () {
        var match = this.state.match;
        if (match.get(_matchStatusKey) === _matchStatusKeyWaiting) {
            match.fetch().then(function (newMatch) {
                if (newMatch.get(_matchStatusKey) !== _matchStatusKeyWaiting) {
                    console.log("New state of match: " + newMatch.get(_matchStatusKey));
                    this.setState({match: newMatch});
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
        alert("Test. Prace trwają!");
    }
});

module.exports = FindRandomOpponent;