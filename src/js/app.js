var React = require('react');
var ReactDOM = require('react-dom');
var Parse = require('parse').Parse;
var $ = require('./utils/Utils.js').$;
var moment = require('moment');
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

moment.updateLocale('en', {
    relativeTime: {
        future: "in %s",
        past: "%s temu",
        s: "sekund",
        m: "minutę",
        mm: "%d minut",
        h: "godzinę",
        hh: "%d godzin",
        d: "dzień",
        dd: "%d dni",
        M: "miesiąc",
        MM: "%d miesięcy",
        y: "rok",
        yy: "%d lat"
    }
});

Parse.initialize(Keys.ParseAppId);
Parse.serverURL = $.getAppUrl() + '/parse';

var LoginWrapper = require('./LoginWrapper.react.js');

ReactDOM.render(
    <LoginWrapper />,
    document.getElementById('app')
);