var model = require('cloud/model.js');

Parse.Cloud.beforeSave("Survey", function (request, response) {
    Parse.Cloud.useMasterKey();

    var survey = request.object;

    if (survey.dirty("status") && survey.get("status") === model.surveyStatus.FILLED) {
        var playerQuery = new Parse.Query(Parse.User);
        playerQuery.include("score");

        playerQuery.get(survey.get("player").id).then(function (player) {
            var gameScore = player.get("score");
            gameScore.increment("score", 1000);
            return gameScore.save();
        }).then(function (savedScore) {
            response.success();
        }).then(null, function (error) {
            console.error("Something wrong while saving survey response\n" + error.message);
            response.error("Problem with beforeSave in Survey");
        });
    } else {
        response.success();
    }
});