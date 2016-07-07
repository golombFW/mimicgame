var React = require('react');

var SummaryAvatar = React.createClass({
    propTypes: {
        img: React.PropTypes.string,
        nick: React.PropTypes.string,
        score: React.PropTypes.number,
        invert: React.PropTypes.bool
    },
    getDefaultProps: function () {
        return {
            img: null,
            nick: null,
            score: null,
            invert: false
        }
    },
    render: function () {
        var classes = "summary-avatar";
        if (this.props.invert) {
            classes += " summary-avatar-inverted";
        }
        var score = this.props.score;
        var scoreElem;
        if (score) {
            var sign = "+";
            if (0 > score) {
                sign = "-";
            }
            scoreElem = sign + score;
        }

        return (
            <div className={classes}>
                <img src={this.props.img}/>
                <span className="nick">{this.props.nick}</span>
                <span className="score">{scoreElem}</span>
            </div>
        );
    }
});

module.exports = SummaryAvatar;