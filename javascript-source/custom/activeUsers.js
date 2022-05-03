(function() {
    var userCache = {},
    activeTime = 900000,
    i,
    excludedUsers = [
        'super_waffle_bot',
        'truckybot',
        'superpenguintv',
        'moobot',
        'soundalerts',
        'streamelements',
        'drinking_buddy_bot'
        ];

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

    $.getActiveUsers = getActiveUsers;
})();