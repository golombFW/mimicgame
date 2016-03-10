var Reflux = require('reflux');

var GameManagerActions = Reflux.createActions([
    'startGame',
    'choosePhotoTopic'
]);

module.exports = GameManagerActions;