var React = require('react');
var StateMixin = require('reflux-state-mixin');

var UserStore = require('../../stores/UserStore.js');
var UserActions = require('../../actions/UserActions.js');
var Emoticon = require('../Emoticon.react.js');

var AchievementsPanel = React.createClass({
    mixins: [StateMixin.connect(UserStore)],

    componentWillMount: function () {
        UserActions.updatePlayerStats();
    },
    render: function () {
        var userScore, playerRank;
        if (this.state.user && this.state.user.get("score")) {
            userScore = this.state.user.get("score").get("score");
        }
        if (this.state.playerRank) {
            playerRank = this.state.playerRank;
        }

        return (
            <div id="achievements-panel">
                <Emoticon emotion="trophy"/>
                <div className="player-rank">
                    <span className="description">miejsce</span>
                    <span className="rank-value">{playerRank}</span>
                </div>
                <Emoticon emotion="awesome"/>
                <div className="player-points">
                    <span className="description">punktów EQ</span>
                    <span className="points-value">{userScore}</span>
                </div>
            </div>
        );
    }
});

module.exports = AchievementsPanel;