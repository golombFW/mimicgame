var React = require('react');
var DefaultAppViewContainer = require('../DefaultAppViewContainer.react.js');

var DefaultGameViewContainer = React.createClass({
    propTypes: {
        hideResult: React.PropTypes.bool,
        gameInfo: React.PropTypes.object
    },
    getDefaultProps: function () {
        return {
            hideResult: false,
            gameInfo: null
        }
    },

    render: function () {
        var opponentNick,
            opponentAvatarUrl, opponentInfo;
        var turnNumber;
        if (this.props.gameInfo && this.props.gameInfo.opponent) {
            opponentNick = this.props.gameInfo.opponent.nick;
            if (this.props.gameInfo.opponent.avatar) {
                opponentAvatarUrl = this.props.gameInfo.opponent.avatar.url;
            }
            opponentInfo = (
                <span>przeciwko <span className="opponent-nick">{opponentNick}</span> <img
                    className="opponent-avatar" src={opponentAvatarUrl}/>
                </span>
            );
        }
        if (this.props.gameInfo && this.props.gameInfo.match) {
            turnNumber = this.props.gameInfo.match.get("round");
        }

        var gameResultInfo;
        if (!this.props.hideResult) {

            gameResultInfo = (
                <div id="game-info" className="row">
                    Runda {turnNumber} {opponentInfo}
                </div>
            );
        }
        return (
            <DefaultAppViewContainer>
                <div className="app-game-default-container">
                    {gameResultInfo}
                    <div className="row game-content">
                        {this.props.children}
                    </div>
                </div>
            </DefaultAppViewContainer>
        );
    }
});

module.exports = DefaultGameViewContainer;