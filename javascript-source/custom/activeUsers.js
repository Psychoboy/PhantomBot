(function() {
    var userCache = {},
    activeTime = 900000,
    lurkUsers = {},
    lurkTime = 3600000,
    i,
    excludedUsers = [
        'super_waffle_bot',
        'truckybot',
        'moobot',
        'soundalerts',
        'streamelements',
        'drinking_buddy_bot'
        ];

        //3600000 = 1hour
        //1800000 = 30m

    function isExcluded(username) {
        for(var i = 0; i < excludedUsers.length; i++) {
           if (excludedUsers[i] == username) {
                return true;
           }
        }
        return false;
    }

    function getActiveUsers() {
        var currentTime = $.systemTime();
        var users = [];
        var currentUsers = $.users;
        var username;
        for (i in currentUsers) {
            try {
                username = currentUsers[i].toLowerCase();
            } catch (ex) {
                $.log.warn(ex.toString());
                continue;
            }
            
            if(isExcluded(username) == true ) {
                continue;
            }
            if (userCache[username] !== undefined) {
                if(userCache[username] + activeTime > currentTime && isAlreadyInList(username, users) == false) {
                    users.push(username);
                } else if (lurkUsers[username] + lurkTime > currentTime && isAlreadyInList(username, users) == false) {
                    users.push(username);
                } else if ($.isSub(username) && isAlreadyInList(username, users) == false) {
                    users.push(username);
                }
            }
        }
        return users;
    }

    function isAlreadyInList(username, users) {
        for (var i = 0; i < users.length; i++) {
            if(username == users[i]) {
                return true;
            }
        }
        return false;
    }

    $.bind('ircChannelMessage', function(event) {
        userCache[event.getSender().toLowerCase()] = $.systemTime();
    });

    $.bind('pubSubChannelPoints', function (event) {
        var username = event.getUsername()    
        userCache[username.toLowerCase()] = $.systemTime();
    });

    $.bind('command', function(event) {
        var sender = event.getSender().toLowerCase(),
            command = event.getCommand(),
            args = event.getArgs(),
            action = args[0],
            actionArg1 = args[1],
            actionArg2 = args[2];

        if (command.equalsIgnoreCase('lurk')) {
            if ($.twitchcache.isStreamOnline()) {
                lurkUsers[sender] = $.systemTime();
                $.alertspollssocket.triggerAudioPanel('lurk', -1);
                $.say('Thanks for lurking, ' + event.getSender() + ' and for supporting the channel! You will be considered \'active\' for a period of time. TwitchUnity');
            }
            return;
        }
    });

    $.bind('initReady', function() {
        $.registerChatCommand('./custom/activeUsers.js', 'lurk', $.PERMISSION.Viewer);
    });

    $.getActiveUsers = getActiveUsers;
})();