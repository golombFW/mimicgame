var fs = require('fs');
var http = require('http');
var https = require('https');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var privateKey = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var indexPage = '/appindex.html';
var webcamswfUrl = '/webcam.swf';
var faviconUrl = '/favicon.ico';

app.set('port', (process.env.PORT || 3000));
app.use('/', express.static(path.join(__dirname, 'target/public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.all('/', function (req, res) {
    // Translating the signed_request parameter from POST to GET. This is not required for the FB JS SDK, but it helps detecting if you are inside a FB Canvas
    if (req.body && req.body['signed_request']) {
        res.redirect(indexPage + '?signed_request=' + req.body['signed_request']);
    }
    else {
        res.redirect(indexPage);
    }
});

app.get('/webcam.swf', function (req, res) {
    res.send(webcamswfUrl);
});

app.get('/favicon.ico', function (req, res) {
    res.send(faviconUrl);
});

app.use('/resources', express.static(path.join(__dirname, 'target/public/resources')));

//var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

//httpServer.listen(app.get('port'), function () {
//    console.log('Server HTTP started: http://localhost:' + app.get('port') + '/');
//});
httpsServer.listen(app.get('port') + 1, function () {
    console.log('Server HTTPS started: https://localhost:' + (app.get('port') + 1) + '/');
});
