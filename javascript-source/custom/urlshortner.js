(function() {
    var shortUrlKey = $.getSetIniDbString('shorten', 'key', 'NOTSET')
    function shortenUrl(url) {
        var encodedUrl = encodeURI(url);
        //encodedUrl = encodeURIComponent(encodedUrl);
        var completeUrl = "https://superpenguin.tv/s/yourls-api.php?action=shorturl&url=" + encodedUrl + "&signature=" + shortUrlKey + "&format=simple";
        return $.customAPI.get(completeUrl).content;
    }

    $.bind('command', function(event) {
        var sender = event.getSender().toLowerCase(),
            command = event.getCommand(),
            args = event.getArgs(),
            action = args[0];
        
        if(command.equalsIgnoreCase('setshortkey')) {
            $.inidb.set('shorten','key', action.trim());
            shortUrlKey = action.trim();
            $.say('Key Updated.');
        }
    })

    $.bind('initReady', function() {
        $.registerChatCommand('./custom/urlshortner.js', 'setshortkey', 1);
    })
    $.shortenUrl = shortenUrl;
})();