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
    }
};

module.exports = Functions;