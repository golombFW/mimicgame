var React = require('react');

var AppLogo = React.createClass({
    sizeClass: "normal",

    componentWillMount: function () {
        switch (this.props.size) {
            case "big":
            {
                this.sizeClass = " big-text";
                break;
            }
            case "small":
            {
                this.sizeClass = " small-text";
                break;
            }
            default:
            {
                this.sizeClass = " normal-text";
            }
        }
    },
    render: function () {
        var desc = null;

        if (this.props.showdesc) {
            desc = <span className="description hidden">project</span>;
        }

        var logo = (
            <div className="logo-container">
                <div className={this.getClassName()}>
                    <span className="title">Mimic Game</span>
                    {desc}
                </div>
            </div>
        );

        if (this.props.href) {
            return (
                <a href="#" onClick={this.props.href}>
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