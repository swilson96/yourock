var tweetStore = require('../src/TweetStore');

module.exports = {
    /*
     * GET home page.
     */
    index: function (req, res) {
        tweetStore.getTopPraised(5, function(err, praised) {
            tweetStore.getTopPraisers(5, function(err, praisers) {
                res.render('index', {users: [], topPraisers: praisers, topPraised: praised, error: err});
            });
        });
    }
};
