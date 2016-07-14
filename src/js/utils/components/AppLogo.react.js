var React = require('react');

var AppLogo = React.createClass({
    sizeClass: "normal",

    propTypes: {
        size: React.PropTypes.string,
        showdesc: React.PropTypes.bool,
        showHome: React.PropTypes.bool
    },
    componentWillMount: function () {
        switch (this.props.size) {
            case "big": {
                this.sizeClass = " big-text";
                break;
            }
            case "small": {
                this.sizeClass = " small-text";
                break;
            }
            default: {
                this.sizeClass = " normal-text";
            }
        }
    },
    render: function () {
        var desc, homeIcon;

        if (this.props.showdesc) {
            desc = <span className="description hidden">project</span>;
        }

        if (this.props.showHome) {
            homeIcon = (
                <div className="home-icon">
                    <i className="fa fa-home" aria-hidden="true"></i>
                </div>);
        }

        var logo = (
            <div className="logo-container">
                <div className={this.getClassName()}>
                    <span className="title">Mimic Game</span>
                    {homeIcon}
                    {desc}
                </div>
            </div>
        );

        if (this.props.href) {
            return (
                <a href="javascript:;" onClick={this.props.href}>
                    {logo}
                </a>
            )
        }
        return logo;
    },
    getClassName: function () {
        return "app-logo" + this.sizeClass;
    }
});

module.exports = AppLogo;