var React = require('react');

var LoadingBar1 = React.createClass({
    propTypes: {
        customText: React.PropTypes.string,
        center: React.PropTypes.oneOf(["screen", "parent"]),
        color: React.PropTypes.oneOf(["white", "dark"]),
        classes: React.PropTypes.string
    },
    getDefaultProps: function () {
        return {
            customText: "Trwa wczytywanie danych",
            center: null,
            color: "white",
            classes: null
        };
    },
    render: function () {
        var classes = "loading-bar1";
        if ("screen" === this.props.center) {
            classes += " screen-center";
        } else if ("parent" === this.props.center) {
            classes += " parent-center";
        }

        switch (this.props.color) {
            case "white":
                classes += " white";
                break;
            case "dark":
                classes += " dark";
                break;
            default:
                console.error("LoadingBar1: Invalid color parameter");
        }

        if (this.props.classes) {
            classes += " " + this.props.classes;
        }

        return (
            <div className={classes}>
                <div className="spinner">
                    <div className="rect1"></div>
                    <div className="rect2"></div>
                    <div className="rect3"></div>
                    <div className="rect4"></div>
                    <div className="rect5"></div>
                </div>
                <div className="text">{this.props.customText}</div>
            </div>

        );
    }
});

module.exports = LoadingBar1;