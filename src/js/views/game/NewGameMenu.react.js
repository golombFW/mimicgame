var React = require('react');
var MenuButton = require('../../components/MenuButton.react.js');

var AppStateActions = require('../../actions/AppStateActions.js');
var AppState = require('../../states/AppState.js');

var NewGameMenu = React.createClass({
    render: function() {
        return (
            <div id="newgame-menu" className="app-view-default">
                <h1>Nowa Gra</h1>
                <MenuButton icon="fa fa-random" onClick={this.selectView.bind(this, AppState.FIND_RANDOM_OPPONENT)}>Losowy Przeciwnik</MenuButton>
                <MenuButton icon="fa fa-user-secret" disabled></MenuButton><br/>
                <MenuButton disabled>Znajdź Przeciwnika</MenuButton><br/>
                <MenuButton disabled>Znajomy z Facebooka</MenuButton>
            </div>
        );
    },
    selectView: function(tab) {
        AppStateActions.changeState(tab);
    }
});

module.exports = NewGameMenu;