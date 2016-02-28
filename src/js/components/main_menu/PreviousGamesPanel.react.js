var React = require('react');
var BasicMenuPanel = require('./BasicMenuPanel.react.js');

var PreviousGamesPanel = React.createClass({
    render: function () {
        return (
            <BasicMenuPanel id="previous-games-tab">
                <div className="">
                    Nie rozegrałeś jeszcze żadnej gry!
                    {
                        //Edek1 wygrana
                        //Anonim23 przegrana
                    }
                </div>
            </BasicMenuPanel>
        );
    }
});

module.exports = PreviousGamesPanel;