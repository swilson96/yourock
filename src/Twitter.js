"use strict"

var ntwitter = require("ntwitter");

var TwitterProxy = function(populatedNodeTwitter) {
    this.ntwitter = populatedNodeTwitter;
    this.users;

    var self = this;

    this.getUsers = function(callback) {
        if(!self.users) {
            self.ntwitter.getFollowersIds("yourocksite", function(err, ids) {
                self.users = ids;
                setInterval(function() {
                    self.ntwitter.getFollowersIds("yourocksite", function(err, ids) {
                        if (!err) {
                            self.users = ids;
                        } else {
                            console.error("[TWITTER ERROR: couldn't refresh users]");
                        }
                    });
                }, 2 * 60 * 1000);

                callback(err, ids);
            });
        } else {
            callback(null, self.users);
        }
    };

    this.stream = function(filter, object, callback) {
        this.ntwitter.stream(filter, object, callback);
    };
    this.showUser = function(id, callback) {
        this.ntwitter.showUser(id, callback);
    };
    this.getFollowersIds = function(id, callback) {
        this.ntwitter.getFollowersIds(id, callback);
    };
};

module.exports = new TwitterProxy(new ntwitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
}));