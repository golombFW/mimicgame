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
            opponentAvatarUrl;
        if (this.props.gameInfo) {
            opponentNick = this.props.gameInfo.opponent.nick;
            if (this.props.gameInfo.opponent.avatar) {
                opponentAvatarUrl = this.props.gameInfo.opponent.avatar.url;
            }
        }
        return (
            <DefaultAppViewContainer>
                <div className="app-game-default-container">
                    <div id="game-info" className="row">
                        Runda X przeciwko <span className="opponent-nick">{opponentNick}</span> <img className="opponent-avatar" src={opponentAvatarUrl}/>
                    </div>
                    <div className="row game-content">
                        {this.props.children}
                    </div>
                </div>
            </DefaultAppViewContainer>
        );
    }
});

module.exports = DefaultGameViewContainer;