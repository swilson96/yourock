"use strict";

var monk = require('monk');
var _ = require('lodash-node');
var twitter = require('../src/Twitter');

var dbHolder;
var db = function() {
    if (!dbHolder) {
        dbHolder = monk(process.env.MONGOLAB_URI);
    }
    return dbHolder;
};

var decorateUser = function(user, callback) {
    db().get('tweets').count({"tweet.user.screen_name": user.screen_name }, function(err, count) {
        user.praiseCount = count;
        db().get('tweets').count({"tweet.entities.user_mentions.screen_name": user.screen_name}, function(err, count) {
            user.praisedCount = count;
            callback(user);
        });
    });
};

var getDecoratedUser = function(id, callback) {
    twitter.showUser(id, function(err, user) {
        decorateUser(user, callback);
    });
};

var getAllUsers = function(callback) {
    db().get('users').find({}, {}, function(err, docs) {
        if (err) {
            console.error("[DB READ ERROR: USERS]" + err);
        }
        callback(err, docs);
    })
};

module.exports = {
    storeTweet: function(tweet, callback) {
        db().get('tweets').insert(tweet, function(err) {
            if (err) {
                console.error("[DB WRITE ERROR] " + err);
            }
            if (callback) {
                callback(err);
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

    getTopPraisers: function(limit, callback) {
        db().get('users').find({}, {limit: limit, sort: { praise : -1 }}, function(err, docs) {
            if (err) {
                console.error("[DB READ ERROR: TOP PRAISERS] " + err);
            }
            callback(err, docs);
        });
    },
    getTopPraised: function(limit, callback) {
        db().get('users').find({}, {limit: limit, sort: { praised : -1 }}, function(err, docs) {
            if (err) {
                console.error("[DB READ ERROR: TOP PRAISED] " + err);
            }
            callback(err, docs);
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

    getAllUsers: getAllUsers,
    getUser: function(username, callback) {
        db().get('users').find({"screen_name": username}, {}, function(err, user) {
            if (err) {
                console.error("[DB READ ERROR: USER BY USERNAME " +  username + "]" + err);
            }
            callback(err, user[0]);
        })
    },
    refreshUsers: function(callback) {
        twitter.getUsers(function(err, twitterIds) {
            getAllUsers(function(err, oldUsers) {
                oldUsers.forEach(function(oldUser) {
                    var match = _.find(twitterIds, function(id) { return id === oldUser.id});
                    if (match) {
                        _.remove(twitterIds, function(id) { return id === match});
                        getDecoratedUser(match, function(decorated) {
                            db().get('users').update({id: decorated.id}, decorated);
                        })
                    } else {
                        console.log(oldUser.screen_name + " has left us!");
                        db().get('users').remove({id: oldUser.id}, { justOne: true });
                    }
                });

                twitterIds.forEach(function(id) {
                    getDecoratedUser(id, function(decorated) {
                        console.log(decorated.screen_name + " has joined our mighty army");
                        db().get('users').insert(decorated);
                    });
                });

                console.log("Users have been refreshed.");
                if (callback) {
                    callback();
                }
            });
        });
    },

    close: function() {
        db().close();
    }
};