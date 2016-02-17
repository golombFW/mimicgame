var React = require('react');
var Reflux = require('reflux');
var Utils = require('./utils/Utils.js');

var AppStateStore = require('./stores/AppStateStore.js');
var AppState = require('./AppState.js');
var LoadingBar = Utils.Components.LoadingBar1;

/* Views */
var Menu = require('./views/Menu.react.js');
var UserSettings = require('./views/UserSettings.react.js');
var CameraView = require('./views/CameraShot.react.js');
var NewGameMenu = require('./views/game/NewGameMenu.react.js');
var RandomOpponent = require('./views/game/FindRandomOpponent.react.js');
var Game = require('./views/game/Game.react.js');

var AppWrapper = React.createClass({
    mixins: [Reflux.connect(AppStateStore, 'currentAppState')],
    contents: {},

    getInitialState: function () {
        this.contents[AppState.MENU] = <Menu/>;
        this.contents[AppState.USER_SETTINGS] = <UserSettings/>;
        this.contents[AppState.NEW_GAME_MENU] = <NewGameMenu />;
        this.contents[AppState.FIND_RANDOM_OPPONENT] = <RandomOpponent/>;
        this.contents[AppState.CAMERA_VIEW]  = <CameraView />;

        this.contents[AppState.TEST] = <Game/>;
    },
    render: function () {
        return (
            <div id="app-wrapper">
                {this.contents[this.state.currentAppState]}
            </div>
        );
    }
});

module.exports = AppWrapper;