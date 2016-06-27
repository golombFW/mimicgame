var React = require('react');

var DefaultGameViewContainer = require('../../components/game/DefaultGameViewContainer.react.js');
var LoadingBar = require('../../utils/Utils.js').Components.LoadingBar1;

var LoadingView = React.createClass({
    render: function () {
        return (
            <DefaultGameViewContainer hideResult={true}>
                <LoadingBar customText="Trwa ładowanie danych gry..." color="dark" center="parent"/>
            </DefaultGameViewContainer>
        );
    }
});

module.exports = LoadingView;