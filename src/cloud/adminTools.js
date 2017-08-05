var _photoQuestionClassName = "PhotoQuestion";
var _photoQuestionClass = Parse.Object.extend(_photoQuestionClassName);
var _ = require('underscore');

Parse.Cloud.define("migrationGetPhotos", function (request, response) {
    console.log("###Migration# Get Photos - from " + request.user);

    var user = request.user;
    if (user) {
        isUserAdmin(user.id).then(function (result) {
            return getPhotoQuestions();
        }).then(function (photoQuestions) {
            response.success(photoQuestions);
        }, function (error) {
            console.error(error);
        });
    } else {
        response.error("Authentication failed");
    }
});

Parse.Cloud.define("migrationUpdatePhoto", function (request, response) {
    console.log("###Migration# Update Photo - from " + request.user);

    var photoId = request.params.photoId;
    if (!photoId) {
        response.error("No photoId param in function call");
    }

    var newPhoto = request.params.newPhoto;
    if (!newPhoto) {
        response.error("No newPhoto param in function call");
    }

    var fileName = request.params.fileName;
    if (!fileName) {
        response.error("No fileName param in function call");
    }

    var user = request.user;
    if (user) {
        isUserAdmin(user.id).then(function (result) {
            return updatePhoto(photoId, newPhoto, fileName);
        }).then(function (photoQuestion) {
            response.success(photoQuestion);
        }, function (error) {
            console.error(error);
        });
    } else {
        response.error("Authentication failed");
    }
});

Parse.Cloud.define("onePhotoUsersLists", function (request, response) {
    console.log("Getting Users Set with minimum 1 photo" + request.user);

    var user = request.user;
    if (user) {
        isUserAdmin(user.id).then(function (result) {
            return getPhotoUsers();
        }).then(function (photoUsers) {
            response.success(photoUsers);
        }, function (error) {
            console.error(error);
        });
    } else {
        response.error("Authentication failed");
    }
});

var getPhotoQuestions = function () {
    var promise = new Parse.Promise();

    var photoQuestionQuery = new Parse.Query(_photoQuestionClass);

    photoQuestionQuery.include("photo");
    photoQuestionQuery.exists("photo");
    photoQuestionQuery.find({useMasterKey: true}).then(function (serverPhotoQuestions) {
        var questions = _.map(serverPhotoQuestions, function (serverQuestion) {
            return {
                "id": serverQuestion.id,
                "photo": serverQuestion.get("photo")
            }
        });
        promise.resolve(questions);
    }, function (error) {
        console.error(error.message);
        promise.reject(error.message);
    });
    return promise;
};

var updatePhoto = function (photoQuestionId, photo, fileName) {
    var promise = new Parse.Promise();
    var parseFile = new Parse.File(fileName, {base64: photo});

    var photoQuestionQuery = new Parse.Query(_photoQuestionClass);
    photoQuestionQuery.get(photoQuestionId, {useMasterKey: true}).then(function (photoQuestion) {
        photoQuestion.set("photo", parseFile);

        return photoQuestion.save(null, {useMasterKey: true});
    }, function (error) {
        console.error(error.message);
        promise.reject(error.message);
    }).then(function (updatedPhotoQuestion) {
        console.log("PhotoQuestion (" + photoQuestionId + ") updated successfully");
        promise.resolve(updatedPhotoQuestion);
    }, function (error) {
        console.error(error.message);
        promise.reject(error.message);
    });

    return promise;
};

var getPhotoUsers = function () {
    var promise = new Parse.Promise();
    var photoQuestionsQuery = new Parse.Query(_photoQuestionClassName);

    photoQuestionsQuery.find({useMasterKey: true}).then(function (photoQuestions) {
        // var uniquePlayers = new Set();
        var playersPhotosNumber = {};

        for (var x in photoQuestions) {
            var photoQuestion = photoQuestions[x];
            var author = photoQuestion.get("author");
            if (author) {
                // uniquePlayers.add(author.id);
                var photosNumber = playersPhotosNumber[author.id];
                if (null == photosNumber) {
                    photosNumber = 0;
                }
                playersPhotosNumber[author.id] = photosNumber + 1;
            }
        }
        promise.resolve(playersPhotosNumber)
    }, function (error) {
        promise.reject(error);
    });
    return promise;
};

var isUserAdmin = function (userId) {
    var promise = new Parse.Promise();

    var roleQuery = new Parse.Query(Parse.Role);
    roleQuery.equalTo('name', 'Administrator');
    roleQuery.first({
        success: function (result) {
            var adminRelation = new Parse.Relation(result, 'users');
            var adminsQuery = adminRelation.query();

            adminsQuery.equalTo('objectId', userId);
            adminsQuery.first({
                success: function (result) {
                    if (result) {
                        promise.resolve(true);
                        console.log("Admin privileges granted for user id " + userId);
                    } else {
                        promise.reject("User is not admin! (" + userId + ")");
                    }
                }
            });
        },
        error: function (error) {
            console.log("Can't find Administrator role");
        },
        useMasterKey: true
    });

    return promise;
};