var React = require('react');
var Reflux = require('reflux');
var Utils = require('./utils/Utils.js');

var AppStateStore = require('./stores/AppStateStore.js');
var AppState = require('./AppState.js');

var LoadingBar = Utils.LoadingBar1;

/* Views */
var Menu = require('./views/Menu.react.js');
var UserSettings = require('./views/UserSettings.react.js');

var AppWrapper = React.createClass({
    mixins: [Reflux.connect(AppStateStore, 'currentAppState')],
    contents: {},

    getInitialState: function () {
        this.contents[AppState.MENU] = <Menu/>;
        this.contents[AppState.USER_SETTINGS] = <UserSettings/>;

        this.contents[AppState.TEST] = <LoadingBar/>;
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