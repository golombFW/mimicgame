var Parse = require('parse').Parse;
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin');
var blobUtil = require('blob-util');

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
            selectedTopic: null,
            turnSummary: {},
            reportedQuestion: null
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
    nextTurn: function () {
        this.startGame(this.state.match);
    },
    choosePhotoTopic: function (topic) {
        console.log("User chose a topic: " + topic.value);
        //todo validation
        this.setState({
            currentView: GameState.PHOTO,
            selectedTopic: topic
        });
    },
    chooseAnswer: function (answer) {
        console.log("Sending answer to question: " + answer.value);
        this.switchToDataSendView();
        var self = this;
        Parse.Cloud.run('answerQuestion', {
            matchId: self.state.match.id,
            answer: answer
        }).then(function (result) {
            console.log("Sending answer to question successful!");
            this.setState({
                currentView: GameState.TURN_SUMMARY,
                turnSummary: result
            });
        }.bind(this), function (error) {
            console.error("Answer question error: " + error.message);
            //todo loopback
        });
    },
    uploadPhoto: function (photoBlob, topic) {
        console.log("Sending photo with topic: " + topic.value);
        var self = this;
        this.switchToDataSendView();

        //converting photo to parse file format
        blobUtil.blobToBase64String(photoBlob).then(function (base64String) {
            // success
            Parse.Cloud.run('uploadPhoto', {
                photo: base64String,
                matchId: self.state.match.id,
                topic: topic
            }).then(function (result) {
                    console.log("Uploading photo successful!");

                    //todo validation, change start game to summary
                    self.startGame(self.state.match);
                }.bind(this),
                function (error) {
                    console.log("Something wrong: " + error.message);
                });
        }).catch(function (err) {
            // error
            console.error(err.message);
        });
    },
    reportPhoto: function (photoQuestion) {
        console.log("Reporting question: " + JSON.stringify(photoQuestion));
        this.setState({
            currentView: GameState.REPORT_PHOTO,
            reportedQuestion: photoQuestion
        });
    },

    switchToDataSendView: function () {
        this.setState({
            currentView: GameState.DATA_SEND
        });
    },

    //other functions
    initializeGame: function (match) {
        var view, gameplayData;
        Parse.Cloud.run('getGameplayData', {matchId: match.id}).then(function (data) {
                console.log("Getting gameplay data success");
                view = this.resolveViewState(data.status, data.turn);
                gameplayData = data;
                return match.fetch();
            }.bind(this)
        ).then(function (updatedMatch) {
                this.setState({
                    data: gameplayData,
                    currentView: view,
                    match: updatedMatch
                });
            }.bind(this)
        ).then(null, function (error) {
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