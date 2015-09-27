var React = require('react');
var Parse = require('parse').Parse;
var ParseReact = require('parse-react');
var Reflux = require('reflux');
var UserUtils = require('../../utils/Utils.js').User;

var FacebookUserStore = require('../../stores/FacebookUserStore.js');

var SettingsInput = require("../../components/settings/SettingsInput.react.js");

var UserDetailsSettings = React.createClass({
    mixins: [ParseReact.Mixin, Reflux.connect(FacebookUserStore, 'facebookUser')],

    observe: function () {
        return {
            user: ParseReact.currentUser
        };
    },
    render: function () {
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">Gracz</h3>
                </div>
                <div className="panel-body">
                    <div className="form-group">
                        <label for="userName">Nick</label>
                        <SettingsInput id="userName" placeholder="Podaj nick" ref="userName" onSave={this.saveUserName}>
                            {this.getUserName()}
                        </SettingsInput>
                    </div>
                </div>
            </div>
        );
    },
    saveUserName: function (userName) {
        if (null != userName && "" !== userName && userName !== this.data.user.nick) {
            console.log("Save new username: " + userName);

            //fixme: modifying user by Parse.User.current() doesn't work properly, this.data.user is not modified. Change this code if fixed.
            ParseReact.Mutation.Set(this.data.user.id, {
                nick: userName
            }).dispatch().then((result) => {
                console.log("Username saved, new username: " + Parse.User.current().get("nick"));
            }, (error) => {
                console.error("Something going wrong while updating user");
            });
        }

        //Parse.User.current()
        //    .save({
        //        nick: userName
        //    }).then((result) => {
        //        console.log("Username saved: " + result);
        //        console.log("new username: " + Parse.User.current().get("nick"));
        //
        //    }, (error) => {
        //        console.error("Something going wrong while updating user");
        //    });

    },
    getUserName: function () {
        return UserUtils.getUserName(this.state.facebookUser.first_name, this.data.user.nick, true);
    }
});

module.exports = UserDetailsSettings;