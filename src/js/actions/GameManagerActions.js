var Reflux = require('reflux');

var GameManagerActions = Reflux.createActions([
    'startGame',
    'nextTurn',
    'choosePhotoTopic',
    'chooseAnswer',
    'uploadPhoto',
    'reportPhoto',
    'switchToDataSendView'
]);

module.exports = GameManagerActions;