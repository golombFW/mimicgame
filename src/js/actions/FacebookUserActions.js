var Reflux = require('reflux');

var FacebookUserActions = Reflux.createActions([
    'fetchUser',
    'setUser',
    'fetchFriendsList',
    'fetchAvatar'
]);

module.exports = FacebookUserActions;