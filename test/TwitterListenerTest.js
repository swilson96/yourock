var rewire = require('rewire');
var TwitterListener = rewire('../src/TwitterListener');
var twitterListener;

var tweet = {};
var stream = {};

module.exports = {
    setUp: function (callback) {
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

        this.mockMentionBuilder = {};
        this.mockMentionBuilder.buildMentions = function (mentions, buildCallback) {
            buildCallback([
                { profile_image_url: "url", screen_name: "someone"}
            ]);
        };

        TwitterListener.__set__({
            'twitter': this.mockTwitter,
            'mentionBuilder': this.mockMentionBuilder
        });

        twitterListener = new TwitterListener();

        callback();
    },
    streamIsSetUpCorrectly: function (test) {
        this.mockTwitter.stream = function (type, data, callback) {
            test.equal(1, data.track.length);
            test.equal("#yourock", data.track[0].toLowerCase());
            test.equal("statuses/filter", type);
            test.done();
        };

        twitterListener.start();
    },
    retweetsAreInvalid: function (test) {
        //tweet.retweeted_status = true;

        twitterListener.on("newTweet", function (tweet) {
            test.ok(false, "Should not emit a retweet");
        });

        twitterListener.start();
        test.done();
    },
    directMessagesAreInvalid: function (test) {
        tweet.text = "@theStarvis, what's up #yourock";

        twitterListener.on("newTweet", function (tweet) {
            test.ok(false, "Should not emit a direct message");
        });

        twitterListener.start();
        test.done();
    },
    praisesToNoOneAreInvalid: function (test) {
        tweet = {text: "hahahha #yourock", entities: {user_mentions: []} };

        twitterListener.on("newTweet", function (tweet) {
            test.ok(false, "Should not emit a praise to noone");
        });

        twitterListener.start();
        test.done();
    },
    tweetsContainAllTheRightStuff: function (test) {
        twitterListener.on("newTweet", function (data) {
            test.equal(tweet.text, data.tweet.text);
            test.done();
        });

        twitterListener.start();
    },
    htmlTextLinksMentions: function (test) {
        twitterListener.on("newTweet", function (tweet) {
            console.log(tweet.htmlText);
            test.notEqual(-1, tweet.htmlText.indexOf("@someone"));
            test.notEqual(-1, tweet.htmlText.indexOf("<a href="));
            test.notEqual(-1, tweet.htmlText.indexOf("twitter.com/someone"));
            test.done();
        });

        twitterListener.start();
    },
    htmlTextLinksHashtags: function (test) {
        twitterListener.on("newTweet", function (data) {
            console.log(data.htmlText);
            test.notEqual(-1, data.htmlText.indexOf("#yourock"));
            test.notEqual(-1, data.htmlText.indexOf("#yolo"));
            test.notEqual(-1, data.htmlText.indexOf("twitter.com/search?q=%23yolo&src=hash"));
            test.done();
        });

        twitterListener.start();
    },
    htmlTextContainsHyperLinks: function (test) {
        twitterListener.on("newTweet", function (data) {
            console.log(data.htmlText);
            test.notEqual(-1, data.htmlText.indexOf(">a.b.com/url<"));
            test.notEqual(-1, data.htmlText.indexOf("http://t.co/123"));
            test.done();
        });

        twitterListener.start();
    },
    htmlTextContainsMediaLinks: function (test) {
        tweet.entities.urls = [];
        tweet.entities.media = [{url: "http://t.co/123", display_url: "pic.mockTwitter.com/what"}];
        twitterListener.on("newTweet", function (data) {
            console.log(data.htmlText);
            test.equal(-1, data.htmlText.indexOf("a.b.com/url"));
            test.notEqual(-1, data.htmlText.indexOf(">pic.mockTwitter.com/what<"));
            test.notEqual(-1, data.htmlText.indexOf("http://t.co/123"));
            test.done();
        });

        twitterListener.start();
    },
    htmlTextContainsSymbols: function (test) {
        tweet.text = tweet.text.replace("#yolo", "$GOOG");
        tweet.entities.hashtags = [];
        tweet.entities.symbols = [ { text: "GOOG" } ];
        twitterListener.on("newTweet", function (data) {
            console.log(data.htmlText);
            test.notEqual(-1, data.htmlText.indexOf(">$GOOG<"));
            test.notEqual(-1, data.htmlText.indexOf("twitter.com/search?q=%24GOOG&src=ctag"));
            test.done();
        });

        twitterListener.start();
    },
    entitiesCanBeUndefined: function (test) {
        tweet.entities.urls = undefined;
        tweet.entities.hashtags = undefined;
        tweet.entities.mentions = undefined;
        tweet.entities.media = undefined;
        tweet.entities.symbols = undefined;
        twitterListener.on("newTweet", function (data) {
            test.notEqual(-1, data.htmlText.indexOf("#yourock"));
            test.done();
        });

        twitterListener.start();
    }, 
    htmlTextLinksDuplicateMentions: function (test) {
        tweet.text = "hahahha @someone #yourock yeah yeah yeah @someone yeah";
        tweet.entities.user_mentions = [
            { screen_name: "someone" },
            { screen_name: "someone" }
        ];

        twitterListener.on("newTweet", function (data) {
            console.log(data.htmlText);
            test.equal(2, data.htmlText.match(/@someone/g).length);
            test.equal(3, data.htmlText.match(/<a href=/g).length);
            test.equal(2, data.htmlText.match(/twitter.com\/someone/g).length);
            test.done();
        });

        twitterListener.start();
    }
};