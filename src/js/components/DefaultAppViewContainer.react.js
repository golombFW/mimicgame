var React = require('react');

var DefaultAppViewContainer = React.createClass({
    render: function () {
        return (
            <div className="app-view-default-container">
                {this.props.children}
            </div>
        );
    }
});

module.exports = DefaultAppViewContainer;