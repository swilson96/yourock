require('newrelic');

var express = require('express');
var http = require('http');
var path = require('path');
var io = require('socket.io');

var twitterListener = require('./src/TwitterListener');

var routes = require('./routes/index');
var profile = require('./routes/profile');

var app = express();

// Create the HTTP server with the Express app as an argument
var server = http.createServer(app);

// All environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// Development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

// Routing
app.get('/', routes.index);
app.get('/:username', profile.show);

// Tear down DB connections on exit
var tweetStore = require('./src/TweetStore');
process.on('exit', function() {
    tweetStore.close();
});

// Start a Socket.IO to listen
var sockets = io.listen(server);

// Set the sockets.io configuration.
// THIS IS NECESSARY ONLY FOR HEROKU!
sockets.configure(function () {
    sockets.set('transports', ['xhr-polling']);
    sockets.set('polling duration', 10);
});

twitterListener.start(sockets);

// Thunderbirds are go
server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

