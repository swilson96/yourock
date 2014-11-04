"use strict"

var twitter = require('../src/Twitter');

var MentionBuilder = function(mentions, callback) {
    this.yourockName = 'YouRockSite';
    this.mentions = mentions;
    this.callback = callback;
    this.mentionIndex = 0;
    this.detailedMentions = [];
    this.haveExcludedYouRockAlready = false;

    this.addMentionDetails = function () {
        this.addMentionChain();
    };

    this.addMentionChain = function () {
        var self = this;
        var mention = this.mentions[this.mentionIndex];
        if (mention) {
            if (this.includeMention(mention)) {
                twitter.showUser(this.mentions[this.mentionIndex].screen_name, function (err, user) {
                    self.userFromTwitter(err, user);
                });
            } else {
                this.mentionIndex++;
                this.addMentionChain();
            }
        } else {
            this.callback(this.detailedMentions);
        }
    };

    this.userFromTwitter = function (err, user) {
        if (err) {
            console.log(err);
        }
        this.detailedMentions.push(user);
        this.mentionIndex++;
        this.addMentionChain();
    };

    this.includeMention = function (mention) {
        if (!mention) {
            return false;
        }
        if (mention.screen_name != this.yourockName || this.haveExcludedYouRockAlready) {
            return true;
        }
        this.haveExcludedYouRockAlready = true;
        return false;
    };
};

module.exports = {
    buildMentions: function (mentions, callback) {
        var builder = new MentionBuilder(mentions, callback);
        builder.addMentionDetails();
    }
};
