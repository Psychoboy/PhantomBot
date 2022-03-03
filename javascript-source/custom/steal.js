(function() {
    var stealMin = $.getSetIniDbNumber('steal', 'min', 100),
        stealMax = $.getSetIniDbNumber('steal', 'max', 10000);

    function stealFromUser(user, target) {
        var amount = $.randRange(stealMin, stealMax);
        if($.getUserPoints(target) < amount) {
            $.say($.whisperPrefix(user) + $.lang.get('steal.poortarget',  $.username.resolve(user), $.getPointsString(amount), $.username.resolve(target)));
            movePoints(user, target, amount);
            return;
        }

        var rand = $.randRange(1,12);
        var success = rand <= 4;
        if(success) {
            $.say($.lang.get('steal.success', $.username.resolve(user), $.getPointsString(amount), $.username.resolve(target)))
            movePoints(user, target, amount);
        } else {
            $.say($.lang.get('steal.fail', $.username.resolve(user), $.getPointsString(amount), $.username.resolve(target)))
            movePoints(target, user, amount);
        }
    }

    function movePoints(from, to, amount) {
        $.inidb.decr('points', from, amount);
        $.inidb.incr('points', to, amount);
    }

    $.bind('command', function(event) {
        var sender = event.getSender().toLowerCase(),
            command = event.getCommand(),
            args = event.getArgs(),
            target = args[0],
            action = args[0];

        if(command.equalsIgnoreCase('steal')) {
            if (!$.twitchcache.isStreamOnline()) {
                $.say($.whisperPrefix(sender) + $.lang.get('steal.offline'));
                return;
            }

            if(!target || target.equalsIgnoreCase(sender)) {
                $.say($.whisperPrefix(sender) + $.lang.get('steal.usage'));
                return;
            }

            if($.getUserPoints(sender) < stealMax) {
                $.say($.whisperPrefix(sender) + $.lang.get('steal.notenough', $.getPointsString(stealMax)));
                return;
            }

            target = $.user.sanitize(target);

            if (!$.user.isKnown(target) || $.isTwitchBot(target)) {
                $.say($.whisperPrefix(sender) + $.lang.get('steal.404'));
                return;
            }

            stealFromUser(sender, target);
            return;
        }

        if(command.equalsIgnoreCase('stealmin')) {
            stealMin = parseInt(action);
            $.inidb.set('steal', min, stealMin)
            return;
        }

        if(command.equalsIgnoreCase('stealmax')) {
            stealMax = parseInt(action);
            $.inidb.set('steal', max, stealMax)
            return;
        }
    })

    $.bind('initReady', function() {
        $.registerChatCommand('./custom/steal.js', 'steal', 7);
        $.registerChatCommand('./custom/steal.js', 'stealmin', 1);
        $.registerChatCommand('./custom/steal.js', 'stealmax', 1);
    });
})();