Parse.Cloud.afterSave("Turn", function (request) {
    var turn = request.object;
    _setTurnACL(turn, request.user);

    turn.save(null, {
        success: function (newTurn) {
        },
        error: function (obj, error) {
            console.error("afterSave Turn: " + error.message);
        },
        useMasterKey: true
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