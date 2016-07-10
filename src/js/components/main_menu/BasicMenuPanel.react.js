var React = require('react');

var BasicMenuPanel = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        title: React.PropTypes.string,
        classes: React.PropTypes.string
    },

    render: function () {
        var classes = "";
        if (this.props.classes) {
            classes += this.props.classes;
        }
        return (
            <div id={this.props.id} className={"menu-panel-container col-sm-6 col-xs-12 "+classes}>
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