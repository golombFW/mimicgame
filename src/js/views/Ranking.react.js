var React = require('react');
var Parse = require('parse').Parse;
var _ = require('underscore');
var StateMixin = require('reflux-state-mixin');

var UserStore = require('../stores/UserStore.js');
var UserActions = require('../actions/UserActions.js');
var AppStateActions = require('../actions/AppStateActions.js');
var DefaultGameViewContainer = require('../components/game/DefaultGameViewContainer.react.js');
var MenuButton = require('../components/MenuButton.react.js');

var _playersInRanking = 10;
var Ranking = React.createClass({
    mixins: [StateMixin.connect(UserStore)],
    getInitialState: function () {
        return {
            top10: null,
            playersNumber: 0
        }
    },
    componentDidMount: function () {
        UserActions.updateUser();

        var top10RankQuery = new Parse.Query("GameScore");
        top10RankQuery.include("player");
        top10RankQuery.include("player.FacebookUser");
        top10RankQuery.descending("score");
        top10RankQuery.find().then(function (players) {
            console.log("Found " + players.length + " players in ranking");
            this.setState({top10: _.first(players, _playersInRanking)});
        }.bind(this), function (error) {
            console.error(error.message);
        });

        var countRankQuery = new Parse.Query("GameScore");
        countRankQuery.count().then(function (playersNumber) {
            this.setState({playersNumber: playersNumber});
        }.bind(this), function (error) {
            console.error(error.message);
        });

        UserActions.updatePlayerRank();
    },
    render: function () {
        var top10Elem = (
            <div className="top-players">
                Trwa wczytywanie rankingu...
            </div>
        );
        if (this.state.top10) {
            var playersElem = _.map(this.state.top10, function (playerScore, num) {
                var key = "top10-" + playerScore.id;
                var player = playerScore.get("player");
                var nick, avatarUrl, rowClasses = "top-player-row row";
                if (player) {
                    nick = player.get("nick");
                    var fbUser = player.get("FacebookUser");
                    if (fbUser && fbUser.get("avatar")) {
                        avatarUrl = fbUser.get("avatar").url;
                    }
                    if (player.id === this.state.user.id) {
                        rowClasses += " user-row";
                    }
                }
                var score = playerScore.get("score");

                return (
                    <div className={rowClasses} key={key}>
                        <div className="rank-position col-xs-1 col-sm-1">{num + 1}</div>
                        <div className="rank-avatar col-xs-1 col-sm-1">
                            &#160;
                            <div className="avatar-container">
                                <img src={avatarUrl}/>
                            </div>
                        </div>
                        <div className="rank-nick col-xs-6 col-sm-6">{nick}</div>
                        <div className="rank-score col-xs-4 col-sm-4">{score}</div>
                    </div>
                );
            }.bind(this));
            top10Elem = (
                <div className="top-players">
                    <div className="top-player-header row">
                        <div className="rank-position col-xs-1 col-sm-1">Pozycja</div>
                        <div className="rank-avatar col-xs-1 col-sm-1"></div>
                        <div className="rank-nick col-xs-6 col-sm-6">Gracz</div>
                        <div className="rank-score col-xs-4 col-sm-4">Punkty EQ</div>
                    </div>
                    {playersElem}
                </div>
            );
        }
        var userElem;
        if (this.state.playerRank && _playersInRanking < this.state.playerRank) {
            var userAvatarUrl, userScore;
            var fbUser = this.state.user.get("FacebookUser");
            if (fbUser && fbUser.get("avatar")) {
                userAvatarUrl = fbUser.get("avatar").url;
            }
            var userScoreObj = this.state.user.get("score");
            if (userScoreObj) {
                userScore = userScoreObj.get("score");
            }

            userElem = (
                <div className="user-rank">
                    <div className="top-player-row row">...</div>
                    <div className="top-player-row row user-row">
                        <div className="rank-position col-xs-1 col-sm-1">{this.state.playerRank}</div>
                        <div className="rank-avatar col-xs-1 col-sm-1">
                            &#160;
                            <div className="avatar-container">
                                <img src={userAvatarUrl}/>
                            </div>
                        </div>
                        <div className="rank-nick col-xs-6 col-sm-6">{this.state.user.get("nick")}</div>
                        <div className="rank-score col-xs-4 col-sm-4">{userScore}</div>
                    </div>
                </div>
            );
        }
        return (
            <DefaultGameViewContainer hideResult={true}>
                <div id="ranking">
                    <div className="header">Top 10 graczy z {this.state.playersNumber}</div>
                    {top10Elem}
                    {userElem}
                    <div className="options">
                        <MenuButton icon="fa fa-home" onClick={this.backToMenu}>Powrót do Menu</MenuButton>
                    </div>
                </div>
            </DefaultGameViewContainer>
        );
    },
    backToMenu: function () {
        AppStateActions.goToMenu();
    }
});

module.exports = Ranking;