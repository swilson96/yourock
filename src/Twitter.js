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
            callback(null, (result && result.length > 0) ? result[0] : null);
        } else {
            callback(null, result);
        }
    }
};
var TwitterProxy = function(populatedNodeTwitter) {
    this.ntwitter = populatedNodeTwitter;

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
        self.ntwitter.stream(filter, object, callback);
    };

    this.showUserById = function(id, callback) {
        self.ntwitter.showUser({user_id: id}, showUserCallback(callback));
    };

    this.showUserByScreenName = function(id, callback) {
        self.ntwitter.showUser({screen_name: id}, showUserCallback(callback));
    };

    this.getFollowersIds = function(id, callback) {
        self.ntwitter.getFollowersIds(id, wrapCallbackForNewApi(callback));
    };

    this.createFavorite = function(id, callback) {
        if (!callback) {
            callback = function(json, response) {
                console.log("Create fave response for " + id + ", error/json: " + json + " response: " + response);
            };
        }
        self.ntwitter.createFavorite({id: id}, wrapCallbackForNewApi(callback));
    };
};


// For running in test (dev) mode without twitter, e.g. offline
// TODO: Move this, shouldn't mix test/mocking code with production code
var MockTwitter = function() {

    var mock = this;

    this.theStarvisMockId = 222

    this.stream = function(filter, object, callback) {
        callback({ on: function(name, onTweet) {/* onTweet(tweet) is the callback for when a tweet arrives. */}});
    };

    this.showUser = function(criteria, callback) {
        if (criteria.id == mock.theStarvisMockId || criteria.screen_name.toLowerCase() == "thestarvis") {
            callback(null, {screen_name: "thestarvis", id: mock.theStarvisMockId});
        } else {
            callback(null, {});
        }
    };

    this.getFollowersIds = function(id, callback) {
        callback(null, [mock.theStarvisMockId]);
    };

    this.createFavorite = function(criteria, callback) {
        callback();
    };
};

// TODO: Externalise this environment config decision, i.e. put it somewhere more appropriate.
// Can we use Require() to inject different implementations according to the context?
module.exports = process.env.YOUROCK_TESTMODE
    ? new TwitterProxy(new MockTwitter())
    : new TwitterProxy(new ntwitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    }));