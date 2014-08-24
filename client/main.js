var $ = require('jquery');

var socket = io.connect(window.location.hostname);
var alreadyConnected = false;

socket.on('connection', function (praises) {
    if (alreadyConnected) {
        return;
    }
    if (!praises || praises.length == 0) {
        $('#tweets').find('.tweet').text('No rocking behaviour to report!');
        return;
    }
    $('#tweets').text('');
    for (var i = praises.length - 1; i >= 0; --i) {
        if (praises[i]) {
            appendTweet(praises[i]);
        }
    }
    alreadyConnected = true;
});

socket.on('data', function (data) {
    appendTweet(data);
});

var tweetTemplate = require("../views/tweet.jade");
var appendTweet = function (data) {
    var tweet = $(tweetTemplate(data));
    tweet.find('.text').html(data.htmlText);
    tweet.find('.time').text(formatTweetDate(data.tweet));
    tweet.hide().prependTo($("#tweets")).slideDown('slow');
};

var formatTweetDate = function(tweet) {
    return (new Date(tweet.created_at)).toLocaleString();
};