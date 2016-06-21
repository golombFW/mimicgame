var _ = require('underscore');
var utils = require('cloud/utils.js');

exports.randomAnswers = function (emotionList, correctAnswerFlat, answersNumber) {
    if (null == answersNumber) {
        answersNumber = 4;
    }
    var answers = utils.randomEmotions(emotionList);
    var correctAnswer = _.find(answers, function (el) {
        return el.id === correctAnswerFlat.id
    });
    answers = _.first(answers, answersNumber);
    if (0 > answers.indexOf(correctAnswer)) {
        answers[0] = correctAnswer;
        answers = _.shuffle(answers);
    }
    return answers;
};