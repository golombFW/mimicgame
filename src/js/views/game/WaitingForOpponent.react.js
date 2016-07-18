var React = require('react');
var StateMixin = require('reflux-state-mixin');
var _ = require('underscore');

var AppStateActions = require('../../actions/AppStateActions.js');
var AppState = require('../../states/AppState.js');
var GameManagerActions = require('../../actions/GameManagerActions.js');
var FacebookUserStore = require('../../stores/FacebookUserStore.js');

var DefaultGameViewContainer = require('../../components/game/DefaultGameViewContainer.react.js');
var LoadingBar = require('../../utils/Utils.js').Components.LoadingBar1;
var MenuButton = require('../../components/MenuButton.react');

var WaitingForOpponent = React.createClass({
    mixins: [StateMixin.connect(FacebookUserStore)],

    fetchFuncHandle: undefined,
    propTypes: {
        gameInfo: React.PropTypes.object
    },
    getDefaultProps: function () {
        return {
            gameInfo: null
        }
    },
    componentDidMount: function () {
        this.fetchFuncHandle = setInterval(this.fetchGameplayInfo, 10000);
    },
    componentWillUnmount: function () {
        clearInterval(this.fetchFuncHandle);
    },
    render: function () {
        var fbId, hurryFriendButton;
        if (this.props.gameInfo && this.props.gameInfo.opponent) {
            fbId = this.props.gameInfo.opponent.fbId;
            if (this.isFriendOpponent(fbId)) {
                hurryFriendButton = (
                    <MenuButton onClick={this.hurryFriend.bind(this, fbId)} classes="btn-warning">Ponaglij
                        przeciwnika</MenuButton>);
            }
        }

        return (
            <DefaultGameViewContainer gameInfo={this.props.gameInfo}>
                <div id="app-game-waiting-for-opponent">
                    <LoadingBar customText="Oczekiwanie na ruch przeciwnika" color="dark"/>
                    <div className="options">
                        <MenuButton onClick={this.backToMenu} icon="fa fa-arrow-left">Powrót</MenuButton>
                        {hurryFriendButton}
                    </div>
                </div>
            </DefaultGameViewContainer>
        );
    },
    backToMenu: function () {
        AppStateActions.changeState(AppState.MENU);
    },
    fetchGameplayInfo: function () {
        console.log("Fetch gameplay data...");
        var gameInfo = this.props.gameInfo;
        if (gameInfo && gameInfo.match) {
            GameManagerActions.startGame(gameInfo.match);
        }
    },
    hurryFriend: function (fbUserId) {
        if (fbUserId) {
            FB.ui({
                method: 'apprequests',
                message: 'Teraz twoja kolej w naszej rozgrywce!',
                to: fbUserId,
                action_type: 'turn'
            }, function (response) {
                console.log(response);
            }.bind(this));
        }
    },
    isFriendOpponent: function (opponentFbId) {
        var friends = this.state.facebookUser.friends;
        if (!friends && 1 > friends.length) {
            return false;
        } else {
            var friendIds = _.pluck(friends, 'id');
            return _.contains(friendIds, opponentFbId);
        }
    }
});

module.exports = WaitingForOpponent;