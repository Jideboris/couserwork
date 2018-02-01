
var express = require('express');
var compression = require('compression');
var http = require('http');
var https = require('https');
var fs = require('fs');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const path = require('path');

const processor = require('./routes/processor');


var app = express();

app.use(compression());
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());


app.use(express.static(path.join(__dirname, 'public')))

app.get('/', processor.generatecert)


// If no route is matched by now, it must be a 404
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404;
  next(err);
})

app.set('port', process.env.PORT || 9000);


var server = app.listen(app.get('port'), function () {
  console.log('Express Trent listening on port ' + server.address().port);
});