var React = require('react');
var ParseReact = require('parse-react');
var Reflux = require('reflux');
var UserUtils = require('../../utils/Utils.js').User;

var FacebookUserStore = require('../../stores/FacebookUserStore.js');
var AppStateActions = require('../../actions/AppStateActions.js');

var UserPanel = React.createClass({
        mixins: [ParseReact.Mixin, Reflux.connect(FacebookUserStore, 'facebookUser')],
        username: null,
        avatarUrl: null,

        observe: function () {
            return {
                user: ParseReact.currentUser
            };
        },
        componentWillUpdate: function () {
            if (null != this.state.facebookUser) {
                this.username = this.getUsername();

                if (null == this.avatarUrl && null != this.state.facebookUser.avatar) {
                    this.avatarUrl = this.state.facebookUser.avatar.url;
                }
            }
            //this.username = new Array(75 + 1).join('x'); //test
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
        isUpdateNeeded: function () {
            return null == this.username || null == this.avatarUrl;
        },
        getUsername: function () {
            return UserUtils.getUserName(this.state.facebookUser.first_name, this.data.user.nick);
        },
        openSettings: function () {
            AppStateActions.openUserSettings();
        }
    }
);

module.exports = UserPanel;