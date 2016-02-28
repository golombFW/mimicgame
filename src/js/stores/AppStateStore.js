var Reflux = require('reflux');

var AppStateActions = require('../actions/AppStateActions.js');
var AppState = require('../states/AppState.js');

var AppStateStore = Reflux.createStore({
    listenables: [AppStateActions],
    currentAppState: AppState.MENU,
    prevAppState: null,

    getInitialState: function () {
        return this.currentAppState;
    },
    changeState: function (newState) {
        if (this.currentAppState !== newState) {
            this.prevAppState = this.currentAppState;
            this.currentAppState = newState;

            this.trigger(this.currentAppState);
        }
    },
    openUserSettings: function () {
        this.changeState(AppState.USER_SETTINGS);
    },
    closeUserSettings: function () {
        this.changeState(this.prevAppState);
    },
    toggleUserSettings: function () {
        if (this.currentAppState !== AppState.USER_SETTINGS) {
            this.openUserSettings();
        } else {
            this.closeUserSettings();
        }
    },
    goToMenu: function () {
        this.changeState(AppState.MENU);
    },
    openGameView: function () {
        this.changeState(AppState.GAME);
    }
});

module.exports = AppStateStore;