var React = require('react');

var BasicMenuPanel = React.createClass({
    propTypes: {
        id: React.PropTypes.string
    },

    render: function () {
        return (
            <div id={this.props.id} className="menu-panel-container col-md-6">
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