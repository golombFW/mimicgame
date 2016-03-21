var model = require('cloud/model.js');
var utils = require('cloud/utils.js');

var _matchClassName = "Match";
var _photoQuestionClassName = "PhotoQuestion";
var _emotionClassName = "Emotion";
var _matchPlayer1Key = "player1";
var _matchPlayer2Key = "player2";
var _matchStatusKey = "gameStatus";
var _matchStatusKeyWaiting = "waiting";
var _matchStatusKeyInProgress = "in_progress";
var _matchStatusKeyFinished = "finished";
var _matchStatusKeyCancelled = "cancelled";

var _matchClass = Parse.Object.extend(_matchClassName);
var _photoQuestionClass = Parse.Object.extend(_photoQuestionClassName);
var _emotionClass = Parse.Object.extend(_emotionClassName);

exports.getGameplayData = function (player, matchId, options) {
    var matchQuery = new Parse.Query(_matchClass);
    matchQuery.include("turnList");
    matchQuery.include("turnList.question_" + _matchPlayer1Key);
    matchQuery.include("turnList.question_" + _matchPlayer2Key);
    matchQuery.get(matchId).then(function (newMatch) {
        console.log("match fetched: " + JSON.stringify(newMatch));
        _prepareGameplayDataForPlayer(player, newMatch, options);
    }, function (error) {
        options.error("GameManager.getGameplayData matchQuery error: " + error.message);
    });
};

exports.playerUploadPhoto = function (player, matchId, topic, photo, options) {
    var playerStr;
    var matchQuery = new Parse.Query(_matchClass);
    matchQuery.include("turnList");
    matchQuery.get(matchId).then(function (match) {
        console.log("match fetched: " + match.id);

        playerStr = _getPlayerString(player, match);
        if (null == playerStr) {
            console.error("player: " + player.id + " is not linked with match: " + matchId);
            return Parse.Promise.error("That match is not linked with player!");
        }

        var turnResult = _getPlayerTurn(player, match);
        if (turnResult.type === model.GameplayDataStatus.TURN && turnResult.turn.get("type") === model.TurnType.PHOTO_QUESTION.name) {
            var opponentQuestionKey = "question_" + _getOpponentString(player, match);

            //valid state, player doesn't upload photo for oppponent yet
            if (null === turnResult.turn.get(opponentQuestionKey)) {
                return _addPhotoQuestion(player, opponentQuestionKey, turnResult.turn, topic, photo);
            } else {
                return Parse.Promise.error("Invalid request, player uploaded photo before!");
            }
        } else {
            return Parse.Promise.error("Player cannot send photo to his actual turn!");
        }
    }, function (error) {
        options.error("GameManager.playerUploadPhoto matchQuery error: " + error.message);
    }).then(function (savedTurn) {
        console.log("Photo saved");
        var result;
        var playerQuestionKey = "question_" + playerStr;

        if (null !== savedTurn.get(playerQuestionKey)) {
            result = _gameplayDataFromTurn(model.GameplayDataStatus.TURN, playerStr, savedTurn);
        } else {
            result = _gameplayDataFromTurn(model.GameplayDataStatus.WAITING);
        }

        options.success(result);
    }).then(null, function (error) {
        options.error(error);
    });
};

