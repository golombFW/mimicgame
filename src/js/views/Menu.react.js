var React = require('react');
var Parse = require('parse').Parse;
var Reflux = require('reflux');
var Utils = require('../utils/Utils.js');

var AppStateActions = require('../actions/AppStateActions.js');
var AppState = require('../states/AppState.js');

var AppDataStore = require('../stores/AppDataStore.js');
var AppDataActions = require('../actions/AppDataActions.js');

var UserActions = require('../actions/UserActions.js');

var Logo = Utils.Components.AppLogo;
var MenuButton = require('../components/MenuButton.react.js');
var DefaultAppViewContainer = require('../components/DefaultAppViewContainer.react.js');
var ActualGamesPanel = require('../components/main_menu/ActualGamesPanel.react.js');
var GameRequestsPanel = require('../components/main_menu/GameRequestsPanel.react.js');
var CompletedGamesPanel = require('../components/main_menu/CompletedGamesPanel.react.js');
var BasicMenuPanel = require('../components/main_menu/BasicMenuPanel.react.js');

var Menu = React.createClass({
    mixins: [Reflux.connect(AppDataStore, 'appData')],
    componentDidMount: function () {
        AppDataActions.fetchGamesInfo();
        UserActions.updateUser();
        UserActions.updatePlayerRank();
    },
    render: function () {
        var actualGames = this.state.appData.gamesInfo.actualGames;
        var completedGames = this.state.appData.gamesInfo.completedGames;
        return (
            <DefaultAppViewContainer>
                <div id="app-menu">
                    <div className="menu-horizontal-container row">
                        <GameRequestsPanel/>
                        <ActualGamesPanel games={actualGames}/>
                    </div>

                    <div className="menu-horizontal-container row">
                        <BasicMenuPanel>
                            <nav className="menu">
                                <MenuButton
                                    onClick={this.selectView.bind(this, AppState.NEW_GAME_MENU)}>Nowa Gra</MenuButton>
                                <MenuButton onClick={this.selectView.bind(this, AppState.RANKING)} icon="fa fa-trophy">Ranking</MenuButton>
                                <MenuButton onClick={this.logout}>wyloguj</MenuButton>
                            </nav>
                        </BasicMenuPanel>
                    </div>

                    <div className="menu-horizontal-container row">
                        <CompletedGamesPanel games={completedGames}/>
                    </div>
                </div>
            </DefaultAppViewContainer>

        );
    },
    selectView: function (tab) {
        AppStateActions.changeState(tab);
    },
    logout: function () {
        Parse.User.logOut();
        FB.logout();
    }
});

module.exports = Menu;