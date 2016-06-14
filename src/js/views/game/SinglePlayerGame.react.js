var React = require('react');
var Parse = require('parse').Parse;
var LoadingBar = require('../../utils/Utils.js').Components.LoadingBar1;
var DefaultAppViewContainer = require('../../components/DefaultAppViewContainer.react.js');
var MenuButton = require('../../components/MenuButton.react.js');

var GameManagerActions = require('../../actions/GameManagerActions.js');

var _matchStatusKey = "gameStatus";
var _matchStatusKeyInProgress = "in_progress";

var SinglePlayerGame = React.createClass({
    getInitialState: function () {
        return {
            match: null
        }
    },
    componentDidMount: function () {
        Parse.Cloud.run('joinNewSingleplayerGame').then(function (match) {
            this.setState({match: match});
        }.bind(this), function (error) {
            console.log(error);
        });
    },
    render: function () {
        var match = this.state.match;

        var content = (
            <div id="find-opponent-loading-tab">
                <LoadingBar customText="Trwa przygotowywanie rozgrywki..."/>
            </div>
        );

        if (match && match.get(_matchStatusKey) === _matchStatusKeyInProgress) {
            content = (
                <div id="singleplayer-match">
                    <span>Przygotowano rozgrywkę!</span><br/>
                    <MenuButton classes="" onClick={this.startGame}>Zagraj</MenuButton>
                </div>
            );
        }

        return (
            <DefaultAppViewContainer>
                <div id="app-singleplayer-match">
                    {content}
                </div>
            </DefaultAppViewContainer>
        );
    },
    startGame: function () {
        GameManagerActions.startGame(this.state.match);
    }
});

module.exports = SinglePlayerGame;