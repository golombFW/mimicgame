var React = require('react');
var StateMixin = require('reflux-state-mixin');

var VelocityTransitionGroup = require('velocity-react').VelocityTransitionGroup;
var Utils = require('../../utils/Utils.js');
var GameUtils = Utils.Game;

var UserStore = require('../../stores/UserStore.js');
var GameState = require('../../states/GameState.js');
var GameManagerStore = require('../../stores/GameManagerStore.js');

var LoadingView = require('../../views/game/LoadingView.react.js');
var CameraView = require('../../views/game/CameraView.react.js');

var Game = React.createClass({
    mixins: [StateMixin.connect(UserStore), StateMixin.connect(GameManagerStore)],
    contents: {},
    animation: "fade",

    getInitialState: function () {
        this.contents[GameState.PHOTO] = <CameraView />;
    },
    render: function () {
        //animation
        var animationIn = "transition." + this.animation + "In";
        var animationOut = "transition." + this.animation + "Out";

        //content
        var content;
        if (this.state.currentView === GameState.LOADING) {
            content = <LoadingView />
        } else {
            content = (
                <VelocityTransitionGroup component="div"
                                         enter={{animation: animationIn, duration: 500, delay: 500}}
                                         leave={{animation: animationOut, duration: 500}}>
                    {this.gameView()}
                </VelocityTransitionGroup>
            );
        }
        return (
            <div id="app-game">
                {content}
            </div>
        );
    },
    gameView: function () {
        var key = this.state.currentView;

        switch (this.state.currentView) {
            case GameState.PHOTO:
                return <CameraView gameInfo={this.gameInfo()} key={key}/>
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
    }
});

module.exports = Game;