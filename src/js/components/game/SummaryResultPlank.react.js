var React = require('react');

var SummaryResultPlank = React.createClass({
    propTypes: {
        answer: React.PropTypes.object.isRequired,
        correctAnswer: React.PropTypes.object.isRequired
    },
    getDefaultProps: function () {
        return {
            answer: null,
            correctAnswer: null
        }
    },
    render: function () {
        var answer = this.props.answer;
        var correctAnswer = this.props.correctAnswer;
        var isCorrectAnswer = answer.id === correctAnswer.id;

        var correctAnswerElem, classes = "summary-result-plank ";
        if (!isCorrectAnswer) {
            classes += "summary-result-plank-wrong";

            correctAnswerElem = (
                <div className="correct-answer">
                    <b>Poprawna:</b> {correctAnswer.value}
                </div>
            );
        } else {
            classes += "summary-result-plank-valid";
        }
        return (
            <div className={classes}>
                <div className="answer">{answer.value}</div>
                {correctAnswerElem}
            </div>
        );
    }
});

module.exports = SummaryResultPlank;