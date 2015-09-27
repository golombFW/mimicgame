var ExceptionMessages = require('../../Messages.js').ExceptionMessages;

var UserUtils = {
    getUserName: function (facebookUserName, parseUserName, slice) {
        slice = typeof slice !== 'undefined' ? slice : true;

        var userName;
        if (null != parseUserName) {
            userName = parseUserName;
        } else if (null != facebookUserName) {
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