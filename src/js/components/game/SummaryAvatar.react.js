var React = require('react');

var SummaryAvatar = React.createClass({
    propTypes: {
        img: React.PropTypes.string,
        nick: React.PropTypes.string,
        invert: React.PropTypes.bool
    },
    getDefaultProps: function () {
        return {
            img: null,
            nick: null,
            invert: false
        }
    },
    render: function () {
        var classes = "summary-avatar";
        if (this.props.invert) {
            classes += " summary-avatar-inverted";
        }
        return (
            <div className={classes}>
                <img src={this.props.img}/>
                <span className="nick">{this.props.nick}</span>
            </div>
        );
    }
});

module.exports = SummaryAvatar;