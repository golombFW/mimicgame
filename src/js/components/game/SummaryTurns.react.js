var React = require('react');
var _ = require('underscore');

var cloudModel = require('../../../cloud/model.js');
var SummaryResultPlank = require('./SummaryResultPlank.react.js');
var SummaryTurnPlank = require('./SummaryTurnPlank.react.js');

var SummaryTurns = React.createClass({
    propTypes: {
        match: React.PropTypes.object.isRequired,
        player: React.PropTypes.object.isRequired,
        turnsSummary: React.PropTypes.array.isRequired
    },
    getDefaultProps: function () {
        return {
            match: null,
            player: null,
            turnsSummary: null
        }
    },
    componentDidMount: function () {
        setTimeout(function () {
            var images = document.querySelectorAll(".summary-turn-plank .photo img");
            var imagesLength = images.length ? images.length : 0;
            for (var i = 0; i < imagesLength; i += 1) {
                var image = images[i];
                var parent = image.parentElement;
                var parentHeight = parent ? parent.offsetHeight : "auto";
                if (image.offsetHeight > parentHeight) {
                    image.style.height = 'calc(' + parentHeight + 'px - 0.4em)';
                }
            }
        }, 1500);
    },
    render: function () {
        var match = this.props.match;
        var player = this.props.player;
        var isSinglePlayerGame = "SINGLE" === match.get("type");
        var isUserPlayer1 = match.get("player1").equals(player);

        var turnsResults = _.map(this.props.turnsSummary, function (turn) {
            var key = "turn-" + turn.turnNumber;
            var p1, p2, player2Elem, photoUrl1, photoUrl2;
            if (turn.player1) {
                p1 = (
                    <SummaryResultPlank answer={turn.player1.answer} correctAnswer={turn.player1.correctAnswer}/>
                );
                photoUrl1 = turn.player1.questionUrl;
                if (!photoUrl1 && turn.player1.defaultPhoto) {
                    photoUrl1 = 'resources/' + cloudModel.defaultQuestionImages[turn.player1.defaultPhoto];
                }
            }
            if (turn.player2) {
                p2 = (
                    <SummaryResultPlank answer={turn.player2.answer} correctAnswer={turn.player2.correctAnswer}/>
                );
                photoUrl2 = turn.player2.questionUrl;
                if (!photoUrl2 && turn.player2.defaultPhoto) {
                    photoUrl2 = 'resources/' + cloudModel.defaultQuestionImages[turn.player2.defaultPhoto];
                }
            }
            if (!isUserPlayer1) {
                p1 = [p2, p2 = p1][0];
                photoUrl1 = [photoUrl2, photoUrl2 = photoUrl1][0];
            }
            if (!isSinglePlayerGame) {
                player2Elem = (
                    <div className="col-xs-4 col-sm-4">{p2}</div>
                );
            }
            return (
                <div className="turn-result row" key={key}>
                    <div className="col-xs-4 col-sm-4">{p1}</div>
                    <div className="col-xs-4 col-sm-4 summary-turn-plank-container"><SummaryTurnPlank
                        turnNumber={turn.turnNumber}
                        photoUrl1={photoUrl1} photoUrl2={photoUrl2}/>
                    </div>
                    {player2Elem}
                </div>
            );
        });
        var headerClasses = "col-xs-4 col-sm-4";
        if (isSinglePlayerGame) {
            headerClasses += " col-sm-offset-4 col-xs-offset-4";
        }
        return (
            <div className="turns">
                <div className="turns-header row">
                    <div className={headerClasses}>Tura</div>
                </div>
                {turnsResults}
            </div>
        );
    }
});

module.exports = SummaryTurns;