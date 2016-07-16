var React = require('react');
var Parse = require('parse').Parse;
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin');
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
    mixins: [StateMixin.connect(AppDataStore, 'gamesInfo'), StateMixin.connect(AppDataStore, 'challengeRequests')],

    componentWillMount: function () {
        AppDataActions.fetchGamesInfo();
        AppDataActions.fetchChallengeRequests();
        UserActions.updatePlayerStats();
    },
    render: function () {
        var actualGames = this.state.gamesInfo.actualGames;
        var completedGames = this.state.gamesInfo.completedGames;
        var challengeRequests = this.state.challengeRequests;

        return (
            <DefaultAppViewContainer>
                <div id="app-menu">
                    <div className="row">
                        <div className="row flexible-panel col-sm-12 col-xs-12">
                            <GameRequestsPanel requests={challengeRequests}/>
                            <ActualGamesPanel games={actualGames}/>
                        </div>
                        <div id="app-menu-options" className="col-sm-12 col-xs-12 fixed-height">
                            <div className="main-menu-header">
                                <div className="app-logo">
                                    Mimic Game
                                </div>
                                <div className="title">
                                    Menu
                                </div>
                            </div>
                            <div className="options">
                                <MenuButton
                                    onClick={this.selectView.bind(this, AppState.NEW_GAME_MENU)} icon="fa fa-gamepad"
                                    classes="btn-success">Nowa Gra</MenuButton>
                                <MenuButton onClick={this.selectView.bind(this, AppState.RANKING)}
                                            icon="fa fa-trophy" classes="">Ranking</MenuButton>
                                <MenuButton onClick={this.selectView.bind(this, AppState.USER_SETTINGS)}
                                            icon="fa fa-wrench" classes="">Ustawienia</MenuButton>
                                {/*<MenuButton onClick={this.selectView.bind(this, AppState.HOW_TO_PLAY)}*/}
                                            {/*icon="fa fa-info" classes="">Jak grac?</MenuButton>*/}
                                {/*<MenuButton onClick={this.logout}>wyloguj</MenuButton>*/}
                            </div>
                        </div>
                        <CompletedGamesPanel games={completedGames}/>
                    </div>
                </div>
            </DefaultAppViewContainer >
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