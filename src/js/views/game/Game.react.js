var React = require('react');
var StateMixin = require('reflux-state-mixin');

var VelocityTransitionGroup = require('velocity-react').VelocityTransitionGroup;
var Utils = require('../../utils/Utils.js');
var GameUtils = Utils.Game;
var CloudModel = require('../../../cloud/model.js');

var UserStore = require('../../stores/UserStore.js');
var GameState = require('../../states/GameState.js');
var GameManagerStore = require('../../stores/GameManagerStore.js');

var LoadingView = require('../../views/game/LoadingView.react.js');
var WaitingForOpponent = require('../../views/game/WaitingForOpponent.react.js');
var WaitingToSendData = require('../../views/game/WaitingToSendData.react.js');
var CameraView = require('../../views/game/CameraView.react.js');
var ChoosePhotoTopic = require('../../views/game/ChoosePhotoTopic.react.js');
var AnswerQuestion = require('../../views/game/AnswerQuestion.react.js');
var TurnSummary = require('../../views/game/TurnSummary.react.js');
var Summary = require('../../views/game/Summary.react.js');

var Game = React.createClass({
    mixins: [StateMixin.connect(UserStore), StateMixin.connect(GameManagerStore)],
    animation: "fade",

    render: function () {
        //animation
        var animationIn = "transition." + this.animation + "In";
        var animationOut = "transition." + this.animation + "Out";

        //content
        var content = (
            <VelocityTransitionGroup component="div"
                                     enter={{animation: animationIn, duration: 300, delay: 300}}
                                     leave={{animation: animationOut, duration: 300}}>
                {this.gameView()}
            </VelocityTransitionGroup>
        );

        return (
            <div id="app-game">
                {content}
            </div>
        );
    },
    gameView: function () {
        var key = this.state.currentView;

        switch (this.state.currentView) {
            case GameState.LOADING:
                return <LoadingView key={key}/>;
            case GameState.WAITING:
                return <WaitingForOpponent gameInfo={this.gameInfo()} key={key}/>;
            case GameState.DATA_SEND:
                return <WaitingToSendData gameInfo={this.gameInfo()} key={key}/>;
            case GameState.PHOTO:
                return <CameraView gameInfo={this.gameInfo()} key={key} data={this.gameplayData()}/>;
            case GameState.CHOOSE_PHOTO_TOPIC:
                return <ChoosePhotoTopic gameInfo={this.gameInfo()} key={key} data={this.gameplayData()}/>;
            case GameState.ANSWER_QUESTION:
                return <AnswerQuestion gameInfo={this.gameInfo()} key={key} data={this.gameplayData()}/>;
            case GameState.TURN_SUMMARY:
                return <TurnSummary gameInfo={this.gameInfo()} key={key} data={this.gameplayData()}/>;
            case GameState.SUMMARY:
                return <Summary gameInfo={this.gameInfo()} key={key} data={this.gameplayData()}/>;
        }
    },
    gameInfo: function () {
        var opponent = {},
            opponentAvatar;
        if (!Utils.$.isNullOrEmpty(this.state.match) && this.state.user) {
            opponent = GameUtils.getOpponent(this.state.user, this.state.match);
            if (opponent) {
                opponentAvatar = opponent.get("FacebookUser").get("avatar");
            }
        }
        var resultOpponent = null;
        if (opponent) {
            resultOpponent = {
                nick: opponent.get("nick"),
                avatar: opponentAvatar
            };
        }
        return {
            player: this.state.user,
            opponent: resultOpponent,
            match: this.state.match
        }
    },
    gameplayData: function () {
        var currentView = this.state.currentView;
        var turnType = this.state.data.turn.type;
        var data;
        if (currentView === GameState.CHOOSE_PHOTO_TOPIC || currentView === GameState.PHOTO) {
            if (turnType === CloudModel.TurnType.PHOTO_QUESTION.name) {
                data = Utils.$.clone(this.state.data);
                data.selectedTopic = this.state.selectedTopic;

                return data;
            } else if (turnType === CloudModel.TurnType.RANDOM_QUESTION) {
                //todo
            } else {
                console.warn("No data for current view!");
            }
        } else if (currentView === GameState.ANSWER_QUESTION) {
            data = Utils.$.clone(this.state.data);

            return data;
        } else if (currentView === GameState.TURN_SUMMARY) {
            data = Utils.$.clone(this.state.data);
            data.turnSummary = this.state.turnSummary;

            return data;
        } else if (currentView === GameState.SUMMARY) {
            //todo
            return null;
        }
        return null;
    }
});

module.exports = Game;