var React = require('react');

var AppDisable = React.createClass({
    render: function () {
        return (
            <div id="appDisable">
                {this.props.info}
            </div>
        );
    }
});

module.exports = AppDisable;