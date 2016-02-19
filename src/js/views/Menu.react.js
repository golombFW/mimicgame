var React = require('react');
var Parse = require('parse').Parse;
var Reflux = require('reflux');
var Utils = require('../utils/Utils.js');

var AppStateActions = require('../actions/AppStateActions.js');
var AppState = require('../states/AppState.js');

var AppDataStore = require('../stores/AppDataStore.js');
var AppDataActions = require('../actions/AppDataActions.js');

var Logo = Utils.Components.AppLogo;
var ActualGamesPanel = require('../components/main_menu/ActualGamesPanel.react.js');

var Menu = React.createClass({
    mixins: [Reflux.connect(AppDataStore, 'appData')],
    componentDidMount: function () {
        AppDataActions.fetchGamesInfo();
    },
    render: function () {
        var actualGames = this.state.appData.gamesInfo.actualGames;
        return (
            <div id="app-menu" className="app-view-default">
                <div id="game-requests-table">
                    {
                        //Wyzwanie 1
                        //Wyzwanie 2
                    }
                </div>
                <nav className="menu">
                    <a className="btn btn-default" role="button"
                       onClick={this.selectView.bind(this, AppState.NEW_GAME_MENU)}>Nowa Gra</a><br/>
                    <a className="btn btn-default" role="button"
                       onClick={this.selectView.bind(this, AppState.CAMERA_VIEW)}>Camera Test</a><br/>
                    <a className="btn btn-default" role="button" onClick={this.logout}>wyloguj</a>
                </nav>

                <ActualGamesPanel games={actualGames}/>

                <div id="previous-games-tab">
                    {
                        //Edek1 wygrana
                        //Anonim23 przegrana
                    }
                </div>
            </div>
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
