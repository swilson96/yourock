var twitter = require('../src/Twitter');
var tweetStore = require('../src/TweetStore');

var getUserData = function(username, callback) {
    tweetStore.recentPraiseFrom(username, function(err1, praise) {
        tweetStore.recentPraiseTo(username, function(err2, praised) {
            twitter.showUser(username, function (err3, users) {
                var user = users ? users[0] : undefined;
                if (user) {
                    user.praise = praise;
                    user.praised = praised;
                }
                var error = null;
                if (err1) {
                    error = err1 + '\n';
                }
                if (err2) {
                    error = error + err2 + '\n';
                }
                if (err3) {
                    error = error + err3;
                }
                callback(error, user);
            });
        });
    });
};

var format = function(res, user, err) {
    res.format({
        html: function(){
            res.render('profile', {user: user, error: err});
        },

        json: function(){
            res.send({user: user, error: err});
        }
    });
};

module.exports = {
    /*
     * GET user details page.
     */
    // TODO: unit test
    show: function (req, res) {
        var username = req.param("username");

        tweetStore.getUser(username, function(err, user) {
            if (!user) {
                getUserData(username, function(err, user) {
                    if (!user) {
                        res.status(404).send('No such user');
                        return;
                    }
                    user.followsYouRock = false;
                    format(res, user, err)
                });
            } else {
                user.followsYouRock = true;
                format(res, user, err)
            }
        });
    }
};
