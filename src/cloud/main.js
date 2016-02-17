require('cloud/app.js');
require('cloud/objects/User.js');
var GameManager = require('cloud/gameMatching.js');
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function (request, response) {
    response.success("Hello world!");
});

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