(function() {
    var bonusCommand = $.getSetIniDbString('bonus', 'command', 'bonus'),
        bonusViewers = [],
        minAmount = 1,
        maxAmount = 3;

    function reset() {
        bonusViewers = [];
    }

    function giveBonus(sender) {
        if(!$.twitchcache.isStreamOnline()) {
            $.say($.whisperPrefix(sender) + $.lang.get('bonus.offline'));
            return;
        }

        if(bonusViewers.includes(sender)) {
            return;
        }

        awardPoints = $.randRange(minAmount, maxAmount);
        bonusViewers.push(sender);
        $.streamelements.AddTicketsToUsers([sender],awardPoints);
        $.say($.lang.get('bonus.prize', sender, awardPoints));
    }

    $.bind('command', function(event) {
        var sender = event.getSender().toLowerCase(),
            command = event.getCommand();

        if(command.equalsIgnoreCase(bonusCommand)) {
            giveBonus(sender);
            return;
        }

        if(command.equalsIgnoreCase('resetbonus')) {
            reset();
            return;
        }
    })

    $.bind('initReady', function () {
        $.registerChatCommand('./custom/bonus.js', bonusCommand, $.PERMISSION.Viewer)
        $.registerChatCommand('./custom/bonus.js', 'resetbonus', $.PERMISSION.Admin)
    })
})()