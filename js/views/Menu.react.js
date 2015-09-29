var React = require('react');
var Parse = require('parse').Parse;
var Utils = require('../utils/Utils.js');

var AppStateActions = require('../actions/AppStateActions.js');
var AppState = require('../AppState.js');

var Logo = Utils.Components.AppLogo;

var Menu = React.createClass({
    render: function () {
        return (
            <div id="app-menu">
                <nav className="menu">
                    <a className="btn btn-default" role="button"
                       onClick={this.selectView.bind(this, AppState.TEST)}>graj</a><br/>
                    <a className="btn btn-default" role="button" onClick={this.logout}>wyloguj</a>
                </nav>
            </div>
        );
    },
    selectView: function (tab) {
        AppStateActions.changeState(tab);
    },
    logout: function () {
        Parse.User.logOut();
        FB.logout();
    }
});

module.exports = Menu;
