var React = require('react');
var Parse = require('parse').Parse;

var LoginWrapper = React.createClass({
    getInitialState: function () {
        return {FBUserName: "You are not logged in with Facebook"}
    },
    testAPI: function () {
        FB.api('/me', function (response) {
            console.log('Successful login for: ' + response.name);
            this.setState({FBUserName: response.name});
        }.bind(this));
    },
    loginUser: function () {
        Parse.FacebookUtils.logIn(null, {
            success: function (user) {

                if (!user.existed()) {
                    alert("User signed up and logged in through Facebook!");
                } else {
                    alert("User logged in through Facebook!");
                }

                this.testAPI();
            }.bind(this),
            error: function (user, error) {
                alert("User cancelled the Facebook login or did not fully authorize.");
            }
        });
    },
    componentDidMount: function () {
        window.fbAsyncInit = function () {
            Parse.FacebookUtils.init({ // this line replaces FB.init({
                appId: '476535895837963', // Facebook App ID
                status: true,  // check Facebook Login status
                cookie: true,  // enable cookies to allow Parse to access the session
                xfbml: false,  // initialize Facebook social plugins on the page
                version: 'v2.4' // point to the latest Facebook Graph API version
            });

            FB.getLoginStatus(function (response) {
                if (response.status !== 'connected') {
                    console.log("User not logged");
                } else {
                    console.log("User logged");
                    this.testAPI();
                }

            }.bind(this));


        }.bind(this);

        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {
                return;
            }
            js = d.createElement(s);
            js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));


    },
    render: function () {

        return (
            <div className="loginWrapper">Hello World! <h1 id="fb-welcome">{this.state.FBUserName}</h1></div>
        );
    }
});
module.exports = LoginWrapper;