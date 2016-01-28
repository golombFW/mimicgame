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
var AppDisable = require('./components/AppDisable.react.js');
var LoadingBar = Utils.Components.LoadingBar1;
var Logo = Utils.Components.AppLogo;

var LoginWrapper = React.createClass({
    mixins: [ParseReact.Mixin, Reflux.listenTo(FacebookUserStore, 'onFacebookUserUpdated')],
    shouldUpdateParseUser: false,

    observe: function () {
        return {
            user: ParseReact.currentUser
        };
    },
    getInitialState: function () {
        return {
            config: null
        }
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
                version: 'v2.5' // point to the latest Facebook Graph API version
            });

            FB.getLoginStatus(function (response) {
                console.log("fb login status: " + response.status);
                if (response.status !== 'connected') {
                    console.log("User fb not logged");

                    if (null != this.data.user) {
                        Parse.User.logOut();
                    }

                    var s = '<div class="fb-login-button" data-max-rows="1" data-size="large" data-show-faces="true" data-auto-logout-link="false" onlogin="loginUser" scope="public_profile, email, user_friends"></div>';
                    var div = document.getElementById('social-login-button-facebook');
                    div.innerHTML = s;
                } else {
                    console.log("User logged to FB");
                }
                this.loginUser(response.status);
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
            js.src = "//connect.facebook.net/pl_PL/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

        var minutes = 5;
        var interval = 1000 * 60 * minutes;
        this.fetchConfig();
        setInterval(this.fetchConfig, interval);
    },
    render: function () {
        if (null != this.state.config && this.state.config.get("appDisable")) {
            return (
                <AppDisable info={this.state.config.get("appDisableText")}/>
            );
        }
        if (this.data.user) {
            if (null == this.state.facebookUser) {
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
            <div id="login-view">
                <Logo size="big"/>

                <div className="welcome-footer-dark">
                    <div id="social-login-button-facebook"/>
                    <AppFooter />
                </div>
            </div>
        );
    },
    onFacebookUserUpdated: function (fbUser) {
        this.setState({facebookUser: fbUser});
        if (this.shouldUpdateParseUser) {
            //todo add additional facebook data
            this.shouldUpdateParseUser = false;
        }
    },
    getMyFBIdentity: function () {
        FacebookUserActions.fetchUser();
        FacebookUserActions.fetchAvatar();
        FacebookUserActions.fetchFriendsList();
    },
    loginUser: function (fbStatus) {
        if (this.data.user) {
            Parse.User.current().fetch().then(function (result) {
                console.log("Parse User fetch successful");
                return result;
            }, function (error) {
                Parse.User.logOut();
                console.log(error);
                return Parse.Promise.as("There was an error while fetching user, trying to execute login.");
            }).then(function (result) {
                this.executeFBLogin();
            }.bind(this))
        } else {
            this.executeFBLogin();
        }
    },
    executeFBLogin: function () {
        Parse.FacebookUtils.logIn("public_profile, email, user_friends", {
            success: function (user) {
                if (!user.existed()) {
                    console.log("User signed up and logged in through Facebook!");
                    this.shouldUpdateParseUser = true;
                    this.getMyFBIdentity();
                } else {
                    console.log("User logged in through Facebook!");
                    if (null == this.state.facebookUser) {
                        this.getMyFBIdentity();
                    }
                }
            }.bind(this),
            error: function (user, error) {
                console.log("User cancelled the Facebook login or did not fully authorize.");
                //todo information for user that login failed and link to refresh page
            }
        });
    },
    fetchConfig: function () {
        Parse.Config.get().then(
            function (config) {
                this.setState({config: config});
                console.log("Config was fetched from server.")
            }.bind(this), function (error) {
                console.log("Failed to fetch. Using Cached Config.");
            }
        );
    }
});

module.exports = LoginWrapper;