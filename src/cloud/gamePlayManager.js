var model = require('cloud/model.js');
var common = require('cloud/common.js');
var utils = require('cloud/utils.js');
var _ = require('underscore');

var _matchClassName = "Match";
var _photoQuestionClassName = "PhotoQuestion";
var _photoQuestionAnswerClassName = "PhotoQuestionAnswer";
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
var _photoQuestionAnswerClass = Parse.Object.extend(_photoQuestionAnswerClassName);
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

        var turnDetails = _getPlayerTurn(player, match);
        if (turnDetails.type === model.GameplayDataStatus.TURN && turnDetails.turn.get("type") === model.TurnType.PHOTO_QUESTION.name) {
            var opponentKey = _getOpponentString(player, match);
            var questionForOpponentKey = "question_" + opponentKey;

            //valid state, player doesn't upload photo for oppponent yet
            if (!turnDetails.turn.get(questionForOpponentKey)) {
                return _addPhotoQuestion(player, opponentKey, turnDetails.turn, topic, photo);
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
        console.log("saved turn: " + JSON.stringify(savedTurn));

        var result = {
            turnId: savedTurn.id
        };
        options.success(result);
    }).then(null, function (error) {
        options.error(error);
    });
};

exports.answerQuestion = function (player, matchId, answerEmotion, options) {
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

        var turnDetails = _getPlayerTurn(player, match);
        if (turnDetails.type === model.GameplayDataStatus.TURN && (!turnDetails.phase || _isPhotoQuestionAnswerPhase(turnDetails.phase))) {
            var turn = turnDetails.turn;
            var playerAnswerKey = "answer_" + playerStr;

            if (!turn.get(playerAnswerKey)) {
                var playerQuestionKey = "question_" + playerStr;
                var question = turn.get(playerQuestionKey);
                if (!question) {
                    return Parse.Promise.error("Incorrect state, there is no question for Player!");
                }

                var emotion = new _emotionClass();
                emotion.id = answerEmotion.id;

                var answer = _prepareAnswer(player, question, emotion);
                turn.set(playerAnswerKey, answer);

                return turn.save();
            } else {
                return Parse.Promise.error("Incorrect state, player send answer to current turn!");
            }
        } else {
            return Parse.Promise.error("Incorrect state, player is not allowed to send answer to current turn!");
        }
    }).then(function (savedTurn) {
        console.log("Answer to question saved!");
        var saveAnswerResult = {
            turnId: savedTurn.id
        };
        options.success(saveAnswerResult);
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
        //todo summary
        console.log("Match finished, sending summary");
        result = _gameplayDataFromTurn(model.GameplayDataStatus.SUMMARY, playerStr);
        options.success(result);
        return;
    }

    var turnResult = _getPlayerTurn(player, match);
    if (turnResult.type === model.GameplayDataStatus.TURN) {
        console.log("Prepare gameplay data with turn");
        result = _gameplayDataFromTurn(model.GameplayDataStatus.TURN, playerStr, turnResult.turn, turnResult.phase);
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

_gameplayDataFromTurn = function (status, playerStr, turn, phase) {
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
            data.turn.type = turn.get("type");
            if (data.turn.type === model.TurnType.PHOTO_QUESTION.name && phase === model.TurnType.PHOTO_QUESTION.phases.initial) {
                console.log("Preparing turn gameplay data without question");
                data.turn.question = null;
            } else {
                data.turn.question = turn.get("question_" + playerStr);
            }
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

                if (_isPhotoQuestionTurnType(turnType)) {
                    if (_playerPreparedOpponentQuestion(turnList[i], opponentQuestionKey) && !_opponentPreparedPlayerQuestion(turnList[i], playerQuestionKey)) {
                        result = {type: model.GameplayDataStatus.WAITING, turn: turnList[i]};
                    } else if (_opponentPreparedPlayerQuestion(turnList[i], playerQuestionKey) && !_playerPreparedOpponentQuestion(turnList[i], opponentQuestionKey)) {
                        result = {
                            type: model.GameplayDataStatus.TURN,
                            turn: turnList[i],
                            phase: model.TurnType.PHOTO_QUESTION.phases.initial
                        };
                    } else {
                        result = {
                            type: model.GameplayDataStatus.TURN,
                            turn: turnList[i],
                            phase: model.TurnType.PHOTO_QUESTION.phases.answer
                        };
                    }
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

_addPhotoQuestion = function (player, opponentKey, turn, topic, photo) {
    console.log("Adding new photo... player: " + player.id + " turn: " + turn.id + " topic: " + topic.id + " photo length: " + photo.length);
    var resultPromise = new Parse.Promise();
    var photoQuestion = new _photoQuestionClass();
    var questionForOpponentKey = "question_" + opponentKey;

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
        turn.set(questionForOpponentKey, photoQuestion);

        return _updatePhotoTurnAdditionalData(turn, opponentKey, topicObj);
    }, function (error) {
        resultPromise.reject("Player settings fetch error: " + error.message);
    }).then(function (updatedTurn) {
        return updatedTurn.save();
    }).then(function (savedTurn) {
        resultPromise.resolve(savedTurn);
    }, function (error) {
        resultPromise.reject("Save turn with photo error: " + error.message);
    });

    return resultPromise;
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

_setPhotoQuestionACL = function (photoQuestion, user) {
    var newACL = new Parse.ACL();

    newACL.setPublicReadAccess(false);
    newACL.setPublicWriteAccess(false);
    newACL.setReadAccess(user.id, true);
    newACL.setWriteAccess(user.id, false);

    photoQuestion.setACL(newACL);
};

_setPhotoQuestionAnswerACL = function (photoQuestionAnswer, user) {
    var newACL = new Parse.ACL();

    newACL.setPublicReadAccess(false);
    newACL.setPublicWriteAccess(false);
    newACL.setReadAccess(user.id, true);

    photoQuestionAnswer.setACL(newACL);
};

_updatePhotoTurnAdditionalData = function (turn, playerKey, correctAnswerFlat) {
    var promise = new Parse.Promise();
    var additionalDataForPlayerKey = "additionalData_" + playerKey;
    var data = turn.get(additionalDataForPlayerKey);
    var emotionQuery = new Parse.Query(_emotionClassName);
    emotionQuery.find().then(function (emotionList) {
        if (1 > emotionList.length) {
            promise.reject("Emotions list is empty!");
            return;
        }
        data.answers = common.randomAnswers(emotionList, correctAnswerFlat);
        turn.set(additionalDataForPlayerKey, data);
        promise.resolve(turn);
    }, function (error) {
        console.error("error while fetching emotion list.");
        promise.reject(error);
    });

    return promise;
};

_prepareAnswer = function (player, photoQuestion, emotion) {
    var answer = new _photoQuestionAnswerClass();
    answer.set("player", player);
    answer.set("question", photoQuestion);
    answer.set("answer", emotion);
    _setPhotoQuestionAnswerACL(answer, player);

    return answer;
};

_isPhotoQuestionTurnType = function (turnType) {
    return turnType === model.TurnType.PHOTO_QUESTION.name;
};

_isPhotoQuestionAnswerPhase = function (phase) {
    return phase === model.TurnType.PHOTO_QUESTION.phases.answer
};

_playerPreparedOpponentQuestion = function (turn, opponentQuestionKey) {
    return null != turn.get(opponentQuestionKey)
};

_opponentPreparedPlayerQuestion = function (turn, playerQuestionKey) {
    return null != turn.get(playerQuestionKey);
};