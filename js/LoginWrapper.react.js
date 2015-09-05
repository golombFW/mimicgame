var React = require('react');
var Parse = require('parse').Parse;
var ParseReact = require('parse-react');
var Reflux = require('reflux');
var Utils = require('./utils/Utils.js');
var Keys = require('./KeyConfig.js');

var FacebookUserActions = require('./actions/FacebookUserActions.js');
var FacebookUserStore = require('./stores/FacebookUserStore.js');

var AppWrapper = require('./AppWrapper.react.js');
var UserTopBar = require('./UserTopBar.react.js');
var AppFooter = require('./AppFooter.react.js');
var LoadingBar = Utils.LoadingBar1;
var Logo = Utils.AppLogo;

var LoginWrapper = React.createClass({
    mixins: [ParseReact.Mixin, Reflux.connect(FacebookUserStore, 'facebookUser')],
    observe: function () {
        return {
            user: ParseReact.currentUser
        };
    },
    componentWillMount: function () {
        window['loginUser'] = this.loginUser;
    },
    componentDidMount: function () {
        window.fbAsyncInit = function () {
            Parse.FacebookUtils.init({ // this line replaces FB.init({
                appId: Keys.FacebookAppId, // Facebook App ID
                status: false,  // check Facebook Login status
                cookie: true,  // enable cookies to allow Parse to access the session
                xfbml: false,  // initialize Facebook social plugins on the page
                version: 'v2.4' // point to the latest Facebook Graph API version
            });

            FB.getLoginStatus(function (response) {
                if (response.status !== 'connected') {
                    console.log("User not logged");
                    var s = '<div class="fb-login-button" data-max-rows="1" data-size="large" data-show-faces="true" data-auto-logout-link="false" onlogin="loginUser" scope="public_profile, email, user_friends"></div>';
                    var div = document.getElementById('social-login-button-facebook');
                    div.innerHTML = s;
                } else {
                    console.log("User logged");
                    this.loginUser();
                }

                FB.XFBML.parse(document.getElementById('social-login-button-facebook'));

            }.bind(this));
        }.bind(this);

        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {
                return;
            }
            js = d.createElement(s);
            js.id = id;
            js.src = "//connect.facebook.net/pl_PL/sdk.js#xfbml=1&version=v2.4&appId=" + Keys.FacebookAppId;
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    },
    render: function () {
        if (this.data.user) {
            if (this.state.facebookUser == null) {
                return (
                    <LoadingBar/>
                );
            }
            return (
                <div>
                    <UserTopBar />
                    <AppWrapper />
                    <AppFooter />
                </div>
            );
        }
        return (
            <div className="login-view">
                <Logo size="big"/>

                <div className="welcome-footer-dark">
                    <div id="social-login-button-facebook"/>
                    <AppFooter />
                </div>
            </div>
        );
    },
    getMyFBIdentity: function () {
        FacebookUserActions.fetchUser();
        FacebookUserActions.fetchFriendsList();
    },
    loginUser: function () {
        if (!this.data.user) {
            Parse.FacebookUtils.logIn("public_profile, email, user_friends", {
                success: function (user) {
                    if (this.state.facebookUser == null) {
                        this.getMyFBIdentity();
                    }
                    if (!user.existed()) {
                        console.log("User signed up and logged in through Facebook!");
                        if (this.state.facebookUser != null) {
                            user.set("facebookId", this.state.facebookUser.id);
                            user.save(null, {
                                success: function (user) {
                                    console.log("FacebookId added to user account");
                                }
                            });
                        }
                    } else {
                        console.log("User logged in through Facebook!");
                    }
                }.bind(this),
                error: function (user, error) {
                    console.log("User cancelled the Facebook login or did not fully authorize.");
                }
            });
        } else if (this.state.facebookUser == null) {
            this.getMyFBIdentity();
        }
    }
});
module.exports = LoginWrapper;