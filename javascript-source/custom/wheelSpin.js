(function() {
    var cost = 10000,
        userCoolDown = 3600, //1 hour in seconds
        coolDown = $.getSetIniDbNumber('wheelspinSettings', 'coolDown', 60),
        users = [];

    $.bind('command', function(event) {
        var sender = event.getSender().toLowerCase(),
            command = event.getCommand(),
            args = event.getArgs(),
            action = args[0],
            actionArg1 = args[1],
            actionArg2 = args[2];

        if(command.equalsIgnoreCase('wheelspin')) {
            if ($.getUserPoints(sender) < cost) {
                $.say($.whisperPrefix(sender) + ' you don\'t have a enough pasties. Wheelspin costs 10,000')
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
            $.alertspollssocket.alertImage('wheelspin.gif, 6, 1.0,color: #BAB2B3;font-size: 50px;font-family: Cantarell;width: 600px;word-wrap: break-word;,' + (sender) + ' paid ' + cost + ' to spin the wheel');
            $.say((sender) + ' paid ' + cost + ' to spin the wheel!');
            var time = String($.getCurrentLocalTimeString('h:mm:ss a', 'America/Phoenix'));
            $.writeToFile( time + ' ' + sender + ' Wheel Spin', './addons/wheelspins.txt', true);
            $.coolDown.set('wheelspin', false, coolDown, false);
        }

        if(command.equalsIgnoreCase('wheelspincooldown')) {
            coolDown = parseInt(action);
            $.inidb.set('wheelspinSettings', 'coolDown', coolDown);
            $.say($.whisperPrefix(sender) + 'Updated cooldown to ' + coolDown + ' seconds');
        }
    });

    $.bind('initReady', function() {
        $.registerChatCommand('./custom/wheelSpin.js', 'wheelspin', 7);
        $.registerChatCommand('./custom/wheelSpin.js', 'wheelspincooldown', 1);

    });
})();