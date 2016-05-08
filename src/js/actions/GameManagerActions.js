var Reflux = require('reflux');

var GameManagerActions = Reflux.createActions([
    'startGame',
    'choosePhotoTopic',
    'chooseAnswer',
    'uploadPhoto'
]);

module.exports = GameManagerActions;