var React = require('react');
var ReactDOM = require('react-dom');
var Parse = require('parse').Parse;
var Keys = require('./KeyConfig.js');

require('velocity-animate');
require('velocity-animate/velocity.ui');

require('react-safe-render')(React, {
    errorHandler: function (errReport) {
        console.error("\"" + errReport.displayName + "\" component failed in \"" + errReport.method +
            "\" method.\nError:\n" + errReport.error.message + "\n\nStack:\n" + errReport.error.stack);
        //todo send to parse log
    }
});

Parse.initialize(Keys.ParseAppId, Keys.ParseJavaScriptKey);

var LoginWrapper = require('./LoginWrapper.react.js');

ReactDOM.render(
    <LoginWrapper />,
    document.getElementById('app')
);