/* Originally created by Mattieu Gamache-Asselin
 * https://github.com/Mattieuga/ParseGameManager
 * */

// === Model classes and keys ===
var model = require('cloud/model.js');

var _matchClassName = "Match";
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

var Match = Parse.Object.extend(_matchClassName);

var _ = require('underscore');

// === Overridable methods ===
// TODO all these
exports.initialize = function () {
};
exports.beforeMatchCreated = function () {
};
exports.afterMatchCreated = function () {
};
exports.beforeMatchJoined = function () {
};
exports.afterMatchJoined = function () {
};
exports.beforeTurnChange = function () {
};
exports.afterTurnChange = function () {
};

// === API methods ===

exports.joinAnonymousGame = function (player, options) {
    _log("Joining anonymous game", player);
    // Find number of available games
    var matchQuery = new Parse.Query(Match);
    matchQuery.equalTo(_matchStatusKey, _matchStatusKeyWaiting);
    matchQuery.notEqualTo(_matchPlayer1Key, player); // Can't play with yourself

    matchQuery.count({
        success: function (count) {
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

                matchQuery.find({
                    success: function (results) {
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
                    error: options.error
                });
            } else {
                // If no matches were found, create new one
                _log("Creating new game since no available games were found", player);
                _getOrCreateMatch(player, options);
            }
        },
        error: options.error
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
                    match.set("turnList", turns);
                    match.save(null, {
                        success: function (newMatch) {
                            // Return the game
                            var isTurn = newMatch.get(_matchTurnKey) === _matchTurnKeyPlayer2;
                            _log("Game joined, and it isTurn is : " + isTurn, player);
                            _log(JSON.stringify(newMatch), player);

                            options.success(newMatch, isTurn);
                        },
                        error: options.error
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
        error: options.error
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
                            _createNewMatch(player, options);
                        }
                    },
                    error: options.error
                });
            } else {
                //create new match
                _createNewMatch(player, options);
            }
        }
    });
};

_createNewMatch = function (player, options) {
    // Set new match attributes
    var match = new (Parse.Object.extend(_matchClassName))();
    match.set(_matchLockKey, _matchLockKeyInitial);
    match.set(_matchPlayer1Key, player); // challenger is player 1
    match.set(_matchStatusKey, _matchStatusKeyWaiting); // wait for second player
    match.set(_matchTurnKey, _matchTurnKeyPlayer1); // default challenger starts
    match.set("round", 1);
    //todo set acl

    _log("Creating new game with properties:", player);
    _log(JSON.stringify(match), player);
    // Create match
    match.save(null, {
        success: function (newMatch) {
            // Return the game
            _log("Game created successfully, now waiting for players", player);
            _log(JSON.stringify(newMatch), player);
            options.success(newMatch, true);
        },
        error: options.error
    });
};

_log = function (message, player) {
    console.log(player.get("username") + "$ " + message);
};

//

_createTurns = function (player, match, gameType) {
    _log("Creating turns for match", player);
    var _turnClass = Parse.Object.extend("Turn");
    var turns = gameType.turns;
    var resultTurns = [];

    var promise = new Parse.Promise();
    var emotionQuery = new Parse.Query("Emotion");

    emotionQuery.find().then(
        function (emotionList) {
            if (1 > emotionList.length) {
                promise.reject("Emotions list is empty!");
                return;
            }

            for (var i = 0; i < turns.length; i += 1) {
                var turn = new _turnClass();
                turn.set("type", turns[i].name);
                turn.set("status", "initial");

                var question1, question2;
                var additional1 = null, additional2 = null;

                if ("random_const" === turns[i].photo_p1) {
                    question1 = _randomQuestion();
                } else if ("opponent" === turns[i].photo_p1) {
                    question1 = _opponentQuestion();
                    additional1 = _photoTopic(emotionList);
                }

                if ("random_const" === turns[i].photo_p2) {
                    question2 = question1;
                } else if ("opponent" === turns[i].photo_p2) {
                    question2 = _opponentQuestion();
                    additional2 = _photoTopic(emotionList);
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
            //return resultTurns;
        }, function (error) {
            promise.reject(error);
        });

    return promise;
};

_randomQuestion = function () {
    return null;
    //todo
};

_opponentQuestion = function () {
    return null;
};

_photoTopic = function (emotionList) {
    console.log("Shuffling photoTopics");
    var randomEmotions = _.first(_.shuffle(emotionList), 3);
    var topics = [];

    _.each(randomEmotions, function (el, idx) {
        topics.push({id: el.id, value: el.get("name")});
    });

    return topics;
};