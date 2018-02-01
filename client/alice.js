var express = require('express');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

http = require('http');
http.post = require('http-post');

x509 = require('x509');

const engine = require('./util/processor')

fs = require('fs');
path = require('path');
crypto = require('crypto');

var app = express();

app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());




app.get('/', engine.generatecert)



// If no route is matched by now, it must be a 404
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Start the server
app.set('port', process.env.PORT || 8000);


var server = app.listen(app.get('port'), function () {
    console.log('Express alice listening on port ' + server.address().port);
});