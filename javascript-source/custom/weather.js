(function() {
    var apikey = $.getSetIniDbString('weather', 'key', 'NOTSET');

    function getWeather(location) {
        location = encodeURIComponent(location);
        var url = "https://api.weatherapi.com/v1/forecast.json?key=" + apikey + "&q=" + location + "&days=1&aqi=no&alerts=no";
        var data = JSON.parse($.customAPI.get(url).content);
        if(data.error) {
            return data.error.message;
        }

        var name = data.location.name;
        var country = data.location.country;
        var tempF = data.current.temp_f;
        var tempC = data.current.temp_c;
        var condition = data.current.condition.text;
        var humidity = data.current.humidity;
        var region = data.location.region;
        var maxF = data.forecast.forecastday[0].day.maxtemp_f;
        var maxC = data.forecast.forecastday[0].day.maxtemp_c;
        var minf = data.forecast.forecastday[0].day.mintemp_f;
        var minc = data.forecast.forecastday[0].day.mintemp_c;
        var todaycondition = data.forecast.forecastday[0].day.condition.text;
        var result = "The weather currently in " + name + ", " + region + ", " + country + " is " + tempF + "F/" + tempC + "C. Humidity: " + humidity + "% Condition: " + condition;
        result = result + ". Todays high: " + maxF + "F/" + maxC + "C Low: " + minf + "F/" + minc + "C Condition: " + todaycondition;
        return result;
    }

    $.bind('command', function(event) {
        var sender = event.getSender().toLowerCase(),
        command = event.getCommand(),
        args = event.getArgs(),
        location = args.join(" "),
        action = args[0];
        if(command.equalsIgnoreCase('weather')) {
            if(!location) {
                location = "85234";
            }

            var msg = getWeather(location);
            $.say($.whisperPrefix(sender) + msg);
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

    $.getWeather = getWeather;
})();