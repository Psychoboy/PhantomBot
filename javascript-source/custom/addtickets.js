(function() {

    function addTickets(target, amount) {
        $.streamelements.AddTicketsToUsers([target],amount);
        $.say($.whisperPrefix(target) + 'You have been awarded ' + amount + ' tickets.');
    }

    $.bind('command', function(event) {
        var sender = event.getSender().toLowerCase(),
            command = event.getCommand(),
            args = event.getArgs(),
            target = args[0],
            amount = args[1],
            actionArg2 = args[2];

            if(command.equalsIgnoreCase('givetickets')) {
                target = $.user.sanitize(target);
                addTickets(target, parseInt(amount));
            }        
    });

   
    $.bind('initReady', function() {
        $.registerChatCommand('./custom/addtickets.js', 'givetickets', 1)
    });
})();