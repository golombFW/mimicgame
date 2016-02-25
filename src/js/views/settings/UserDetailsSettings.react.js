var React = require('react');
var Parse = require('parse').Parse;
var StateMixin = require('reflux-state-mixin');
var Reflux = require('reflux');
var UserUtils = require('../../utils/Utils.js').User;

var FacebookUserStore = require('../../stores/FacebookUserStore.js');
var UserStore = require('../../stores/UserStore.js');
var UserActions = require('../../actions/UserActions.js');

var SettingsInput = require("../../components/settings/SettingsInput.react.js");

var UserDetailsSettings = React.createClass({
    mixins: [StateMixin.connect(UserStore), Reflux.connect(FacebookUserStore, 'facebookUser')],

    render: function () {
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">Gracz</h3>
                </div>
                <div className="panel-body">
                    <div className="form-group">
                        <label htmlFor="userName">Nick</label>
                        <SettingsInput id="userName" placeholder="Podaj nick" ref="userName" onSave={this.saveUserName}>
                            {this.getUserName()}
                        </SettingsInput>
                    </div>
                </div>
            </div>
        );
    },
    saveUserName: function (userName) {
        if (userName && "" !== userName && userName !== this.state.user.get("nick")) {
            console.log("Save new username: " + userName);

            Parse.User.current().save({
                nick: userName
            }).then(function (result) {
                console.log("Username saved, new username: " + Parse.User.current().get("nick"));
                UserActions.updateUser();
            }, function (error) {
                console.error("Something going wrong while updating user, error: " + error.message);
            });
        }
    },
    getUserName: function () {
        return UserUtils.getUserName(this.state.facebookUser.first_name, this.state.user.get("nick"), true);
    }
});

module.exports = UserDetailsSettings;