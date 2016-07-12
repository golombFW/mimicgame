var React = require('react');

var cloudModel = require('../../../cloud/model.js');
var DefaultGameViewContainer = require('../../components/game/DefaultGameViewContainer.react.js');
var AnswerButton = require('../../components/game/AnswerButton.react.js');
var GameManagerActions = require('../../actions/GameManagerActions.js');
var MenuButton = require('../../components/MenuButton.react.js');

var AnswerQuestion = React.createClass({
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
        var photoQuestion, photoQuestionUrl;
        photoQuestion = this.props.data.turn.question;
        if (this.props.data && photoQuestion) {
            var defaultParam = photoQuestion.get("default");
            if (photoQuestion.get("photo")) {
                photoQuestionUrl = photoQuestion.get("photo")._url;
                if (photoQuestionUrl && photoQuestionUrl.indexOf("http://") > -1) {
                    photoQuestionUrl = photoQuestionUrl.replace("http://", "https://");
                }
            } else if (defaultParam) {
                photoQuestionUrl = '/resources/' + cloudModel.defaultQuestionImages[defaultParam];
            }
        }
        var answerButtons;
        var additionalData = this.props.data.turn.additionalData ? this.props.data.turn.additionalData : {};
        var answers = additionalData.answers;
        if (this.props.data && answers) {
            answerButtons = answers.map(function (answer) {
                return (
                    <div className="col-xs-6 col-sm-12 col-md-6 answer-button-container" key={answer.id}>
                        <AnswerButton fullWidth={true}
                                      onClick={this.chooseAnswer.bind(this, answer)}>{answer.value}</AnswerButton>
                    </div>
                )
            }.bind(this));
        }

        var options;
        if (photoQuestion && photoQuestion.get("reportStatus") !== cloudModel.photoQuestionReportStatus.ALLOWED &&
            photoQuestion.get("reportStatus") !== cloudModel.photoQuestionReportStatus.BLOCKED) {
            options = (
                <div className="options">
                    <MenuButton icon="fa fa-gavel" onClick={this.reportPhoto}
                                classes="btn-danger">Zgłoś</MenuButton>
                    <span className="report-description">
                            Wybierz tę opcję jeśli uważasz, że zdjęcie przedstawia nieodpowiednie treści tj. wulgarne, niesmaczne,
                            niedozwolone itd. lub zwyczajnie nie odpowiada założeniom gry, czyli nie można na jego
                            podstawie odgadnąć jaką emocję przedstawia. <b>Po pomyślnej weryfikacji zgłoszenia otrzymasz dodatkowe punkty!</b>
                        </span>
                </div>
            );
        }

        return (
            <DefaultGameViewContainer gameInfo={this.props.gameInfo}>
                <div id="answer-question">
                    <div className="task-description">
                        Wybierz odpowiedź, która twoim zdaniem najtrafniej opisuje emocję widoczną na danym zdjęciu.
                    </div>
                    <div className="row">
                        <div id="photo-question" className="col-xs-12 col-sm-8 col-md-6 vcenter">
                            <img src={photoQuestionUrl}/>
                        </div>
                        <div className="col-xs-12 col-sm-4 col-md-6 vcenter">
                            <div id="photo-answers" className="row">
                                {answerButtons}
                            </div>
                        </div>
                    </div>
                    {options}
                </div>
            </DefaultGameViewContainer>
        );
    },
    chooseAnswer: function (answer) {
        GameManagerActions.chooseAnswer(answer);
    },
    reportPhoto: function () {
        GameManagerActions.reportPhoto(this.props.data.turn.question);
    }
});

module.exports = AnswerQuestion;