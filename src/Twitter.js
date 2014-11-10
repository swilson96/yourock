"use strict";

var ntwitter = require("twitter");

var wrapCallbackForNewApi = function(callback) {
    return function (result) {
        console.log("result: " + result);
        if (Array.isArray(result)) {
            callback(null, result);
        } else {
            callback(result);
        }
    };
};

var showUserCallback = function(callback) {
    return function(result) {
        if (Array.isArray(result)) {
            if (result && result.length > 1) {
                console.error("Weird! More than one user with username/id " + id);
            }
            callback(null, (users && users.length > 0) ? users[0] : null);
        } else {
            callback(null, result);
        }
    }
};

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
            self.ntwitter.getFollowersIds("yourocksite", wrapCallbackForNewApi(function(err, ids) {
                self.users = ids;
                setInterval(refreshUsers, 2 * 60 * 1000);
                callback(err, ids);
            }));
        } else {
            callback(null, self.users);
        }
    };

    this.stream = function(filter, object, callback) {
        this.ntwitter.stream(filter, object, callback);
    };
    
    this.showUserById = function(id, callback) {
        this.ntwitter.showUser({user_id: id}, showUserCallback(callback));
    };

    this.showUserByScreenName = function(id, callback) {
        this.ntwitter.showUser({screen_name: id}, showUserCallback(callback));
    };
    
    this.getFollowersIds = function(id, callback) {
        this.ntwitter.getFollowersIds(id, wrapCallbackForNewApi(callback));
    };
    
    this.createFavorite = function(id, callback) {
        if (!callback) {
            callback = function(json, response) {
                console.log("Create fave response for " + id + ", error/json: " + json + " response: " + response);
            };
        }
        this.ntwitter.createFavorite({id: id}, wrapCallbackForNewApi(callback));
    };
};

module.exports = new TwitterProxy(new ntwitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
}));