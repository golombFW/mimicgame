/* Originally created by Mattieu Gamache-Asselin
 * https://github.com/Mattieuga/ParseGameManager
 * */

var _ = require('underscore');

// === Model classes and keys ===
var model = require('./model.js');
var common = require('./common.js');
var utils = require('./utils.js');

var _matchClassName = "Match";
var _emotionClassName = "Emotion";
var _gameTypeClassName = "GameType";
var _photoQuestionClassName = "PhotoQuestion";
var _challengeRequestClassName = "ChallengeRequest";

var _facebookUserAttrName = "FacebookUser";
var _matchLockKey = "gameLock";
var _matchLockKeyInitial = 1;
var _matchLockKeyMax = 2;
var _matchPlayer1Key = "player1";
var _matchPlayer2Key = "player2";
var _matchStatusKey = "gameStatus";
var _matchStatusKeyWaiting = "waiting";
var _matchStatusKeyInProgress = "in_progress";
var _matchStatusKeyFinished = "finished";
var _matchStatusKeyCancelled = "cancelled";
var _matchTurnKey = "turn";
var _matchTurnKeyPlayer1 = "player_1";
var _matchTurnKeyPlayer2 = "player_2";
var _matchTypeKey = "type";
var _matchType = {SINGLE: "SINGLE", RANDOM: "RANDOM", DETERMINED: "DETERMINED"};

var Match = Parse.Object.extend(_matchClassName);

// === API methods ===

exports.joinAnonymousGame = function (player, options) {
    _log("Joining anonymous game", player);
    // Find number of available games
    var matchQuery = new Parse.Query(Match);
    matchQuery.equalTo(_matchStatusKey, _matchStatusKeyWaiting);
    matchQuery.notEqualTo(_matchPlayer1Key, player); // Can't play with yourself

    matchQuery.count({useMasterKey: true}).then(function (count) {
            _log("Found " + count + " available games: ", player);
            if (0 < count) {
                // If matches were found, fetch random one
                var row = Math.floor(Math.random() * count);
                matchQuery.limit(1);
                matchQuery.skip(row); // random num is 0 to count-1 so we can use it as skip directly
                matchQuery.include(_matchPlayer1Key);
                matchQuery.include(_matchPlayer1Key + "." + _facebookUserAttrName);
                matchQuery.include(_matchPlayer2Key);
                matchQuery.include(_matchPlayer2Key + "." + _facebookUserAttrName);

                matchQuery.find({useMasterKey: true}).then(function (results) {
                        _log("Fetched random game: " + JSON.stringify(results[0]), player);
                        if (0 < results.length) {
                            // Attempt to join fetched game
                            _log("Attempting to join game: " + JSON.stringify(results[0]), player);
                            _joinMatchAttempt(results[0], player, options);
                        } else {
                            // If something happened to the match give up and create a new one
                            _log("Creating new game since random selection not found", player);
                            _getOrCreateMatch(player, options);
                        }
                    },
                    function (error) {
                        options.error(error)
                    }
                );
            } else {
                // If no matches were found, create new one
                _log("Creating new game since no available games were found", player);
                _getOrCreateMatch(player, options);
            }
        },
        function (error) {
            options.error(error)
        });
};

exports.cancelAnonymousGame = function (player, matchId, options) {
    _log("Canceling anonymous game", player);
    var matchQuery = new Parse.Query(Match);
    matchQuery.equalTo(_matchStatusKey, _matchStatusKeyWaiting);
    matchQuery.equalTo(_matchPlayer1Key, player);

    matchQuery.find({useMasterKey: true}).then(function (matches) {
        if (1 > matches.length) {
            return Parse.Promise.error("No waiting matches for player");
        } else {
            var match = matches[0];
            match.increment(_matchLockKey);
            return match.save(null, {useMasterKey: true});
        }
    }).then(function (updatedMatch) {
        if (updatedMatch.get(_matchLockKey) <= _matchLockKeyMax) {
            updatedMatch.set(_matchStatusKey, _matchStatusKeyCancelled);
            return updatedMatch.save(null, {useMasterKey: true});
        } else {
            _log("Game lock failed, can't cancel match: " + updatedMatch.id, player);
            return Parse.Promise.error("Game lock failed, match has started");
        }
    }).then(function (canceledMatch) {
        options.success(canceledMatch);
    }).then(null, function (error) {
        options.error(error.message);
    });
};

