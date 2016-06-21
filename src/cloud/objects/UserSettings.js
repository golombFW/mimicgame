var model = require('cloud/model.js');

var DEFAULT_SETTINGS = {
    ADDED_PHOTOS_PRIVACY: model.photoPrivacy.ALL_USERS
};

var POSSIBLE_VALUES = {
    ADDED_PHOTOS_PRIVACY: [model.photoPrivacy.ALL_USERS, model.photoPrivacy.FRIENDS, model.photoPrivacy.NONE]
};

Parse.Cloud.beforeSave("UserSettings", function (request, response) {
    var settings = request.object;

    if (!settings.get("photoPrivacy")) {
        settings.set("photoPrivacy", DEFAULT_SETTINGS.ADDED_PHOTOS_PRIVACY);
    }

    //validation
    if (POSSIBLE_VALUES.ADDED_PHOTOS_PRIVACY.indexOf(settings.get("photoPrivacy")) === -1) {
        response.error("UserSettings validation error, photoPrivacy has invalid value: " + settings.get("photoPrivacy"));
    } else {
        response.success();
    }
});