var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin');

var GameManagerActions = require('../actions/GameManagerActions.js');
var AppStateActions = require('../actions/AppStateActions.js');
var GameState = require('../states/GameState.js');
var AppState = require('../states/AppState.js');

var GameManagerStore = Reflux.createStore({
    mixins: [StateMixin.store],
    listenables: [GameManagerActions],


    getInitialState: function () {
        return {
            currentView: GameState.LOADING,
            match: {}
        }
    },
    //actions
    startGame: function (match) {
        console.log("Starting game...");
        AppStateActions.openGameView();
        this.setState({match: match});
        this.initializeGame(match);
    },

    //other functions
    initializeGame: function () {
        //todo add logic
        this.setState({currentView: GameState.PHOTO});
    }
});

module.exports = GameManagerStore;