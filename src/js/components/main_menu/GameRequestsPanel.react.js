var React = require('react');
var Parse = require('parse').Parse;
var _ = require('underscore');
var cloudModel = require('../../../cloud/model.js');

var AppDataActions = require('../../actions/AppDataActions.js');
var BasicMenuPanel = require('./BasicMenuPanel.react.js');
var MenuButton = require('../MenuButton.react.js');

var GameRequestsPanel = React.createClass({
    propTypes: {
        requests: React.PropTypes.array
    },
    getDefaultProps: function () {
        return {
            requests: null
        };
    },
    render: function () {
        var requests = this.props.requests;
        var user = Parse.User.current();

        if (requests && 0 < requests.length) {
            var requestElems = _.map(requests, function (request) {
                if (user.id === request.get("opponent").id) {
                    return (
                        <div key={request.id}
                             className="request-info">
                            <div className="opponent-info">
                                <div className="info">Wyzwanie od {request.get("player").get("nick")}</div>
                            </div>
                            <MenuButton onClick={this.acceptChallengeRequest.bind(this, request)}
                                        classes="btn-xs btn-success">Przyjmij</MenuButton>
                            <MenuButton onClick={this.rejectChallengeRequest.bind(this, request)}
                                        classes="btn-xs btn-danger">Odrzuć</MenuButton>
                        </div>
                    );
                } else {
                    return (
                        <div key={request.id}
                             className="request-info">
                            <div className="opponent-info">
                                <div className="info">Rzucono wyzwanie {request.get("opponent").get("nick")}</div>
                            </div>
                        </div>
                    );
                }
            }.bind(this));
            return (
                <BasicMenuPanel id="game-requests-panel" title="Wyzwania">
                    {requestElems}
                </BasicMenuPanel>
            );
        } else {
            return null;
        }
    },
    acceptChallengeRequest: function (request) {
        request.set("status", cloudModel.challengeStatus.ACCEPTED);
        request.save().then(function () {
            console.log("challenge request vs " + request.get("player").get("nick") + " accepted");
            AppDataActions.fetchChallengeRequests();
            setTimeout(AppDataActions.fetchGamesInfo(), 0);
        })
    },
    rejectChallengeRequest: function (request) {
        request.set("status", cloudModel.challengeStatus.REJECTED);
        request.save().then(function () {
            console.log("challenge request vs " + request.get("player").get("nick") + " rejected");
            AppDataActions.fetchChallengeRequests();
        })
    }
});

module.exports = GameRequestsPanel;