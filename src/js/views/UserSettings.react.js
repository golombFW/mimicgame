var React = require('react');

var SettingsState = require('../states/SettingsState.js');

var DefaultAppViewContainer = require('../components/DefaultAppViewContainer.react.js');
var SettingsMenu = require('../components/settings/SettingsMenu.react.js');
var UserDetailsSettings = require('./settings/UserDetailsSettings.react.js');
var PrivacySettings = require('./settings/PrivacySettings.react.js');

var UserSettings = React.createClass({
    contents: {},

    getInitialState: function () {
        this.contents[SettingsState.USER] = <UserDetailsSettings/>;
        this.contents[SettingsState.PRIVACY] = <PrivacySettings/>;

        return {
            currentTab: SettingsState.USER
        }
    },
    render: function () {
        return (
            <DefaultAppViewContainer>
                <div id="app-user-settings">
                    <div className="row">
                        <div className="col-sm-3 col-md-2">
                            <SettingsMenu currentTab={this.state.currentTab} changeTabFunc={this.changeTab}/>
                        </div>
                        <div className="col-sm-9 col-md-10">
                            {this.contents[this.state.currentTab]}
                        </div>
                    </div>
                </div>
            </DefaultAppViewContainer>

        );
    },
    changeTab: function (newTab) {
        this.setState({
            currentTab: newTab
        });
    }
});

module.exports = UserSettings;