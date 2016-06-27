var React = require('react');

var MenuButton = React.createClass({
    propTypes: {
        icon: React.PropTypes.string,
        onClick: React.PropTypes.func,
        classes: React.PropTypes.string,
        disabled: React.PropTypes.bool
    },
    render: function () {
        var icon;
        if (this.props.icon) {
            icon = <span><i className={this.props.icon}></i> </span>
        }
        var classes = "btn btn-default btn-menubutton";
        if (this.props.disabled) {
            classes += " disabled";
        }

        if (this.props.classes) {
            classes += " " + this.props.classes;
        }
        return (
            <a className={classes} role="button" onClick={this.props.onClick}>
                {icon}{this.props.children}
            </a>
        );
    }
});

module.exports = MenuButton;