exports.joinSingleplayerGame = function (player, options) {
    _log("Joining singleplayer game", player);
    _log("Create new singleplayer game", player);
    _createNewMatch(player, _matchType.SINGLE).then(function (match) {
        _log("Singleplayer game created successfully", player);
        _createTurns(player, match, model.GameType.SINGLE).then(function (turns) {
            _log("Setting turns to match: " + JSON.stringify(turns), player);
            match.set("turnList", turns);
            match.save(null, {
                success: function (newMatch) {
                    // Return the game
                    var isTurn = newMatch.get(_matchTurnKey) === _matchTurnKeyPlayer2;
                    _log("Game joined, and it isTurn is : " + isTurn, player);
                    _log(JSON.stringify(newMatch), player);
                    options.success(newMatch, isTurn);
                },
                error: function (error) {
                    options.error(error.message);
                },
                useMasterKey: true
            });
        }, function (error) {
            _log("Create turns failed " + error.message, player);
        });
    }, function (error) {
        options.error(error.message);
    });
};

exports.challengePlayer = function (player, userId, options) {
    if (player.id === userId) {
        options.error("You can't challenge yourself!");
    } else {
        var playerQuery = new Parse.Query(Parse.User);
        var opponent;
        playerQuery.get(userId, {useMasterKey: true}).then(function (fetchedOpponent) {
            opponent = fetchedOpponent;
            var challengeRequestQuery = new Parse.Query(_challengeRequestClassName);
            challengeRequestQuery.equalTo("player", player);
            challengeRequestQuery.equalTo("opponent", opponent);
            challengeRequestQuery.equalTo('status', model.challengeStatus.INITIAL);

            return challengeRequestQuery.find({useMasterKey: true});
        }, function (error) {
            options.error("Something goes wrong while getting user to challenge " + error.message);
        }).then(function (challengeRequests) {
            if (challengeRequests && 0 < challengeRequests.length) {
                console.log("New challenge request not created, returning previous challenge request");
                options.success(challengeRequests[0]);

                return Parse.Promise.as();
            } else {
                var challengeRequest = new (Parse.Object.extend(_challengeRequestClassName))();
                challengeRequest.set("player", player);
                challengeRequest.set("opponent", opponent);
                challengeRequest.set("status", model.challengeStatus.INITIAL);
                _setChallengeRequestACL(challengeRequest, userId);

                return challengeRequest.save(null, {useMasterKey: true});
            }
        }, function (error) {
            options.error("Something wrong while searching challenge requests " + error.message);
        }).then(function (savedChallenge) {
            if (savedChallenge) {
                console.log("Challenge request " + player.id + " vs " + userId + " created");
                options.success(savedChallenge);
            }
        }, function (error) {
            options.error("Can't save challenge request " + error.message);
        });
    }
};

exports.joinDeterminedGame = function (player1, player2, options) {
    _log("Joining determined game", player1);
    _log("Create new determined game", player1);
    _createNewMatch(player1, _matchType.DETERMINED, player2).then(function (createdMatch) {
        _log("Determined game created successfully", player1);
        var match;
        var matchQuery = new Parse.Query(_matchClassName);
        matchQuery.include(_matchPlayer1Key);
        matchQuery.include(_matchPlayer1Key + "." + _facebookUserAttrName);
        matchQuery.include(_matchPlayer2Key);
        matchQuery.include(_matchPlayer2Key + "." + _facebookUserAttrName);
        matchQuery.get(createdMatch.id, {useMasterKey: true}).then(function (fetchedMatch) {
            match = fetchedMatch;
            return _createTurns(player1, match, model.GameType.DEFAULT);
        }).then(function (turns) {
            _log("Setting turns to match: " + JSON.stringify(turns), player1);
            match.set("turnList", turns);
            match.save(null, {
                success: function (newMatch) {
                    _log(JSON.stringify(newMatch), player1);
                    options.success(newMatch);
                },
                error: function (error) {
                    options.error(error.message);
                },
                useMasterKey: true
            });
        }, function (error) {
            _log("Create turns failed " + error.message, player1);
        });
    }, function (error) {
        options.error(error.message);
    });
};

// === Core methods ===

