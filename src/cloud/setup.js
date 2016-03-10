var _emotionClassName = "Emotion";

var emotions = ["strach", "radość", "wstręt", "złość", "smutek", "zdziwienie"];

Parse.Cloud.job("createEmotionList", function (request, status) {
    Parse.Cloud.useMasterKey();
    var _emotionClass = Parse.Object.extend(_emotionClassName);
    var emotionQuery = new Parse.Query(_emotionClass);
    emotionQuery.count().then(function (count) {
        if (0 >= count) {
            for (var i = 0; i < emotions.length; i += 1) {
                var emotion = new _emotionClass();
                emotion.set("name", emotions[i]);
                emotion.setACL(setupACLs());
                emotion.save();
            }
        } else {
            console.error("Emotion table is not clear! Delete all records manual before running \"createEmotionList\"");
        }
    }, function (error) {
        console.error(error.message);
    })
});

//Common functions
var setupACLs = function () {
    var newACL = new Parse.ACL();

    newACL.setPublicReadAccess(false);
    newACL.setPublicWriteAccess(false);

    return newACL;
};