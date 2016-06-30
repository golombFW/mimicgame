// These two lines are required to initialize Express in Cloud Code.
express = require('express');
app = express();

var indexPage = '/appindex.html';
var faviconUrl = '/favicon.ico';

// Global app configuration section
app.use(express.bodyParser());    // Middleware for reading request body

// This is an example of hooking up a request handler with a specific request
// path and HTTP verb using the Express routing API.
app.get('/hello', function (req, res) {
    res.render('hello', {message: 'Congrats, you just set up your app!'});
});

app.all('/', function (req, res) {
    // Translating the signed_request parameter from POST to GET. This is not required for the FB JS SDK, but it helps detecting if you are inside a FB Canvas
    if (req.body && req.body['signed_request']) {
        res.redirect(indexPage + '?signed_request=' + req.body['signed_request']);
    }
    else {
        res.redirect(indexPage);
    }
});

app.get('/favicon.ico', function (req, res) {
    res.send(faviconUrl);
});

app.listen();