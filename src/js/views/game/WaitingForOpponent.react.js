var React = require('react');

var AppStateActions = require('../../actions/AppStateActions.js');
var AppState = require('../../states/AppState.js');
var GameManagerActions = require('../../actions/GameManagerActions.js');

var DefaultGameViewContainer = require('../../components/game/DefaultGameViewContainer.react.js');
var LoadingBar = require('../../utils/Utils.js').Components.LoadingBar1;
var MenuButton = require('../../components/MenuButton.react');

var WaitingForOpponent = React.createClass({
    fetchFuncHandle: undefined,
    propTypes: {
        gameInfo: React.PropTypes.object
    },
    getDefaultProps: function () {
        return {
            gameInfo: null
        }
    },
    componentDidMount: function () {
        this.fetchFuncHandle = setInterval(this.fetchGameplayInfo, 20000);
    },
    componentWillUnmount: function () {
        clearInterval(this.fetchFuncHandle);
    },
    render: function () {
        return (
            <DefaultGameViewContainer gameInfo={this.props.gameInfo}>
                <div id="app-game-waiting-for-opponent">
                    <LoadingBar customText="Oczekiwanie na ruch przeciwnika" color="dark"/>
                    <div className="options">
                        <MenuButton onClick={this.backToMenu} icon="fa fa-arrow-left">Powrót</MenuButton>
                    </div>
                </div>
            </DefaultGameViewContainer>
        );
    },
    backToMenu: function () {
        AppStateActions.changeState(AppState.MENU);
    },
    fetchGameplayInfo: function () {
        console.log("Fetch gameplay data...");
        var gameInfo = this.props.gameInfo;
        if (gameInfo && gameInfo.match) {
            GameManagerActions.startGame(gameInfo.match);
        }
    }
});

module.exports = WaitingForOpponent;