require('cloud/app.js');
require('cloud/objects/User.js');
require('cloud/objects/UserSettings.js');
var GameManager = require('cloud/gameMatching.js');

//Function originally created by Mattieu Gamache-Asselin
Parse.Cloud.define("joinNewAnonymousGame", function (request, response) {
    console.log("Incoming join request from " + request.user);

    if (request.user) {
        GameManager.joinAnonymousGame(request.user, {
            success: function (match, isTurn) {
                response.success(match);
            },
            error: function (error) {
                console.log(error);
                response.error("An error has occured.");
            }
        });
    } else {
        response.error("Authentication failed");
    }
});