//Helper functions
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
    if (null == playerStr) {
        options.error("That match is not linked with player!");
        return;
    }

    //send summary
    if (matchStatus === _matchStatusKeyFinished) {
        //todo
        console.log("Match finished, sending summary");
        result = _gameplayDataFromTurn(model.GameplayDataStatus.SUMMARY, playerStr);
        options.success(result);
        return;
    }

    var turnResult = _getPlayerTurn(player, match);
    if (turnResult.type === model.GameplayDataStatus.TURN) {
        console.log("Prepare gameplay data with turn");
        result = _gameplayDataFromTurn(model.GameplayDataStatus.TURN, playerStr, turnResult.turn);
    } else if (turnResult.type === model.GameplayDataStatus.WAITING) {
        //todo waiting for opponent
        console.log("Prepare gameplay waiting data");
        result = _gameplayDataFromTurn(model.GameplayDataStatus.WAITING, playerStr, turnResult.turn);
    } else {
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
            data.turn.ordinal = turn.get("turnNumber");
            data.turn.type = turn.get("type");
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

_getPlayerTurn = function (player, match) {
    var turnList = match.get("turnList");
    turnList.sort(function (a, b) {
        return a.get("turnNumber") - b.get("turnNumber");
    });

    var lastTurn, result;
    var playerAnswerKey = "answer_" + _getPlayerString(player, match);
    var opponentAnswerKey = "answer_" + _getOpponentString(player, match);

    for (var i = 0; i < turnList.length; i += 1) {
        var answer = turnList[i].get(playerAnswerKey);
        var isWaitingTurn = turnList[i].get("isWaitingForPrevious");

        if (null === answer) {
            lastTurn = turnList[i];

            //player doesn't give answer in turn and opponent give answer in previous turn or player can't have to wait
            if (!isWaitingTurn || (isWaitingTurn && 0 < i && null !== turnList[i - 1].get(opponentAnswerKey))) {
                var turnType = turnList[i].get("type");
                var playerQuestionKey = "question_" + _getPlayerString(player, match);
                var opponentQuestionKey = "question_" + _getOpponentString(player, match);

                //check exceptions
                //todo change this complicated logic to something more simple ex. split photo_question to turn of
                //todo sending photo and turn of sending answer to photo uploaded before
                //1. Player sent photo for opponent before and opponent doesn't sent photo for player
                if (turnType === model.TurnType.PHOTO_QUESTION.name && null === turnList[i].get(playerQuestionKey) && null !== turnList[i].get(opponentQuestionKey)) {
                    result = {type: model.GameplayDataStatus.WAITING, turn: turnList[i]};
                } else {
                    result = {type: model.GameplayDataStatus.TURN, turn: turnList[i]};
                }
            } else {
                result = {type: model.GameplayDataStatus.WAITING, turn: turnList[i]};
            }
            break;
        }
    }

    if (!lastTurn) {
        result = {type: model.GameplayDataStatus.SUMMARY};
    }

    return result;
};

_addPhotoQuestion = function (player, opponentQuestionKey, turn, topic, photo) {
    console.log("Adding new photo... player: " + player.id + " turn: " + turn.id + " topic: " + topic.id + " photo length: " + photo.length);
    var promise = new Parse.Promise();
    var photoQuestion = new _photoQuestionClass();

    //set photo
    var fileName = player.getUsername() + "_" + topic.id;
    var parseFile = new Parse.File(fileName, {base64: photo});
    photoQuestion.set("photo", parseFile);

    //set topic
    var topicObj = new _emotionClass();
    topicObj.id = topic.id;
    photoQuestion.set("player_answer", topicObj);

    //set acls
    _setPhotoQuestionACL(photoQuestion, player);

    //set player
    photoQuestion.set("author", player);

    var playerSettings = player.get("settings");
    playerSettings.fetch().then(function (settings) {
        //set access level
        var accessLevel = settings.get("photoPrivacy");
        photoQuestion.set("accessLevel", accessLevel);

        //add question to turn
        turn.set(opponentQuestionKey, photoQuestion);

        return turn.save();
    }, function (error) {
        promise.reject("Player settings fetch error: " + error.message);
    }).then(function (savedTurn) {
        promise.resolve(savedTurn);
    }, function (error) {
        promise.reject("Save turn with photo error: " + error.message);
    });

    return promise;
};

//Miscellaneous
_getPlayerString = function (player, match) {
    var p1 = match.get(_matchPlayer1Key);
    var p2 = match.get(_matchPlayer2Key);

    return p1.id === player.id ? _matchPlayer1Key : p2.id === player.id ? _matchPlayer2Key : null;
};

_getOpponentString = function (player, match) {
    var p1 = match.get(_matchPlayer1Key);
    var p2 = match.get(_matchPlayer2Key);

    return p1.id === player.id ? _matchPlayer2Key : p2.id === player.id ? _matchPlayer1Key : null;
};

var _setPhotoQuestionACL = function (photoQuestion, user) {
    var newACL = new Parse.ACL();

    newACL.setPublicReadAccess(false);
    newACL.setPublicWriteAccess(false);
    newACL.setReadAccess(user.id, true);
    newACL.setWriteAccess(user.id, false);

    photoQuestion.setACL(newACL);
};