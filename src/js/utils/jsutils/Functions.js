var Functions = {
    clone: function (obj) {
        return Object.assign({}, obj);
    },
    isEmpty: function (obj) {
        return 0 === Object.keys(obj).length
    },
    isNullOrEmpty: function (obj) {
        return !obj || this.isEmpty(obj)
    }
};

module.exports = Functions;