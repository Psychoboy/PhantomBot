(function(){
    $.bind('discordChannelCommand', function(event) {
        var channel = event.getDiscordChannel(),
            command = event.getCommand(),
            mention = event.getMention(),
            arguments = event.getArguments(),
            args = event.getArgs(),
            location = args.join(" ");

        if(command.equalsIgnoreCase('weather')) {
            if(!location) {
                location = "85234";
            }

            var msg = $.getWeather(location);
            $.discord.say(channel, $.discord.userPrefix(mention) + msg);
            return;
        }
    });

    $.bind('initReady', function() {
        $.discord.registerCommand('./discord/custom/weather.js', 'weather', 0);
    });
})();