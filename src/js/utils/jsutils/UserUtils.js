var ExceptionMessages = require('../../Messages.js').ExceptionMessages;

var UserUtils = {
    getUserName: function (facebookUserName, parseUserName, slice) {
        slice = 'undefined' !== typeof slice ? slice : true;

        var userName;
        if (parseUserName) {
            userName = parseUserName;
        } else if (facebookUserName) {
            userName = facebookUserName;
        } else {
            throw ExceptionMessages.UserNameIllegalState;
        }

        if (true === slice) {
            userName = userName.slice(0, 25);
        }

        return userName;
    }
};

module.exports = UserUtils;