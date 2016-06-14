var React = require('react');

var DefaultAppViewContainer = require('../../components/DefaultAppViewContainer.react.js');
var MenuButton = require('../../components/MenuButton.react.js');

var AppStateActions = require('../../actions/AppStateActions.js');
var AppState = require('../../states/AppState.js');

var NewGameMenu = React.createClass({
    render: function () {
        return (
            <DefaultAppViewContainer>
                <div id="newgame-menu">
                    <h1>Nowa Gra</h1>
                    <MenuButton icon="fa fa-random" onClick={this.selectView.bind(this, AppState.FIND_RANDOM_OPPONENT)}>Losowy
                        Przeciwnik</MenuButton>
                    <MenuButton icon="fa fa-user-secret" disabled></MenuButton><br/>
                    <MenuButton icon="fa fa-user" onClick={this.selectView.bind(this, AppState.SINGLE_PLAYER_GAME)}>Gra bez przeciwnika</MenuButton><br/>
                    <MenuButton disabled>Znajdź Przeciwnika</MenuButton><br/>
                    <MenuButton disabled>Znajomy z Facebooka</MenuButton>
                </div>
            </DefaultAppViewContainer>
        );
    },
    selectView: function (tab) {
        AppStateActions.changeState(tab);
    }
});

module.exports = NewGameMenu;