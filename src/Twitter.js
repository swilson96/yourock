"use strict"

var ntwitter = require("ntwitter");

var TwitterProxy = function(populatedNodeTwitter) {
    this.ntwitter = populatedNodeTwitter;
    this.users;

    var self = this;

    var refreshUsers = function() {
        self.ntwitter.getFollowersIds("yourocksite", function(err, ids) {
            if (!err) {
                self.users = ids;
            } else {
                console.error("[TWITTER ERROR: couldn't refresh users]");
            }
        });
    };

    this.getUsers = function(callback) {
        if(!self.users) {
            self.ntwitter.getFollowersIds("yourocksite", function(err, ids) {
                self.users = ids;
                setInterval(refreshUsers, 2 * 60 * 1000);
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
        this.ntwitter.showUser(id, function(err, users) {
            if (users.length > 1) {
                console.error("Weird! More than one user with username/id " + id);
            }
            callback(err, users[0]);
        });
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