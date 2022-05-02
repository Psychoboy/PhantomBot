(function() {
    var apikey = $.getSetIniDbString('weather', 'key', 'NOTSET');

    function getWeather(sender, location) {
        location = encodeURIComponent(location);
        var url = "https://api.weatherapi.com/v1/current.json?key=" + apikey + "&q=" + location + "&aqi=no";
        var data = JSON.parse($.customAPI.get(url).content);
        if(data.error) {
            $.say($.whisperPrefix(sender) + data.error.message)
            return;
        }

        var name = data.location.name;
        var country = data.location.country;
        var tempF = data.current.temp_f;
        var tempC = data.current.temp_c;
        var condition = data.current.condition.text;
        $.say($.whisperPrefix(sender) + "The weather currently in " + name + ", " + country + " is " + tempF + "F, " + tempC + "C. Current Condition: " + condition);
    }

    $.bind('command', function(event) {
        var sender = event.getSender().toLowerCase(),
        command = event.getCommand(),
        args = event.getArgs(),
        location = args.join(" ");
        action = args[0];
        if(command.equalsIgnoreCase('weather')) {
            if(!location) {
                location = "85234";
            }

            getWeather(sender, location);
            return;
        }

        if(command.equalsIgnoreCase('setweatherapi')){
            $.inidb.set('weather', 'key', action.trim());
            apikey = action.trim();
            $.say('API Key updated');
            return;
        }
    });

    $.bind('initReady', function() {
        $.registerChatCommand('./custom/weather.js', 'weather', 7);
        $.registerChatCommand('./custom/weather.js', 'setweatherapi', 1);
    })
})();