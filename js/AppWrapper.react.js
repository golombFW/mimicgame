var React = require('react');
var Parse = require('parse').Parse;
var ParseReact = require('parse-react');
var Utils = require('./utils/Utils.js');

var Logo = Utils.AppLogo;
var LoadingBar = Utils.LoadingBar1;

var contents = {
    "TEST": <LoadingBar/>
};
var AppWrapper = React.createClass({
    getInitialState: function () {
        return {
            currentView: "MENU"
        }
    },
    render: function () {
        if (this.state.currentView === "MENU") {
            return (
                <div className="app-wrapper">
                    <Logo />

                    <nav className="menu">
                        <a className="btn btn-default" role="button"
                           onClick={this.selectView.bind(this, "TEST")}>graj</a><br/>
                        <a className="btn btn-default" role="button" onClick={this.logout}>wyloguj</a>
                    </nav>
                </div>
            );
        }
        return (
            <div className="app-wrapper">
                {contents[this.state.currentView]}
            </div>
        );

    },
    selectView: function (tab) {
        this.setState({currentView: tab});
    },
    logout: function () {
        Parse.User.logOut();
        FB.logout();
    }
});

module.exports = AppWrapper;