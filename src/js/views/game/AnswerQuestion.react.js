var React = require('react');

var DefaultGameViewContainer = require('../../components/game/DefaultGameViewContainer.react.js');
var AnswerButton = require('../../components/game/AnswerButton.react.js');
var GameManagerActions = require('../../actions/GameManagerActions.js');

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
        if (this.props.data && this.props.data.turn.question && this.props.data.turn.question.get("photo")) {
            photoQuestionUrl = this.props.data.turn.question.get("photo")._url;
            if (photoQuestionUrl && photoQuestionUrl.indexOf("http://") > -1) {
                photoQuestionUrl = photoQuestionUrl.replace("http://", "https://");
            }
        }
        return (
            <DefaultGameViewContainer gameInfo={this.props.gameInfo}>
                <div id="photo-question">
                    <img src={photoQuestionUrl}/>
                </div>
                <div id="photo-answers" className="row">
                    <div className="col-xs-6 col-sm-3">
                        <AnswerButton fullWidth={true}>test</AnswerButton>
                    </div>
                    <div className="col-xs-6 col-sm-3">
                        <AnswerButton fullWidth={true}>test</AnswerButton>
                    </div>
                    <div className="col-xs-6 col-sm-3">
                        <AnswerButton fullWidth={true}>test</AnswerButton>
                    </div>
                    <div className="col-xs-6 col-sm-3">
                        <AnswerButton fullWidth={true}>test</AnswerButton>
                    </div>
                </div>
            </DefaultGameViewContainer>
        );
    }
});

module.exports = AnswerQuestion;