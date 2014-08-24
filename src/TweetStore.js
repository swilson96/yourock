var monk = require('monk');
var twitter = require('../src/Twitter');

var dbHolder;
var db = function() {
    if (!dbHolder) {
        dbHolder = monk(process.env.MONGOLAB_URI);
    }
    return dbHolder;
};

module.exports = {
    storeTweet: function(tweet) {
        db().get('tweets').insert(tweet, function(err) {
            if (err) {
                console.error("[DB WRITE ERROR] " + err);
            }
        });
    },
    getRecentUserTweets: function(limit, callback) {
        twitter.getUsers(function(err, ids) {
            if (err) {
                console.error("[DB READ ERROR: GETTING USERS FROM TWITTER] " + err);
                callback(err);
            }
            if (!ids) {
                ids = [];
            }
            db().get('tweets').find({"tweet.user.id": {$in: ids}}, {limit: limit, sort: { _id : -1 }}, function(err, docs) {
                if (err) {
                    console.error("[DB READ ERROR: RECENT USER TWEETS] " + err);
                }
                callback(err, docs);
            });
        });
    },
    getRecentTweets: function(limit, callback) {
        db().get('tweets').find({}, { limit: limit, sort: { _id : -1 }}, function(err, docs) {
            if (err) {
                console.error("[DB READ ERROR: RECENT TWEETS] " + err);
            }
            callback(err, docs);
        });
    },
    recentPraiseFrom: function(username, callback) {
        db().get('tweets').find({"tweet.user.screen_name": username}, {sort: { _id : -1 }}, function(err, docs) {
            if (err) {
                console.error("[DB READ ERROR: RECENT PRAISE FROM " + username + "] " + err);
            }
            callback(err, docs);
        });
    },
    recentPraiseTo: function(username, callback) {
        db().get('tweets').find({"tweet.entities.user_mentions.screen_name": username}, {sort: { _id : -1 }}, function(err, docs) {
            if (err) {
                console.error("[DB READ ERROR: RECENT PRAISE TO " + username + "] " + err);
            }
            callback(err, docs);
        });
    },
    close: function() {
        db().close();
    }
};