var model = require('cloud/model.js');
var utils = require('cloud/utils.js');

var _matchClassName = "Match";
var _matchPlayer1Key = "player1";
var _matchPlayer2Key = "player2";
var _matchStatusKey = "gameStatus";
var _matchStatusKeyWaiting = "waiting";
var _matchStatusKeyInProgress = "in_progress";
var _matchStatusKeyFinished = "finished";
var _matchStatusKeyCancelled = "cancelled";

var Match = Parse.Object.extend(_matchClassName);

exports.getGameplayData = function (player, matchId, options) {
    var matchQuery = new Parse.Query(Match);
    matchQuery.include("turnList");
    matchQuery.get(matchId).then(function (newMatch) {
        console.log("match fetched: " + JSON.stringify(newMatch));
        _prepareGameplayDataForPlayer(player, newMatch, options);
    }, function (error) {
        options.error("GameManager.getGameplayData matchQuery error: " + error.message);
    });
};

_prepareGameplayDataForPlayer = function (player, match, options) {
    console.log("Preparing gameplay data for player...");
    var result;

    //match is waiting or is cancelled
    var matchStatus = match.get(_matchStatusKey);
    if (matchStatus === _matchStatusKeyWaiting || matchStatus === _matchStatusKeyCancelled) {
        options.error("Incorrect match status: " + matchStatus);
        return;
    }

    var playerStr = _getPlayerString(player, match);
    var opponentStr = _getOpponentString(player, match);

    //send summary
    if (matchStatus === _matchStatusKeyFinished) {
        //todo
        console.log("Match finished, sending summary");
        result = _gameplayDataFromTurn(model.GameplayDataStatus.SUMMARY, playerStr);
        options.success(result);
        return;
    }

    var turnList = match.get("turnList");
    turnList.sort(function (a, b) {
        return a.get("turnNumber") - b.get("turnNumber");
    });

    console.log("turns: " + JSON.stringify(turnList));
    var lastturn;
    var playerAnswerKey = "answer_" + playerStr;
    var opponentAnswerKey = "answer_" + opponentStr;

    for (var i = 0; i < turnList.length; i += 1) {
        var answer = turnList[i].get(playerAnswerKey);
        var isWaitingTurn = turnList[i].get("isWaitingForPrevious");

        if (null === answer) {
            console.log("Turn without answer found");
            lastturn = turnList[i];

            //player doesn't give answer in turn and opponent give answer in previous turn
            if (!isWaitingTurn || (isWaitingTurn && 0 < i && null !== turnList[i - 1].get(opponentAnswerKey))) {
                console.log("Prepare gameplay data with turn");
                result = _gameplayDataFromTurn(model.GameplayDataStatus.TURN, playerStr, turnList[i]);
            } else {
                //todo waiting for opponent
                console.log("Prepare gameplay waiting data");
                result = _gameplayDataFromTurn(model.GameplayDataStatus.WAITING);
            }
            break;
        }
    }
    if (!lastturn) {
        //todo player ends game, send partial summary
        console.log("No active turns found, sending summary");
        result = _gameplayDataFromTurn(model.GameplayDataStatus.SUMMARY, playerStr);
    }
    if (result) {
        options.success(result);
    } else {
        options.error("no result, something goes wrong");
    }
};

_gameplayDataFromTurn = function (status, playerStr, turn) {
    var data = utils.cloneObject(model.GameplayData);
    data.status = status;

    switch (status) {
        case model.GameplayDataStatus.WAITING:
            break;
        case model.GameplayDataStatus.SUMMARY:
            break;
        case model.GameplayDataStatus.TURN:
            data.turn.ordinal = turn.get("turnNumber");
            data.turn.question = turn.get("question_" + playerStr);
            data.turn.type = turn.get("type");
            data.turn.additionalData = turn.get("additionalData_" + playerStr);
            break;
        default:
            console.error("Invalid status!");
    }
    return data;
};

//Miscellaneous
_getPlayerString = function (user, match) {
    var p1 = match.get(_matchPlayer1Key);
    var p2 = match.get(_matchPlayer2Key);

    return p1.id === user.id ? _matchPlayer1Key : _matchPlayer2Key;
};

_getOpponentString = function (user, match) {
    var p1 = match.get(_matchPlayer1Key);
    var p2 = match.get(_matchPlayer2Key);

    return p1.id !== user.id ? _matchPlayer1Key : _matchPlayer2Key;
};