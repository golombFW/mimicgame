var React = require('react');

var DefaultGameViewContainer = require('../../components/game/DefaultGameViewContainer.react.js');
var LoadingBar = require('../../utils/Utils.js').Components.LoadingBar1;

var WaitingToSendData = React.createClass({
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
                <div id="app-game-waiting-to-send-data">
                    <LoadingBar customText="Trwa wysyłanie danych..." color="dark" center="parent"/>
                </div>
            </DefaultGameViewContainer>
        );
    }
});

module.exports = WaitingToSendData;