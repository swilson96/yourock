"use strict";
var tweetStore = require('../src/TweetStore');
var favourites = require('../src/Favourites');

module.exports = {
    hookUp: function(listener, sockets) {
        sockets.sockets.on('connection', function (socket) {
            tweetStore.getRecentTweets(5, function(e, docs) {
                socket.emit('connection', docs);
            });
        });
        
        listener.on("newTweet", function(update) {
            sockets.sockets.emit('data', update);
            tweetStore.storeTweet(update);
            favourites.tweet(update);
        });
     }
};