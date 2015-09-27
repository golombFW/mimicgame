var React = require('react');

var VerticalSeparator = React.createClass({
    render: function () {
        return (
            <div className="or-spacer-vertical left">
                <div className="mask"></div>
            </div>
        );
    }
});

module.exports = VerticalSeparator;