_joinMatchAttempt = function (match, player, options) {
    // get random match returned
    match.increment(_matchLockKey);
    match.save(null, {
        success: function (updatedMatch) {
            _log("Incremented lock, game data is now: " + JSON.stringify(updatedMatch), player);
            // Check if the join succeeded
            if (updatedMatch.get(_matchLockKey) <= _matchLockKeyMax) {
                _log("Game lock successful, joining game.", player);
                match.set(_matchPlayer2Key, player);
                match.set(_matchStatusKey, _matchStatusKeyInProgress);

                //create turns
                _createTurns(player, match, model.GameType.DEFAULT).then(function (turns) {
                    _log("Setting turns to match: " + JSON.stringify(turns), player);
                    match.set("turnList", turns);
                    match.save(null, {
                        success: function (newMatch) {
                            // Return the game
                            var isTurn = newMatch.get(_matchTurnKey) === _matchTurnKeyPlayer2;
                            _log("Game joined, and it isTurn is : " + isTurn, player);
                            _log(JSON.stringify(newMatch), player);

                            options.success(newMatch, isTurn);
                        },
                        error: function (error) {
                            options.error(error.message);
                        },
                        useMasterKey: true
                    });
                }, function (error) {
                    _log("Create turns failed " + error.message, player);
                });
            } else {
                // If someone else joined game first, give up and create new one
                console.error("COLLISION");
                _log("Game lock failed, giving up and creating new game.", player);
                _getOrCreateMatch(player, options);
            }
        },
        error: options.error,
        useMasterKey: true
    });
};

_getOrCreateMatch = function (player, options) {
    //try to find existing waiting match
    var playerPrevMatchQuery = new Parse.Query(Match);
    playerPrevMatchQuery.equalTo(_matchStatusKey, _matchStatusKeyWaiting);
    playerPrevMatchQuery.equalTo(_matchPlayer1Key, player);
    playerPrevMatchQuery.include(_matchPlayer1Key);
    playerPrevMatchQuery.include(_matchPlayer1Key + "." + _facebookUserAttrName);
    playerPrevMatchQuery.include(_matchPlayer2Key);
    playerPrevMatchQuery.include(_matchPlayer2Key + "." + _facebookUserAttrName);

    playerPrevMatchQuery.count({
        success: function (count) {
            _log("Found " + count + " player games: ", player);
            if (0 < count) {
                playerPrevMatchQuery.limit(1);
                playerPrevMatchQuery.find({
                    success: function (results) {
                        _log("Fetched player previous game: " + JSON.stringify(results[0]), player);
                        if (0 < results.length) {
                            // Attempt to join fetched game
                            _log("Returning previous player game: " + JSON.stringify(results[0]), player);
                            options.success(results[0], true);
                        } else {
                            // If something happened to the match give up and create a new one
                            _log("Creating new game since previous player game selection not found", player);
                            _createNew2PlayerMatch(player, options);
                        }
                    },
                    error: options.error,
                    useMasterKey: true
                });
            } else {
                //create new match
                _createNew2PlayerMatch(player, options);
            }
        },
        useMasterKey: true
    });
};

_createNewMatch = function (player, matchType, player2) {
    // Set new match attributes
    var match = new (Parse.Object.extend(_matchClassName))();
    match.set(_matchLockKey, _matchLockKeyInitial);
    match.set(_matchPlayer1Key, player); // challenger is player 1
    if (matchType === _matchType.RANDOM) {
        match.set(_matchStatusKey, _matchStatusKeyWaiting); // wait for second player
        match.set(_matchTypeKey, _matchType.RANDOM);
    } else if (matchType === _matchType.SINGLE) {
        match.set(_matchStatusKey, _matchStatusKeyInProgress);
        match.set(_matchTypeKey, _matchType.SINGLE);
    } else if (matchType === _matchType.DETERMINED) {
        match.set(_matchStatusKey, _matchStatusKeyInProgress);
        match.set(_matchPlayer2Key, player2);
        match.set(_matchTypeKey, _matchType.RANDOM);
    }

    match.set(_matchTurnKey, _matchTurnKeyPlayer1); // default challenger starts
    match.set("round", 1);
    _setMatchACL(match);

    _log("Creating new game with properties:", player);
    _log(JSON.stringify(match), player);
    // Create match
    return match.save(null, {useMasterKey: true});
};

