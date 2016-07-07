var _ = require('underscore');

var cloneObject = function (obj) {
    if (null === obj || 'object' !== typeof obj) {
        return obj;
    }

    var temp = obj.constructor(); // give temp the original obj's constructor
    for (var key in obj) {
        temp[key] = cloneObject(obj[key]);
    }

    return temp;
};

var randomEmotions = function (emotionList, count) {
    if (null == count) {
        count = emotionList.length;
    }
    var randomEmotions = _.first(_.shuffle(emotionList), count);
    var topics = [];

    _.each(randomEmotions, function (el, idx) {
        topics.push(flattenEmotionObj(el));
    });

    return topics;
};

var flattenEmotionObj = function (emotionObj) {
    return {id: emotionObj.id, value: emotionObj.get("name")};
};

var mapRankRules = function (rankRules) {
    var mapedRankRules = {};
    for (var key in rankRules) {
        var rankRule = rankRules[key];
        var name = rankRule.get("name");

        mapedRankRules[name] = rankRule;
    }
    return mapedRankRules;
};

var rankPointsBonus = function (playerPoints, rankRule) {
    var rules = [
        {
            type: rankRule.get("type"),
            value: rankRule.get("value")
        },
        {
            type: rankRule.get("type2"),
            value: rankRule.get("value2")
        }
    ];

    var award = 0;
    var points;
    for (var x = 0; x < rules.length; x++) {
        var type = rules[x].type;
        switch (type) {
            case "points":
                points = (+rules[x].value);
                award += points;
                break;
            case "multiplier":
                var multiplier = (+rules[x].value);
                points = playerPoints * multiplier - playerPoints;
                award += points;
                break;
        }
    }
    return award;
};

var playerPoints = function (playerEvents) {
    var points = 0;
    for (var i in playerEvents) {
        var event = playerEvents[i];
        if (event && event.value) {
            points += (+event.value);
        }
    }
    return points;
};

exports.cloneObject = cloneObject;
exports.randomEmotions = randomEmotions;
exports.flattenEmotionObj = flattenEmotionObj;
exports.mapRankRules = mapRankRules;
exports.rankPointsBonus = rankPointsBonus;
exports.playerPoints = playerPoints;