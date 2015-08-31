var React = require('react');

var AppLogo = React.createClass({
    sizeClass: "normal",
    componentWillMount: function () {
        switch (this.props.size) {
            case "big":
            {
                this.sizeClass = "big-text";
                break;
            }
            case "small":
            {
                this.sizeClass = "small-text";
                break;
            }
            default:
            {
                this.sizeClass = "normal";
            }
        }
    },
    getClassName: function () {
        return "app-logo center-block " + this.sizeClass;
    },
    render: function () {
        return (
            <div className={this.getClassName()}>
                Mimic Game
            </div>
        );
    }
});

module.exports = AppLogo;