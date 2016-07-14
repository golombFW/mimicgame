var Reflux = require('reflux');

var AppDataActions = Reflux.createActions([
    'fetchGamesInfo',
    'fetchChallengeRequests',
    'fetchFriendsGameList'
]);

module.exports = AppDataActions;