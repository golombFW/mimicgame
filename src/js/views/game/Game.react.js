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
var CameraView = require('../../views/game/CameraView.react.js');
var ChoosePhotoTopic = require('../../views/game/ChoosePhotoTopic.react.js');

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
            case GameState.PHOTO:
                return <CameraView gameInfo={this.gameInfo()} key={key} data={this.gameplayData()}/>;
            case GameState.CHOOSE_PHOTO_TOPIC:
                return <ChoosePhotoTopic gameInfo={this.gameInfo()} key={key} data={this.gameplayData()}/>;
        }
    },
    gameInfo: function () {
        var opponent = {},
            opponentAvatar;
        if (!Utils.$.isNullOrEmpty(this.state.match) && this.state.user) {
            opponent = GameUtils.getOpponent(this.state.user, this.state.match);
            opponentAvatar = opponent.get("FacebookUser").get("avatar");
        }
        return {
            opponent: {
                nick: opponent.get("nick"),
                avatar: opponentAvatar
            }
        }
    },
    gameplayData: function () {
        var currentView = this.state.currentView;
        if (currentView === GameState.CHOOSE_PHOTO_TOPIC || currentView === GameState.PHOTO) {
            if (this.state.data.turn.type === CloudModel.TurnType.PHOTO_QUESTION.name) {
                var data = Utils.$.clone(this.state.data);
                data.selectedTopic = this.state.selectedTopic;

                return data;
            } else {
                console.warn("No data for current view!");
            }
        }
        return null;
    }
});

module.exports = Game;