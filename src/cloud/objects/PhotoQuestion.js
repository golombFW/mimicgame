var model = require('../model.js');
var _ = require('underscore');

var _reportClassName = "Report";
var _gameScoreClassName = "GameScore";

var VALID_REPORT_BONUS = 500;

Parse.Cloud.beforeSave("PhotoQuestion", function (request, response) {
    var photoQuestion = request.object;
    var photoQuestionReportStatus = photoQuestion.get("reportStatus");
    var isReportInspected = photoQuestionReportStatus === model.photoQuestionReportStatus.ALLOWED ||
        photoQuestionReportStatus === model.photoQuestionReportStatus.BLOCKED;

    if (photoQuestion.dirty("reportStatus") && isReportInspected) {
        var reportQuery = new Parse.Query(_reportClassName);
        reportQuery.include("player");
        reportQuery.include("player.score");
        reportQuery.equalTo("photoQuestion", photoQuestion);

        var reportStatus = photoQuestionReportStatus === model.photoQuestionReportStatus.ALLOWED ?
            model.reportStatus.NOT_VALID : model.reportStatus.VALID;

        reportQuery.find({useMasterKey: true}).then(function (reports) {
            var promise = Parse.Promise.as();
            //change reports statuses and add bonus points to players
            _.each(reports, function (report) {
                promise = promise.then(function () {
                    report.set("status", reportStatus);
                    var reportPromise = report.save(null, {useMasterKey: true});

                    var player = report.get("player");
                    var playerScore = player.get("score");
                    var playerScorePromise;

                    if (reportStatus === model.reportStatus.VALID) {
                        playerScore.increment("score", VALID_REPORT_BONUS);
                        playerScorePromise = playerScore.save(null, {useMasterKey: true});
                    } else {
                        playerScorePromise = Parse.Promise.as();
                    }

                    return Parse.Promise.when(reportPromise, playerScorePromise)
                });
            });
            return promise;
        }).then(function () {
            if (reportStatus === model.reportStatus.VALID) {
                //update score of author of photoQuestion
                var gameScoreQuery = new Parse.Query(_gameScoreClassName);
                gameScoreQuery.equalTo("player", photoQuestion.get("author"));

                gameScoreQuery.first({useMasterKey: true}).then(function (authorScore) {
                    authorScore.increment("score", (-1) * VALID_REPORT_BONUS);
                    return authorScore.save(null, {useMasterKey: true});
                }).then(function () {
                    console.log("player: " + photoQuestion.get("author").id + " score is decreased because of vandal question " + photoQuestion.id);
                    response.success();
                }, function (error) {
                    console.error("Problem with updating score of photoQuestion author!\n" + error.message);
                    response.error("Problem with updating score of photoQuestion author");
                })
            } else {
                response.success();
            }
        }, function (error) {
            console.error("Not all reports were updated!\n" + error.message);
            response.error("Problem with updating reports and player scores");
        })
    } else {
        response.success();
    }
});