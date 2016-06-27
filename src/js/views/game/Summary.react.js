var React = require('react');

var DefaultGameViewContainer = require('../../components/game/DefaultGameViewContainer.react.js');
var MenuButton = require('../../components/MenuButton.react.js');
var Emoticon = require('../../components/Emoticon.react.js');
var SummaryAvatar = require('../../components/game/SummaryAvatar.react.js');

var AppStateActions = require('../../actions/AppStateActions.js');

var Summary = React.createClass({
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
        /*
         todo wynik gracza 1, wynik gracza 2
         zwyciezca
         powrot do menu, rewanz
         */
        var match = this.props.gameInfo.match;
        var isSinglePlayerGame = "SINGLE" === match.get("type");
        var isMatchFinished = "finished" === match.get("gameStatus");
        var resultNumbersObj = match.get("result");

        var player = this.props.gameInfo.player;
        var playerAvatar = player.get("FacebookUser").get("avatar").url;
        var opponent = this.props.gameInfo.opponent;
        var opponentAvatar;
        if (opponent && opponent.avatar) {
            opponentAvatar = opponent.avatar.url;
        }
        var playerSummaryAvatar = (<SummaryAvatar img={playerAvatar} nick={player.get("nick")}/>);

        var p1, p2;
        var resultSummary, resultNumbers, winnerInfo, resultEmoticon;
        if (resultNumbersObj) {
            var isUserPlayer1 = match.get("player1").equals(player);
            var playerStr;
            if (isUserPlayer1) {
                p1 = resultNumbersObj.player1;
                p2 = resultNumbersObj.player2;
                playerStr = "player1";
            } else {
                p1 = resultNumbersObj.player2;
                p2 = resultNumbersObj.player1;
                playerStr = "player2";
            }
            if (!isMatchFinished) {
                p2 = "?";
            } else {

                if (playerStr === match.get("winner")) {
                    winnerInfo = "Zwycięstwo!"
                    resultEmoticon = (
                        <Emoticon emotion="veryhappy"/>
                    );
                } else if ("draw" === match.get("winner")) {
                    winnerInfo = "Remis";
                    resultEmoticon = (
                        <Emoticon emotion="neutral"/>
                    );
                } else {
                    winnerInfo = "Porażka";
                    resultEmoticon = (
                        <Emoticon emotion="killme"/>
                    );
                }
            }
        } else {
            p1 = 0;
            p2 = 0;
        }

        if (!isSinglePlayerGame) {
            resultEmoticon = null;
        }

        resultNumbers = (
            <div className="result-numbers-container">
                <div className="result-numbers">
                    {p1} - {p2}
                </div>
                <div className="winner-info">
                    {winnerInfo}
                </div>
                {resultEmoticon}
            </div>
        );
        if (!isSinglePlayerGame) {
            resultSummary = (
                <div className="result-summary row">
                    <div className="col-sm-4">
                        {playerSummaryAvatar}
                    </div>
                    <div className="col-sm-4">
                        {resultNumbers}
                    </div>
                    <div className="col-sm-4">
                        <SummaryAvatar img={opponentAvatar} nick={opponent.nick} invert/>
                    </div>
                </div>
            );
        } else {
            resultSummary = (
                <div className="result-summary-single row">
                    <div className="col-sm-4">
                        {playerSummaryAvatar}
                    </div>
                    <div className="col-sm-8 ">
                        {resultNumbers}
                    </div>
                </div>
            );
        }
        return (
            <DefaultGameViewContainer hideResult={true}>
                <div id="match-summary">
                    {resultSummary}
                    <div className="turns">
                        WORK IN PROGRESS
                    </div>
                    <div className="options">
                        <MenuButton icon="fa fa-home" onClick={this.backToMenu}>Powrót do menu głównego</MenuButton>
                        <MenuButton icon="fa fa-gamepad" onClick={this.playRematch} disabled>Rewanż</MenuButton>
                    </div>
                </div>
            </DefaultGameViewContainer>
        );
    },
    backToMenu: function () {
        AppStateActions.goToMenu();
    },
    playRematch: function () {
        //todo
    }
});

module.exports = Summary;