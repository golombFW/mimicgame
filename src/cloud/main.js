require('cloud/app.js');
require('cloud/setup.js');
require('cloud/objects/User.js');
require('cloud/objects/UserSettings.js');
require('cloud/objects/Turn.js');
require('cloud/objects/PhotoQuestion.js');
require('cloud/objects/ChallengeRequest.js');
var GameManager = require('cloud/gameMatching.js');
var GamePlayManager = require('cloud/gamePlayManager.js');

//Function originally created by Mattieu Gamache-Asselin
Parse.Cloud.define("joinNewAnonymousGame", function (request, response) {
    console.log("Incoming join request from " + request.user);

    if (request.user) {
        Parse.Cloud.useMasterKey();

        GameManager.joinAnonymousGame(request.user, {
            success: function (match, isTurn) {
                response.success(match);
            },
            error: function (error) {
                console.error(error);
                response.error("An error has occured.");
            }
        });
    } else {
        response.error("Authentication failed");
    }
});

Parse.Cloud.define("cancelAnonymousGame", function (request, response) {
    console.log("Incoming cancel game request from " + request.user);

    if (request.user) {
        Parse.Cloud.useMasterKey();

        var player = request.user;
        var matchId = request.params.matchId;

        if (!matchId) {
            response.error("No matchId param in function call");
        }

        GameManager.cancelAnonymousGame(player, matchId, {
            success: function (match) {
                response.success(match);
            },
            error: function (error) {
                console.error(error);
                response.error("An error has occured.");
            }
        });
    } else {
        response.error("Authentication failed");
    }
});

Parse.Cloud.define("joinNewSingleplayerGame", function (request, response) {
    console.log("Incoming start singleplayer game from " + request.user);
    if (request.user) {
        Parse.Cloud.useMasterKey();

        GameManager.joinSingleplayerGame(request.user, {
            success: function (match) {
                response.success(match);
            },
            error: function (error) {
                console.error(error);
                response.error("An error has occured.");
            }
        })
    } else {
        response.error("Authentication failed");
    }
});

Parse.Cloud.define("challengePlayer", function (request, response) {
    console.log("Incoming challenge player from " + request.user);
    if (request.user) {
        Parse.Cloud.useMasterKey();

        var player = request.user;
        var userId = request.params.userId;

        if (!userId) {
            response.error("No userId param in function call");
        }

        GameManager.challengePlayer(player, userId, {
            success: function (challengeRequest) {
                response.success(challengeRequest);
            },
            error: function (error) {
                console.error(error);
                response.error("An error has occured.");
            }
        })
    } else {
        response.error("Authentication failed");
    }
});

Parse.Cloud.define("getGameplayData", function (request, response) {
    Parse.Cloud.useMasterKey();

    if (request.user) {
        console.log("Getting gameplay data...");
        var player = request.user;
        var matchId = request.params.matchId;

        if (!matchId) {
            response.error("No matchId param in function call");
        }

        GamePlayManager.getGameplayData(player, matchId, {
            success: function (data) {
                console.log("Success, Sending gameplay data...");
                response.success(data);
            },
            error: function (errorMsg) {
                console.error("getGameplayData cloud func error: " + errorMsg);
                response.error("An error has occured.");
            }
        });
    } else {
        response.error("Authentication failed");
    }
});

Parse.Cloud.define("uploadPhoto", function (request, response) {
    Parse.Cloud.useMasterKey();
    if (request.user) {
        var player = request.user;
        var photo = request.params.photo;
        var topic = request.params.topic;
        var matchId = request.params.matchId;

        if (!matchId) {
            response.error("No matchId param in function call");
        }
        if (!photo) {
            response.error("No photo param in function call");
        }
        if (!topic) {
            response.error("No topic param in function call");
        }

        GamePlayManager.playerUploadPhoto(player, matchId, topic, photo, {
            success: function (data) {
                console.log("Photo upload success, Sending gameplay data...");
                response.success(data);
            },
            error: function (error) {
                console.error("playerUploadPhoto cloud func error: " + error);
                response.error("An error has occured.");
            }
        });

    } else {
        response.error("Authentication failed");
    }
});

Parse.Cloud.define("answerQuestion", function (request, response) {
    Parse.Cloud.useMasterKey();
    if (request.user) {
        var player = request.user;
        var matchId = request.params.matchId;
        var answer = request.params.answer;

        if (!matchId) {
            response.error("No matchId param in function call");
        }
        if (!answer) {
            response.error("No answer param in function call");
        }
        GamePlayManager.answerQuestion(player, matchId, answer, {
            success: function (data) {
                console.log("Sending answer success, Sending gameplay data...");
                response.success(data);
            },
            error: function (error) {
                console.error("answerQuestion cloud func error: " + error);
                response.error("An error has occured.");
            }
        });

    } else {
        response.error("Authentication failed");
    }
});

Parse.Cloud.define("reportPhoto", function (request, response) {
    Parse.Cloud.useMasterKey();
    if (request.user) {
        var player = request.user;
        var photoQuestionId = request.params.photoQuestionId;
        var reason = request.params.reason;

        if (!photoQuestionId) {
            response.error("No photoQuestionId param in function call");
        }
        if (!reason) {
            response.error("No reason param in function call");
        }

        GamePlayManager.reportPhoto(player, photoQuestionId, reason, {
            success: function (data) {
                console.log("Sending report success, Sending response data...");
                response.success(data);
            },
            error: function (error) {
                console.error("reportPhoto cloud func error: " + error);
                response.error("An error has occured.");
            }
        });
    } else {
        response.error("Authentication failed");
    }
});