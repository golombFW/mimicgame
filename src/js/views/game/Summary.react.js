var React = require('react');
var Parse = require('parse').Parse;

var DefaultGameViewContainer = require('../../components/game/DefaultGameViewContainer.react.js');
var MenuButton = require('../../components/MenuButton.react.js');
var Emoticon = require('../../components/Emoticon.react.js');
var SummaryAvatar = require('../../components/game/SummaryAvatar.react.js');
var SummaryTurns = require('../../components/game/SummaryTurns.react.js');
var BonusEventsPanel = require('../../components/game/BonusEventsPanel.react.js');
var LoadingBar = require('../../utils/Utils.js').Components.LoadingBar1;

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
    getInitialState: function () {
        return {
            isRevengeLoading: false,
            challengeRequest: null
        }
    },
    render: function () {
        var content;
        if (this.state.challengeRequest) {
            content = (
                <div id="match-summary">
                    <div className="challenge-send">
                        Rzucono wyzwanie graczowi <b>{this.state.challengeRequest.get("opponent").get("nick")}</b>
                    </div>
                    <div className="options">
                        <MenuButton icon="fa fa-home" onClick={this.backToMenu}>Powrót do menu głównego</MenuButton>
                    </div>
                </div>
            );
        } else if (this.state.isRevengeLoading) {
            content = (
                <div id="match-summary">
                    <LoadingBar customText="Trwa wysyłanie danych..." color="dark" center="parent"/>
                </div>
            );
        } else {
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

            var p1, p2;
            var resultSummary, resultNumbers, winnerInfo, resultEmoticon, revengeButton;
            var isUserPlayer1 = match.get("player1").equals(player);
            var playerStr;
            if (resultNumbersObj) {
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
                        winnerInfo = "Zwycięstwo!";
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

            var playerEvents = match.get("events_" + playerStr);
            var playerScore = 0;
            if (playerEvents) {
                for (var i in playerEvents) {
                    var event = playerEvents[i];
                    playerScore += (+event.value);
                }
            }

            var playerSummaryAvatar = (
                <SummaryAvatar img={playerAvatar} nick={player.get("nick")} score={playerScore}/>);

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
                        <div className="col-xs-4 col-sm-4">
                            {playerSummaryAvatar}
                        </div>
                        <div className="col-xs-4 col-sm-4">
                            {resultNumbers}
                        </div>
                        <div className="col-xs-4 col-sm-4">
                            <SummaryAvatar img={opponentAvatar} nick={opponent.nick} invert/>
                        </div>
                    </div>
                );
                revengeButton = (
                    <MenuButton icon="fa fa-gamepad" onClick={this.playRematch.bind(this, opponent)}>Rewanż</MenuButton>
                );
            } else {
                resultSummary = (
                    <div className="result-summary-single row">
                        <div className="col-xs-6 col-sm-4">
                            {playerSummaryAvatar}
                        </div>
                        <div className="col-xs-6 col-sm-4 ">
                            {resultNumbers}
                        </div>
                    </div>
                );
            }
            content = (
                <div id="match-summary">
                    {resultSummary}
                    <SummaryTurns match={match} player={player} turnsSummary={this.props.data.summary}/>
                    <BonusEventsPanel events={playerEvents}/>
                    <div className="options">
                        <MenuButton icon="fa fa-home" onClick={this.backToMenu}>Powrót do menu głównego</MenuButton>
                        {revengeButton}
                    </div>
                </div>
            );
        }

        return (
            <DefaultGameViewContainer hideResult={true}>
                {content}
            </DefaultGameViewContainer>
        );
    },
    backToMenu: function () {
        AppStateActions.goToMenu();
    },
    playRematch: function (opponent) {
        if (opponent) {
            this.setState({isRevengeLoading: true});

            Parse.Cloud.run('challengePlayer', {userId: opponent.id}).then(function (challengeRequest) {
                this.setState({challengeRequest: challengeRequest});
            }.bind(this), function (error) {
                console.log(error);
            });
        }
    }
});

module.exports = Summary;