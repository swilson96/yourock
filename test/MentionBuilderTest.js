var rewire = require('rewire');
var mentionBuilder = rewire("../src/MentionBuilder");

module.exports = {
    setUp: function (callback) {
        this.mockTwitter = {};
        mentionBuilder.__set__({
            "twitter": this.mockTwitter
        });
        callback();
    },
    testNoUsers: function (test) {
        this.mockTwitter.showUser = function () {
            test.ok(false, "Shouldn't query twitter for no users");
        };
        mentionBuilder.buildMentions([], function (users) {
            test.equal(0, users.length);
            test.done();
        });
    },
    testSingleUser: function (test) {
        this.mockTwitter.showUser = function (name, callback) {
            test.equal("thestarvis", name, "Who?");
            callback(null, { screen_name: name, profile_image_url: "url"});
        };
        mentionBuilder.buildMentions(
            [ {screen_name: "thestarvis"} ],
            function (users) {
                test.equal(1, users.length);
                test.equal("url", users[0].profile_image_url);
                test.done();
            });
    }
};