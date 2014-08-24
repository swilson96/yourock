var rewire = require('rewire');
var twitterListener = rewire('../src/TwitterListener');

var tweet = {};
var sockets = {};
var stream = {};

module.exports = {
    setUp: function (callback) {
        this.mockTweetStore = {};
        this.mockTweetStore.getRecentTweets = function(limit, callback) { callback(null, []) };
        this.mockTweetStore.storeTweet = function(tweet) {};

        tweet = {
            text: "hahahha @someone #yourock http://t.co/123 #yolo",
            entities: {
                user_mentions: [ { screen_name: "someone" } ],
                hashtags: [ { text: "yourock" }, { text: "yolo" } ],
                urls: [ {
                    display_url: "a.b.com/url",
                    extended_url: "http://a.b.com/url",
                    url: "http://t.co/123"
                } ],
                symbols: [],
                media: []
            }
        };

        this.mockTwitter = {};
        this.mockTwitter.stream = function (type, data, streamCallback) {
            streamCallback(stream);
        };
        stream.on = function (data, streamCallback) {
            streamCallback(tweet);
        };

        sockets.sockets = {};
        sockets.sockets.on = function () {
        };
        sockets.sockets.emit = function () {
        };

        this.mockMentionBuilder = {};
        this.mockMentionBuilder.buildMentions = function (mentions, buildCallback) {
            buildCallback([
                { profile_image_url: "url", screen_name: "someone"}
            ]);
        };

        twitterListener.__set__({
            'twitter': this.mockTwitter,
            'mentionBuilder': this.mockMentionBuilder,
            'tweetStore': this.mockTweetStore
        });

        callback();
    },
    streamIsSetUpCorrectly: function (test) {
        this.mockTwitter.stream = function (type, data, callback) {
            test.equal(1, data.track.length);
            test.equal("#yourock", data.track[0].toLowerCase());
            test.equal("statuses/filter", type);
            test.done();
        };

        twitterListener.start(sockets);
    },
    retweetsAreInvalid: function (test) {
        tweet = { text: "hey s/o to @theStarvis, what's up #yourock" };
        tweet.retweeted_status = true;

        sockets.sockets.emit = function () {
            test.ok(false, "Should not emit a direct message");
        };

        twitterListener.start(sockets);
        test.done();
    },
    directMessagesAreInvalid: function (test) {
        tweet = { text: "@theStarvis, what's up #yourock" };

        sockets.sockets.emit = function () {
            test.ok(false, "Should not emit a direct message");
        };

        twitterListener.start(sockets);
        test.done();
    },
    praisesToNoOneAreInvalid: function (test) {
        tweet = {text: "hahahha #yourock", entities: {user_mentions: []} };

        sockets.sockets.emit = function () {
            test.ok(false, "Should not emit a praise to noone");
        };

        twitterListener.start(sockets);
        test.done();
    },
    tweetsContainAllTheRightStuff: function (test) {
        sockets.sockets.emit = function (type, data) {
            test.equal("data", type);
            test.equal(tweet.text, data.tweet.text);
            test.done();
        };

        twitterListener.start(sockets);
    },
    htmlTextLinksMentions: function (test) {
        sockets.sockets.emit = function (type, data) {
            console.log(data.htmlText);
            test.notEqual(-1, data.htmlText.indexOf("@someone"));
            test.notEqual(-1, data.htmlText.indexOf("<a href="));
            test.notEqual(-1, data.htmlText.indexOf("twitter.com/someone"));
            test.done();
        };

        twitterListener.start(sockets);
    },
    htmlTextLinksHashtags: function (test) {
        sockets.sockets.emit = function (type, data) {
            console.log(data.htmlText);
            test.notEqual(-1, data.htmlText.indexOf("#yourock"));
            test.notEqual(-1, data.htmlText.indexOf("#yolo"));
            test.notEqual(-1, data.htmlText.indexOf("twitter.com/search?q=%23yolo&src=hash"));
            test.done();
        };

        twitterListener.start(sockets);
    },
    htmlTextContainsHyperLinks: function (test) {
        sockets.sockets.emit = function (type, data) {
            console.log(data.htmlText);
            test.notEqual(-1, data.htmlText.indexOf(">a.b.com/url<"));
            test.notEqual(-1, data.htmlText.indexOf("http://t.co/123"));
            test.done();
        };

        twitterListener.start(sockets);
    },
    htmlTextContainsMediaLinks: function (test) {
        tweet.entities.urls = [];
        tweet.entities.media = [{url: "http://t.co/123", display_url: "pic.mockTwitter.com/what"}];
        sockets.sockets.emit = function (type, data) {
            console.log(data.htmlText);
            test.equal(-1, data.htmlText.indexOf("a.b.com/url"));
            test.notEqual(-1, data.htmlText.indexOf(">pic.mockTwitter.com/what<"));
            test.notEqual(-1, data.htmlText.indexOf("http://t.co/123"));
            test.done();
        };

        twitterListener.start(sockets);
    },
    htmlTextContainsSymbols: function (test) {
        tweet.text = tweet.text.replace("#yolo", "$GOOG");
        tweet.entities.hashtags = [];
        tweet.entities.symbols = [ { text: "GOOG" } ];
        sockets.sockets.emit = function (type, data) {
            console.log(data.htmlText);
            test.notEqual(-1, data.htmlText.indexOf(">$GOOG<"));
            test.notEqual(-1, data.htmlText.indexOf("twitter.com/search?q=%24GOOG&src=ctag"));
            test.done();
        };

        twitterListener.start(sockets);
    },
    entitiesCanBeUndefined: function (test) {
        tweet.entities.urls = undefined;
        tweet.entities.hashtags = undefined;
        tweet.entities.mentions = undefined;
        tweet.entities.media = undefined;
        tweet.entities.symbols = undefined;
        sockets.sockets.emit = function (type, data) {
            test.notEqual(-1, data.htmlText.indexOf("#yourock"));
            test.done();
        };

        twitterListener.start(sockets);
    },
    htmlTextLinksDuplicateMentions: function (test) {
        tweet.text = "hahahha @someone #yourock yeah yeah yeah @someone yeah";
        tweet.entities.user_mentions = [
            { screen_name: "someone" },
            { screen_name: "someone" }
        ];

        sockets.sockets.emit = function (type, data) {
            console.log(data.htmlText);
            test.equal(2, data.htmlText.match(/@someone/g).length);
            test.equal(3, data.htmlText.match(/<a href=/g).length);
            test.equal(2, data.htmlText.match(/twitter.com\/someone/g).length);
            test.done();
        };

        twitterListener.start(sockets);
    }
};