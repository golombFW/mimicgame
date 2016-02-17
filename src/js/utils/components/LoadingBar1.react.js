var React = require('react');

var LoadingBar1 = React.createClass({
    propTypes: {
        customText: React.PropTypes.string,
        center: React.PropTypes.bool
    },
    getDefaultProps: function () {
        return {
            customText: "Trwa wczytywanie danych",
            center: false
        };
    },
    render: function () {
        var classes = "loading-bar1";
        if (this.props.center) {
            classes += " screen-center"
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