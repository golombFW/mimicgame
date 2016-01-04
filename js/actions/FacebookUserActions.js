var Reflux = require('reflux');

var FacebookUserActions = Reflux.createActions({
    'fetchUser': {asyncResult: true},
    'setUser': {},
    'fetchFriendsList': {},
    'fetchAvatar': {}
});

module.exports = FacebookUserActions;