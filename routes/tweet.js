var listener = require('../src/TwitterListener');

module.exports = {
    /*
     * Sends a fake tweet for testing.
     */
    index: function (req, res) {
        if (process.env.YOUROCK_TESTMODE) {
            var tweet = {
                text: "hey @theStarvis, here's a #YouRock fake tweet",
                user: {screen_name: "thestarvis"},
                entities: {
                    user_mentions: {screen_name: "thestarvis"}
                },
                created_at: new Date()
            };

            listener.onTweet(tweet);

            res.status(201).send("Fake tweet sent");
        } else {
            res.status(403).send("Nope, sorry");
        }
    }
};
