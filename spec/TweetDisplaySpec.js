var text = "blah http://pic.twitter.com/blah #yourock @to1 and @to2 but not @to10. Oh and @to3";
var htmlText = 'blah <a href="http://pic.twitter.com/blah">http://pic.twitter.com/blah</a> '
 + '#yourock <a href="http://www.twitter.com/to1">@to1</a> '
 + 'and <a href="http://www.twitter.com/to2">@to2</a> but not @to10. '
 + 'Oh and <a href="http://www.twitter.com/to3">@to3</a>';
var username = "baby";
var url = "http://twitter.com/baby";
var recipients = [];
var alreadyConnected;

function getData() {
    for (var i = 1; i <= 3; ++i) {
        recipients.push({screen_name: "to" + i, profile_image_url: "toUrl" + i})
    }
    return  {
        tweet: {
            text: text,
            user: {screen_name: username, profile_image_url: url},
            created_at: new Date()
        },
        to: recipients,
        htmlText: htmlText
    };
}

describe("Tweets display correctly", function () {
    beforeEach(function () {
        alreadyConnected = false;
        $('#tweets').remove();
        $('body').append('<div id="tweets">...</div>');
    });
    it("From image displays with the right classes", function () {
        var data = getData();
        appendTweet(data);
        expect($("#from")).toHaveClass('from');
        expect($("#from")).toHaveClass('float');
    });
    it("Time is displayed", function () {
        var data = getData();
        var expectedTime = "2:01:15 PM";
        var expectedDate = new Date("2013-04-30 14:01:15");
        data.tweet.created_at = expectedDate;
        appendTweet(data);
        expect($("#time")).toHaveClass('right');
        expect($("#time")).toHaveClass('time');
        expect($("#time")).toContainText(expectedTime);
        expect($("#time")).toHaveText(expectedDate.toLocaleString());
    });
    it("Text is displayed", function () {
        var data = getData();
        appendTweet(data);
        expect($("#text")).toHaveClass('text');
        expect($("#text").html()).toBe(htmlText);
    });
    it("Mentions are highlighted", function () {
        var data = getData();
        appendTweet(data);
        expect($("#text > a").length).toBeGreaterThan(2);
    });
    it("Non-mention usernames are not highlighted", function () {
        var data = getData();
        appendTweet(data);
        $("#text > a").each(function() {
            expect($(this).text().indexOf("to10")).toBe(-1);
        });
    });
    it("Displays unicode characters", function() {
        text = text + " \u2764 yeah";
        htmlText = htmlText + " \u2764 yeah";
        var data = getData();
        appendTweet(data);
        expect($($("#text")).text().indexOf("\u2764")).toBeGreaterThan(0);
    });
    it("Does not crash if undefined data on connection", function() {
        connection(null);
        expect($('#tweets').children('div.tweet').length).toBe(0);
    });
    it("Only displays initial tweets once", function() {
        var data = getData();
        connection([data]);
        expect($('#tweets').children('div.tweet').length).toBe(1);

        connection([data]);
        expect($('#tweets').children('div.tweet').length).toBe(1);
    });

});