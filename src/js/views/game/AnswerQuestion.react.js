var React = require('react');

var DefaultGameViewContainer = require('../../components/game/DefaultGameViewContainer.react.js');
var AnswerButton = require('../../components/game/AnswerButton.react.js');
var GameManagerActions = require('../../actions/GameManagerActions.js');

var defaultQuestions = {
    "strach": 'fear_strach.jpg',
    "radość": 'joy_radosc.jpg',
    "wstręt": 'disgust_wstret.jpg',
    "złość": 'anger_zlosc.jpg',
    "smutek": 'sadness_smutek.jpg',
    "zdziwienie": 'surprise_zdziwienie.jpg'
};

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
        var photoQuestionUrl;
        if (this.props.data && this.props.data.turn.question) {
            var defaultParam = this.props.data.turn.question.get("default");
            if (this.props.data.turn.question.get("photo")) {
                photoQuestionUrl = this.props.data.turn.question.get("photo")._url;
                if (photoQuestionUrl && photoQuestionUrl.indexOf("http://") > -1) {
                    photoQuestionUrl = photoQuestionUrl.replace("http://", "https://");
                }
            } else if (defaultParam) {
                photoQuestionUrl = '/resources/' + defaultQuestions[defaultParam];
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
                </div>
            </DefaultGameViewContainer>
        );
    },
    chooseAnswer: function (answer) {
        GameManagerActions.chooseAnswer(answer);
    }
});

module.exports = AnswerQuestion;