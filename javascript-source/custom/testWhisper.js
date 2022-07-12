(function () {

    $.bind('command', function(event) {
        var sender = event.getSender().toLowerCase(),
            command = event.getCommand(),
            args = event.getArgs(),
            action = args[0],
            actionArg1 = args[1],
            actionArg2 = args[2];

            if(command.equalsIgnoreCase('testwhisper')) {
                $.say($.whisperPrefix(sender, true) + "Whisper works!");
            }
    });

    $.bind('initReady', function() {
        $.registerChatCommand('./custom/testWhisper.js', 'testwhisper', 1)
    });
})();