_createNew2PlayerMatch = function (player, options) {
    _createNewMatch(player, _matchType.RANDOM).then(
        function (newMatch) {
            // Return the game
            _log("Game created successfully, now waiting for players", player);
            _log(JSON.stringify(newMatch), player);
            options.success(newMatch, true);
        }, function (error) {
            error: options.error
        });
};

_log = function (msg, player) {
    common._log(msg, player);
};

//

_createTurns = function (player, match, gameTypeObj) {
    _log("Creating turns for match", player);
    var _turnClass = Parse.Object.extend("Turn");
    var resultTurns = [];

    var promise = new Parse.Promise();
    var emotionQuery = new Parse.Query(_emotionClassName);

    var emotionsPromise = emotionQuery.find({useMasterKey: true});
    var gameTypesPromise = _loadGameTypes();

    var playerQuestionPromise = _playerRandomQuestionsList(player, match.get(_matchPlayer1Key), match.get(_matchPlayer2Key));
    var defaultQuestionPromise = _defaultQuestionsList(player);

    Parse.Promise.when(emotionsPromise, gameTypesPromise, playerQuestionPromise, defaultQuestionPromise).then(
        function (emotionsList, turnTypesList, playerRandomQuestionsList, defaultQuestionsList) {
            if (1 > emotionsList.length) {
                promise.reject("Emotions list is empty!");
                return;
            }
            if (1 > _.size(turnTypesList)) {
                promise.reject("Game Types list is empty!");
            }
            if (1 > _.size(defaultQuestionsList) && 1 > _.size(playerRandomQuestionsList)) {
                promise.reject("Questions lists are empty!");
            }

            var turns = turnTypesList[gameTypeObj.name].turns;
            playerRandomQuestionsList = _.shuffle(playerRandomQuestionsList);
            defaultQuestionsList = _.shuffle(defaultQuestionsList);
            var questions = playerRandomQuestionsList.concat(defaultQuestionsList);

            for (var i = 0; i < turns.length; i += 1) {
                var turn = new _turnClass();
                turn.set("type", turns[i].name);
                turn.set("status", "initial");

                var question1, question2;
                var additional1 = null, additional2 = null;

                if ("random_const" === turns[i].photo_p1) {
                    question1 = _getNextQuestionFromList(questions);
                    additional1 = {answers: common.randomAnswers(emotionsList, question1.get("player_answer"))};
                } else if ("opponent" === turns[i].photo_p1) {
                    question1 = _opponentQuestion();
                    additional1 = {photoTopics: _randomizePhotoTopicList(emotionsList)};
                }

                if ("random_const" === turns[i].photo_p2) {
                    question2 = question1;
                    additional2 = additional1;
                } else if ("opponent" === turns[i].photo_p2) {
                    question2 = _opponentQuestion();
                    additional2 = {photoTopics: _randomizePhotoTopicList(emotionsList)};
                }

                turn.set("turnNumber", (i + 1));
                turn.set("question_player1", question1);
                turn.set("question_player2", question2);
                turn.set("answer_player1", null);
                turn.set("answer_player2", null);
                turn.set("additionalData_player1", additional1);
                turn.set("additionalData_player2", additional2);
                turn.set("starting_player", "both");
                var isWaitingForPrevious = !!('undefined' !== typeof turns[i - 1] && turns[i - 1].name !== turns[i].name);
                turn.set("isWaitingForPrevious", isWaitingForPrevious);
                turn.set("result", null);
                resultTurns.push(turn);
            }
            promise.resolve(resultTurns);
        }, function (error) {
            _log(error.message, player);
            promise.reject(error);
        });

    return promise;
};

_loadGameTypes = function () {
    console.log("Loading game types form database...");
    var promise = new Parse.Promise();
    var gameTypeQuery = new Parse.Query(_gameTypeClassName);

    var turnTypes = [];
    for (var turnTypeIdx in model.TurnType) {
        var turnType = model.TurnType[turnTypeIdx];
        turnTypes[turnType.name] = turnType;
    }

    gameTypeQuery.find({useMasterKey: true}).then(function (gameTypes) {
        var resultGameTypes = {};
        for (var gameTypeIdx in gameTypes) {
            var gameType = gameTypes[gameTypeIdx];
            var resultGameType = {};
            resultGameType.name = gameType.get("name");

            var turnTypeTexts = gameType.get("turns");
            var turns = [];
            for (var turnTypeIdx in turnTypeTexts) {
                var turnType = turnTypeTexts[turnTypeIdx];
                turns.push(turnTypes[turnType])
            }
            resultGameType.turns = turns;
            resultGameTypes[resultGameType.name] = resultGameType;
        }
        promise.resolve(resultGameTypes);
    }, function (error) {
        console.error(error.message);
        promise.reject(error);
    });
    return promise;
};

