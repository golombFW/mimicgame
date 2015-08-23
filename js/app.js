var React = require('react');
var Parse = require('parse').Parse;

// Insert your app's keys here:
Parse.initialize("tMWQH7ybkZBT5eRTm60nYpeEGJMFfN4gM8Q2Enra", "Iac3Ms8magoc7sCMzaRmTuroC33UhSlA55ThxWlr");

var LoginWrapper = require('./LoginWrapper.react.js');
React.render(
    <LoginWrapper />,
    document.getElementById('app')
);