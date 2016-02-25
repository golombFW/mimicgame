var Reflux = require('reflux');

var AppStateActions = Reflux.createActions([
    'changeState',
    'openUserSettings',
    'closeUserSettings',
    'toggleUserSettings',
    'goToMenu',
    'openGameView'
]);

module.exports = AppStateActions;