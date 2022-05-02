(function() {
    var apikey = $.getSetIniDbString('weather', 'key', 'NOTSET');

    function getWeather(sender, zipcode) {
        var url = "http://api.openweathermap.org/geo/1.0/zip?zip=" + zipcode + "&appid=" + apikey;
        var data = JSON.parse($.customAPI.get(url).content);
        if(data.cod === "404") {
            $.say($.whisperPrefix(sender) +  "Could not find the location for weather, please use zip code or Postal,Country code (E14,GB)");
            return;
        }

        var lat = data.lat;
        var lon = data.lon;
        var location = data.name;
        url = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=" + apikey + "&units=imperial"
        var data = JSON.parse($.customAPI.get(url).content);
        var temp = data.main.temp;
        var description = data.weather[0].description;
        var tempC = Number(((temp - 32) / 1.8).toFixed(2));
        $.say($.whisperPrefix(sender) +  "The weather currently in " + location + " is " + temp + "F, " + tempC + "C Condition: " + description);
    }

    $.bind('command', function(event) {
        var sender = event.getSender().toLowerCase(),
        command = event.getCommand(),
        args = event.getArgs(),
        action = args[0];
        if(command.equalsIgnoreCase('weather')) {
            if(!action) {
                action = "85234";
            }

            getWeather(sender, action);
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