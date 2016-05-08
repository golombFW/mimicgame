require('cloud/app.js');
require('cloud/setup.js');
require('cloud/objects/User.js');
require('cloud/objects/UserSettings.js');
require('cloud/objects/Turn.js');
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
            error: function (error) {
                console.error("getGameplayData cloud func error: " + error);
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

Parse.Cloud.define("answerQuestion", function(request, response) {
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