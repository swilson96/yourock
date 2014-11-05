var tweetStore = require('../src/TweetStore');
var mentionBuilder = require('../src/MentionBuilder');

module.exports = {
    /*
     * GET home page.
     */
    index: function (req, res) {
        tweetStore.getAllUsers(function(err, users) {
            if (!users) {
                users = [];
            }

            res.render('index', {users: users, error: err});
        });
    }
};
