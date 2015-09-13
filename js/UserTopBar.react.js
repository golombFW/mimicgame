var React = require('react');
var Reflux = require('reflux');
var Utils = require('./utils/Utils.js');

var FacebookUserStore = require('./stores/FacebookUserStore.js');
var AppStateActions = require('./actions/AppStateActions.js');

var UserPanel = require('./components/UserPanel.react.js');
var AchievementsPanel = require('./components/AchievementsPanel.react.js');
var Logo = Utils.AppLogo;
var Separator = Utils.VerticalSeparator;

var UserTopBar = React.createClass({
    mixins: [Reflux.connect(FacebookUserStore, 'facebookUser')],
    render: function () {
        return (
            <div id="user-topbar">
                <Logo size="normal" href={AppStateActions.goToMenu}/>
                <Separator />
                <AchievementsPanel />
                <UserPanel />
            </div>
        );
    }
});

module.exports = UserTopBar;