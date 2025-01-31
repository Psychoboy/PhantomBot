(function() {
    var firstCommand = $.getSetIniDbString('first', 'first', 'arrived'),
        secondCommand = $.getSetIniDbString('first', 'second', 'second'),
        firstViewers = [],
        secondViewers = [],
        firstPointsMax = 3,
        firstDecrement = 250,
        firstMax = 60,
        secondStarting = 40000,
        secondDecrement = 500,
        secondMax = 40;

    function reset() {
        firstViewers = [];
        secondViewers = [];
    }

    function giveFirst(sender) {
        if (!$.twitchcache.isStreamOnline()) {
            $.say($.whisperPrefix(sender) + $.lang.get('first.offline'));
            return;
        }
        var awardPoints = firstViewers.length >= firstMax ? 0 : $.randRange(1, firstPointsMax);;
        if(awardPoints <= 0) {
            $.say($.whisperPrefix(sender) + $.lang.get('first.late'));
            return;
        }

        if(firstViewers.includes(sender)) {
            return;
        }

        firstViewers.push(sender);
        $.streamelements.AddTicketsToUsers([sender],awardPoints);
        $.say($.whisperPrefix(sender) + $.lang.get('first.reward', firstViewers.length, awardPoints));
    }

    // function giveSecond(sender) {
    //     if (!$.twitchcache.isStreamOnline()) {
    //         $.say($.whisperPrefix(sender) + $.lang.get('first.offline'));
    //         return;
    //     }

    //     if(secondViewers.length >= secondMax) {
    //         $.say($.whisperPrefix(sender) + $.lang.get('first.late'));
    //         return;
    //     }

    //     if(secondViewers.includes(sender)) {
    //         return;
    //     }

    //     var awardPoints = secondStarting - (secondViewers.length * secondDecrement);
    //     secondViewers.push(sender);
    //     $.streamelements.AddTicketsToUsers([sender],awardPoints);
    //     $.say($.whisperPrefix(sender) + $.lang.get('first.reward', secondViewers.length, awardPoints) + ' Check on !twitter to get bonus!');
    // }

    function registerFirst(newCommand) {
        if(newCommand != firstCommand) {
            $.unregisterChatCommand(firstCommand);
            $.registerChatCommand('./custom/first.js', newCommand, 7);
            firstCommand = newCommand;
            $.inidb.set('first', 'first', newCommand);
            $.say('First command registered');
        }
    }

    // function registerSecond(newCommand) {
    //     if(newCommand != secondCommand) {
    //         $.unregisterChatCommand(secondCommand);
    //         $.registerChatCommand('./custom/first.js', newCommand, 7);
    //         secondCommand = newCommand;
    //         $.inidb.set('first', 'second', newCommand);
    //         $.say('Second command registered');
    //         $.coolDown.add(secondCommand, 1, false);
    //     }
    // }

    $.bind('command', function(event) {
        var sender = event.getSender().toLowerCase(),
            username = $.username.resolve(sender, event.getTags()),
            command = event.getCommand(),
            args = event.getArgs(),
            action = args[0],
            actionArg1 = args[1],
            actionArg2 = args[2],
            isWhisper = event.isWhisper();

            if(command.equalsIgnoreCase(firstCommand)) {
                giveFirst(sender);
                return;
            }

            if(command.equalsIgnoreCase(secondCommand) && isWhisper) {
                giveSecond(sender);
                return;
            }

            if(command.equalsIgnoreCase('registerfirst')) {
                registerFirst(action);
            }

            // if(command.equalsIgnoreCase('registersecond')) {
            //     registerSecond(action);
            // }

            if(command.equalsIgnoreCase('resetfirst')) {
                reset();
            }
    });

    $.bind('initReady', function() {
        $.registerChatCommand('./custom/first.js', 'resetfirst', 1);
        $.registerChatCommand('./custom/first.js', 'registerfirst', 1);
        // $.registerChatCommand('./custom/first.js', 'registersecond', 1);
        $.registerChatCommand('./custom/first.js', firstCommand, 7);
        // $.registerChatCommand('./custom/first.js', secondCommand, 7);
    });

    $.firstCommand = firstCommand;
    $.secondCommand = secondCommand;
})()