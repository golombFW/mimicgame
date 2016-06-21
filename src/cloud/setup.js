var model = require('cloud/model.js');

var _emotionClassName = "Emotion";
var _gameTypeClassName = "GameType";
var _photoQuestionClassName = "PhotoQuestion";

var _photoQuestionClass = Parse.Object.extend(_photoQuestionClassName);

Parse.Cloud.job("createEmotionList", function (request, status) {
    Parse.Cloud.useMasterKey();
    createEmotionsList().then(function () {
        status.success("Creating emotions list completed successfully.");
    }, function (error) {
        status.error("Something went wrong");
    });
});

Parse.Cloud.job("createDefaultGameTypes", function (request, status) {
    Parse.Cloud.useMasterKey();
    createDefaultGameTypes().then(function () {
        status.success("Creating default GameTypes completed successfully.");
    }, function (error) {
        status.error("Something went wrong");
    });
});

Parse.Cloud.job("createDefaultPhotoQuestions", function (request, status) {
    Parse.Cloud.useMasterKey();
    createDefaultPhotoQuestions().then(function () {
        status.success("Creating default Photo Questions completed successfully.");
    }, function (error) {
        status.error("Something went wrong");
    });
});

var createEmotionsList = function () {
    var promise = new Parse.Promise();

    var emotions = model.emotions;
    var _emotionClass = Parse.Object.extend(_emotionClassName);
    var emotionQuery = new Parse.Query(_emotionClass);
    emotionQuery.count().then(function (count) {
        if (0 >= count) {
            for (var i = 0; i < emotions.length; i += 1) {
                var emotion = new _emotionClass();
                emotion.set("name", emotions[i]);
                emotion.setACL(setupACLs());
                emotion.save();
            }
            promise.resolve("emotions saved");
        } else {
            console.error("Emotion table is not empty! Delete all records manually before running \"createEmotionList\"");
            promise.reject("Emotion table is not empty!");
        }
    }, function (error) {
        console.error(error.message);
        promise.reject(error.message);
    });
    return promise;
};

var createDefaultGameTypes = function () {
    var promise = new Parse.Promise();

    var _gameTypeClass = Parse.Object.extend(_gameTypeClassName);
    var gameTypeQuery = new Parse.Query(_gameTypeClass);
    gameTypeQuery.count().then(function (count) {
        if (0 >= count) {
            for (var key in model.GameType) {
                var gameType = new _gameTypeClass();
                if (model.GameType.hasOwnProperty(key)) {
                    gameType.set("name", model.GameType[key].name);
                    var turns = [];

                    var turnTypes = model.GameType[key].turns;
                    for (var i = 0; i < turnTypes.length; i++) {
                        turns.push(turnTypes[i].name);
                    }
                    gameType.set("turns", turns);
                    gameType.setACL(setupACLs());
                    gameType.save().then(function (obj) {
                        console.log("GameType obj " + obj.get("name") + " saved successful");
                    }, function (error) {
                        console.error(error.message);
                    });
                }
            }
            promise.resolve("Game Types saved");
        } else {
            console.error("GameType table is not empty! Delete all records manually before running \"createDefaultGameTypes\"");
            promise.reject("GameType table is not empty!");
        }
    }, function (error) {
        console.error(error.message);
        promise.reject(error.message);
    });
    return promise;
};

var createDefaultPhotoQuestions = function () {
    var promise = new Parse.Promise();

    var emotionQuery = new Parse.Query(_emotionClassName);
    emotionQuery.find().then(function (emotionsList) {
        for (var i in emotionsList) {
            var photoQuestion = new _photoQuestionClass();

            //set topic
            var topicObj = emotionsList[i];
            photoQuestion.set("player_answer", topicObj);

            //set acls
            photoQuestion.setACL(setupACLs());

            //set player
            photoQuestion.set("author", Parse.User.current());

            //set accessLevel
            photoQuestion.set("accessLevel", model.photoPrivacy.NONE);

            //set default parameter
            photoQuestion.set("default", emotionsList[i].get("name"));

            photoQuestion.save().then(function (obj) {
                console.log("PhotoQuestion obj saved successful");
            }, function (error) {
                console.error(error.message);
            });
        }
        promise.resolve("Default photo questions saved");
    }, function (error) {
        console.error("Something went wrong while getting emotions list: " + error.message);
        promise.reject(error.message);
    });
    return promise;
};

//Common functions
var setupACLs = function () {
    var newACL = new Parse.ACL();

    newACL.setPublicReadAccess(false);
    newACL.setPublicWriteAccess(false);

    return newACL;
};