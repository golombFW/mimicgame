var React = require('react');
var Reflux = require('reflux');
var Utils = require('./utils/Utils.js');

var AppStateStore = require('./stores/AppStateStore.js');
var AppState = require('./states/AppState.js');
var LoadingBar = Utils.Components.LoadingBar1;

/* Views */
var Menu = require('./views/Menu.react.js');
var UserSettings = require('./views/UserSettings.react.js');
var NewGameMenu = require('./views/game/NewGameMenu.react.js');
var RandomOpponent = require('./views/game/FindRandomOpponent.react.js');
var SinglePlayerGame = require('./views/game/SinglePlayerGame.react.js');
var FriendChallenge = require('./views/game/FacebookFriendChallenge.react.js');
var Game = require('./views/game/Game.react.js');
var Ranking = require('./views/Ranking.react.js');

var VelocityTransitionGroup = require('velocity-react').VelocityTransitionGroup;
var directions = ["Up", "Down", "Left", "Right"];

var AppWrapper = React.createClass({
    mixins: [Reflux.connect(AppStateStore, 'currentAppState')],
    contents: {},
    animation: "bounce",
    delay: 500,
    duration: 500,

    getInitialState: function () {
        this.contents[AppState.MENU] = <Menu key={AppState.MENU}/>;
        this.contents[AppState.USER_SETTINGS] = <UserSettings key={AppState.USER_SETTINGS}/>;
        this.contents[AppState.NEW_GAME_MENU] = <NewGameMenu key={AppState.NEW_GAME_MENU}/>;
        this.contents[AppState.FIND_RANDOM_OPPONENT] = <RandomOpponent key={AppState.FIND_RANDOM_OPPONENT}/>;
        this.contents[AppState.SINGLE_PLAYER_GAME] = <SinglePlayerGame key={AppState.SINGLE_PLAYER_GAME}/>;
        this.contents[AppState.FB_FRIEND] = <FriendChallenge key={AppState.FB_FRIEND}/>;
        this.contents[AppState.GAME] = <Game key={AppState.GAME}/>;
        this.contents[AppState.RANKING] = <Ranking key={AppState.RANKING}/>;
    },
    render: function () {
        var content = this.contents[this.state.currentAppState];

        var animationBase = "transition." + this.animation;
        var animationIn = animationBase + directions[Math.floor(Math.random() * directions.length)] + "In";
        var animationOut = animationBase + directions[Math.floor(Math.random() * directions.length)] + "Out";

        return (
            <div id="app-wrapper">
                <VelocityTransitionGroup component="div"
                                         enter={{animation: animationIn, delay: this.delay, duration: this.duration}}
                                         leave={{animation: animationOut, duration: this.duration}}>
                    {content}
                </VelocityTransitionGroup>
            </div>
        );
    }
});

module.exports = AppWrapper;