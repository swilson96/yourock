"use strict";
var $ = require('jquery');
var tweetTemplate = require("../views/tweet.jade");

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

    $('button#close-toast').click(function() {
        $('#toast').toggle('slide');
    });
});

socket.on('data', function (data) {
    toast(data);
    appendTweet(data);
    removeOldestTweet();
});

var appendTweet = function (data) {
    var tweet = $(tweetTemplate(data));
    tweet.find('.text').html(data.htmlText);
    tweet.find('.time').text(formatTweetDate(data.tweet));
    tweet.hide().prependTo($('#tweets')).slideDown('slow');
};

var formatTweetDate = function(tweet) {
    return (new Date(tweet.created_at)).toLocaleString();
};

var removeOldestTweet = function () {
    $('#tweets > .tweet:visible:last').slideUp('slow');
};

var toast = function(data) {
    var toast = $('#toast');
    if (toast.is(':visible')) {
        toast.toggle('slide');
    }
    
    var tweet = $(tweetTemplate(data));
    tweet.find('.text').html(data.htmlText);
    tweet.find('.time').text(formatTweetDate(data.tweet));

    var toastContent = $('#toast-content');
    toastContent.html('');
    tweet.appendTo(toastContent);

    toast.toggle('slide');
};