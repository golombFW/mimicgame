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
        topics.push({id: el.id, value: el.get("name")});
    });

    return topics;
};

exports.cloneObject = cloneObject;
exports.randomEmotions = randomEmotions;