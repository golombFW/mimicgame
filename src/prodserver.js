var fs = require('fs');
var path = require('path');
var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var S3Adapter = require('parse-server').S3Adapter;
var bodyParser = require('body-parser');
var mimicAddons = require('./cloud/app.js');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
    console.log('DATABASE_URI not specified, falling back to localhost.');
}

var appId = process.env.APP_ID || 'tMWQH7ybkZBT5eRTm60nYpeEGJMFfN4gM8Q2Enra';
var masterKey = process.env.MASTER_KEY || 'Your Parse Master Key';
var serverUrl = process.env.SERVER_URL || 'https://localhost:1337/parse';
databaseUri = databaseUri || 'mongodb://localhost:27017/dev';
var awsKeyId = process.env.AWS_ACCESS_KEY_ID || "Your AWS access key id";
var awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY || "Your AWS secret key";
var awsBucketName = process.env.AWS_BUCKET_NAME || "mimicgame";
var awsRegion = process.env.AWS_REGION || 'eu-central-1';

var api = new ParseServer({
    databaseURI: databaseUri,
    cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
    appId: appId,
    masterKey: masterKey,
    serverURL: serverUrl,
    liveQuery: {
        classNames: [] // List of classes to support for query subscriptions
    },
    filesAdapter: new S3Adapter(
        awsKeyId,
        awsSecretKey,
        awsBucketName,
        {
            directAccess: true,
            region: awsRegion
        }
    )
});

var app = express();
app.use('/', express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
mimicAddons.initializeFunctions(app);

var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

var port = process.env.PORT || 1337;
var httpsServer = app.listen(port, function () {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpsServer);