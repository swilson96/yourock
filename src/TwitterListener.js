"use strict";
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var twitter = require('../src/Twitter');
var mentionBuilder = require('../src/MentionBuilder');

var TwitterListener = function() {
    EventEmitter.call(this);
    
    this.tag = '#yourock';

    var listener = this;

    this.start = function () {
        // Tell the twitter API to filter on the hashtag
        twitter.stream('statuses/filter', { track: [ this.tag ] }, function (stream) {

            // We have a connection. Now watch the 'data' event for incoming tweets.
            stream.on('data', listener.onTweet);
        });
    };

    this.onTweet = function (tweet) {
        // Make sure it was a valid tweet
        if (listener.tweetIsValid(tweet)) {
            var update = {};
            update.tweet = tweet;

            // Get the user mentions: these are the praisees.
            mentionBuilder.buildMentions(tweet.entities.user_mentions, function (users) {
                update.to = users;
                listener.setHtmlString(update);
                listener.emit('newTweet', update);
            });
        }
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

util.inherits(TwitterListener, EventEmitter);

// One single instance, so that we know we are always using the one that's hooked up to twitter.
var instance = null;

module.exports = {
    getInstance: function() {
        if (!instance) {
            instance = new TwitterListener();
        }
        return instance;
    }
};