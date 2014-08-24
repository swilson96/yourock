"use strict"

var twitter = require('../src/Twitter');
var mentionBuilder = require('../src/MentionBuilder');
var tweetStore = require('../src/TweetStore');

var TwitterListener = function(sockets) {
    this.tag = '#yourock';
    this.sockets = sockets;

    this.start = function () {
        var listener = this;

        // If the client just connected, give them a bunch of recent praises
        this.sockets.sockets.on('connection', function (socket) {
            tweetStore.getRecentTweets(5, function(e, docs) {
                socket.emit('connection', docs);
            });
        });

        // Tell the twitter API to filter on the hashtag
        twitter.stream('statuses/filter', { track: [ this.tag ] }, function (stream) {

            // We have a connection. Now watch the 'data' event for incoming tweets.
            stream.on('data', function (tweet) {
                // Make sure it was a valid tweet
                if (listener.tweetIsValid(tweet)) {
                    var update = {};
                    update.tweet = tweet;

                    // Get the user mentions: these are the praisees.
                    mentionBuilder.buildMentions(tweet.entities.user_mentions, function (users) {
                        update.to = users;
                        listener.setHtmlString(update);

                        // TODO: notify event listeners instead of doing these things directly.
                        listener.sockets.sockets.emit('data', update);
                        tweetStore.storeTweet(update);
                    });
                }
            });
        });
    };

    this.tweetIsValid = function (tweet) {
        return tweet.text !== undefined
            && tweet.retweeted_status == undefined
            && tweet.text.indexOf('@') > 0
            && tweet.text.toLowerCase().indexOf(this.tag.toLowerCase()) !== -1;
    };

    this.setHtmlString = function(update) {
        var listener = this;
        var html = update.tweet.text;

        update.to.forEach(function(entry) {
            html = listener.replaceAll("@" + entry.screen_name,
                "<a href='http://www.twitter.com/" + entry.screen_name + "'>@" + entry.screen_name + "</a>",
                html);
        });

        if (update.tweet.entities.hashtags) {
            update.tweet.entities.hashtags.forEach(function(entry) {
                html = listener.replaceAll("#" + entry.text,
                    "<a href='http://www.twitter.com/search?q=%23" + entry.text + "&src=hash'>#" + entry.text + "</a>",
                html)
            });
        }
        if (update.tweet.entities.urls) {
            update.tweet.entities.urls.forEach(function(entry) {
                html = listener.replaceAll(entry.url,
                    "<a href='" + entry.url + "'>" + entry.display_url + "</a>",
                    html)
            });
        }
        if (update.tweet.entities.symbols) {
            update.tweet.entities.symbols.forEach(function(entry) {
                html = listener.replaceAll("\\$" + entry.text,
                    "<a href='http://www.twitter.com/search?q=%24" + entry.text + "&src=ctag'>\$" + entry.text + "</a>",
                    html)
            });
        }
        if (update.tweet.entities.media) {
            update.tweet.entities.media.forEach(function(entry) {
                html = listener.replaceAll(entry.url,
                    "<a href='" + entry.url + "'>" + entry.display_url + "</a>",
                html)
            });
        }

        update.htmlText = html;
    };

    this.replaceAll = function (find, replace, str) {
        return str.replace(new RegExp(find, 'g'), replace);
    };
};

 module.exports = {
    start: function (sockets) {
        var listener = new TwitterListener(sockets);
        listener.start();
    }
};