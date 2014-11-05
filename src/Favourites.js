"use strict";
var twitter = require('../src/Twitter');

var shouldFavoriteThisTweet = function(tweet) {
    return tweet.user.screen_name === 'thestarvis' || tweet.user.screen_name === 'SiAndLucyInNZ';
};

module.exports = {
    tweet: function(update) {
        if (shouldFavoriteThisTweet(update.tweet)) {
            twitter.createFavorite(update.tweet.id);
            console.log("Favoriting tweet " + update.tweet.id + " from user " + update.tweet.user.screen_name);
        } else {
            console.log("Not favoriting tweet " + update.tweet.id + " from user " + update.tweet.user.screen_name);
        }
     }
};