var model = require('../model.js');
var GameManager = require('../gameMatching.js');

Parse.Cloud.beforeSave("ChallengeRequest", function (request, response) {
    var challengeRequest = request.object;

    if (challengeRequest.dirty("status") && model.challengeStatus.ACCEPTED === challengeRequest.get("status")) {
        var playerPromise = challengeRequest.get("player").fetch({useMasterKey: true});
        var opponentPromise = challengeRequest.get("opponent").fetch({useMasterKey: true});
        Parse.Promise.when(playerPromise, opponentPromise).then(function (player, opponent) {
            GameManager.joinDeterminedGame(player, opponent, {
                success: function (match) {
                    response.success();
                },
                error: function (error) {
                    console.error(error);
                    response.error("An error has occured.");
                }
            });
        }, function (error) {
            console.error(error.message);
            response.error("An error has occured");
        });

    } else {
        response.success();
    }
});