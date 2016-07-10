var React = require('react');
var BasicMenuPanel = require('./BasicMenuPanel.react.js');

var GameRequestsPanel = React.createClass({
    propTypes: {
        requests: React.PropTypes.array
    },
    getDefaultProps: function () {
        return {
            requests: null
        };
    },
    render: function () {
        if (this.props.requests) {
            return (
                <BasicMenuPanel id="game-requests-table">
                    <div className="">
                        Aktualnie brak wyzwań
                        {
                            //Wyzwanie 1
                            //Wyzwanie 2
                        }
                    </div>
                </BasicMenuPanel>
            );
        } else {
            return null;
        }

    }
});

module.exports = GameRequestsPanel;