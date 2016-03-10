Parse.Cloud.afterSave("Turn", function (request) {
    Parse.Cloud.useMasterKey();

    var turn = request.object;
    _setTurnACL(turn, Parse.User.current());

    turn.save(null, {
        success: function (newTurn) {
        },
        error: function (obj, error) {
            console.error("afterSave Turn: " + error.message);
        }
    });
});

//ACLs
var _setTurnACL = function (turn, user) {
    var newACL = new Parse.ACL();

    newACL.setPublicReadAccess(false);
    newACL.setPublicWriteAccess(false);
    //newACL.setReadAccess(user.id, true);
    //newACL.setWriteAccess(user.id, true);

    turn.setACL(newACL);
};