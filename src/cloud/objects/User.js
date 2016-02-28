Parse.Cloud.beforeSave(Parse.User, function (request, response) {
    Parse.Cloud.useMasterKey();
    _validateUser(request.object, response);
    if (!request.object.get("FacebookUser")) {
        var authData = request.object.get("authData");
        var id = authData.facebook.id;
        var FacebookUser = Parse.Object.extend("FacebookUser");
        var fbUser = new FacebookUser();
        fbUser.set("facebookId", id);
        fbUser.save().then(function (resultUser) {
            request.object.set("FacebookUser", resultUser);
            return _setAdditionalData(request.object, response);
        }).then(function (data) {
                response.success();
            },
            function (error) {
                console.error("beforeSave User: " + error.message);
                response.error(error);
            });
    }
    else {
        _setAdditionalData(request.object, response).then(function (data) {
            response.success();
        }, function (error) {
            console.error("error: " + error.message);
        });
    }
})
;

Parse.Cloud.afterSave(Parse.User, function (request) {
    Parse.Cloud.useMasterKey();
    var facebookUser = request.object.get("FacebookUser");
    if (facebookUser) {
        facebookUser.fetch().then(function (fbUser) {
            if (!fbUser.get("User")) {
                fbUser.set("User", request.object);
                _setFacebookUserACL(fbUser, request.object);
                fbUser.save(null, {
                    success: function (user) {
                    },
                    error: function (obj, error) {
                        console.error("afterSave User: " + error.message);
                    }
                });
            }
        })
    } else {
        console.error("Invalid state, user should have FacebookUser object");
    }
    var settings = request.object.get("settings");
    _setUserSettingsACL(settings, request.object);
});

var _setAdditionalData = function (user, response) {
    var resultPromise = new Parse.Promise();

    (function () {
        var promise = new Parse.Promise();
        if (!user.get("settings")) {
            var UserSettings = Parse.Object.extend("UserSettings");
            var settings = new UserSettings();

            settings.save(null, {
                success: function (newSettings) {
                    user.set("settings", newSettings);
                    promise.resolve(user);
                }, error: function (newSettings, error) {
                    console.error("Error when setting user additional data, error: " + error.message);
                    response.error(error);
                    promise.reject(error);
                }
            })
        } else {
            promise.resolve(user);
        }
        return promise;
    })().then(function (data) {
        resultPromise.resolve(data);
    }, function (error) {
        response.error(error);
        resultPromise.reject(error);
    });
    return resultPromise;
};

var _validateUser = function (user, response) {
    var settings = user.get("settings");

    //validation
};

//ACLs
var _setFacebookUserACL = function (fbUser, user) {
    var newACL = new Parse.ACL();

    newACL.setPublicReadAccess(true);
    newACL.setPublicWriteAccess(false);
    newACL.setReadAccess(user.id, true);
    newACL.setWriteAccess(user.id, true);

    fbUser.setACL(newACL);
};

var _setUserSettingsACL = function (settings, user) {
    var newACL = new Parse.ACL();

    newACL.setPublicReadAccess(false);
    newACL.setPublicWriteAccess(false);
    newACL.setReadAccess(user.id, true);
    newACL.setWriteAccess(user.id, true);

    settings.setACL(newACL);
};