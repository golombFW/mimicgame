var Reflux = require('reflux');

var AppStateActions = require('../actions/AppStateActions.js');
var AppState = require('../AppState.js');

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
    goToMenu: function () {
        this.changeState(AppState.MENU);
    }
});

module.exports = AppStateStore;