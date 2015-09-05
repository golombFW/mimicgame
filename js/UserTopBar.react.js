var React = require('react');
var Parse = require('parse').Parse;
var ParseReact = require('parse-react');
var Reflux = require('reflux');

var FacebookUserStore = require('./stores/FacebookUserStore.js');

var UserTopBar = React.createClass({
    mixins: [Reflux.connect(FacebookUserStore, 'facebookUser')],
    render: function () {
        return (
            <div className="user-topbar">
                Hello World! <h1 id="fb-welcome">{this.state.facebookUser.name}</h1>
            </div>
        );
    }
});

module.exports = UserTopBar;