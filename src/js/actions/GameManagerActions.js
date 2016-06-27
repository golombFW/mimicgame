var Reflux = require('reflux');

var GameManagerActions = Reflux.createActions([
    'startGame',
    'nextTurn',
    'choosePhotoTopic',
    'chooseAnswer',
    'uploadPhoto'
]);

module.exports = GameManagerActions;