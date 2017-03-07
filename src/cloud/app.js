var model = require('./model.js');

var indexPage = '/appindex.html';
var faviconUrl = '/favicon.ico';

var mimicAddons = {
    initializeFunctions: function (app) {
// This is an example of hooking up a request handler with a specific request
// path and HTTP verb using the Express routing API.
        app.get('/hello', function (req, res) {
            res.render('hello', {message: 'Congrats, you just set up your app!'});
        });

        app.all('/', function (req, res) {
            // Translating the signed_request parameter from POST to GET. This is not required for the FB JS SDK, but it helps detecting if you are inside a FB Canvas
            if (req.body && req.body['signed_request']) {
                res.redirect(indexPage + '?signed_request=' + req.body['signed_request']);
            }
            else {
                res.redirect(indexPage);
            }
        });

        app.get('/favicon.ico', function (req, res) {
            res.send(faviconUrl);
        });

        app.post('/survey', function (req, res) {
            console.log("###req body:\n" + JSON.stringify(req.body));

            var tags = req.body['tags'];
            var userId = tags[1] ? tags[1] : null;
            var answers = req.body['answers'];
            var answersLength = answers.length ? answers.length : 0;

            var userQuery = new Parse.Query(Parse.User);
            userQuery.include("survey");
            userQuery.get(userId, {useMasterKey: true}).then(function (user) {
                var survey = user.get("survey");

                if (survey.get("status") !== model.surveyStatus.FILLED) {
                    for (var i = 0; i < answersLength; i += 1) {
                        var answer = answers[i];
                        var answerTags = answer["tags"];
                        var questionNumber = answerTags[0];
                        var questionType = answer["type"];
                        var questionValue = answer["value"];
                        var value = null;

                        switch (questionType) {
                            case "boolean":
                                value = questionValue;
                                break;
                            case "number":
                                value = questionValue["amount"];
                                break;
                            case "text":
                                value = questionValue;
                                break;
                            case "choice":
                                if (questionValue["other"]) {
                                    value = questionValue["other"];
                                } else {
                                    value = questionValue["label"];
                                }
                                break;
                        }
                        survey.set(questionNumber, value);
                    }
                    survey.set("status", model.surveyStatus.FILLED);
                    return survey.save(null, {useMasterKey: true});
                } else {
                    console.log("Duplicate survey, send ok.");
                    res.status(200).send("duplicate!"); //OK
                    return Parse.Promise.as();
                }
            }, function (error) {
                console.error("/survey Something wrong while fetching user with id " + userId + " error: " + error.message);
                res.status(500).send("not ok");
            }).then(function (savedSurvey) {
                if (savedSurvey) {
                    console.log("survey updated, send ok");
                    res.status(200).send("ok!"); //OK
                }
            }, function (error) {
                console.error("/survey Something wrong while saving survey, error: " + error.message);
                res.status(500).send("not ok");
            });
        });
    }
};

module.exports = mimicAddons;