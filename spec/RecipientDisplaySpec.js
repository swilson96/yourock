function getDataWithThisManyRecipients(numberOfUsers) {
    var recipients = [];
    for (var i = 1; i <= numberOfUsers; ++i) {
        recipients.push({screen_name: "to" + i, profile_image_url: "toUrl" + i})
    }
    return  {
        tweet: {
            text: "blah",
            user: {screen_name: "a", profile_image_url: "b"},
            created_at: new Date()
        },
        to: recipients
    };
}

describe("Tweet recipients display correctly", function () {
    beforeEach(function () {
        $('#tweets').remove();
        $('body').append('<div id="tweets">...</div>');
    });
    it("No recipients acts as one", function () {
        var data = getDataWithThisManyRecipients(0);
        appendTweet(data);
        expect($("#to")).toHaveClass('to');
        expect($("#to")).toHaveClass('from');
        expect($("#to")).toHaveClass('horizontalCenter');
    });
    it("One recipient displays in the middle", function () {
        var data = getDataWithThisManyRecipients(1);
        appendTweet(data);
        expect($("#to")).toHaveClass('to');
        expect($("#to")).toHaveClass('from');
        expect($("#to")).toHaveClass('horizontalCenter');
    });
    it("Two recipients display side by side", function () {
        var data = getDataWithThisManyRecipients(2);
        appendTweet(data);
        expect($("#to")).toHaveClass('to');
        expect($("#to")).not.toHaveClass('from');
    });
    it("Two recipients are horizontally centred", function () {
        var data = getDataWithThisManyRecipients(2);
        appendTweet(data);
        expect($("#to")).toHaveClass('to');
        expect($("#to")).toHaveClass('horizontalCenter');
    });
    it("Three recipients are not horizontally centred", function () {
        var data = getDataWithThisManyRecipients(3);
        appendTweet(data);
        expect($("#to")).toHaveClass('to');
        expect($("#to")).not.toHaveClass('from');
        expect($("#to")).not.toHaveClass('horizontalCenter');
    });
    it("Four recipients are not horizontally centred", function () {
        var data = getDataWithThisManyRecipients(4);
        appendTweet(data);
        expect($("#to")).toHaveClass('to');
        expect($("#to")).not.toHaveClass('from');
        expect($("#to")).not.toHaveClass('horizontalCenter');
    });
});