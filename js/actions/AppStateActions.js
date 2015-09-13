var Reflux = require('reflux');

var AppStateActions = Reflux.createActions([
    'changeState',
    'openUserSettings',
    'closeUserSettings',
    'goToMenu'
]);

module.exports = AppStateActions;