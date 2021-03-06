require('dotenv').config({path: './config.env'});
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var fs = require('fs');
var https = require('https');
var path = require('path');
var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var S3Adapter = require('parse-server').S3Adapter;
var bodyParser = require('body-parser');
var mimicAddons = require('./target/cloud/app.js');

var privateKey = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var allowInsecureHTTP = false;

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
    cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/target/cloud/main.js',
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

var dashboard = new ParseDashboard({
    // Parse Dashboard settings
    "apps": [
        {
            "serverURL": serverUrl,
            "appId": appId,
            "masterKey": masterKey,
            "appName": "mimicgame"
        }
    ]
}, allowInsecureHTTP);

var app = express();
app.set('port', (process.env.PORT || 1337));
app.use('/', express.static(path.join(__dirname, 'target/public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
mimicAddons.initializeFunctions(app);

var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

app.use('/dashboard', dashboard);

var httpsServer = https.createServer(credentials, app);
httpsServer.listen(app.get('port'), function () {
    console.log('Server HTTPS started: https://localhost:' + (app.get('port')) + '/');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpsServer);