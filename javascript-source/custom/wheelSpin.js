(function() {
    var cost = 10000,
        userCoolDown = 3600, //1 hour in seconds
        coolDown = $.getSetIniDbNumber('wheelspinSettings', 'coolDown', 60),
        wheelEnabled = false,
        users = [];

    $.bind('command', function(event) {
        var sender = event.getSender().toLowerCase(),
            command = event.getCommand(),
            args = event.getArgs(),
            action = args[0],
            actionArg1 = args[1],
            actionArg2 = args[2];

        if(command.equalsIgnoreCase('wheelspin')) {
            if(wheelEnabled == false) {
                $.say($.whisperPrefix(sender) + ' wheel is currently disabled while it gets re-designed.')
                return;
            }
            if ($.getUserPoints(sender) < cost) {
                $.say($.whisperPrefix(sender) + ' you don\'t have a enough pasties. Wheelspin costs 10,000 pasties')
                return;
            }

            if (users[sender] !== undefined) {
                if(users[sender] + (userCoolDown * 1000) > $.systemTime()) {
                    $.say($.whisperPrefix(sender) + ' wheelspin is still on cooldown for YOU.');
                    return;
                }
            }

            users[sender] = $.systemTime();
            $.inidb.decr('points', sender, cost);
            $.alertspollssocket.alertImage('wheelspin.gif, 6, 1.0,color: white;font-size: 50px;font-family: Arial;width: 600px;word-wrap: break-word;-webkit-text-stroke-width: 1px;-webkit-text-stroke-color: black;text-shadow: black 1px 0 5px;,' + (sender) + ' paid ' + cost + ' pasties to spin the wheel');
            $.say((sender) + ' paid ' + cost + ' pasties to spin the wheel!');
            var time = String($.getCurrentLocalTimeString('h:mm:ss a', 'America/Phoenix'));
            $.writeToFile( time + ' ' + sender + ' Wheel Spin', './addons/wheelspins.txt', true);
            $.coolDown.set('wheelspin', true, coolDown, undefined);
            return;
        }

        if(command.equalsIgnoreCase('togglewheel')) {
            wheelEnabled = !wheelEnabled;
            if(wheelEnabled){
                $.say('Wheel is now enabled!');
            } else {
                $.say('Wheel is now disabled!');
            }
            return;
        }

        if(command.equalsIgnoreCase('wheelspincooldown')) {
            coolDown = parseInt(action);
            $.inidb.set('wheelspinSettings', 'coolDown', coolDown);
            $.say($.whisperPrefix(sender) + 'Updated cooldown to ' + coolDown + ' seconds');
            return;
        }
    });

    $.bind('initReady', function() {
        $.registerChatCommand('./custom/wheelSpin.js', 'wheelspin', 7);
        $.registerChatCommand('./custom/wheelSpin.js', 'wheelspincooldown', 1);
        $.registerChatCommand('./custom/wheelSpin.js', 'togglewheel', 1);
    });
})();