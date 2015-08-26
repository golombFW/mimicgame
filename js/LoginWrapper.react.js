var React = require('react');
var Parse = require('parse').Parse;
var ParseReact = require('parse-react');
var Utils = require('./utils/Utils.js');

var AppWrapper = require('./AppWrapper.react.js');
var LoadingBar = Utils.LoadingBar1;

var LoginWrapper = React.createClass({
    mixins: [ParseReact.Mixin],
    getInitialState: function () {
        return {FBUser: null}
    },
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
                appId: '476535895837963', // Facebook App ID
                status: true,  // check Facebook Login status
                cookie: true,  // enable cookies to allow Parse to access the session
                xfbml: true,  // initialize Facebook social plugins on the page
                version: 'v2.4' // point to the latest Facebook Graph API version
            });

            FB.getLoginStatus(function (response) {
                if (response.status !== 'connected') {
                    console.log("User not logged");
                    var s = '<div class="fb-login-button" data-max-rows="1" data-size="large" data-show-faces="true" data-auto-logout-link="false" onlogin="loginUser"></div>';
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
            js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.4&appId=476535895837963";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    },
    render: function () {
        if (this.data.user) {
            if (this.state.FBUser == null) {
                return (
                    <LoadingBar/>
                );
            }
            return (
                <div>Hello World! <h1 id="fb-welcome">{this.state.FBUser.name}</h1>
                    <AppWrapper />
                </div>
            );
        }
        return (
            <div>
                <div id="social-login-button-facebook"/>
            </div>
        );
    },
    getMyFBIdentity: function () {
        FB.api('/me', function (response) {
            console.log('Successful login for: ' + response.name);
            this.setState({FBUser: response});

        }.bind(this));
    },
    loginUser: function () {
        if (!this.data.user) {
            Parse.FacebookUtils.logIn(null, {
                success: function (user) {
                    this.getMyFBIdentity();
                    if (!user.existed()) {
                        console.log("User signed up and logged in through Facebook!");
                        if (this.state.FBUser !== null) {
                            user.set("facebookId", this.state.FBUser.id);
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
        }
        if (this.state.FBUser === null) {
            this.getMyFBIdentity();
        }
    }
});
module.exports = LoginWrapper;