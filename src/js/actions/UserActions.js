var Reflux = require('reflux');

var UserActions = Reflux.createActions([
    'setUser',
    'updateUser',
    'setPlayerRank',
    "updatePlayerRank"
]);

module.exports = UserActions;