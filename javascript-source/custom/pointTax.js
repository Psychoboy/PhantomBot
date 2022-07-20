(function() {
    var streamLastLive = $.getSetIniDbNumber('pointTax', 'streamLastLive', 1658016000000),
        ranPostStream = $.inidb.GetBoolean('pointTax','', 'ranPostStream'),
        oneHour = 3600000,
        delay = 300000;

    function runTimeEvent() {
        $.log.event('runTimeEvent ' + ranPostStream);
        if ($.twitchcache.isStreamOnline()) {
            streamLastLive = $.systemTime();
            ranPostStream = false;

            $.inidb.set('pointTax', 'streamLastLive', streamLastLive);
            $.inidb.SetBoolean('pointTax', '','ranPostStream', ranPostStream);

        } else if (ranPostStream == false) {
            if(streamLastLive + oneHour < $.systemTime()) {
                $.log.event('Starting point tax');
                ranPostStream = true;
                $.inidb.SetBoolean('pointTax','', 'ranPostStream', ranPostStream);
                var offset = 0;
                var effectedUsers = [];
                var greaterThen1k = true;
                while (greaterThen1k) {
                    var users = $.inidb.GetKeysByNumberOrderValue('points', '', 'DESC', 1000, offset)
                    if (users.length == 0) {
                        break;
                    }
                    for(i in users) {
                        try{
                            var user = users[i];
                            if(isAlreadyInList(user, effectedUsers) == false) {
                                effectedUsers.push(user);
                                var lastSeen = $.getIniDbNumber('lastseen', user, 0);

                                if(lastSeen + (oneHour * 24) < streamLastLive) {
                                    if(decreaseUserTickets(user) == false) {
                                        greaterThen1k = false;
                                        break;
                                    } 
                                }
                            }
                        } catch (e) {
                            $.log.error('Error with ' + users[i] + ' ex: ' + e.message);
                        }
                        
                    }
                    offset = offset + 1000;
                }
                $.log.event('Done with point tax');
            }
            
        }
    }

    function isAlreadyInList(username, effectedUsers) {
        for (var i = 0; i < effectedUsers.length; i++) {
            if(username == effectedUsers[i]) {
                return true;
            }
        }
        return false;
    }

    function decreaseUserTickets(user) {
        var userPoints = $.getUserPoints(user);
        if(userPoints > 10000) {
            var amountToLose = parseInt(userPoints * 0.01)
            amountToLose = amountToLose > 200000069 ? 200000069 : amountToLose;
            $.inidb.decr('points', user, amountToLose);
            $.log.event('Lowering ' + user + ' points by ' + amountToLose);
            return true;
        }
        return false;
    }

    var interval = setInterval(function() {
        runTimeEvent();
    }, delay);
    setTimeout(function() {
        runTimeEvent();
    }, 30000)
    
})();