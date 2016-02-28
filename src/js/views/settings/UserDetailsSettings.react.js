var React = require('react');
var Parse = require('parse').Parse;
var StateMixin = require('reflux-state-mixin');
var Reflux = require('reflux');
var UserUtils = require('../../utils/Utils.js').User;

var FacebookUserStore = require('../../stores/FacebookUserStore.js');
var FacebookUserActions = require('../../actions/FacebookUserActions.js');
var UserStore = require('../../stores/UserStore.js');
var UserActions = require('../../actions/UserActions.js');

var SettingsInput = require("../../components/settings/SettingsInput.react.js");

var UserDetailsSettings = React.createClass({
    mixins: [StateMixin.connect(UserStore), Reflux.connect(FacebookUserStore, 'facebookUser')],

    render: function () {
        var avatar = this.state.user.get("FacebookUser").get("avatar");
        var avatarContent = (<span ref="avatar">Brak</span>);
        if (avatar) {
            avatarContent = (<img src={avatar.url} ref="avatar"/>);
        }
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
                        <p className="note">Po tym nicku będą mogli znaleźć cię inni gracze!</p>
                    </div>
                    <div className="form-group">
                        <label htmlFor="avatar">Avatar</label>
                        <div>{avatarContent}<br/><br/>
                            <button className="btn btn-default btn-xs" type="button" onClick={this.updateAvatar}>
                                <i className="fa fa-refresh"></i>
                                <span> Aktualizuj</span>
                            </button>
                        </div>
                        <p className="note">Avatarem jest twoje zdjęcie profilowe FB. Jeśli zmieniono je na facebooku,
                            to w tym miejscu możesz zaktulizować je w grze.</p>
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
    },
    updateAvatar: function () {
        FacebookUserActions.fetchAvatar(true);
    }
});

module.exports = UserDetailsSettings;