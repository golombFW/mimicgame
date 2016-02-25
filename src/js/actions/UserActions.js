var Reflux = require('reflux');

var UserActions = Reflux.createActions([
    'setUser',
    'updateUser'
]);

module.exports = UserActions;