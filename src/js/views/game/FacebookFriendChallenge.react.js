var React = require('react');
var Parse = require('parse').Parse;
var StateMixin = require('reflux-state-mixin');
var _ = require('underscore');
var moment = require('moment');

var AppDataStore = require('../../stores/AppDataStore.js');
var AppDataActions = require('../../actions/AppDataActions.js');
var AppState = require('../../states/AppState.js');
var AppStateActions = require('../../actions/AppStateActions.js');

var DefaultGameViewContainer = require('../../components/game/DefaultGameViewContainer.react.js');
var MenuButton = require('../../components/MenuButton.react.js');
var LoadingBar = require('../../utils/Utils.js').Components.LoadingBar1;

var FacebookFriendChallenge = React.createClass({
    mixins: [StateMixin.connect(AppDataStore, 'friendsGameList')],

    getInitialState: function () {
        return {
            challengeRequest: null,
            isLoading: false
        }
    },
    componentWillMount: function () {
        AppDataActions.fetchFriendsGameList();
    },
    render: function () {
        var options = (
            <div className="options">
                <MenuButton icon="fa fa-arrow-left" onClick={this.backToMenu}>Powrót do menu</MenuButton>
            </div>);

        var content = (
            <div id="app-facebook-friend-challenge">
                <div className="header">
                    <span>Żaden z twoich znajomych nie gra w Mimic Game </span>
                    <i className="fa fa-frown-o" aria-hidden="true"></i>
                </div>
                {options}
            </div>
        );

        if (this.state.challengeRequest) {
            content = (
                <div id="app-facebook-friend-challenge">
                    <div className="request-send-info">
                        Rzucono wyzwanie graczowi <b>{this.state.challengeRequest.get("opponent").get("nick")}</b>
                    </div>
                    {options}
                </div>
            );
        } else if (this.state.isLoading) {
            content = (
                <div id="app-facebook-friend-challenge">
                    <LoadingBar customText="Trwa wysyłanie danych..." color="dark" center="parent"/>
                </div>
            )
        } else {
            var friends = this.state.friendsGameList;
            if (friends && 0 < friends.length) {
                var friendElems = _.map(friends, function (friend, num) {
                    var friendAvatar = friend.get("FacebookUser").get("avatar");
                    var avatarUrl = friendAvatar ? friendAvatar.url : "";

                    var score = friend.get("score");

                    var updateTime = friend.get("updatedAt") ? moment(friend.get("updatedAt")) : null;
                    var onlineTime = updateTime ? (
                        <div className="online-time col-xs-2 col-sm-2">{updateTime.fromNow()}</div>) : null;

                    return (
                        <div className="friend-row row" key={"friend-" + num}>
                            <div className="col-xs-1 col-sm-1">
                                <div className="avatar-container"><img src={avatarUrl}/></div>
                            </div>
                            <div className="nick col-xs-4 col-sm-4">{friend.get("nick")}</div>
                            <div className="score col-xs-3 col-sm-3">{score.get("score")}</div>
                            {onlineTime}
                            <div className="option col-xs-2 col-sm-2">
                                <MenuButton icon="fa fa-gamepad" onClick={this.challengeFriend.bind(this, friend.id)}
                                            classes="btn-primary btn-sm">Rzuć wyzwanie</MenuButton>
                            </div>
                        </div>
                    );
                }.bind(this));
                content = (
                    <div id="app-facebook-friend-challenge">
                        <div className="header">
                            <i className="fa fa-facebook-official" aria-hidden="true"></i>
                            <span>Rzuć wyzwanie znajomym z FB</span>
                        </div>
                        <div className="friends-list">
                            <div className="friend-row-header row">
                                <div className="col-xs-1 col-sm-1"></div>
                                <div className="nick col-xs-4 col-sm-4">nick</div>
                                <div className="score col-xs-3 col-sm-3">punkty</div>
                                <div className="online-time col-xs-2 col-sm-2">Ostatnio online</div>
                                <div className="option col-xs-2 col-sm-2"></div>
                            </div>
                            {friendElems}
                        </div>
                        {options}
                    </div>
                );
            }
        }

        return (
            <DefaultGameViewContainer hideResult={true}>
                {content}
            </DefaultGameViewContainer>
        );
    },
    backToMenu: function () {
        AppStateActions.changeState(AppState.NEW_GAME_MENU);
    },
    challengeFriend: function (userId) {
        this.setState({isLoading: true});

        Parse.Cloud.run('challengePlayer', {userId: userId}).then(function (challengeRequest) {
            this.setState({challengeRequest: challengeRequest});
        }.bind(this), function (error) {
            console.log(error);
        });
    }
});

module.exports = FacebookFriendChallenge;