'use strict';
var Parse = require('parse').Parse;
var UserActions = require('../actions/UserActions.js');

var oldSignUp = Parse.User.prototype.signUp;
var oldLogIn = Parse.User.prototype.logIn;
var oldLinkWith = Parse.User.prototype._linkWith;
var oldLogOut = Parse.User.logOut;

var patches = {
    /**
     * Patches for Parse.User to watch for user signup / login / logout
     */
    signUp: function signUp(attrs, options) {
        return oldSignUp.call(this, attrs, options).then(function () {
            UserActions.updateUser();
        });
    },
    logIn: function logIn(options) {
        return oldLogIn.call(this, options).then(function () {
            UserActions.updateUser();
        });
    },
    _linkWith: function _linkWith(provider, options) {
        return oldLinkWith.call(this, provider, options).then(function () {
            UserActions.updateUser();
        });
    },
    logOut: function logOut() {
        var promise = oldLogOut();
        UserActions.updateUser();
        return promise;
    }
};

var ParsePatches = {
    applyPatches: function () {
        Parse.User.prototype.signUp = patches.signUp;
        Parse.User.prototype.logIn = patches.logIn;
        Parse.User.prototype._linkWith = patches._linkWith;
        Parse.User.logOut = patches.logOut;
    }
};

module.exports = ParsePatches;