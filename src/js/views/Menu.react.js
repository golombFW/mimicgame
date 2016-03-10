var React = require('react');
var Parse = require('parse').Parse;
var Reflux = require('reflux');
var Utils = require('../utils/Utils.js');

var AppStateActions = require('../actions/AppStateActions.js');
var AppState = require('../states/AppState.js');

var AppDataStore = require('../stores/AppDataStore.js');
var AppDataActions = require('../actions/AppDataActions.js');

var Logo = Utils.Components.AppLogo;
var DefaultAppViewContainer = require('../components/DefaultAppViewContainer.react.js');
var ActualGamesPanel = require('../components/main_menu/ActualGamesPanel.react.js');
var GameRequestsPanel = require('../components/main_menu/GameRequestsPanel.react.js');
var PreviousGamesPanel = require('../components/main_menu/PreviousGamesPanel.react.js');
var BasicMenuPanel = require('../components/main_menu/BasicMenuPanel.react.js');

var Menu = React.createClass({
    mixins: [Reflux.connect(AppDataStore, 'appData')],
    componentDidMount: function () {
        AppDataActions.fetchGamesInfo();
    },
    render: function () {
        var actualGames = this.state.appData.gamesInfo.actualGames;
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
                                <a className="btn btn-default" role="button"
                                   onClick={this.selectView.bind(this, AppState.NEW_GAME_MENU)}>Nowa Gra</a><br/>
                                <a className="btn btn-default" role="button" onClick={this.logout}>wyloguj</a>
                            </nav>
                        </BasicMenuPanel>
                    </div>

                    <div className="menu-horizontal-container row">
                        <PreviousGamesPanel/>
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
