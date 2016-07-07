var React = require('react');
var StateMixin = require('reflux-state-mixin');
var Utils = require('../../utils/Utils.js');
var UserUtils = Utils.User;
var $ = Utils.$;

var FacebookUserStore = require('../../stores/FacebookUserStore.js');
var UserStore = require('../../stores/UserStore.js');
var AppStateActions = require('../../actions/AppStateActions.js');

var UserPanel = React.createClass({
        mixins: [StateMixin.connect(UserStore), StateMixin.connect(FacebookUserStore, 'facebookUser')],
        username: null,
        avatarUrl: null,

        componentDidUpdate: function () {
            if (!$.isNullOrEmpty(this.state.facebookUser) && this.state.user) {
                this.username = this.getUsername();
                this.avatarUrl = this.getAvatar();
            }
        },
        render: function () {
            return (
                <div id="user-panel">
                    <div className="col">
                        <span className="username">{this.username}</span>
                    </div>
                    <div className="col avatar-col">
                        <div id="user-panel-avatar"><img src={this.avatarUrl}/></div>
                    </div>
                    <div className="col settings-col button">
                        <a onClick={this.openSettings}><i className="fa fa-bars"></i></a>
                    </div>
                </div>
            );
        },
        getUsername: function () {
            if (this.state.facebookUser.first_name && this.state.user.get) {
                return UserUtils.getUserName(this.state.facebookUser.first_name, this.state.user.get("nick"));
            }
            return null;
        },
        getAvatar: function () {
            if (this.state.user.get("FacebookUser").get("avatar")) {
                return this.state.user.get("FacebookUser").get("avatar").url;
            } else if (this.state.facebookUser.avatar) {
                return this.state.facebookUser.avatar.url;
            } else {
                return null;
            }
        },
        openSettings: function () {
            AppStateActions.toggleUserSettings();
        }
    }
);

module.exports = UserPanel;