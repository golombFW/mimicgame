var React = require('react');
var BasicMenuPanel = require('./BasicMenuPanel.react.js');

var GameRequestsPanel = React.createClass({
    render: function () {
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
    }
});

module.exports = GameRequestsPanel;