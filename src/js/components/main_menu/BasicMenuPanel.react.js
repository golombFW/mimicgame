var React = require('react');

var BasicMenuPanel = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        title: React.PropTypes.string,
        classes: React.PropTypes.string,
        fullWidth: React.PropTypes.bool
    },

    render: function () {
        var classes = "";
        if (this.props.classes) {
            classes += this.props.classes;
        }
        var fullWidth = "col-sm-6 ";
        if (this.props.fullWidth) {
            fullWidth = "col-sm-12";
        }

        return (
            <div id={this.props.id} className={"menu-panel-container col-xs-12 " + fullWidth + classes}>
                <div className="title">{this.props.title}</div>
                <div className="menu-panel">
                    <div className="menu-panel-content">
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = BasicMenuPanel;