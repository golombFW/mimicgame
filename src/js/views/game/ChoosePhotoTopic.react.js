var React = require('react');
var Utils = require('../../utils/Utils.js');

var DefaultGameViewContainer = require('../../components/game/DefaultGameViewContainer.react.js');
var AnswerButton = require('../../components/game/AnswerButton.react.js');
var GameManagerActions = require('../../actions/GameManagerActions.js');

var ChoosePhotoTopic = React.createClass({
    propTypes: {
        gameInfo: React.PropTypes.object,
        data: React.PropTypes.object
    },
    getDefaultProps: function () {
        return {
            gameInfo: null,
            data: null
        }
    },
    render: function () {
        var buttons;
        if (!Utils.$.isNullOrEmpty(this.props.data)) {
            buttons = this.props.data.turn.additionalData.photoTopics.map(function (emotion) {
                return (
                    <div className="col-xs-6 col-sm-4 answer-button-container" key={emotion.id}>
                        <AnswerButton fullWidth={true}
                                      onClick={this.chooseTopic.bind(this, emotion)}>{emotion.value}</AnswerButton>
                    </div>
                );
            }.bind(this));
        }
        return (
            <DefaultGameViewContainer gameInfo={this.props.gameInfo}>
                <div id="app-game-choose-photo-topic">
                    <div className="task-description">
                        Wybierz jedną z opcji. Twoim zadaniem będzie zrobienie sobie zdjęcia, na którym udajesz wybraną
                        emocję. Twój przecwinik ma takie samo zadanie! Po zrobieniu zdjęcia nastąpi wymiana zdjęć i
                        będzie trzeba wybrać emocję jaką przedstawił oponent.
                    </div>
                    <div className="row">
                        {buttons}
                    </div>
                </div>
            </DefaultGameViewContainer>
        );
    },
    chooseTopic: function (topic) {
        GameManagerActions.choosePhotoTopic(topic);
    }
});

module.exports = ChoosePhotoTopic;