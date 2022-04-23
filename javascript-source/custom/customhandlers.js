(function() {

    $.bind('twitchOnline', function () {
        setTimeout(function() {
            if ($.twitchcache.isStreamOnline()) {
                $.say('Stream is now online, refresh if you do not see the video.')
            }
        }, 6e4);
    });
})()