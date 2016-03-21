var React = require('react');

var DefaultGameViewContainer = require('../../components/game/DefaultGameViewContainer.react.js');

var WaitingForOpponent = React.createClass({
    propTypes: {
        gameInfo: React.PropTypes.object
    },
    getDefaultProps: function () {
        return {
            gameInfo: null
        }
    },
    render: function () {
        return (
            <DefaultGameViewContainer gameInfo={this.props.gameInfo}>
                <span>Oczekiwanie na przeciwnika.</span>
            </DefaultGameViewContainer>
        );
    }
});

module.exports = WaitingForOpponent;