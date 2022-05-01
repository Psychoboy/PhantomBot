(function() {

    $.bind('twitchOnline', function (event) {
        setTimeout(function() {
            if ($.isOnline()) {
                $.say('Stream is now online, refresh if you do not see the video.')
            }
        }, 60000);
    });
})()