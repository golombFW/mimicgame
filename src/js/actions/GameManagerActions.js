var Reflux = require('reflux');

var GameManagerActions = Reflux.createActions([
    'startGame',
    'choosePhotoTopic',
    'uploadPhoto'
]);

module.exports = GameManagerActions;