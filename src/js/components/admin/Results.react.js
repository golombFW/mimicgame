var Parse = require('parse').Parse;
var React = require('react');
var _ = require('underscore');
var moment = require('moment');

let _matchClassName = "Match";
let _photoQuestionClassName = "PhotoQuestion";

var Results = React.createClass({
    getInitialState: function () {
        return {
            activeUsersNumber: 0,
            photoUsersNumber: 0,
            averagePhotosPerUser: 0,
            performance: 0,
            averageGamesPerUser: 0
        }
    },
    render: function () {

        return (
            <div>
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <h3 className="panel-title">Wyniki</h3>
                    </div>
                    <div className="panel-body">
                        Wyniki ponizej
                        <a onClick={this.computeResults}>Policz wartosci</a>
                    </div>
                    <ul className="list-group">
                        <li className="list-group-item">Liczba aktywnych użytkowników (min 1
                            rozgrywka): <b>{this.state.activeUsersNumber}</b></li>
                        <li className="list-group-item">Liczba osob, ktore dostarczyly min 1
                            zdjecie: <b>{this.state.photoUsersNumber}</b></li>
                        <li className="list-group-item"> Średnia liczba dostarczonych zdjęć przez
                            użytkownika: <b>{this.state.averagePhotosPerUser}</b></li>
                        <li className="list-group-item">Przyrost wielkości bazy danych –
                            wydajność: <b>{this.state.performance}</b></li>
                        <li className="list-group-item">średnia liczba rozgrywek na
                            uzytkownika: <b>{this.state.averageGamesPerUser}</b></li>
                    </ul>
                </div>

            </div>
        );
    },
    computeResults: function () {
        debugger;
        var self = this;
        var promises = [];
        promises.push(self.activeUsers());
        promises.push(self.photoUsers());
        promises.push(self.photoDatabasePerformance());

        Parse.Promise.when(promises).then(function (results) {
            var nextState = {};
            var activeUsers = results[0];
            let photoUsers = results[1];

            if (activeUsers && activeUsers.size) {
                nextState.activeUsersNumber = activeUsers.size;
            }
            if (photoUsers && _.size(photoUsers)) {
                nextState.photoUsersNumber = _.size(photoUsers);
            }

            self.setState(nextState);
        });

    },
    activeUsers: function () {
        var promise = new Parse.Promise();
        var matchesQuery = new Parse.Query(_matchClassName);

        matchesQuery.find().then(function (matches) {
            var uniquePlayers = new Set();

            for (let x in matches) {
                var match = matches[x];
                var player1 = match.get("player1");
                var player2 = match.get("player2");
                if (player1) {
                    uniquePlayers.add(player1.id);
                }
                if (player2) {
                    uniquePlayers.add(player2.id);
                }
            }
            promise.resolve(uniquePlayers)
        }, function (error) {
            promise.reject(error);
        });
        return promise;
    },
    photoUsers: function () {
        var promise = new Parse.Promise();

        Parse.Cloud.run('onePhotoUsersLists').then(function (photoUsers) {
            promise.resolve(photoUsers);
        }, function (error) {
            promise.reject(error);
        });

        return promise;
    },
    photoDatabasePerformance: function () {
        var promise = new Parse.Promise();
        var photoQuestionsQuery = new Parse.Query(_photoQuestionClassName);

        photoQuestionsQuery.find().then(function (photoQuestions) {

            for (let x in photoQuestions) {
                var photoQuestion = photoQuestions[x];
                //todo
            }

            promise.resolve();
        }, function (error) {
            promise.reject(error);
        });
        return promise;
    }
});

module.exports = Results;