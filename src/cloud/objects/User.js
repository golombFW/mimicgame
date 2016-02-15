Parse.Cloud.beforeSave(Parse.User, function (request, response) {
    Parse.Cloud.useMasterKey();
    if (!request.object.get("FacebookUser")) {
        var authData = request.object.get("authData");
        var id = authData.facebook.id;
        var FacebookUserClass = Parse.Object.extend("FacebookUser");
        var fbUser = new FacebookUserClass();
        fbUser.set("facebookId", id);
        fbUser.save(null, {
            success: function (resultUser) {
                request.object.set("FacebookUser", resultUser);
                response.success();
            },
            error: function (obj, error) {
                console.error("beforeSave User: " + error.message);
                response.error(error);
            }
        });
    } else {
        response.success();
    }
});

Parse.Cloud.afterSave(Parse.User, function (request) {
    Parse.Cloud.useMasterKey();
    var facebookUser = request.object.get("FacebookUser");
    if (facebookUser) {
        facebookUser.fetch().then(function (fbUser) {
            if (null == fbUser.get("User")) {
                fbUser.set("User", request.object);
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
});