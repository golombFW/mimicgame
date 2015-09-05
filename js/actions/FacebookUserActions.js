var Reflux = require('reflux');

var FacebookUserActions = Reflux.createActions([
    'fetchUser',
    'setUser',
    'fetchFriendsList'
]);

module.exports = FacebookUserActions;