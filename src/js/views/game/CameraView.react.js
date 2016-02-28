var React = require('react');

var DefaultGameViewContainer = require('../../components/game/DefaultGameViewContainer.react.js');

var CameraView = React.createClass({
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
                <div>
                    test
                </div>
            </DefaultGameViewContainer>
        );
    }
});

module.exports = CameraView;