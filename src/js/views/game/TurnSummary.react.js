var React = require('react');

var DefaultGameViewContainer = require('../../components/game/DefaultGameViewContainer.react.js');
var MenuButton = require('../../components/MenuButton.react.js');
var GameManagerActions = require('../../actions/GameManagerActions.js');
var Emoticon = require('../../components/Emoticon.react.js');

var TurnSummary = React.createClass({
    propTypes: {
        gameInfo: React.PropTypes.object,
        data: React.PropTypes.object
    },
    getDefaultProps: function () {
        return {
            gameInfo: null,
            data: null
        }
    },
    render: function () {
        console.log("turn summary, " + JSON.stringify(this.props.data));
        var summary = this.props.data.turnSummary;

        var result, resultHeader;
        if (summary.playerResult) {
            resultHeader = (
                <div className="result-header">
                    <h1>Gratulacje!</h1>
                    <Emoticon emotion="good"/>
                </div>
            );
            result = (<div><b>{summary.correctAnswer.value}</b> to prawidłowa odpowiedź!</div>);
        } else {
            resultHeader = (
                <div className="result-header">
                    <h1>Błędna odpowiedź!</h1>
                    <Emoticon emotion="sad"/>
                </div>
            );
            result = (<div>Prawidłowa odpowiedź to: <b>{summary.correctAnswer.value}</b></div>);
        }
        return (
            <DefaultGameViewContainer gameInfo={this.props.gameInfo}>
                <div id="turn-summary">
                    {resultHeader}
                    {result}<br/>
                    <h2>Zdobyto w tej turze <b>{summary.points}</b> punktów</h2><br/>
                    <MenuButton onClick={this.nextTurn} icon="fa fa-arrow-right">Następna tura</MenuButton>
                </div>
            </DefaultGameViewContainer>
        );
    },
    nextTurn: function () {
        GameManagerActions.nextTurn();
    }
});

module.exports = TurnSummary;