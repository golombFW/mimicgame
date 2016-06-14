var model = require('cloud/model.js');

var _emotionClassName = "Emotion";
var _gameTypeClassName = "GameType";

Parse.Cloud.job("createEmotionList", function (request, status) {
    Parse.Cloud.useMasterKey();
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
        } else {
            console.error("Emotion table is not empty! Delete all records manually before running \"createEmotionList\"");
        }
    }, function (error) {
        console.error(error.message);
    })
});

Parse.Cloud.job("createDefaultGameTypes", function (request, status) {
    Parse.Cloud.useMasterKey();
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
        } else {
            console.error("GameType table is not empty! Delete all records manually before running \"createDefaultGameTypes\"");
        }
    }, function (error) {
        console.error(error.message);
    });
});

//Common functions
var setupACLs = function () {
    var newACL = new Parse.ACL();

    newACL.setPublicReadAccess(false);
    newACL.setPublicWriteAccess(false);

    return newACL;
};