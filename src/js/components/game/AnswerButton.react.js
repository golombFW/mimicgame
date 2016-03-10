var React = require('react');

var AnswerButton = React.createClass({
    propTypes: {
        icon: React.PropTypes.string,
        onClick: React.PropTypes.func,
        fullWidth: React.PropTypes.bool
    },
    render: function () {
        var classes = "btn btn-primary btn-answerbutton";
        if (this.props.fullWidth) {
            classes += " btn-block";
        }

        return (
            <a type="button" className={classes} onClick={this.props.onClick}>
                {this.props.children}
            </a>
        );
    }
});

module.exports = AnswerButton;