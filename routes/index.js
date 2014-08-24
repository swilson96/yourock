var twitter = require('../src/Twitter');
var mentionBuilder = require('../src/MentionBuilder');

module.exports = {
    /*
     * GET home page.
     */
    index: function (req, res) {
        twitter.getUsers(function(err, ids) {
            if (err) {
                res.render('index', {users: [], error: err});
            }
            if (!ids) {
                ids = [];
            }

            // Slight abuse of the mention builder, it calls twitter with what it thinks is the screen name,
            // but which could equally be the user ID
            var users = ids.map(function(id){ return {screen_name: id};});
            mentionBuilder.buildMentions(users, function (followers) {
                var model = { users: followers };
                res.render('index', model);
            });
        });
    }
};
