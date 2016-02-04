var React = require('react');
var Utils = require('./utils/Utils.js');

var AppStateActions = require('./actions/AppStateActions.js');

var UserPanel = require('./components/topbar/UserPanel.react.js');
var AchievementsPanel = require('./components/topbar/AchievementsPanel.react.js');
var Logo = Utils.Components.AppLogo;
var Separator = Utils.Components.VerticalSeparator;

var UserTopBar = React.createClass({
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