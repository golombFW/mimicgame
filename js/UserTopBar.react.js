var React = require('react');
var Parse = require('parse').Parse;
var ParseReact = require('parse-react');
var Reflux = require('reflux');

var FacebookUserStore = require('./stores/FacebookUserStore.js');
var UserPanel = require('./components/UserPanel.react.js');

var UserTopBar = React.createClass({
    mixins: [Reflux.connect(FacebookUserStore, 'facebookUser')],
    render: function () {
        return (
            <div className="user-topbar">
                <div id="achievements"></div>
                <UserPanel />
            </div>
        );
    }
});

module.exports = UserTopBar;