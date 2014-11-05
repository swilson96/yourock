var twitter = require('../src/Twitter');
var tweetStore = require('../src/TweetStore');

var getUserData = function(username, callback) {
    tweetStore.recentPraiseFrom(username, function(err1, praise) {
        tweetStore.recentPraiseTo(username, function(err2, praised) {
            twitter.showUser(username, function (err3, user) {
                if (user) {
                    user.praise = praise;
                    user.praised = praised;
                    user.praiseCount = praise.length;
                    user.praisedCount = praised.length;
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

var formatResponse = function(res, user, err) {
    var model = {user: user, error: err};

    res.format({
        html: function(){
            res.render('profile', model);
        },

        json: function(){
            res.send(model);
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
                    formatResponse(res, user, err)
                });
            } else {
                console.log('returning user from DB with praiseCount ' + user.praiseCount);
                user.followsYouRock = true;
                formatResponse(res, user, err)
            }
        });
    }
};
