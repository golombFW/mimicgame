var model = require('cloud/model.js');
var common = require('cloud/common.js');
var utils = require('cloud/utils.js');
var _ = require('underscore');

var _matchClassName = "Match";
var _photoQuestionClassName = "PhotoQuestion";
var _photoQuestionAnswerClassName = "PhotoQuestionAnswer";
var _emotionClassName = "Emotion";
var _rankRuleClassName = "RankRule";
var _reportClassName = "Report";
var _matchPlayer1Key = "player1";
var _matchPlayer2Key = "player2";
var _matchStatusKey = "gameStatus";
var _matchStatusKeyWaiting = "waiting";
var _matchStatusKeyInProgress = "in_progress";
var _matchStatusKeyFinished = "finished";
var _matchStatusKeyCancelled = "cancelled";
var _matchTypeKeySingle = "SINGLE";

var _matchClass = Parse.Object.extend(_matchClassName);
var _photoQuestionClass = Parse.Object.extend(_photoQuestionClassName);
var _photoQuestionAnswerClass = Parse.Object.extend(_photoQuestionAnswerClassName);
var _emotionClass = Parse.Object.extend(_emotionClassName);
var _reportClass = Parse.Object.extend(_reportClassName);


exports.getGameplayData = function (player, matchId, options) {
    var matchQuery = new Parse.Query(_matchClass);
    matchQuery.include("turnList");
    matchQuery.include("turnList.question_" + _matchPlayer1Key);
    matchQuery.include("turnList.question_" + _matchPlayer2Key);
    matchQuery.include("turnList.answer_" + _matchPlayer1Key);
    matchQuery.include("turnList.answer_" + _matchPlayer2Key);
    matchQuery.get(matchId).then(function (newMatch) {
        console.log("match fetched: " + JSON.stringify(newMatch));
        return _prepareGameplayDataForPlayer(player, newMatch);
    }, function (error) {
        options.error("GameManager.getGameplayData matchQuery error: " + error.message);
    }).then(function (gameplayData) {
        options.success(gameplayData);
    }, function (errorMsg) {
        options.error("GameManager.getGameplayData _prepareGameplayDataForPlayer error: " + errorMsg);
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
    var match;
    matchQuery.include("turnList");
    matchQuery.include("player1");
    matchQuery.include("player2");
    matchQuery.get(matchId).then(function (fetchedMatch) {
        match = fetchedMatch;
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
        _log("Answer to question saved!", player);
        return _computeAnswerResult(player, savedTurn, playerStr, match);
    }).then(function (answerResult) {
        options.success(answerResult);
    }).then(null, function (error) {
        options.error(error);
    });
};

exports.reportPhoto = function (player, photoQuestionId, reason, options) {
    var photoQuestionQuery = new Parse.Query(_photoQuestionClass);
    photoQuestionQuery.get(photoQuestionId).then(function (photoQuestion) {
        return _handlePhotoReport(player, photoQuestion, reason);
    }).then(function (reportResponse) {
        options.success(reportResponse);
    }).then(null, function (error) {
        options.error(error);
    });
};

//Helper functions
_prepareGameplayDataForPlayer = function (player, match) {
    console.log("Preparing gameplay data for player...");
    var promise = new Parse.Promise();
    var result;

    //match is waiting or is cancelled
    var matchStatus = match.get(_matchStatusKey);
    if (matchStatus === _matchStatusKeyWaiting || matchStatus === _matchStatusKeyCancelled) {
        promise.reject("Incorrect match status: " + matchStatus);
    }

    var playerStr = _getPlayerString(player, match);
    if (null == playerStr) {
        promise.reject("That match is not linked with player!");
    }

    var emotionQuery = new Parse.Query(_emotionClassName);
    emotionQuery.find().then(function (emotions) {
        //send summary
        if (matchStatus === _matchStatusKeyFinished) {
            console.log("Match finished, sending summary");
            result = _summaryData(player, match, emotions);
            promise.resolve(result);
        } else {
            var turnResult = _getPlayerTurn(player, match);
            if (turnResult.type === model.GameplayDataStatus.TURN) {
                console.log("Prepare gameplay data with turn");
                result = _gameplayDataFromTurn(model.GameplayDataStatus.TURN, playerStr, turnResult.turn, turnResult.phase);
            } else if (turnResult.type === model.GameplayDataStatus.WAITING) {
                //todo waiting for opponent
                console.log("Prepare gameplay waiting data");
                result = _gameplayDataFromTurn(model.GameplayDataStatus.WAITING, playerStr, turnResult.turn);
            } else {
                console.log("No active turns found, sending summary");
                result = _summaryData(player, match, emotions);
            }

            var updateDataPromise = _updateMatchStatusIfNeeded(match, turnResult.turnNumber);
            updateDataPromise.then(function (updatedMatch) {
                return Parse.Promise.as("Match update successful");
            }, function (error) {
                console.error("Problem with updating match obj: " + error.message);
                return Parse.Promise.as("Update problem");
            }).then(function (res) {
                if (result) {
                    promise.resolve(result);
                } else {
                    promise.reject("no result, something goes wrong");
                }
            });
        }
    }, function (error) {
        promise.reject(error.message);
    });

    return promise;
};

_gameplayDataFromTurn = function (status, playerStr, turn, phase) {
    var data = utils.cloneObject(model.GameplayData);
    data.status = status;

    switch (status) {
        case model.GameplayDataStatus.WAITING:
            data.turn.ordinal = turn.get("turnNumber");
            data.turn.type = turn.get("type");
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

_summaryData = function (player, match, emotions) {
    var data = utils.cloneObject(model.GameplayData);
    data.status = model.GameplayDataStatus.SUMMARY;

    var turnList = match.get("turnList");
    turnList.sort(function (a, b) {
        return a.get("turnNumber") - b.get("turnNumber");
    });

    var player1AnswerKey = "answer_player1";
    var player2AnswerKey = "answer_player2";
    var player1QuestionKey = "question_player1";
    var player2QuestionKey = "question_player2";

    var emotionsList = _.reduce(emotions, function (memo, el) {
        memo[el.id] = utils.flattenEmotionObj(el);
        return memo;
    }, {});

    var resultSummary = _.map(turnList, function (turn) {
        var answer1Obj = turn.get(player1AnswerKey);
        var answer2Obj = turn.get(player2AnswerKey);
        var answer1, answer2, correctAnswer1, correctAnswer2, question1, question2, questionUrl1, questionUrl2, player1,
            player2, default1, default2;
        if (answer1Obj) {
            answer1 = emotionsList[answer1Obj.get("answer").id];
            question1 = turn.get(player1QuestionKey);
            correctAnswer1 = emotionsList[question1.get("player_answer").id];
            if (question1.get("photo")) {
                questionUrl1 = question1.get("photo").url();
            }
            if (question1.get("default")) {
                default1 = question1.get("default");
            }
            player1 = {
                answer: answer1,
                correctAnswer: correctAnswer1,
                questionUrl: questionUrl1,
                defaultPhoto: default1
            }
        }
        if (answer2Obj) {
            answer2 = emotionsList[answer2Obj.get("answer").id];
            question2 = turn.get(player2QuestionKey);
            correctAnswer2 = emotionsList[question2.get("player_answer").id];
            if (question2.get("photo")) {
                questionUrl2 = question2.get("photo").url();
            }
            if (question2.get("default")) {
                default2 = question2.get("default");
            }
            player2 = {
                answer: answer2,
                correctAnswer: correctAnswer2,
                questionUrl: questionUrl2,
                defaultPhoto: default2
            }
        }

        return {
            turnNumber: turn.get("turnNumber"),
            type: turn.get("type"),
            player1: player1,
            player2: player2
        }
    });
    data.summary = resultSummary;

    return data;
};

_getPlayerTurn = function (player, match) {
    var turnList = match.get("turnList");
    turnList.sort(function (a, b) {
        return a.get("turnNumber") - b.get("turnNumber");
    });

    var lastTurn, result = null;
    var playerAnswerKey = "answer_" + _getPlayerString(player, match);
    var opponentAnswerKey = "answer_" + _getOpponentString(player, match);
    var opponentTurnNumber = 1;

    for (var i = 0; i < turnList.length; i += 1) {
        var playerAnswer = turnList[i].get(playerAnswerKey);
        var opponentAnswer = turnList[i].get(opponentAnswerKey);
        var isWaitingTurn = turnList[i].get("isWaitingForPrevious");
        var opponentGiveAnswerInPreviousTurn = 0 < i && null !== turnList[i - 1].get(opponentAnswerKey);

        if (opponentAnswer || _matchTypeKeySingle === match.get("type")) {
            opponentTurnNumber += 1;
        }

        if (null === result && null === playerAnswer) {
            lastTurn = turnList[i];

            if (!isWaitingTurn || (isWaitingTurn && opponentGiveAnswerInPreviousTurn)) {
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
                    result = {
                        type: model.GameplayDataStatus.TURN,
                        turn: turnList[i]
                    };
                }
            } else {
                result = {
                    type: model.GameplayDataStatus.WAITING,
                    turn: turnList[i]
                };
            }
        }
    }

    if (!lastTurn) {
        result = {
            type: model.GameplayDataStatus.SUMMARY
        };
    }

    var playerTurnNumber;
    if (result.turn) {
        playerTurnNumber = result.turn.get("turnNumber");
    } else {
        playerTurnNumber = turnList.length + 1;
    }
    result.turnNumber = playerTurnNumber < opponentTurnNumber ? playerTurnNumber : opponentTurnNumber;

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

_computeAnswerResult = function (player, turn, playerStr, match) {
    var promise = new Parse.Promise();

    var opponentStr = _getOpponentString(player, match);
    var opponent = match.get(opponentStr);
    var playerAnswerKey = "answer_" + playerStr;
    var playerAnswerObj = turn.get(playerAnswerKey);
    console.log("player answer" + JSON.stringify(playerAnswerObj));
    var playerQuestion = playerAnswerObj.get("question");
    console.log("player question" + JSON.stringify(playerQuestion));
    var playerAnswer = playerAnswerObj.get("answer");
    console.log("player answer emotion" + JSON.stringify(playerAnswer));

    var rankRulesQuery = new Parse.Query(_rankRuleClassName);
    var rankRulePromise = rankRulesQuery.find();
    var playerScorePromise = player.get("score").fetch();
    var opponentScorePromise = opponent ? opponent.get("score").fetch() : Parse.Promise.as();

    var answerResult;
    playerQuestion.fetch().then(function (fetchedQuestion) {
        var correctAnswer = fetchedQuestion.get("player_answer");
        return correctAnswer.fetch();
    }).then(function (correctAnswer) {
        console.log("correct answer" + JSON.stringify(correctAnswer));
        var playerResult = playerAnswer.id === correctAnswer.id;
        var lastTurn = turn.get("turnNumber") == _.size(match.get("turnList"));

        answerResult = {
            points: 0,
            correctAnswer: utils.flattenEmotionObj(correctAnswer),
            playerResult: playerResult,
            lastTurn: lastTurn
        };
        return Parse.Promise.when(rankRulePromise, playerScorePromise, opponentScorePromise);
    }).then(function (rankRules, playerScoreObj, opponentScoreObj) {
        if (1 > rankRules.length) {
            console.error("\"_computeAnswerResult\": Rank rules table is empty!");
            promise.resolve(answerResult);
        } else {
            var rankRulesMap = utils.mapRankRules(rankRules);
            var correctAnswerAward = rankRulesMap["correctAnswerAward"];
            var playerEventsKey = "events_" + playerStr;
            var points = 0;

            if (correctAnswerAward && answerResult.playerResult) {
                var correctAnswerPoints = utils.rankPointsBonus(utils.playerPoints(match.get(playerEventsKey)), correctAnswerAward);
                points += correctAnswerPoints;
                answerResult.points = correctAnswerPoints;
                _addCorrectAnswerEvent(match, turn, playerStr, points);

                if (answerResult.lastTurn) {
                    if (_areAllAnswersCorrect(match, playerStr)) {
                        var allCorrectAnswersAward = rankRulesMap["allCorrectAnswersAward"];
                        if (allCorrectAnswersAward) {
                            var award = utils.rankPointsBonus(utils.playerPoints(match.get(playerEventsKey)), allCorrectAnswersAward);
                            points += award;
                            match.add(playerEventsKey, {
                                name: "allCorrectAnswersAward",
                                value: award
                            });
                        }
                    }
                }
            }
            var opponentPoints = 0;
            var isSinglePlayerGame = _matchTypeKeySingle === match.get("type");
            if (answerResult.lastTurn) {
                var matchRandomBonus = rankRulesMap["matchRandomBonus"];
                if (matchRandomBonus) {
                    var randomAward = _addMatchRandomBonus(match, matchRandomBonus, playerEventsKey, points);
                    points += randomAward;
                }

                var opponentStr = _getOpponentString(player, match);
                if (isSinglePlayerGame || turn.get("answer_" + opponentStr)) {
                    var matchWinLostBonuses = _computeWinLostEvent(match, playerStr, opponentStr, rankRulesMap);
                    points += matchWinLostBonuses.playerBonus;
                    opponentPoints += matchWinLostBonuses.opponentBonus;
                }
            }

            playerScoreObj.increment("score", points);
            var playerScorePromise = 0 !== points ? playerScoreObj.save() : Parse.Promise.as();
            var matchUpdatePromise = match.save();
            var opponentScorePromise;
            if (!isSinglePlayerGame && 0 !== opponentPoints && opponentScoreObj) {
                opponentScoreObj.increment("score", opponentPoints);
                opponentScorePromise = opponentScoreObj.save();
            } else {
                opponentScorePromise = Parse.Promise.as();
            }

            Parse.Promise.when(playerScorePromise, opponentScorePromise, matchUpdatePromise).then(function (savedPlayerScore, savedOpponentScore, savedMatch) {
                promise.resolve(answerResult);
            }, function (error) {
                console.error(error.message);
                promise.resolve(answerResult);
            })
        }
    }).then(null, function (error) {
        console.error("Problem with fetching question while computing answer result!\n" + error.message);
        promise.reject(error);
    });

    return promise;
};

_updateMatchStatusIfNeeded = function (match, turnNumber) {
    var promise = new Parse.Promise();

    var turns = match.get("turnList");
    var matchStatusNeedsUpdate = turns.length < turnNumber;
    var matchTurnNumberNeedsUpdate = match.get("round") < turnNumber;

    if (matchStatusNeedsUpdate || matchTurnNumberNeedsUpdate) {
        if (matchStatusNeedsUpdate) {
            match.set(_matchStatusKey, _matchStatusKeyFinished);
            var matchWinner = _matchWinner(match);
            match.set("winner", matchWinner);
        }
        if (matchTurnNumberNeedsUpdate) {
            match.set("round", turnNumber);
            var matchResult = _matchResult(match);
            match.set("result", matchResult);
        }
        match.save().then(function (updatedMatch) {
            console.log("Match " + updatedMatch.id + " status updated!");
            promise.resolve(updatedMatch);
        }, function (error) {
            console.error("Problem with updating match in _updateMatchStatusIfNeeded");
            promise.reject(error);
        })
    } else {
        promise.resolve(match);
    }

    return promise;
};

_matchWinner = function (match) {
    var matchResult = _matchResult(match);
    if (matchResult.player1 > matchResult.player2) {
        return _matchPlayer1Key;
    } else if (matchResult.player2 > matchResult.player1) {
        return _matchPlayer2Key;
    } else {
        return "draw";
    }
};

_matchResult = function (match) {
    var turns = match.get("turnList");
    var player1Result = 0, player2Result = 0;
    for (var i in turns) {
        var turn = turns[i];

        var question1 = turn.get("question_" + _matchPlayer1Key);
        var question2 = turn.get("question_" + _matchPlayer2Key);
        var correctAnswer1 = question1 ? question1.get("player_answer") : null;
        var correctAnswer2 = question2 ? question2.get("player_answer") : null;

        var playerAnswer1 = turn.get("answer_" + _matchPlayer1Key);
        var playerAnswer2 = turn.get("answer_" + _matchPlayer2Key);

        if (_matchTypeKeySingle === match.get("type")) {
            if (null == playerAnswer1) {
                break;
            }

            if (correctAnswer1.equals(playerAnswer1.get("answer"))) {
                player1Result += 1;
            } else {
                player2Result += 1;
            }
        } else {
            if (null == playerAnswer1 || null == playerAnswer2) {
                break;
            }

            if (correctAnswer1.equals(playerAnswer1.get("answer"))) {
                player1Result += 1;
            }

            if (correctAnswer2.equals(playerAnswer2.get("answer"))) {
                player2Result += 1;
            }
        }
    }
    return {
        player1: player1Result,
        player2: player2Result
    }
};

_eventBasedMatchResult = function (match) {
    var playersEvents = [match.get("events_" + _matchPlayer1Key), match.get("events_" + _matchPlayer2Key)];
    var playersResults = [];

    for (var i = 0; i < playersEvents.length; i += 1) {
        var events = playersEvents[i];
        var result = 0;
        for (var x in events) {
            result += ("correctAnswerAward" === events[x].name) ? 1 : 0;
        }
        playersResults[i] = result;
    }
    var isSinglePlayerGame = _matchTypeKeySingle === match.get("type");
    if (isSinglePlayerGame) {
        playersResults[1] = match.get("turnList").length - playersResults[0];
    }
    return {
        player1: playersResults[0],
        player2: playersResults[1]
    };
};

_computeWinLostEvent = function (match, playerStr, opponentStr, rankRulesMap) {
    var playerEventsKey = "events_" + playerStr;
    var opponentEventsKey = "events_" + opponentStr;
    var result = _eventBasedMatchResult(match);
    console.log("match result: " + JSON.stringify(result));
    var playerResult, opponentResult;
    if (_matchPlayer1Key === playerStr) {
        playerResult = result.player1;
        opponentResult = result.player2;
    } else {
        playerResult = result.player2;
        opponentResult = result.player1;
    }

    var matchWinBonus = rankRulesMap["matchWinBonus"];
    var matchLostBonus = rankRulesMap["matchLostBonus"];
    var isSinglePlayerGame = _matchTypeKeySingle === match.get("type");

    var playerScore = (+utils.playerPoints(match.get(playerEventsKey)));
    var opponentScore = !isSinglePlayerGame ? (+utils.playerPoints(match.get(opponentEventsKey))) : 0;

    var playerBonus = 0, opponentBonus = 0;
    if (playerResult > opponentResult) {
        if (matchWinBonus) {
            playerBonus = utils.rankPointsBonus(playerScore, matchWinBonus);
            match.add(playerEventsKey, {
                name: "matchWinBonus",
                value: playerBonus
            });
        }
        if (matchLostBonus && !isSinglePlayerGame) {
            opponentBonus = utils.rankPointsBonus(opponentScore, matchLostBonus);
            match.add(opponentEventsKey, {
                name: "matchLostBonus",
                value: opponentBonus
            });
        }
    } else if (playerResult < opponentResult) {
        if (matchLostBonus) {
            playerBonus = utils.rankPointsBonus(playerScore, matchLostBonus);
            match.add(playerEventsKey, {
                name: "matchLostBonus",
                value: playerBonus
            });
        }
        if (matchWinBonus && !isSinglePlayerGame) {
            opponentBonus = utils.rankPointsBonus(opponentScore, matchWinBonus);
            match.add(opponentEventsKey, {
                name: "matchWinBonus",
                value: opponentBonus
            });
        }
    }
    console.log("playerBonus: " + playerBonus + " opponentBonus: " + opponentBonus);
    return {
        playerBonus: playerBonus,
        opponentBonus: opponentBonus
    };
};

_handlePhotoReport = function (player, photoQuestion, reason) {
    var promise = new Parse.Promise();

    var reportResponse = {
        isAccepted: null,
        reason: null
    };

    var photoQuestionReportStatus = photoQuestion.get("reportStatus");
    if (model.photoQuestionReportStatus.ALLOWED === photoQuestionReportStatus || model.photoQuestionReportStatus.BLOCKED === photoQuestionReportStatus) {
        reportResponse.isAccepted = false;
        reportResponse.reason = model.reportResponseReason.INSPECTED;

        promise.resolve(reportResponse);
    } else {
        var reportQuery = new Parse.Query(_reportClassName);
        reportQuery.equalTo("photoQuestion", photoQuestion);
        reportQuery.equalTo("player", player);
        reportQuery.count().then(function (reportsNumber) {
            if (0 < reportsNumber) {
                reportResponse.isAccepted = false;
                reportResponse.reason = model.reportResponseReason.DUPLICATE;

                promise.resolve(reportResponse);
            } else {
                var playerReport = new _reportClass();
                playerReport.set("player", player);
                playerReport.set("photoQuestion", photoQuestion);
                playerReport.set("status", model.reportStatus.INITIAL);
                playerReport.set("reason", reason);
                _setReportACL(playerReport);

                var playerReportPromise = playerReport.save();
                var photoQuestionPromise;
                if (photoQuestionReportStatus !== model.photoQuestionReportStatus.EXAMINED) {
                    photoQuestion.set("reportStatus", model.photoQuestionReportStatus.EXAMINED);
                    photoQuestionPromise = photoQuestion.save();
                } else {
                    photoQuestionPromise = Parse.Promise.as();
                }

                Parse.Promise.when(playerReportPromise, photoQuestionPromise).then(function (savedReport, savedPhotoQuestion) {
                    _log("Photo question: " + photoQuestion.id + " reported", player);
                    reportResponse.isAccepted = true;

                    promise.resolve(reportResponse);
                }, function (error) {
                    console.error("Problem with saving report");

                    promise.reject(error.message);
                })
            }
        }).then(null, function (error) {
            promise.reject(error.message);
        })
    }

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

_setReportACL = function (playerReport) {
    var newACL = new Parse.ACL();

    newACL.setPublicReadAccess(false);
    newACL.setPublicWriteAccess(false);

    playerReport.setACL(newACL);
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

_addCorrectAnswerEvent = function (match, turn, playerStr, points) {
    var playerEvents = "events_" + playerStr;
    match.add(playerEvents, {
        name: "correctAnswerAward",
        turnNumber: turn.get("turnNumber"),
        value: points
    });
};

_areAllAnswersCorrect = function (match, playerStr) {
    var turnsCount = match.get("turnList").length;
    var events = match.get("events_" + playerStr);
    var correctAnswersCount = 0;
    for (var i = 0; i < _.size(events); i += 1) {
        if ("correctAnswerAward" === events[i].name) {
            correctAnswersCount += 1;
        }
    }
    return correctAnswersCount >= turnsCount;
};

_addMatchRandomBonus = function (match, matchRandomBonus, playerEventsKey) {
    var rand = Math.random();
    var probability = (+matchRandomBonus.get("value2"));
    console.log("Computing random bonus, probability of bonus: " + probability + ", computed: " + rand);
    if (rand <= probability) {
        var award = matchRandomBonus.get("value");
        match.add(playerEventsKey, {
            name: "matchRandomBonus",
            value: award
        });
        return (+award);
    }
    return 0;
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

_log = function (msg, player) {
    common._log(msg, player);
};