_playerRandomQuestionsList = function (user, player1, player2) {
    _log("Getting random question list", user);
    var promise = new Parse.Promise();
    var allUsersQuestionsQuery = new Parse.Query(_photoQuestionClassName);
    allUsersQuestionsQuery.equalTo("accessLevel", model.photoPrivacy.ALL_USERS);

    var facebookUser1 = player1.get(_facebookUserAttrName);
    var fbUser1Promise = facebookUser1.fetch({useMasterKey: true});

    var facebookUser2, fbUser2Promise;
    if (player2) {
        facebookUser2 = player2.get(_facebookUserAttrName);
        fbUser2Promise = facebookUser2.fetch({useMasterKey: true});
    } else {
        fbUser2Promise = Parse.Promise.as(null);
    }

    Parse.Promise.when(fbUser1Promise, fbUser2Promise).then(function (fetchedFbUser1, fetchedFbUser2) {
        var friendsQuestionsQuery = new Parse.Query(_photoQuestionClassName);
        friendsQuestionsQuery.equalTo("accessLevel", model.photoPrivacy.FRIENDS);

        var friendsListP1 = fetchedFbUser1.get("friendsList");
        var friendsListP2, commonFriendsList = friendsListP1;
        if (fetchedFbUser2) {
            friendsListP2 = fetchedFbUser2.get("friendsList");
            commonFriendsList = _.intersection(friendsListP1, friendsListP2);
        }
        var pointers = _.map(commonFriendsList, function (userId) {
            return {
                "__type": "Pointer",
                "className": "_User",
                "objectId": userId
            }
        });
        friendsQuestionsQuery.containedIn("author", pointers);

        var questionQuery = Parse.Query.or(friendsQuestionsQuery, allUsersQuestionsQuery);
        questionQuery.notEqualTo("reportStatus", model.photoQuestionReportStatus.BLOCKED);
        return questionQuery.find({useMasterKey: true});
    }, function (error) {
        console.error("Can't fetch facebook user from user: " + JSON.stringify(player1));
        promise.reject(error);
    }).then(function (matchingQuestions) {
        _log("Found " + matchingQuestions.length + " matching questions", user);
        promise.resolve(matchingQuestions);
    }, function (error) {
        console.error("Problem with getting matching questions in \"_playerRandomQuestionsList\" " + error.message);
        promise.reject(error);
    });
    return promise;
};

_defaultQuestionsList = function (player) {
    _log("Getting default photo questions list", player);
    var promise = new Parse.Promise();

    var questionsQuery = new Parse.Query(_photoQuestionClassName);
    questionsQuery.exists("default");
    questionsQuery.find({useMasterKey: true}).then(function (questionsList) {
        promise.resolve(questionsList);
    }, function (error) {
        console.error("Problem with getting default photo questions: " + error.message);
        promise.reject(error.message);
    });
    return promise;
};

var nextQuestionIdx = 0;
_getNextQuestionFromList = function (questions) {
    var question = questions[nextQuestionIdx];
    nextQuestionIdx = (nextQuestionIdx + 1) % questions.length;
    return question;
};

_opponentQuestion = function () {
    return null;
};

_randomizePhotoTopicList = function (emotionList) {
    console.log("Shuffling photoTopics");
    return utils.randomEmotions(emotionList, 3);
};

//Miscellaneous
var _setMatchACL = function (match) {
    var newACL = new Parse.ACL();

    newACL.setPublicReadAccess(true);
    newACL.setPublicWriteAccess(false);

    match.setACL(newACL);
};

_setChallengeRequestACL = function (challengeRequest, opponentId) {
    var newACL = new Parse.ACL();

    newACL.setPublicReadAccess(true);
    newACL.setPublicWriteAccess(false);
    newACL.setWriteAccess(opponentId, true);

    challengeRequest.setACL(newACL);
};