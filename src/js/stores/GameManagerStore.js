var Parse = require('parse').Parse;
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin');

var GameManagerActions = require('../actions/GameManagerActions.js');
var AppStateActions = require('../actions/AppStateActions.js');
var GameState = require('../states/GameState.js');
var AppState = require('../states/AppState.js');
var cloudModel = require('../../cloud/model.js');

var GameManagerStore = Reflux.createStore({
    mixins: [StateMixin.store],
    listenables: [GameManagerActions],

    getInitialState: function () {
        return {
            currentView: GameState.LOADING,
            match: {},
            data: {},
            selectedTopic: null
        }
    },
    //actions
    startGame: function (match) {
        console.log("Starting game...");

        var newGameState = this.getInitialState();
        newGameState.match = match;
        this.setState(newGameState);
        AppStateActions.openGameView();
        this.initializeGame(match);
    },
    choosePhotoTopic: function (topic) {
        console.log("User chose a topic: " + topic.value);
        //todo validation
        this.setState({
            currentView: GameState.PHOTO,
            selectedTopic: topic
        });
    },
    uploadPhoto: function (photo, topic) {
        console.log("Sending photo with topic: " + topic.value);

        //converting photo to parse file format
        var imageBase64 = photo.replace(/^data:image\/(png|jpeg);base64,/, "");
        var self = this;

        Parse.Cloud.run('uploadPhoto', {
            photo: imageBase64,
            matchId: self.state.match.id,
            topic: topic
        }).then(function (data) {
                console.log("Uploading photo successful!");
                var view = this.resolveViewState(data.status, data.turn);
                this.setState({
                    data: data,
                    currentView: view
                });
            }.bind(this),
            function (error) {
                console.log("Something wrong: " + error.message);
            });
    },

    //other functions
    initializeGame: function (match) {
        Parse.Cloud.run('getGameplayData', {matchId: match.id}).then(function (data) {
                console.log("Getting gameplay data success");
                var view = this.resolveViewState(data.status, data.turn);
                this.setState({
                    data: data,
                    currentView: view
                });
            }.bind(this),
            function (error) {
                console.error("Something happened: " + error.message);
            });
    },
    resolveViewState: function (status, turn) {
        console.log("Resolve view state, status: " + status + " turn: " + JSON.stringify(turn));
        switch (status) {
            case cloudModel.GameplayDataStatus.TURN:
                var turnType = turn.type;
                if (turnType === cloudModel.TurnType.PHOTO_QUESTION.name) {
                    if (null != turn.question) {
                        return GameState.ANSWER_QUESTION;
                    } else {
                        return GameState.CHOOSE_PHOTO_TOPIC;
                    }
                } else if (turnType === cloudModel.TurnType.RANDOM_QUESTION.name) {
                    return GameState.ANSWER_QUESTION;
                } else {
                    console.error("Invalid turnType: " + turnType);
                    return;
                }
            case cloudModel.GameplayDataStatus.WAITING:
                return GameState.WAITING;
            case cloudModel.GameplayDataStatus.SUMMARY:
                return GameState.SUMMARY;
            default:
                console.error("Invalid status: " + status);
        }
    }
});

module.exports = GameManagerStore;