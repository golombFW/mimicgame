var _ = require('underscore');

var Functions = {
    clone: function (obj) {
        return _.clone(obj);
    },
    isEmpty: function (obj) {
        return 0 === _.keys(obj).length
    },
    isNullOrEmpty: function (obj) {
        return null == obj || this.isEmpty(obj)
    },
    getAppUrl: function () {
        var port = window.location.port;
        var url = window.location.protocol + '//' + window.location.hostname;
        if (port) url = url + ':' + port;
        return url;
    }
};

module.exports = Functions;